/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Project } from "@atomist/automation-client";
import {
    CodeInspection,
    CodeInspectionRegistration,
    CodeInspectionResult,
    SdmContext,
} from "@atomist/sdm";
import * as _ from "lodash";
import {
    consolidate,
    LanguageReport,
    LanguagesReport,
    LanguageStats,
    reportForLanguages,
} from "./slocReport";

/**
 * Inspection that reports on languages used in a project
 * @param {Project} p
 * @param {SdmContext} ci
 * @return {Promise<LanguagesReport>}
 * @constructor
 */
export const SlocInspection: CodeInspection<LanguagesReport> = async (p: Project, ci: SdmContext) => {
    const result = await reportForLanguages(p);
    await ci.addressChannels(reportForProject({ repoId: p.id, result }));
    return result;
};

/**
 * Command to display lines of code in current project or projects
 * to Slack, across understood languages.
 * Also displays aggregate data.
 */
export const SlocCommand: CodeInspectionRegistration<LanguagesReport> = {
    name: "sloc",
    inspection: SlocInspection,
    intent: ["compute sloc", "sloc"],
    onInspectionResults: async (results, ci) => {
        // Aggregate the results
        // We'll have all languages for each project
        const languages = results[0].result.languagesScanned;
        // Totals for all languages
        const consolidated: LanguageStats[] = languages.map(language => {
            const stats = consolidate(language,
                results.map(r => r.result.languageReports.find(l => l.language === language).stats));
            return {
                language,
                stats,
            };
        }).filter(s => s.stats.total > 0);
        let message = `Totals across ${results.length} projects:\n`;
        const sorted = _.sortBy(consolidated, s => -s.stats.total);
        for (const langStats of sorted) {
            message += `* ${formatLanguageStats(langStats)}\n`;
        }
        await ci.context.messageClient.respond(message);
    },
};

/**
 * Format a string for the report for the project
 * @param {CodeInspectionResult<LanguagesReport>} result
 * @return {string}
 */
function reportForProject(result: CodeInspectionResult<LanguagesReport>): string {
    return `Project \`${result.repoId.owner}:${result.repoId.repo}\`: ${result.repoId.url}\n` +
        result.result.relevantLanguageReports.map(formatLanguageReport).map(s => "* " + s).join("\n");
}

function formatLanguageReport(report: LanguageReport): string {
    return formatLanguageStats(report) +
        `, ${Number(report.fileReports.length).toLocaleString()} \`.${report.language.extensions[0]}\` files`;
}

function formatLanguageStats(report: LanguageStats): string {
    return `*${report.language.name}*: ${Number(report.stats.total).toLocaleString()} loc, ` +
        `${Number(report.stats.comment).toLocaleString()} in comments`;
}

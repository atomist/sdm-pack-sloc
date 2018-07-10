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

import { RemoteRepoRef } from "@atomist/automation-client/operations/common/RepoId";
import { Project } from "@atomist/automation-client/project/Project";
import { CodeInspection, CodeInspectionRegistration, ExtensionPack, SdmContext } from "@atomist/sdm";
import { metadata } from "@atomist/sdm/api-helper/misc/extensionPack";
import { LanguageReport, LanguagesReport, reportForLanguages } from "./slocReport";

/**
 * Inspection that reports on languages
 * @param {Project} p
 * @param {SdmContext} ci
 * @return {Promise<LanguagesReport>}
 * @constructor
 */
export const SlocInspection: CodeInspection<LanguagesReport> = async (p: Project, ci: SdmContext) => {
    const report = await reportForLanguages(p);
    await ci.context.messageClient.respond(`Project \`${p.id.owner}:${p.id.repo}\`: ${(p.id as RemoteRepoRef).url}`);
    const message = report.relevantLanguageReports.map(formatLanguageReport).join("\n");
    await ci.context.messageClient.respond(message);
    return report;
};

/**
 * Commmand to display lines of code in current project
 * to Slack, across understood languages.
 * Note that this does not actually modify anything.
 */
export const SlocCommand: CodeInspectionRegistration<LanguagesReport> = {
    name: "sloc",
    inspection: SlocInspection,
    intent: ["compute sloc", "sloc"],
};

export const SlocSupport: ExtensionPack = {
    ...metadata(),
    configure: sdm => sdm.addCodeTransformCommand(SlocCommand),
};

function formatLanguageReport(report: LanguageReport): string {
    return `*${report.language.name}*: ${Number(report.stats.total).toLocaleString()} loc, ` +
        `${Number(report.stats.comment).toLocaleString()} in comments, ` +
        `${Number(report.fileReports.length).toLocaleString()} \`.${report.language.extensions[0]}\` files`;
}

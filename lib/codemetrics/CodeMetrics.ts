/*
 * Copyright © 2019 Atomist, Inc.
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

import {
    Project,
    RemoteRepoRef,
} from "@atomist/automation-client";
import {
    Aspect,
    fingerprintOf,
} from "@atomist/sdm-pack-fingerprint";
import * as _ from "lodash";
import { AllLanguages } from "../languages";
import {
    CodeStats,
    isLanguageReportRequest,
    Language,
    LanguageReportRequest,
    reportForLanguages,
} from "../slocReport";

/**
 * Structure that can persisted: For example, written as a fingerprint after each commit
 */
export interface CodeMetrics {

    project: { url: string, owner: string, repo: string, branch: string };
    timestamp: string;
    languages: CodeStats[];

    totalFiles: number;

    /**
     * Lines recognized
     */
    lines: number;
    top20BiggestFiles: Array<{path: string, lines: number}>;
    files: number;
}

/**
 * Return a serializable language summary structure structure
 * @param {Project} p
 * @param {LanguageReportRequest[]} requests
 * @return {Promise<CodeMetrics>}
 */
export async function calculateCodeMetrics(p: Project,
                                           requests: Array<LanguageReportRequest | Language> = AllLanguages): Promise<CodeMetrics> {
    const lrRequests = requests.map(r => isLanguageReportRequest(r) ? r : { language: r });
    const report = await reportForLanguages(p, lrRequests);
    const topFileLines = _.flatten(report.languageReports
        .map(r => r.fileReports))
        .map(fr => ({path: fr.file.path, lines: fr.stats.total}))
        .sort((a, b) => a.lines - b.lines)
        .reverse();
    return {
        project: {
            url: (p.id as RemoteRepoRef).url,
            owner: p.id.owner,
            repo: p.id.repo,
            branch: p.id.branch,
        },
        timestamp: new Date().getTime() + "",
        languages: report.languageReports.map(r => r.stats),
        totalFiles: await p.totalFileCount(),
        files: report.relevantLanguageReports
            .map(r => r.fileReports.length)
            .reduce((tot1, tot2) => tot1 + tot2, 0),
        top20BiggestFiles: topFileLines.slice(0, topFileLines.length > 100 ? 100 : topFileLines.length),
        lines: report.relevantLanguageReports
            .map(r => r.stats.total)
            .reduce((tot1, tot2) => tot1 + tot2, 0),
    };
}

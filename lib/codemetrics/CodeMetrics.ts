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
    FingerprinterRegistration,
    PushTest,
    TypedFingerprint,
} from "@atomist/sdm";
import { AllLanguages } from "../languages";
import {
    CodeStats,
    LanguageReportRequest,
    reportForLanguages,
} from "../slocReport";

const CodeMetricsFingerprintName = "CodeMetrics";

/**
 * Structure tructure that can persisted: For example, written as a fingerprint after each commit
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
    files: number;
}

/**
 * Return a serializable language summary structure structure
 * @param {Project} p
 * @param {LanguageReportRequest[]} requests
 * @return {Promise<CodeMetrics>}
 */
export async function calculateCodeMetrics(p: Project,
                                           requests: LanguageReportRequest[] = AllLanguages.map(language => ({ language }))): Promise<CodeMetrics> {
    const report = await reportForLanguages(p, requests);
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
            .reduce((tot1, tot2) => tot1 + tot2),
        lines: report.relevantLanguageReports
            .map(r => r.stats.total)
            .reduce((tot1, tot2) => tot1 + tot2),
    };
}

export function lineCountFingerprinter(pushTest: PushTest): FingerprinterRegistration {
    return {
        name: CodeMetricsFingerprintName,
        pushTest,
        action: async pu => {
            const codeMetrics = await calculateCodeMetrics(pu.project);
            return new TypedFingerprint(CodeMetricsFingerprintName, "lc", "0.1.0", codeMetrics);
        },
    };
}

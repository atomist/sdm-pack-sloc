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
    ProjectFile,
    projectUtils,
} from "@atomist/automation-client";
import * as _ from "lodash";
import * as sloc from "sloc";
import {
    AllLanguages,
    PowerShellLanguage,
    ShellLanguage,
} from "./languages";

export interface Language {

    name: string;

    /**
     * First extension must be definitive one to pass to SLOC
     */
    extensions: string[];
}

/**
 * Statistics about a particular language. See sloc API for further information
 */
export interface CodeStats {

    language: Language;

    /**
     * Total number of lines
     */
    total: number;

    /**
     * Number of lines of source code
     */
    source: number;

    /**
     * Number of comment lines
     */
    comment: number;
    single: number;
    block: number;
}

export interface FileReport {

    stats: CodeStats;

    file: ProjectFile;

}

export interface LanguageStats {

    language: Language;

    stats: CodeStats;
}

/**
 * Report about a project's files in a given language
 */
export class LanguageReport implements LanguageStats {

    constructor(public readonly language: Language,
                public readonly fileReports: FileReport[]) {
    }

    /**
     * Return stats for each language
     * @return {CodeStats[]}
     */
    get stats(): CodeStats {
        return consolidate(this.language, this.fileReports.map(fr => fr.stats));
    }

}

/**
 * Consolidate the given stats for a particular language
 * @param {Language} language
 * @param {CodeStats[]} stats
 * @return {CodeStats}
 */
export function consolidate(language: Language, stats: CodeStats[]): CodeStats {
    return {
        language,
        total: _.sum(stats.filter(s => s.language.name === language.name).map(r => r.total)),
        source: _.sum(stats.filter(s => s.language.name === language.name).map(r => r.source)),
        comment: _.sum(stats.filter(s => s.language.name === language.name).map(r => r.comment)),
        single: _.sum(stats.filter(s => s.language.name === language.name).map(r => r.single)),
        block: _.sum(stats.filter(s => s.language.name === language.name).map(r => r.block)),
    };
}

/**
 * Report about lines of code in various languages.
 */
export class LanguagesReport {

    constructor(public languageReports: LanguageReport[]) {
    }

    get languagesScanned(): Language[] {
        return _.uniq(this.languageReports.map(lr => lr.language));
    }

    /**
     * Return only the found languages
     * @return {CodeStats[]}
     */
    get relevantLanguageReports(): LanguageReport[] {
        return this.languageReports.filter(lr => lr.stats.total > 0);
    }

}

export interface LanguageReportRequest {

    language: Language;

    /**
     * Glob patterns to exlclude to narrow down search--eg to exclude test or vendor directories
     */
    excludes?: string[];
}

export type LanguageReportRequestable = Language | LanguageReportRequest;

export function isLanguageReportRequest(a: LanguageReportRequestable): a is LanguageReportRequest {
    const maybe = a as LanguageReportRequest;
    return !!maybe.language;
}

/**
 * Use the sloc library to compute code statistics
 * @param {Project} p
 * @param {string} request
 * @return {Promise<LanguageReport>}
 */
export async function reportForLanguage(p: Project, request: LanguageReportRequestable): Promise<LanguageReport> {
    const lrr = isLanguageReportRequest(request) ? request : { language: request};
    const extension = lrr.language.extensions[0];
    const globs = lrr.language.extensions.map(ext => `**/*.${ext}`);
    if (!!lrr.excludes) {
        globs.push(...lrr.excludes.map(e => "!" + e));
    }
    const fileReports = await projectUtils.gatherFromFiles<FileReport>(p, globs, async f => {
        const stats = getStats(await f.getContent(), lrr.language, extension);
        return {
            stats,
            file: f,
            language: lrr.language,
        };
    });
    return new LanguageReport(lrr.language, fileReports);
}

export async function reportForLanguages(p: Project,
                                         requests: LanguageReportRequestable[] = AllLanguages): Promise<LanguagesReport> {
    const languageReports = await Promise.all(requests.map(r => reportForLanguage(p, r)));
    return new LanguagesReport(languageReports);
}

function getStats(content: string, language: Language, extension: string): CodeStats {
    // We handle some languages ourselves
    switch (language.name) {
        case ShellLanguage.name:
            return computeStats(content, language, l => l.trim().startsWith("#"));
        case PowerShellLanguage.name:
            return computeStats(content, language, l => l.trim().startsWith("#"));
        default:
            return {
                language,
                ...sloc(content, extension),
            };
    }
}

/**
 * Compute stats for the given content, given a way of determining comment lines
 * @param {string} content
 * @param {Language} language
 * @param {(s: string) => boolean} lineIsComment
 * @return {CodeStats}
 */
export function computeStats(content: string, language: Language, lineIsComment: (s: string) => boolean): CodeStats {
    const lines = (content || "").split("\n");
    const single = lines.filter(lineIsComment).length;
    return {
        total: lines.length,
        block: 0,
        comment: single,
        language,
        single,
        source: lines.length,
    };
}

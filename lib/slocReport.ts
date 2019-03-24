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

import {
    Project,
    ProjectFile,
    projectUtils,
} from "@atomist/automation-client";
import * as _ from "lodash";
import * as sloc from "sloc";
import { AllLanguages, ShellLanguage } from "./languages";

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

    constructor(public language: Language, public fileReports: FileReport[]) {
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
        total: _.sum(stats.map(r => r.total)),
        source: _.sum(stats.map(r => r.source)),
        comment: _.sum(stats.map(r => r.comment)),
        single: _.sum(stats.map(r => r.single)),
        block: _.sum(stats.map(r => r.block)),
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
     * Narrow down search--eg to exclude test
     */
    glob?: string;
}

/**
 * Use the sloc library to compute code statistics
 * @param {Project} p
 * @param {string} request
 * @return {Promise<LanguageReport>}
 */
export async function reportForLanguage(p: Project, request: LanguageReportRequest): Promise<LanguageReport> {
    const extension = request.language.extensions[0];
    const globs = request.language.extensions.map(ext => `**/*.${ext}`);
    const fileReports = await projectUtils.gatherFromFiles<FileReport>(p, globs, async f => {
        const stats = getStats(await f.getContent(), request.language, extension);
        return {
            stats,
            file: f,
            language: request.language,
        };
    });
    return new LanguageReport(request.language, fileReports);
}

export async function reportForLanguages(p: Project,
                                         requests: LanguageReportRequest[] = AllLanguages.map(language => ({ language }))): Promise<LanguagesReport> {
    const languageReports = await Promise.all(requests.map(r => reportForLanguage(p, r)));
    return new LanguagesReport(languageReports);
}

function getStats(content: string, language: Language, extension: string): CodeStats {
    // We handle some things ourselves
    if (language === ShellLanguage) {
        return computeStats(content, language, l => l.trim().startsWith("#"));
    }
    return sloc(content, extension);
}

/**
 * Compiute stats for the given content, given a way of determining comment lines
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

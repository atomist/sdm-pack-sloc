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
    InMemoryProject,
    InMemoryProjectFile,
} from "@atomist/automation-client";
import * as assert from "power-assert";
import {
    JavaLanguage,
    ScalaLanguage,
    ShellLanguage,
    TypeScriptLanguage,
    YamlLanguage,
} from "../lib/languages";
import {
    reportForLanguage,
    reportForLanguages,
} from "../lib/slocReport";

describe("reportForLanguage", () => {

    it("should work on TypeScript", async () => {
        const p = InMemoryProject.of(new InMemoryProjectFile("thing.ts", "// Comment\n\nconst x = 10;\n"));
        const r = await reportForLanguage(p, {language: TypeScriptLanguage });
        assert.equal(r.fileReports.length, 1);
        const f0 = r.fileReports[0];
        assert.equal(r.stats.total, 3);
        assert.equal(r.stats.source, 1);
        assert.equal(f0.stats.total, 3);
        assert.equal(f0.stats.source, 1);
    });

    it("should work on Java", async () => {
        const p = InMemoryProject.of(new InMemoryProjectFile("src/Thing.java", "// Comment\n\nclass Foo{}\n"));
        const r = await reportForLanguage(p, { language: JavaLanguage});
        assert.equal(r.fileReports.length, 1);
        const f0 = r.fileReports[0];
        assert.equal(r.stats.total, 3);
        assert.equal(r.stats.source, 1);
        assert.equal(f0.stats.total, 3);
        assert.equal(f0.stats.source, 1);
    });

    it("should work on YAML", async () => {
        const p = InMemoryProject.of(new InMemoryProjectFile("junk.yml", "yaml : garbage"));
        const r = await reportForLanguage(p, {language: YamlLanguage });
        assert.equal(r.fileReports.length, 1);
        const f0 = r.fileReports[0];
        assert.equal(f0.stats.total, 1);
        assert.equal(f0.stats.source, 1);
    });

    it("should work on Bash", async () => {
        const p = InMemoryProject.of(new InMemoryProjectFile("thing.sh", "ls\n#This is a thing\nmkdir foo"));
        const r = await reportForLanguage(p, {language: ShellLanguage });
        assert.equal(r.fileReports.length, 1);
        const f0 = r.fileReports[0];
        assert.equal(f0.stats.total, 3);
        assert.equal(f0.stats.source, 3);
        assert.equal(f0.stats.comment, 1);
    });

    it("should work on Java and TypeScript", async () => {
        const p = InMemoryProject.of(
            new InMemoryProjectFile("thing.ts", "// Comment\n\nconst x = 10;\n"),
            new InMemoryProjectFile("src/Thing.java", "// Comment\n\nclass Foo{}\n"),
        );
        const r = await reportForLanguages(p, [{ language: JavaLanguage}, { language: TypeScriptLanguage}]);
        assert.equal(r.languageReports.length, 2);
        assert.equal(r.relevantLanguageReports.length, 2);
        assert(r.languageReports.some(l => l.language === JavaLanguage));
        assert(r.relevantLanguageReports.some(l => l.language === TypeScriptLanguage));
    });

    it("should find default languages", async () => {
        const p = InMemoryProject.of(
            new InMemoryProjectFile("Thing.scala", "// Comment\n\nclass Foo {}\n"),
            new InMemoryProjectFile("src/Thing.java", "// Comment\n\nclass Foo{}\n"),
            new InMemoryProjectFile("junk.yml", "yaml: junk"),
        );
        const r = await reportForLanguages(p);
        assert(r.languageReports.length > 3);
        assert.equal(r.relevantLanguageReports.length, 3);
        assert(r.languageReports.some(l => l.language === JavaLanguage));
        assert(r.relevantLanguageReports.some(l => l.language === ScalaLanguage));
        assert(r.relevantLanguageReports.some(l => l.language === ScalaLanguage));

    });

});

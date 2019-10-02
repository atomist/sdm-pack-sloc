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

import { InMemoryProject } from "@atomist/automation-client";
import { InMemoryFile } from "@atomist/automation-client/lib/project/mem/InMemoryFile";
import * as assert from "assert";
import { calculateCodeMetrics } from "../../lib/codemetrics/CodeMetrics";
import { AllLanguages } from "../../lib/languages";

describe("calculateCodeMetrics", () => {

    it("should calculate for empty project without error", async () => {
        const p = InMemoryProject.of();
        const r = await calculateCodeMetrics(p);
        assert.strictEqual(r.languages.length, AllLanguages.length);
        r.languages.forEach(l => assert.strictEqual(l.total, 0));
    });

    it("should calculate for Java project", async () => {
        const p = InMemoryProject.of(
            { path: "Thing.java", content: "public class Thing {}"},
            { path: "Thing2.java", content: `public class Thing2 {
    public void doSomething() {}
}
`},
        );
        const r = await calculateCodeMetrics(p);
        assert.strictEqual(r.languages.length, AllLanguages.length);
        r.languages.filter(l => l.language.extensions[0] !== "java").forEach(l => assert.strictEqual(l.total, 0));
        r.languages.filter(l => l.language.extensions[0] === "java").forEach(l => assert.strictEqual(l.total, 4));
        assert.strictEqual(r.top20BiggestFiles.length, 2);
        assert.deepStrictEqual(r.top20BiggestFiles[0], { path: "Thing2.java", lines: 3});
        assert.deepStrictEqual(r.top20BiggestFiles[1], { path: "Thing.java", lines: 1});
    });

    it("should honor Go vendoring", async () => {
        const p = InMemoryProject.of(
            new InMemoryFile("thing.go", "type ReferenceCallback func(path string) spec.Ref\n"),
            new InMemoryFile("vendor/someone/thing.go", "type ReferenceCallback func(path string) spec.Ref\n"),
        );
        const r = await calculateCodeMetrics(p);
        r.languages.filter(l => l.language.extensions[0] === "go").forEach(l => assert.strictEqual(l.total, 1));
    });

});

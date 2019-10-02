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
import { toArray } from "@atomist/sdm-core/lib/util/misc/array";
import * as assert from "power-assert";
import { CodeMetricsAspect } from "../../lib/aspect/codeMetricsAspect";

describe("Code metrics aspect", () => {
    it("should create fingerprint", async () => {
        const p = InMemoryProject.of(
            { path: "Thing.java", content: "public class Thing {}"},
            { path: "Thing2.java", content: `public class Thing2 {
    public void doSomething() {}
}
`},
        );
        const fps = toArray(await CodeMetricsAspect.extract(p, undefined));
        assert.strictEqual(fps.length, 1);
        assert.strictEqual(fps[0].data.files, 2);
        assert.strictEqual(fps[0].data.top20BiggestFiles.length, 2);
        assert.strictEqual(fps[0].data.lines, 4);
    });
});

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

import * as assert from "power-assert";
import {
    GoLanguage,
    JavaLanguage,
} from "../../lib/languages";
import {
    CodeStats,
    consolidate,
} from "../../lib/slocReport";

describe("slocReport", () => {

    describe("consolidate", () => {

        it("should consolidate one", () => {
            const codeStats: CodeStats = {
                total: 1,
                language: JavaLanguage,
                single: 1,
                comment: 0,
                block: 0,
                source: 1,
            };
            const consolidated = consolidate(JavaLanguage, [codeStats]);
            assert.deepStrictEqual(consolidated.language, JavaLanguage);
            assert.strictEqual(consolidated.source, 1);
        });

        it("should ignore irrelevant", () => {
            const codeStats: CodeStats = {
                total: 1,
                language: JavaLanguage,
                single: 1,
                comment: 0,
                block: 0,
                source: 1,
            };
            const consolidated = consolidate(GoLanguage, [codeStats]);
            assert.deepStrictEqual(consolidated.language, GoLanguage);
            assert.strictEqual(consolidated.source, 0);
        });

        it("should ignore irrelevant: 2", () => {
            const jStats1: CodeStats = {
                total: 10,
                language: JavaLanguage,
                single: 0,
                comment: 0,
                block: 0,
                source: 1,
            };
            const jStats2: CodeStats = {
                total: 18,
                language: JavaLanguage,
                single: 0,
                comment: 0,
                block: 0,
                source: 2,
            };
            const gStats: CodeStats = {
                total: 9,
                language: GoLanguage,
                single: 1,
                comment: 0,
                block: 0,
                source: 1,
            };
            const jConsolidated = consolidate(JavaLanguage, [jStats1, jStats2, gStats]);
            assert.deepStrictEqual(jConsolidated.language, JavaLanguage);
            assert.strictEqual(jConsolidated.total, 28);
            assert.strictEqual(jConsolidated.source, 3);
            const gConsolidated = consolidate(GoLanguage, [jStats1, gStats]);
            assert.deepStrictEqual(gConsolidated.language, GoLanguage);
            assert.strictEqual(gConsolidated.total, 9);
        });
    });

});

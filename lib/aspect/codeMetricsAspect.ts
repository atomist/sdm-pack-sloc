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
    Aspect,
    fingerprintOf,
} from "@atomist/sdm-pack-fingerprint";
import {
    calculateCodeMetrics,
    CodeMetrics,
} from "../codemetrics/CodeMetrics";

export const CodeMetricsAspectType = "CodeMetrics";
export const CodeMetricsAspect: Aspect<CodeMetrics> = {
    name: CodeMetricsAspectType,
    displayName: "Code metrics",
    extract: async p => {
        const data = await calculateCodeMetrics(p);
        return fingerprintOf({type: CodeMetricsAspectType, data});
    },
};

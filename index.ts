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
    ExtensionPack,
    Fingerprint,
    metadata,
    PushTest,
} from "@atomist/sdm";
import { lineCountFingerprinter } from "./lib/codemetrics/CodeMetrics";
import { SlocCommand } from "./lib/slocCommand";

export { CodeMetrics } from "./lib/codemetrics/CodeMetrics";

export { LanguageReport, LanguagesReport, LanguageReportRequest, reportForLanguages } from "./lib/slocReport";

/**
 * Extension pack to add codeMetrics commands to a machine
 * and optionally, fingerprint with lines of code after every push.
 * @param fingerprint if this is set, automatic fingerprinting will
 * happen on every push
 */
export function codeMetrics(
    fingerprint?: {
        pushTest?: PushTest,
        fingerprintGoal: Fingerprint,
    }): ExtensionPack {
    return {
        ...metadata(),
        configure: sdm => {
            sdm.addCodeInspectionCommand(SlocCommand);
            if (!!fingerprint) {
                fingerprint.fingerprintGoal.with(lineCountFingerprinter(fingerprint.pushTest));
            }
        },
    };
}

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
    Language,
    LanguageReportRequestable,
} from "./slocReport";

export const JavaLanguage: Language = { name: "Java", extensions: ["java"] };
export const KotlinLanguage: Language = { name: "Kotlin", extensions: ["kt"] };
export const ClojureLanguage: Language = { name: "Clojure", extensions: ["clj"] };
export const ScalaLanguage: Language = { name: "Scala", extensions: ["scala"] };
export const PythonLanguage: Language = { name: "Python", extensions: ["py"] };
export const RustLanguage: Language = { name: "Rust", extensions: ["rs"] };
export const GoLanguage: Language = { name: "Go", extensions: ["go"] };

export const ShellLanguage: Language = { name: "Shell", extensions: ["sh", "bash"] };
export const PowerShellLanguage: Language = { name: "PowerShell", extensions: ["ps1"] };

export const TypeScriptLanguage: Language = { name: "TypeScript", extensions: ["ts"] };
export const JavaScriptLanguage: Language = { name: "JavaScript", extensions: ["js"] };

export const YamlLanguage: Language = { name: "YAML", extensions: ["yaml", "yml"] };

/**
 * All languages for which we can compute statistics
 * @type {Language[]}
 */
export const AllLanguages: LanguageReportRequestable[] = [
    JavaLanguage, KotlinLanguage, ClojureLanguage, ScalaLanguage,
    PowerShellLanguage, ShellLanguage,
    TypeScriptLanguage, JavaScriptLanguage,
    PythonLanguage, RustLanguage,
    { language: GoLanguage, excludes: ["vendor/**"] },
    YamlLanguage,
];

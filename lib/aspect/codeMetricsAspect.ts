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

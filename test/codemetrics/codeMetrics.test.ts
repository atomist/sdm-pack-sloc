import { InMemoryProject } from "@atomist/automation-client";
import { calculateCodeMetrics } from "../../lib/codemetrics/CodeMetrics";
import * as assert from "assert";
import { AllLanguages } from "../../lib/languages";
import { InMemoryFile } from "@atomist/automation-client/lib/project/mem/InMemoryFile";

describe("calculateCodeMetrics", () => {

    it("should calculate for empty project without error", async () => {
        const p = InMemoryProject.of();
        const r = await calculateCodeMetrics(p);
        assert.strictEqual(r.languages.length, AllLanguages.length);
        r.languages.forEach(l => assert.strictEqual(l.total, 0));
    });

    it("should calculate for Java project", async () => {
        const p = InMemoryProject.of(new InMemoryFile("Thing.java", "public class Thing {}"));
        const r = await calculateCodeMetrics(p);
        assert.strictEqual(r.languages.length, AllLanguages.length);
        r.languages.filter(l => l.language.extensions[0] !== "java").forEach(l => assert.strictEqual(l.total, 0));
        r.languages.filter(l => l.language.extensions[0] === "java").forEach(l => assert.strictEqual(l.total, 1));

    });

});

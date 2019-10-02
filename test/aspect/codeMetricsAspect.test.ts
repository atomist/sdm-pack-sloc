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

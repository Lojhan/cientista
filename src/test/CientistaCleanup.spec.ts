import { describe, it, assert } from "poku";
import { waitFor } from "../helpers";
import { Cientista } from "../lib/Cientista";

describe("Cientista Cleanup", () => {
  const base = (a: number, b: number) => a + b;

  function createCientista() {
    return new Cientista(base, "Cientista Cleanup");
  }

  it("should call the cleanup method", async () => {
    const cientista = createCientista();
    let cleanupCallCount = 0;
    const cleanup = () => cleanupCallCount++;
    cientista.withTest("test", (a: number, b: number) => a + b, cleanup);
    await cientista.run(1, 2);
    await waitFor(() => assert.strictEqual(cleanupCallCount, 1));
  });
});

import { describe, it, assert } from "poku";
import { wait, waitFor } from "../helpers";
import { Cientista } from "../lib/Cientista";

describe("Cientista Performance", () => {
  const base = (a: number, b: number) => a + b;

  function createCientista() {
    return new Cientista(base, "Cientista Cleanup", {
      failOnDecreasedPerformance: true,
    });
  }

  it("should error on decreased performance", async () => {
    const cientista = createCientista();
    let errorKey = "";
    let errorResult = 0;
    let errorExperiment = "";
    cientista.onError((key, result, experiment) => {
      errorKey = key;
      errorResult = result as number;
      errorExperiment = experiment || "";
    });
    cientista.withAsyncTest("test", (a: number, b: number) =>
      wait(100).then(() => a + b),
    );
    await cientista.run(1, 2);

    await waitFor(() => {
      assert.strictEqual(errorKey, "test");
      assert.strictEqual(errorResult, 3);
      assert.strictEqual(errorExperiment, "Cientista Cleanup");
    });
  });
});

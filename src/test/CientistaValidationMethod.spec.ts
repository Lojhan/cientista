import { describe, it, assert } from "poku";
import { waitFor } from "../helpers";
import { Cientista } from "../lib/Cientista";
import { Verbosity } from "../lib/Verbosity";

describe("Cientista Validation Method", () => {
  const base = (a: number, b: number) => a + b;

  function createCientista() {
    return new Cientista(base, "Cientista Validation Method", {
      verbosity: Verbosity.Verbose,
    });
  }

  it("should call the validation method", async () => {
    const cientista = createCientista();
    let validateCallCount = 0;
    let onErrorCallCount = 0;
    const validate = () => {
      validateCallCount++;
      return false;
    };
    cientista.onError(() => onErrorCallCount++);
    cientista.withTest(
      "test",
      (a: number, b: number) => a + b,
      undefined,
      validate,
    );
    await cientista.run(1, 2);
    await waitFor(() => {
      assert.strictEqual(validateCallCount, 1);
      assert.strictEqual(onErrorCallCount, 1);
    });
  });
});

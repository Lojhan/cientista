import { describe, it, assert } from "poku";
import { waitFor } from "../helpers";
import { Cientista } from "../lib/Cientista";

describe("Cientista Skip", () => {
  const base = (a: number, b: number) => a + b;

  function createCientista() {
    return new Cientista(base, "Cientista Skip");
  }

  it("Overload 1: () => boolean", async () => {
    const cientista = createCientista();
    let onSuccessCallCount = 0;
    cientista.onSuccess(() => onSuccessCallCount++);
    cientista.withTest("test", (a: number, b: number) => a + b);
    cientista.skipTests(() => true);
    const result = await cientista.run(1, 2);

    assert.strictEqual(result, 3);
    await waitFor(() => assert.strictEqual(onSuccessCallCount, 0));
  });

  it("Overload 2: RegExp", async () => {
    const cientista = createCientista();
    const successCalls: string[] = [];
    cientista.onSuccess((key) => successCalls.push(key));
    cientista.withTest("test", (a: number, b: number) => a + b);
    cientista.withTest("shouldRun", (a: number, b: number) => a + b);
    cientista.skipTests(/test/);
    const result = await cientista.run(1, 2);

    assert.strictEqual(result, 3);
    await waitFor(() => {
      assert.ok(!successCalls.includes("test"));
      assert.ok(successCalls.includes("shouldRun"));
    });
  });

  it("Overload 3: string[]", async () => {
    const cientista = createCientista();
    const successCalls: string[] = [];
    cientista.onSuccess((key) => successCalls.push(key));
    cientista.withTest("test", (a: number, b: number) => a + b);
    cientista.withTest("test2", (a: number, b: number) => a + b);
    cientista.skipTests(["test"]);
    const result = await cientista.run(1, 2);

    assert.strictEqual(result, 3);
    await waitFor(() => {
      assert.ok(!successCalls.includes("test"));
      assert.ok(successCalls.includes("test2"));
    });
  });

  it("Overload 4: [string, () => boolean][]", async () => {
    const cientista = createCientista();
    const successCalls: string[] = [];
    cientista.onSuccess((key) => successCalls.push(key));
    cientista.withTest("test", (a: number, b: number) => a + b);
    cientista.withTest("test2", (a: number, b: number) => a + b);
    cientista.skipTests([["test", () => true]]);
    const result = await cientista.run(1, 2);

    assert.strictEqual(result, 3);
    await waitFor(() => {
      assert.ok(!successCalls.includes("test"));
      assert.ok(successCalls.includes("test2"));
    });
  });

  it("Overload 5: [RegExp, () => boolean][]", async () => {
    const cientista = createCientista();
    const successCalls: string[] = [];
    cientista.onSuccess((key) => successCalls.push(key));
    cientista.withTest("test", (a: number, b: number) => a + b);
    cientista.withTest("shouldRun", (a: number, b: number) => a + b);
    cientista.skipTests([[/test/, () => true]]);
    const result = await cientista.run(1, 2);

    assert.strictEqual(result, 3);
    await waitFor(() => {
      assert.ok(!successCalls.includes("test"));
      assert.ok(successCalls.includes("shouldRun"));
    });
  });
});

import { describe, it, assert } from "poku";
import { wait, waitFor } from "../helpers";
import { Cientista } from "../lib/Cientista";

describe("Cientista Async", () => {
  const base = (a: number, b: number) => wait(1).then(() => a + b);
  const test1 = (a: number, b: number) => wait(1).then(() => a - b);
  const test2 = (a: number, b: number) => wait(1).then(() => a * b);
  const test3 = (a: number, b: number) => wait(1).then(() => a / b);
  const test4 = (a: number, b: number) => wait(1).then(() => a + b);
  const test5 = (_: number, __: number) => {
    throw new Error("test5 error");
  };

  function createCientista() {
    return new Cientista(base, "Cientista Async")
      .withTest("test1", test1)
      .withTest("test2", test2)
      .withTest("test3", test3);
  }

  it("should run the base method and the test methods", async () => {
    const cientista = createCientista();
    const result = await cientista.run(1, 2);
    await waitFor(() => assert.strictEqual(result, 3));
  });

  it("should return the results of the test methods that failed", async () => {
    const cientista = createCientista();
    let onErrorCallCount = 0;
    cientista.onError(() => onErrorCallCount++);
    await cientista.run(1, 2);
    await waitFor(() => assert.strictEqual(onErrorCallCount, 3));
  });

  it("should return the results of the test methods that passed", async () => {
    const cientista = createCientista();
    cientista.withTest("test4", test4);
    let onSuccessCallCount = 0;
    let onErrorCallCount = 0;
    cientista.onSuccess(() => onSuccessCallCount++);
    cientista.onError(() => onErrorCallCount++);

    await cientista.run(1, 2);

    await waitFor(() => {
      assert.strictEqual(onSuccessCallCount, 1);
      assert.strictEqual(onErrorCallCount, 3);
    });
  });

  it("should return the results of the test methods that threw an exception", async () => {
    const cientista = createCientista();
    cientista.withTest("test5", test5);
    let onExceptionCallCount = 0;
    let onErrorCallCount = 0;

    cientista.onException(() => onExceptionCallCount++);
    cientista.onError(() => onErrorCallCount++);

    await cientista.run(1, 2);

    await waitFor(() => {
      assert.strictEqual(onExceptionCallCount, 1);
      assert.strictEqual(onErrorCallCount, 3);
    });
  });
});

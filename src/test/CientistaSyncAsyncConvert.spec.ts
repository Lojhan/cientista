import { describe, it, assert } from "poku";
import { waitFor } from "../helpers";
import { Cientista } from "../lib/Cientista";

describe("Cientista Sync Async Convert", () => {
  describe("From Sync to Async", () => {
    const base = (a: number, b: number) => a + b;

    function createCientista() {
      return new Cientista(base, "Cientista Async");
    }

    it("should run the base method and the test methods", async () => {
      const cientista = createCientista();
      const result = await cientista.run(1, 2);
      assert.strictEqual(result, 3);
    });

    it("should return the results of the test methods that passed", async () => {
      const cientista = createCientista();
      cientista.withAsyncTest(
        "testAsync",
        async (a: number, b: number) => a + b,
      );
      let onSuccessCallCount = 0;
      cientista.onSuccess(() => onSuccessCallCount++);

      await cientista.run(1, 2);
      await waitFor(() => assert.strictEqual(onSuccessCallCount, 1));
    });

    it("should return the results of the test methods that failed", async () => {
      const cientista = createCientista();
      cientista.withAsyncTest(
        "testAsync",
        async (a: number, b: number) => a * b,
      );
      let onErrorCallCount = 0;
      cientista.onError(() => onErrorCallCount++);

      await cientista.run(1, 2);
      await waitFor(() => assert.strictEqual(onErrorCallCount, 1));
    });

    it("should return the results of the test methods that threw an exception", async () => {
      const cientista = createCientista();
      cientista.withAsyncTest("testAsync", async (_: number, __: number) => {
        throw new Error("testAsync error");
      });
      let onExceptionCallCount = 0;
      cientista.onException(() => onExceptionCallCount++);

      await cientista.run(1, 2);
      await waitFor(() => assert.strictEqual(onExceptionCallCount, 1));
    });

    it("should return the results of the test methods that passed and the ones that failed", async () => {
      const cientista = createCientista();
      cientista.withAsyncTest(
        "testAsync",
        async (a: number, b: number) => a + b,
      );
      cientista.withAsyncTest(
        "testAsync2",
        async (a: number, b: number) => a * b,
      );
      let onSuccessCallCount = 0;
      let onErrorCallCount = 0;

      cientista.onSuccess(() => onSuccessCallCount++);
      cientista.onError(() => onErrorCallCount++);

      await cientista.run(1, 2);

      await waitFor(() => {
        assert.strictEqual(onSuccessCallCount, 1);
        assert.strictEqual(onErrorCallCount, 1);
      });
    });
  });

  describe("From Async to Sync", () => {
    const base = async (a: number, b: number) => a + b;

    function createCientista() {
      return new Cientista(base, "Cientista Sync");
    }

    it("should run the base method and the test methods", async () => {
      const cientista = createCientista();
      const result = await cientista.run(1, 2);
      assert.strictEqual(result, 3);
    });

    it("should return the results of the test methods that passed", async () => {
      const cientista = createCientista();
      cientista.withSyncTest("testSync", (a: number, b: number) => a + b);
      let onSuccessCallCount = 0;
      cientista.onSuccess(() => onSuccessCallCount++);

      await cientista.run(1, 2);
      await waitFor(() => assert.strictEqual(onSuccessCallCount, 1));
    });

    it("should return the results of the test methods that failed", async () => {
      const cientista = createCientista();
      cientista.withSyncTest("testSync", (a: number, b: number) => a * b);
      let onErrorCallCount = 0;
      cientista.onError(() => onErrorCallCount++);

      await cientista.run(1, 2);
      await waitFor(() => assert.strictEqual(onErrorCallCount, 1));
    });

    it("should return the results of the test methods that threw an exception", async () => {
      const cientista = createCientista();
      cientista.withSyncTest("testSync", (_: number, __: number) => {
        throw new Error("testSync error");
      });
      let onExceptionCallCount = 0;
      cientista.onException(() => onExceptionCallCount++);

      await cientista.run(1, 2);
      await waitFor(() => assert.strictEqual(onExceptionCallCount, 1));
    });

    it("should return the results of the test methods that passed and the ones that failed", async () => {
      const cientista = createCientista();
      cientista.withSyncTest("testSync", (a: number, b: number) => a + b);
      cientista.withSyncTest("testSync2", (a: number, b: number) => a * b);
      let onSuccessCallCount = 0;
      let onErrorCallCount = 0;

      cientista.onSuccess(() => onSuccessCallCount++);
      cientista.onError(() => onErrorCallCount++);

      await cientista.run(1, 2);

      await waitFor(() => {
        assert.strictEqual(onSuccessCallCount, 1);
        assert.strictEqual(onErrorCallCount, 1);
      });
    });
  });
});

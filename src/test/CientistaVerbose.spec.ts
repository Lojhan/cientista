import { describe, it, assert } from "poku";
import { waitFor } from "../helpers";
import { Cientista } from "../lib/Cientista";
import { Verbosity } from "../lib/Verbosity";

describe("Cientista Verbose", () => {
  const base = (a: number, b: number) => a + b;

  it("should log experiment", async () => {
    const loggerCalls: string[] = [];
    const logger = (msg: string) => loggerCalls.push(msg);
    const cientista = new Cientista(base, "Cientista Verbose", {
      logger,
      verbosity: Verbosity.Verbose,
    });

    cientista.withTest("test", (a: number, b: number) => a + b);
    await cientista.run(1, 2);
    await waitFor(() => {
      const expectedCalls = [
        "Running experiment: Cientista Verbose",
        "Running base function with args: 1,2",
        "Running test: test with args: 1,2",
        "Test: test succeeded with result: 3",
      ];

      for (const call of expectedCalls) {
        assert.ok(
          loggerCalls.some((logCall) => logCall.includes(call)),
          `Expected to find log call containing: ${call}`,
        );
      }
    });
  });

  it("should not log experiment", async () => {
    const loggerCalls: string[] = [];
    const logger = (msg: string) => loggerCalls.push(msg);
    const cientista = new Cientista(base, "Cientista Verbose", {
      logger,
      verbosity: Verbosity.Silent,
    });
    cientista.withTest("test", (a: number, b: number) => a + b);
    await cientista.run(1, 2);
    await waitFor(() => {
      assert.strictEqual(loggerCalls.length, 0);
    });
  });
});

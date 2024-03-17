import { waitFor } from "../helpers";
import { Cientista } from "../lib/Cientista";
import { Verbosity } from "../lib/Verbosity";

describe("Cientista Verbose", () => {
  const base = (a: number, b: number) => a + b;
  const logger = jest.fn();

  it("should log experiment", async () => {
    const cientista = new Cientista(base, "Cientista Verbose", {
      logger,
      verbosity: Verbosity.Verbose,
    });

    cientista.withTest("test", (a: number, b: number) => a + b);
    await cientista.run(1, 2);
    await waitFor(() => {
      const calls = [
        "Running experiment: Cientista Verbose",
        "Running base function with args: 1,2",
        "Base function cyclomatic complexity: 1",
        expect.stringContaining("Base function performance in ms:"),
        "Running test: test with args: 1,2",
        expect.stringContaining("Test:"),
        "Test: test succeeded with result: 3",
      ];

      for (const call of calls) {
        expect(logger).toHaveBeenCalledWith(call);
      }
    });
  });

  it("should not log experiment", async () => {
    const cientista = new Cientista(base, "Cientista Verbose", {
      logger,
      verbosity: Verbosity.Silent,
    });
    cientista.withTest("test", (a: number, b: number) => a + b);
    await cientista.run(1, 2);
    await waitFor(() => {
      expect(logger).toHaveBeenCalledTimes(0);
    });
  });
});

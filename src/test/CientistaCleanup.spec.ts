import { waitFor } from "../helpers";
import { Cientista } from "../lib/Cientista";

describe("Cientista Cleanup", () => {
  const base = (a: number, b: number) => a + b;

  function createCientista() {
    return new Cientista(base, "Cientista Cleanup");
  }

  it("should call the cleanup method", async () => {
    const cientista = createCientista();
    const cleanup = jest.fn();
    cientista.withTest("test", (a: number, b: number) => a + b, cleanup);
    await cientista.run(1, 2);
    await waitFor(() => expect(cleanup).toHaveBeenCalledTimes(1));
  });
});

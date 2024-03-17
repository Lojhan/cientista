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
    await waitFor(() => expect(result).toBe(3));
  });

  it("should return the results of the test methods that failed", async () => {
    const cientista = createCientista();
    const onError = jest.fn();
    cientista.onError(onError);
    await cientista.run(1, 2);
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(3));
  });

  it("should return the results of the test methods that passed", async () => {
    const cientista = createCientista();
    cientista.withTest("test4", test4);
    const onSuccess = jest.fn();
    const onError = jest.fn();
    cientista.onSuccess(onSuccess);
    cientista.onError(onError);

    await cientista.run(1, 2);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledTimes(3);
    });
  });

  it("should return the results of the test methods that threw an exception", async () => {
    const cientista = createCientista();
    cientista.withTest("test5", test5);
    const onException = jest.fn();
    const onError = jest.fn();

    cientista.onException(onException);
    cientista.onError(onError);

    await cientista.run(1, 2);

    await waitFor(() => {
      expect(onException).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledTimes(3);
    });
  });
});

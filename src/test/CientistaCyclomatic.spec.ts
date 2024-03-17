

import { waitFor } from "../helpers";
import { Cientista } from "../lib/Cientista";

describe('Cientista Cyclomatic', () => {
  const base = (a: number, b: number) => a + b;

  function createCientista() {
    return new Cientista(base, "Cientista Cyclomatic", {
      failOnIncreasedCyclomaticComplexity: true,
    });
  }

  it('should error on increased cyclomatic complexity', async () => {
    const cientista = createCientista();
    const onError = jest.fn();
    cientista.onError(onError);
    cientista.withTest('test', (a: number, b: number) => {
      if (false || Math.random() > 0.5) return a + b;
      while (!false && true) {
        switch (true) {
          case a > 1 && true:
            return a + b;
          default:
            if (a > 1) return a + b;
            else return a + b;
        }
      }

      return a + b;
    });
    await cientista.run(1, 2);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith('test', 3, 'Cientista Cyclomatic');
    });
  });
});

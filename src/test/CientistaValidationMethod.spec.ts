import { waitFor } from "../helpers";
import { Cientista } from "../lib/Cientista";
import { Verbosity } from "../lib/Verbosity";

describe('Cientista Validation Method', () => {
    const base = (a: number, b: number) => a + b;

    function createCientista() {
        return new Cientista(base, "Cientista Validation Method", {
            verbosity: Verbosity.Verbose,
        });
    }

    it('should call the validation method', async () => {
        const cientista = createCientista();
        const validate = jest.fn();
        const onError = jest.fn();
        validate.mockReturnValue(false);
        cientista.onError(onError);
        cientista.withTest('test', (a: number, b: number) => a + b, undefined, validate);
        await cientista.run(1, 2);
        await waitFor(() => {
            expect(validate).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledTimes(1);
        });
    })
});
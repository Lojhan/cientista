import { waitFor } from "../helpers.ts";
import { Cientista } from "../lib/Cientista.ts";

describe('Cientista Skip', () => {
    const base = (a: number, b: number) => a + b;

    function createCientista() {
        return new Cientista(base, "Cientista Skip");
    }

    it('Overload 1: () => boolean', async () => {
        const cientista = createCientista();
        const onSuccess = jest.fn();
        cientista.onSuccess(onSuccess);
        cientista.withTest('test', (a: number, b: number) => a + b);
        cientista.skipTests(() => true);
        const result = await cientista.run(1, 2);
       
        expect(result).toBe(3);
        await waitFor(() => expect(onSuccess).not.toHaveBeenCalled());
    });

    it('Overload 2: RegExp', async () => {
        const cientista = createCientista();
        const onSuccess = jest.fn();
        cientista.onSuccess(onSuccess);
        cientista.withTest('test', (a: number, b: number) => a + b);
        cientista.withTest('shouldRun', (a: number, b: number) => a + b);
        cientista.skipTests(/test/);
        const result = await cientista.run(1, 2);
       
        expect(result).toBe(3);
        await waitFor(() => {
            expect(onSuccess).not.toHaveBeenCalledWith('test', 3, 'Cientista Skip');
            expect(onSuccess).toHaveBeenCalledWith('shouldRun', 3, 'Cientista Skip');
        });
    });

    it('Overload 3: string[]', async () => {
        const cientista = createCientista();
        const onSuccess = jest.fn();
        cientista.onSuccess(onSuccess);
        cientista.withTest('test', (a: number, b: number) => a + b);
        cientista.withTest('test2', (a: number, b: number) => a + b);
        cientista.skipTests(['test']);
        const result = await cientista.run(1, 2);
       
        expect(result).toBe(3);
        await waitFor(() => {
            expect(onSuccess).not.toHaveBeenCalledWith('test', 3, 'Cientista Skip');
            expect(onSuccess).toHaveBeenCalledWith('test2', 3, 'Cientista Skip');
        });
    });

    it('Overload 4: [string, () => boolean][]', async () => {
        const cientista = createCientista();
        const onSuccess = jest.fn();
        cientista.onSuccess(onSuccess);
        cientista.withTest('test', (a: number, b: number) => a + b);
        cientista.withTest('test2', (a: number, b: number) => a + b);
        cientista.skipTests([['test', () => true]]);
        const result = await cientista.run(1, 2);
       
        expect(result).toBe(3);
        await waitFor(() => {
            expect(onSuccess).not.toHaveBeenCalledWith('test', 3, 'Cientista Skip');
            expect(onSuccess).toHaveBeenCalledWith('test2', 3, 'Cientista Skip');
        });
    });

    it('Overload 5: [RegExp, () => boolean][]', async () => {
        const cientista = createCientista();
        const onSuccess = jest.fn();
        cientista.onSuccess(onSuccess);
        cientista.withTest('test', (a: number, b: number) => a + b);
        cientista.withTest('shouldRun', (a: number, b: number) => a + b);
        cientista.skipTests([[/test/, () => true]]);
        const result = await cientista.run(1, 2);
       
        expect(result).toBe(3);
        await waitFor(() => {
            expect(onSuccess).not.toHaveBeenCalledWith('test', 3, 'Cientista Skip');
            expect(onSuccess).toHaveBeenCalledWith('shouldRun', 3, 'Cientista Skip');
        });
    });
});
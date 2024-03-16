import { waitFor } from "../helpers.ts";
import { Cientista } from "../lib/Cientista.ts";

describe('Cientista Sync Async Convert', () => {
    describe('From Sync to Async', () => {
        const base = (a: number, b: number) => a + b;

        function createCientista() {
            return new Cientista(base, "Cientista Async");
        }

        it('should run the base method and the test methods', async () => {
            const cientista = createCientista();
            const result = await cientista.run(1, 2);
            expect(result).toBe(3);
        });

        it('should return the results of the test methods that passed', async () => {
            const cientista = createCientista();
            cientista.withAsyncTest('testAsync', async (a: number, b: number) => a + b);
            const onSuccess = jest.fn();
            cientista.onSuccess(onSuccess);

            await cientista.run(1, 2)
            await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
        });

        it('should return the results of the test methods that failed', async () => {
            const cientista = createCientista();
            cientista.withAsyncTest('testAsync', async (a: number, b: number) => a * b);
            const onError = jest.fn();
            cientista.onError(onError);

            await cientista.run(1, 2);
            await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
        });

        it('should return the results of the test methods that threw an exception', async () => {
            const cientista = createCientista();
            cientista.withAsyncTest('testAsync', async (_: number, __: number) => { throw new Error('testAsync error') });
            const onException = jest.fn();
            cientista.onException(onException);

            await cientista.run(1, 2);
            await waitFor(() => expect(onException).toHaveBeenCalledTimes(1));
        });

        it('should return the results of the test methods that passed and the ones that failed', async () => {
            const cientista = createCientista();
            cientista.withAsyncTest('testAsync', async (a: number, b: number) => a + b);
            cientista.withAsyncTest('testAsync2', async (a: number, b: number) => a * b);
            const onSuccess = jest.fn();
            const onError = jest.fn();

            cientista.onSuccess(onSuccess);
            cientista.onError(onError);

            await cientista.run(1, 2);

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledTimes(1);
                expect(onError).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('From Async to Sync', () => {
        const base = async (a: number, b: number) => a + b;

        function createCientista() {
            return new Cientista(base, "Cientista Sync");
        }

        it('should run the base method and the test methods', async () => {
            const cientista = createCientista();
            const result = await cientista.run(1, 2);
            expect(result).toBe(3);
        });

        it('should return the results of the test methods that passed', async () => {
            const cientista = createCientista();
            cientista.withSyncTest('testSync', (a: number, b: number) => a + b);
            const onSuccess = jest.fn();
            cientista.onSuccess(onSuccess);

            await cientista.run(1, 2);
            await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
        });

        it('should return the results of the test methods that failed', async () => {
            const cientista = createCientista();
            cientista.withSyncTest('testSync', (a: number, b: number) => a * b);
            const onError = jest.fn();
            cientista.onError(onError);

            await cientista.run(1, 2);
            await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
        });

        it('should return the results of the test methods that threw an exception', async () => {
            const cientista = createCientista();
            cientista.withSyncTest('testSync', (_: number, __: number) => { throw new Error('testSync error') });
            const onException = jest.fn();
            cientista.onException(onException);

            await cientista.run(1, 2);
            await waitFor(() => expect(onException).toHaveBeenCalledTimes(1));
        });

        it('should return the results of the test methods that passed and the ones that failed', async () => {
            const cientista = createCientista();
            cientista.withSyncTest('testSync', (a: number, b: number) => a + b);
            cientista.withSyncTest('testSync2', (a: number, b: number) => a * b);
            const onSuccess = jest.fn();
            const onError = jest.fn();

            cientista.onSuccess(onSuccess);
            cientista.onError(onError);

            await cientista.run(1, 2);

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalledTimes(1);
                expect(onError).toHaveBeenCalledTimes(1);
            });
        });

    });
});
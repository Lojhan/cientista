import { wait, waitFor } from "../helpers";
import { Cientista } from "../lib/Cientista";

describe('Cientista Performance', () => {
    const base = (a: number, b: number) => a + b;

    function createCientista() {
        return new Cientista(base, "Cientista Cleanup" , {
            failOnDecreasedPerformance: true,
        });
    }

    it('should error on decreased performance', async () => {
        const cientista = createCientista();
        const onError = jest.fn();
        cientista.onError(onError);
        cientista.withAsyncTest('test', (a: number, b: number) => wait(100).then(() => a + b));
        await cientista.run(1, 2);
        
        await waitFor(() => {
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith('test', 3, 'Cientista Cleanup');
        });
    })
});
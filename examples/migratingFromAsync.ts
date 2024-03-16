import { wait } from "../src/helpers.ts";
import { Cientista } from "../src/lib/Cientista.ts";

const asyncBase = async () => {
  await wait(100);
  return 3;
}

const cientista = new Cientista(asyncBase, "Migration from async to sync");
cientista.withTest('willError', () => wait(100).then(() => 2));
cientista.withSyncTest('syncTest', () => 3);

(async () => {
  cientista.onError((key, result, experiment) => console.log(`Error on ${key} with result ${result} and experiment ${experiment}`));
  cientista.onSuccess((key, result, experiment) => console.log(`Success on ${key} with result ${result} and experiment ${experiment}`));
  const result = await cientista.run();
  console.log(`Result: ${result}`);
})();

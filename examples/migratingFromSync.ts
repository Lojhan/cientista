import { Cientista } from "../src/lib/Cientista.ts";
import { wait } from "../src/helpers.ts";


const syncBase = () => 3;
const cientista = new Cientista(syncBase, "Migration from sync to async");
cientista.withTest('willError', () => 2);
cientista.withAsyncTest('asyncTest', () => wait(100).then(() => 3));

(async () => {
  cientista.onError((key, result, experiment) => console.log(`Error on ${key} with result ${result} and experiment ${experiment}`));
  cientista.onSuccess((key, result, experiment) => console.log(`Success on ${key} with result ${result} and experiment ${experiment}`));
  const result = await cientista.run();
  console.log(`Result: ${result}`);
})()

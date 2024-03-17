
import { Cientista } from "../src/lib/Cientista";
import { Verbosity } from "../src/lib/Verbosity";

const willFalse = Math.random() > 0.5;

function withSmallComplexity() {
  if (true) {
    if (willFalse) return 3;
    else return 2;
  }
}

function withHigherComplexity() {
  let i = 0;
  while (i < 5) i++;
  if (true) {
    if (willFalse) return 3;
    else return 2;
  }
}

const cientista = new Cientista(withSmallComplexity, "Cyclomatic Complexity", {
  failOnDecreasedPerformance: false,
  failOnIncreasedCyclomaticComplexity: true,
  verbosity: Verbosity.Verbose,
});

cientista.withTest("Cyclomatic Complexity", withHigherComplexity);

console.log("Will fail on increased cyclomatic complexity");
(async () => {
  cientista.onError((key, result, experiment) => console.log(`Error on ${key} with result ${result} and experiment ${experiment}`));
  cientista.onSuccess((key, result, experiment) => console.log(`Success on ${key} with result ${result} and experiment ${experiment}`));
  const result = await cientista.run();
  console.log(`Result: ${result}`);
})();

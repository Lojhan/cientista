import { Cientista } from "../src/lib/Cientista";

function fibonacciBase(n: number): number {
  if (n <= 1) return n;
  return fibonacciBase(n - 1) + fibonacciBase(n - 2);
}

function fibonacciWithoutRecursion(n: number): number {
  let a = 0, b = 1, f = 1;
  for (let i = 2; i <= n; i++) {
    f = a + b;
    [a, b] = [b, f];
  }
  return f;
}

function fibonacciWithMemoization(n: number, memo: number[] = []): number {
  if (memo[n] !== undefined) return memo[n]!;
  if (n <= 1) return n;
  return memo[n] = fibonacciWithMemoization(n - 1, memo) + fibonacciWithMemoization(n - 2, memo);
}

async function fibonacciWithGenerator(n: number) {
  const fibonacciWithGenerator = function*(n: number) {
    let a = 0, b = 1, f = 1;
    for (let i = 2; i <= n; i++) {
      f = a + b;
      [a, b] = [b, f];
      yield f;
    }
    return f;
  }

  const generator = fibonacciWithGenerator(n);
  let result = generator.next();
  while (!result.done) {
    result = generator.next();
  }

  return result.value;
}


const cientista = new Cientista(fibonacciBase, "Fibonacci");
cientista.withTest('withoutRecursion', fibonacciWithoutRecursion);
cientista.withTest('withMemoization', fibonacciWithMemoization);
cientista.withAsyncTest('withGenerator', fibonacciWithGenerator);
cientista.withTest('identity', (n: number) => n);

(async () => {
  cientista.onError((key, result, experiment) => console.log(`Error on ${key} with result ${result} and experiment ${experiment}`));
  cientista.onSuccess((key, result, experiment) => console.log(`Success on ${key} with result ${result} and experiment ${experiment}`));
  const result = await cientista.run(10);
  console.log(`Result: ${result}`);
})();

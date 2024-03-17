# Cientista

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributors](#contributors)
- [Contributing](#contributing)

## Introduction

Cientista is a versatile library designed to facilitate the smooth update of critical software paths. It provides a structured approach to managing and executing experiments, including synchronous, asynchronous, and promise-returning tests. With configurable options for verbosity, logging, and behavior on cyclomatic complexity and performance changes, Cientista ensures robust and reliable experimentation processes. Ideal for developers and organizations aiming to streamline their testing workflows and enhance the quality of their software through rigorous experimentation.

## Features

- **Test Management**: Add, manage, and execute various types of tests including synchronous, asynchronous, and promise-returning tests.
- **Configurable Options**: Customize verbosity, logging, and behavior on cyclomatic complexity and performance changes.
- **Error Handling**: Robust error handling with support for custom error types and continuation chains.
- **Validation Methods**: Add custom validation methods for your tests.
- **Cleanup Methods**: Define cleanup methods to ensure resources are properly released after tests.

## Getting Started

### Installation

To install Cientista, run:

```bash
npm install cientista
```

### Usage

To use Cientista, import the library and create a new instance of the `Cientista` class. You can then add tests using the `with*` methods and execute them using the `run` method.

```javascript
import { Cientista } from 'cientista';

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

const cientista = new Cientista(fibonacciBase, "Fibonacci");
cientista.withTest('withoutRecursion', fibonacciWithoutRecursion);

cientista.onError((key, result, experiment) => console.log({ key, result, experiment }));

cientista.onSuccess((key, result, experiment) => console.log({ key, result, experiment }));
await cientista.run(10);
```

To skip test, you can use the `skipTests` method:

```javascript
    const cientista = new Cientista(fibonacciBase, "Fibonacci");

    // Skip all tests based on a condition
    cientista.skipTests(() => true); 

    // Skip all tests that match a specific regular expression
    cientista.skipTests(/test/); 

    // Skip all tests based in the array of test names
    cientista.skipTests(['test']); 

    // Skip multiple tests based on different conditions
    cientista.skipTests([
        ['test', () => true],
        [/otherTest/, () => true]
    ]); 
```

You can also execute cleanup methods after the tests are executed:

```javascript
    const cientista = new Cientista(fibonacciBase, "Fibonacci");

    const method = () => console.log('method');
    const cleanupMethod = () => console.log('cleanupMethod');
    cientista.withTest('withoutRecursion', method, cleanupMethod);

    await cientista.run(10);
```

Or

```javascript
    const cientista = new Cientista(baseMethod, "Fibonacci");

    const method = () => console.log('method');
    const cleanupMethod = () => console.log('cleanupMethod');

    cientista.withTest('withoutRecursion', method);
    cientista.withCleanup('withoutRecursion', cleanupMethod);

    await cientista.run(10);
```

You can also add custom validation methods for your tests:

```javascript
    const cientista = new Cientista(baseMethod, "Fibonacci");

    const method = () => console.log('method');
    const cleanupMethod = () => console.log('cleanupMethod');
    const validationMethod = (result) => result === 55;

    cientista.withTest('withoutRecursion', method, cleanupMethod, validationMethod);

    await cientista.run(10);
```

Cyclomatic complexity and performance changes can be configured using the `options` method:

```javascript
    const cientista = new Cientista(baseMethod, "Fibonacci", {
        failOnIncreasedCyclomaticComplexity: true,
        failOnDecreasedPerformance: true,
    });

    ...

    await cientista.run(10);
```

You can also add custom verbosity and logging options:

```javascript
    const cientista = new Cientista(baseMethod, "Fibonacci", {
        verbosity: 1, // 0 - Silent, 1 - Verbose
        log: console.log,
    });

    ...

    await cientista.run(10);
```

### Contributors

- [Vinícius Lojhan](https://github.com/Lojhan)


## Contributing

Contributions are welcome! Please read the [contributing guide](CONTRIBUTING.md) to get started.

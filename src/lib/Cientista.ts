import { Verbosity } from "./Verbosity";
import { checkCyclomaticComplexity } from "./cyclomaticComplexity";
import { executeWithPerformance } from "./performance";

type SkipTestsArguments =
  | (() => boolean)
  | RegExp
  | string[]
  | [string, () => boolean][]
  | [RegExp, () => boolean][];

type ValidationMethodParams = {
  result: unknown;
  testName: string;
  experimentName: string;
  performance: number;
  cyclomaticComplexity: number;
  baseCyclomaticComplexity: number;
  basePerformance: number;
};

type CientistaOptions = {
  verbosity?: Verbosity;
  logger?: (message: string) => void;
  failOnIncreasedCyclomaticComplexity?: boolean;
  failOnDecreasedPerformance?: boolean;
  ingoreAllTests?: boolean;
};

/**
 * A class for managing and running experiments with various tests.
 * @template TResult - The type of the result produced by the base function and tests.
 * @template TParams - The type of the parameters accepted by the base function and tests.
 */
export class Cientista<TResult, TParams extends Array<any>> {
  private tests: Map<string, Function> = new Map();
  private cleanupMethods: Map<string, Function> = new Map();
  private validationMethods: Map<string, Function> = new Map();
  private skippedTests: Set<string> = new Set();
  private isBusy = false;
  public isSettled = !this.isBusy;

  /**
   * Constructs a new Cientista instance for managing and running experiments with various tests.
   * @param base - The base function to be tested.
   * @param experimentName - The name of the experiment.
   * @param options - Configuration options for the Cientista instance.
   * @param options.verbosity - The verbosity level for logging.
   * @param options.logger - A custom logger function.
   * @param options.failOnIncreasedCyclomaticComplexity - Whether to fail on increased cyclomatic complexity.
   * @param options.failOnDecreasedPerformance - Whether to fail on decreased performance.
   * @param options.ingoreAllTests - Whether to ignore all tests.
   */
  constructor(
    private base: (...params: TParams) => TResult,
    private experimentName: string,
    private options: CientistaOptions = {
      verbosity: Verbosity.Silent,
      ingoreAllTests: false,
      logger: console.log,
      failOnIncreasedCyclomaticComplexity: false,
      failOnDecreasedPerformance: false,
    },
  ) {
    if (options.ingoreAllTests) this.skipTests(() => true);
    if (options.verbosity == undefined)
      this.options.verbosity = Verbosity.Silent;
    if (options.logger == undefined) this.options.logger = console.log;
    if (options.failOnIncreasedCyclomaticComplexity == undefined)
      this.options.failOnIncreasedCyclomaticComplexity = false;
    if (options.failOnDecreasedPerformance == undefined)
      this.options.failOnDecreasedPerformance = false;
  }

  /**
   * Adds a synchronous test to the experiment.
   * @param key - A unique key for the test.
   * @param test - The test function.
   * @param cleanupMethod - An optional cleanup method to be called after the test.
   * @param validationMethod - An optional validation method to be called after the test.
   * @returns The Cientista instance for method chaining.
   */
  public withTest(
    key: string,
    test: typeof this.base,
    cleanupMethod?: () => void,
    validationMethod?: (params: ValidationMethodParams) => boolean,
  ): this {
    this.tests.set(key, test);
    if (cleanupMethod) this.withCleanupMethod(key, cleanupMethod);
    if (validationMethod) this.withValidationMethod(key, validationMethod);
    return this;
  }

  /**
   * Adds an asynchronous test to the experiment.
   * @param key - A unique key for the test.
   * @param test - The asynchronous test function.
   * @param cleanupMethod - An optional cleanup method to be called after the test.
   * @param validationMethod - An optional validation method to be called after the test.
   * @returns The Cientista instance for method chaining.
   */
  public withAsyncTest(
    key: string,
    test: (...params: TParams) => Promise<TResult>,
    cleanupMethod?: () => void,
    validationMethod?: (params: ValidationMethodParams) => boolean,
  ): this {
    this.tests.set(key, test);
    if (cleanupMethod) this.withCleanupMethod(key, cleanupMethod);
    if (validationMethod) this.withValidationMethod(key, validationMethod);
    return this;
  }

  /**
   * Adds a synchronous test that returns a promise to the experiment.
   * @param key - A unique key for the test.
   * @param test - The test function that returns a promise.
   * @param cleanupMethod - An optional cleanup method to be called after the test.
   * @param validationMethod - An optional validation method to be called after the test.
   * @returns The Cientista instance for method chaining.
   */
  public withSyncTest(
    key: string,
    test: (...params: TParams) => Awaited<TResult>,
    cleanupMethod?: () => void,
    validationMethod?: (params: ValidationMethodParams) => boolean,
  ): this {
    this.tests.set(key, test);
    if (cleanupMethod) this.withCleanupMethod(key, cleanupMethod);
    if (validationMethod) this.withValidationMethod(key, validationMethod);
    return this;
  }

  /**
   * Adds a cleanup method to the experiment.
   * @param key - A unique key for the cleanup method.
   * @param cleanupMethod - The cleanup method.
   * @returns The Cientista instance for method chaining.
   */
  public withCleanupMethod(key: string, cleanupMethod: () => void): this {
    this.cleanupMethods.set(key, cleanupMethod);
    return this;
  }

  /**
   * Adds a validation method to the experiment.
   * @param key - A unique key for the validation method.
   * @param validationMethod - The validation method.
   * @returns The Cientista instance for method chaining.
   */
  public withValidationMethod(
    key: string,
    validationMethod: (params: ValidationMethodParams) => boolean,
  ): this {
    this.validationMethods.set(key, validationMethod);
    return this;
  }

  /**
   * Sets the callback to be invoked when an error occurs during a test.
   * @param callback - The error callback function.
   * @returns The Cientista instance for method chaining.
   */
  public onError(
    callback: (key: string, result: TResult, experimentName?: string) => void,
  ): this {
    this.onErrorCallback = callback;
    return this;
  }

  /**
   * Sets the callback to be invoked when a test succeeds.
   * @param callback - The success callback function.
   * @returns The Cientista instance for method chaining.
   */
  public onSuccess(
    callback: (key: string, result: TResult, experimentName?: string) => void,
  ): this {
    this.onSuccessCallback = callback;
    return this;
  }

  /**
   * Sets the callback to be invoked when an exception occurs during a test.
   * @param callback - The exception callback function.
   * @returns The Cientista instance for method chaining.
   */
  public onException(
    callback: (key: string, error: unknown, experimentName?: string) => void,
  ): this {
    this.onExceptionCallback = callback;
    return this;
  }

  private onErrorCallback: (
    key: string,
    result: TResult,
    experimentName?: string,
  ) => void = () => {};
  private onExceptionCallback: (
    key: string,
    error: unknown,
    experimentName?: string,
  ) => void = () => {};
  private onSuccessCallback: (
    key: string,
    result: TResult,
    experimentName?: string,
  ) => void = () => {};

  /**
   * Runs the base function and all registered tests.
   * @param args - The arguments to pass to the base function and tests.
   * @returns A promise that resolves with the result of the base function or undefined.
   */
  async run(...args: TParams): Promise<TResult | undefined> {
    if (this.options.ingoreAllTests) {
      this.log(`Ignoring all tests for experiment: ${this.experimentName}`);
      return this.base(...args);
    }

    this.log(`Running experiment: ${this.experimentName}`);
    this.log(`Running base function with args: ${args}`);
    this.isBusy = true;
    const baseCyclomaticComplexity = checkCyclomaticComplexity(this.base);
    this.log(
      `Base function cyclomatic complexity: ${baseCyclomaticComplexity}`,
    );
    const { time, result } = await executeWithPerformance<TResult>(
      async () => await this.base(...args),
    );
    this.log(`Base function performance in ms: ${time}`);
    await this.runTests(result, baseCyclomaticComplexity, time, ...args);
    return result;
  }

  /**
   * Runs all registered tests with the given arguments.
   * @param baseResult - The result of the base function.
   * @param args - The arguments to pass to the tests.
   * @returns A promise that resolves when all tests have completed.
   */
  private async runTests(
    baseResult: TResult,
    baseCyclomaticComplexity: number,
    basePerformance: number,
    ...args: TParams
  ): Promise<void> {
    for (const [key, test] of this.tests.entries()) {
      if (this.skippedTests.has(key)) {
        this.log(`Skipping test: ${key}`);
        continue;
      }

      const complexity = checkCyclomaticComplexity(test);
      const increasedComplexity = complexity > baseCyclomaticComplexity;

      const runTest = async () => {
        this.log(`Running test: ${key} with args: ${args}`);
        const { time, result } = await executeWithPerformance<TResult>(
          async () => await test(...args),
        );
        return { time, result };
      };

      const handleError = (error: unknown) => {
        this.log(`Test: ${key} threw an exception: ${error}`);
        this.onExceptionCallback(key, error, this.experimentName);
      };

      const handleSuccess = (time: number, result: TResult) => {
        const decreasedPerformance = time > basePerformance;
        if (decreasedPerformance) {
          this.log(`Test: ${key} has decreased performance: ${time}`);
        } else {
          this.log(`Test: ${key} performance in ms: ${time}`);
        }

        if (this.options.failOnDecreasedPerformance && decreasedPerformance) {
          this.log(`Test: ${key} failed with decreased performance: ${time}`);
          this.onErrorCallback(key, result, this.experimentName);
        } else if (
          this.options.failOnIncreasedCyclomaticComplexity &&
          increasedComplexity
        ) {
          this.log(
            `Test: ${key} failed with increased cyclomatic complexity: ${complexity}`,
          );
          this.onErrorCallback(key, result, this.experimentName);
        } else {
          const validationMethod = this.validationMethods.get(key);
          if (
            validationMethod &&
            !validationMethod({
              result,
              testName: key,
              experimentName: this.experimentName,
              performance: time,
              cyclomaticComplexity: complexity,
              baseCyclomaticComplexity,
              basePerformance,
            })
          ) {
            this.log(`Test: ${key} failed validation`);
            this.onErrorCallback(key, result, this.experimentName);
          } else if (result !== baseResult) {
            this.log(`Test: ${key} failed with result: ${result}`);
            this.onErrorCallback(key, result, this.experimentName);
          } else {
            this.log(`Test: ${key} succeeded with result: ${result}`);
            this.onSuccessCallback(key, result, this.experimentName);
          }
        }
      };

      try {
        const { time, result } = await runTest();
        handleSuccess(time, result);
      } catch (error) {
        handleError(error);
      } finally {
        const cleanup = this.cleanupMethods.get(key);
        if (cleanup) cleanup();
      }
    }

    this.isBusy = false;
  }

  private skipTest(key: string): void {
    this.skippedTests.add(key);
  }

  /**
   * Skips tests based on the provided criteria.
   * @param callback - A function that returns true to skip a test.
   */
  public skipTests(callback: () => boolean): void;

  /**
   * Skips tests based on the provided criteria.
   * @param regex - A regular expression to match test keys.
   */
  public skipTests(regex: RegExp): void;

  /**
   * Skips tests based on the provided criteria.
   * @param keys - An array of test keys to skip.
   */
  public skipTests(keys: string[]): void;

  /**
   * Skips tests based on the provided criteria.
   * @param keysWithCallback - An array of test keys with a callback function to determine if a test should be skipped.
   */
  public skipTests(keysWithCallback: [string, () => boolean][]): void;

  /**
   * Skips tests based on the provided criteria.
   * @param keysWithRegex - An array of test keys with a regular expression to match.
   */
  public skipTests(keysWithRegex: [RegExp, () => boolean][]): void;
  public skipTests(args: SkipTestsArguments): void {
    if (typeof args === "function") this.skipTestsByCallback(args);
    else if (args instanceof RegExp) this.skipTestsByRegex(args);
    else if (Array.isArray(args)) this.skipTestsByArray(args);
  }

  private skipTestsByCallback(callback: () => boolean): void {
    this.tests.forEach((_, key) => {
      if (callback()) this.skipTest(key);
    });
  }

  private skipTestsByRegex(regex: RegExp): void {
    this.tests.forEach((_, key) => {
      if (regex.test(key)) this.skipTest(key);
    });
  }

  private skipTestsByArray(args: SkipTestsArguments): void {
    if (!Array.isArray(args)) return;
    args.forEach((item) => {
      if (typeof item === "string") this.skipTest(item);
      else if (item instanceof RegExp) this.skipTestsByRegex(item);
      else if (Array.isArray(item) && item.length === 2) {
        const [keyOrRegex, callback] = item;
        if (typeof keyOrRegex === "string") {
          if (callback()) this.skipTest(keyOrRegex);
        } else if (keyOrRegex instanceof RegExp) {
          this.skipTestsByRegexWithCallback(keyOrRegex, callback);
        }
      }
    });
  }

  private skipTestsByRegexWithCallback(
    regex: RegExp,
    callback: () => boolean,
  ): void {
    this.tests.forEach((_, key) => {
      if (regex.test(key) && callback()) this.skipTest(key);
    });
  }

  private log(message: string): void {
    if (this.options.verbosity == Verbosity.Silent) return;
    this.options.logger!(message);
  }
}

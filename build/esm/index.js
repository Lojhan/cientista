import * as esprima from 'esprima';

var Verbosity;
(function (Verbosity) {
    Verbosity[Verbosity["Silent"] = 0] = "Silent";
    Verbosity[Verbosity["Verbose"] = 1] = "Verbose";
})(Verbosity || (Verbosity = {}));

function checkCyclomaticComplexity(func) {
    let complexity = 1;
    function visitNode(node) {
        if (!node)
            return;
        switch (node.type) {
            case 'IfStatement':
            case 'ConditionalExpression':
            case 'ForStatement':
            case 'ForInStatement':
            case 'ForOfStatement':
            case 'WhileStatement':
            case 'DoWhileStatement':
            case 'SwitchStatement':
                complexity++;
                break;
            case 'BinaryExpression':
                if (node.operator === '&&' || node.operator === '||') {
                    complexity++;
                }
                break;
        }
        // Recursively visit child nodes
        for (const key in node) {
            if (node.hasOwnProperty(key) && typeof node[key] === 'object') {
                visitNode(node[key]);
            }
        }
    }
    const funcString = func.toString();
    const ast = esprima.parseScript(funcString);
    visitNode(ast);
    return complexity;
}

async function executeWithPerformance(fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return {
        result: result,
        time: end - start
    };
}

/**
 * A class for managing and running experiments with various tests.
 * @template TResult - The type of the result produced by the base function and tests.
 * @template TParams - The type of the parameters accepted by the base function and tests.
 */
class Cientista {
    base;
    experimentName;
    options;
    tests = new Map();
    cleanupMethods = new Map();
    validationMethods = new Map();
    skippedTests = new Set();
    isBusy = false;
    isSettled = !this.isBusy;
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
    constructor(base, experimentName, options = {
        verbosity: Verbosity.Silent,
        ingoreAllTests: false,
        logger: console.log,
        failOnIncreasedCyclomaticComplexity: false,
        failOnDecreasedPerformance: false,
    }) {
        this.base = base;
        this.experimentName = experimentName;
        this.options = options;
        if (options.ingoreAllTests)
            this.skipTests(() => true);
        if (options.verbosity == undefined)
            this.options.verbosity = Verbosity.Silent;
        if (options.logger == undefined)
            this.options.logger = console.log;
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
    withTest(key, test, cleanupMethod, validationMethod) {
        this.tests.set(key, test);
        if (cleanupMethod)
            this.withCleanupMethod(key, cleanupMethod);
        if (validationMethod)
            this.withValidationMethod(key, validationMethod);
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
    withAsyncTest(key, test, cleanupMethod, validationMethod) {
        this.tests.set(key, test);
        if (cleanupMethod)
            this.withCleanupMethod(key, cleanupMethod);
        if (validationMethod)
            this.withValidationMethod(key, validationMethod);
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
    withSyncTest(key, test, cleanupMethod, validationMethod) {
        this.tests.set(key, test);
        if (cleanupMethod)
            this.withCleanupMethod(key, cleanupMethod);
        if (validationMethod)
            this.withValidationMethod(key, validationMethod);
        return this;
    }
    /**
     * Adds a cleanup method to the experiment.
     * @param key - A unique key for the cleanup method.
     * @param cleanupMethod - The cleanup method.
     * @returns The Cientista instance for method chaining.
     */
    withCleanupMethod(key, cleanupMethod) {
        this.cleanupMethods.set(key, cleanupMethod);
        return this;
    }
    /**
     * Adds a validation method to the experiment.
     * @param key - A unique key for the validation method.
     * @param validationMethod - The validation method.
     * @returns The Cientista instance for method chaining.
     */
    withValidationMethod(key, validationMethod) {
        this.validationMethods.set(key, validationMethod);
        return this;
    }
    /**
     * Sets the callback to be invoked when an error occurs during a test.
     * @param callback - The error callback function.
     * @returns The Cientista instance for method chaining.
     */
    onError(callback) {
        this.onErrorCallback = callback;
        return this;
    }
    /**
     * Sets the callback to be invoked when a test succeeds.
     * @param callback - The success callback function.
     * @returns The Cientista instance for method chaining.
     */
    onSuccess(callback) {
        this.onSuccessCallback = callback;
        return this;
    }
    /**
     * Sets the callback to be invoked when an exception occurs during a test.
     * @param callback - The exception callback function.
     * @returns The Cientista instance for method chaining.
     */
    onException(callback) {
        this.onExceptionCallback = callback;
        return this;
    }
    onErrorCallback = () => { };
    onExceptionCallback = () => { };
    onSuccessCallback = () => { };
    /**
     * Runs the base function and all registered tests.
     * @param args - The arguments to pass to the base function and tests.
     * @returns A promise that resolves with the result of the base function or undefined.
     */
    async run(...args) {
        if (this.options.ingoreAllTests) {
            this.log(`Ignoring all tests for experiment: ${this.experimentName}`);
            return this.base(...args);
        }
        this.log(`Running experiment: ${this.experimentName}`);
        this.log(`Running base function with args: ${args}`);
        this.isBusy = true;
        const baseCyclomaticComplexity = checkCyclomaticComplexity(this.base);
        this.log(`Base function cyclomatic complexity: ${baseCyclomaticComplexity}`);
        const { time, result } = await executeWithPerformance(async () => await this.base(...args));
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
    async runTests(baseResult, baseCyclomaticComplexity, basePerformance, ...args) {
        for (const [key, test] of this.tests.entries()) {
            if (this.skippedTests.has(key)) {
                this.log(`Skipping test: ${key}`);
                continue;
            }
            const complexity = checkCyclomaticComplexity(test);
            const increasedComplexity = complexity > baseCyclomaticComplexity;
            if (increasedComplexity) {
                this.log(`Test: ${key} has increased cyclomatic complexity: ${complexity}`);
            }
            try {
                this.log(`Running test: ${key} with args: ${args}`);
                const test = this.tests.get(key);
                const { time, result } = await executeWithPerformance(async () => await test(...args));
                const decreasedPerformance = time > basePerformance;
                if (decreasedPerformance) {
                    this.log(`Test: ${key} has decreased performance: ${time}`);
                }
                else {
                    this.log(`Test: ${key} performance in ms: ${time}`);
                }
                if (this.options.failOnDecreasedPerformance && decreasedPerformance) {
                    this.log(`Test: ${key} failed with decreased performance: ${time}`);
                    this.onErrorCallback(key, result, this.experimentName);
                    continue;
                }
                if (this.options.failOnIncreasedCyclomaticComplexity &&
                    increasedComplexity) {
                    this.log(`Test: ${key} failed with increased cyclomatic complexity: ${complexity}`);
                    this.onErrorCallback(key, result, this.experimentName);
                    continue;
                }
                const validationMethod = this.validationMethods.get(key);
                if (validationMethod) {
                    this.log(`Running validation method for test: ${key}`);
                    const validationResult = validationMethod({
                        result,
                        testName: key,
                        experimentName: this.experimentName,
                        performance: time,
                        cyclomaticComplexity: complexity,
                        baseCyclomaticComplexity,
                        basePerformance,
                    });
                    if (!validationResult) {
                        this.log(`Test: ${key} failed validation`);
                        this.onErrorCallback(key, result, this.experimentName);
                        continue;
                    }
                }
                if (result !== baseResult) {
                    this.log(`Test: ${key} failed with result: ${result}`);
                    this.onErrorCallback(key, result, this.experimentName);
                }
                else {
                    this.log(`Test: ${key} succeeded with result: ${result}`);
                    this.onSuccessCallback(key, result, this.experimentName);
                }
            }
            catch (error) {
                this.log(`Test: ${key} threw an exception: ${error}`);
                this.onExceptionCallback(key, error, this.experimentName);
            }
            finally {
                const clenup = this.cleanupMethods.get(key);
                if (clenup)
                    clenup();
            }
        }
        this.isBusy = false;
    }
    skipTest(key) {
        this.skippedTests.add(key);
    }
    skipTests(args) {
        if (typeof args === "function")
            this.skipTestsByCallback(args);
        else if (args instanceof RegExp)
            this.skipTestsByRegex(args);
        else if (Array.isArray(args))
            this.skipTestsByArray(args);
    }
    skipTestsByCallback(callback) {
        this.tests.forEach((_, key) => {
            if (callback())
                this.skipTest(key);
        });
    }
    skipTestsByRegex(regex) {
        this.tests.forEach((_, key) => {
            if (regex.test(key))
                this.skipTest(key);
        });
    }
    skipTestsByArray(args) {
        if (!Array.isArray(args))
            return;
        args.forEach((item) => {
            if (typeof item === "string")
                this.skipTest(item);
            else if (item instanceof RegExp)
                this.skipTestsByRegex(item);
            else if (Array.isArray(item) && item.length === 2) {
                const [keyOrRegex, callback] = item;
                if (typeof keyOrRegex === "string") {
                    if (callback())
                        this.skipTest(keyOrRegex);
                }
                else if (keyOrRegex instanceof RegExp) {
                    this.skipTestsByRegexWithCallback(keyOrRegex, callback);
                }
            }
        });
    }
    skipTestsByRegexWithCallback(regex, callback) {
        this.tests.forEach((_, key) => {
            if (regex.test(key) && callback())
                this.skipTest(key);
        });
    }
    log(message) {
        if (this.options.verbosity == Verbosity.Silent)
            return;
        this.options.logger(message);
    }
}

export { Cientista };

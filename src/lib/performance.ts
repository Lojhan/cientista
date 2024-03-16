
export async function executeWithPerformance<T>(fn: Function) {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  return {
    result: result as T,
    time: end - start
  }
}

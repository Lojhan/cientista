export async function executeWithPerformance<T>(fn: () => Promise<T> | T) {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  return {
    result: result as T,
    time: end - start,
  };
}

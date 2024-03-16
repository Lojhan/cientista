
export function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function waitFor(callback: Function, options: { timeout?: number, interval?: number } = {}) {
  const { timeout = 1000, interval = 50 } = options;
  const endTime = Date.now() + timeout;

  const checkCondition = async () => {
    if (Date.now() > endTime) throw new Error('Timed out in waitFor.');

    try {
      await callback();
      return true;
    } catch (error) {
      return false;
    }
  };

  return new Promise(async (resolve, reject) => {
    while (true) {
      try {
        const result = await checkCondition();
        if (result) return resolve(null);
      } catch (error) {
        return reject(error);
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }
  });
}

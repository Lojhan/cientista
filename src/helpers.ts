import { waitForExpectedResult } from "poku";

export function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function waitFor(
  callback: () => Promise<void> | void,
  options: { timeout?: number; interval?: number } = {},
) {
  const { timeout = 1000, interval = 50 } = options;

  await waitForExpectedResult(
    async () => {
      try {
        await callback();
        return true;
      } catch {
        return false;
      }
    },
    true,
    {
      delay: 0,
      interval,
      timeout,
      strict: false,
    },
  );
}

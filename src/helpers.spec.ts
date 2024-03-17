import { waitFor } from "./helpers";

describe("waitFor", () => {
  it("should resolve if the condition is met", async () => {
    const condition = () => expect(true).toBe(true);
    await expect(waitFor(condition)).resolves.toBeNull();
  });

  it("should reject if the condition is not met", async () => {
    const condition = () => expect(true).toBe(false);
    await expect(() => waitFor(condition)).rejects.toThrow(
      "Timed out in waitFor.",
    );
  });
});

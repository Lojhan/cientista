import { describe, it, assert } from "poku";
import { waitFor } from "./helpers";

describe("waitFor", () => {
  it("should resolve if the condition is met", async () => {
    const condition = () => assert.strictEqual(true, true);
    await waitFor(condition);
  });

  it("should reject if the condition is not met", async () => {
    const condition = () => {
      throw new Error("Condition not met");
    };
    try {
      await waitFor(condition, { timeout: 100 });
      assert.fail("Should have thrown");
    } catch (error: any) {
      assert.ok(error);
    }
  });
});

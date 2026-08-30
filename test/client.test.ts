import { describe, expect, it } from "vitest";
import { AuthenticationError, RateLimitError } from "context.dev";
import { callContext } from "../src/client.js";

function fakeError<T extends object>(Ctor: { prototype: T }): T {
  return Object.assign(Object.create(Ctor.prototype), { message: "boom" });
}

describe("callContext", () => {
  it("passes through a successful result", async () => {
    await expect(callContext(async () => 42)).resolves.toBe(42);
  });

  it("rewraps RateLimitError with an actionable message", async () => {
    const err = fakeError(RateLimitError);
    await expect(callContext(() => Promise.reject(err))).rejects.toThrow(/rate limit/i);
  });

  it("rewraps AuthenticationError with an actionable message", async () => {
    const err = fakeError(AuthenticationError);
    await expect(callContext(() => Promise.reject(err))).rejects.toThrow(/authentication failed/i);
  });

  it("rethrows any other error unmodified", async () => {
    const original = new Error("not found");
    await expect(callContext(() => Promise.reject(original))).rejects.toBe(original);
  });
});

import { ContextDev, AuthenticationError, RateLimitError } from "context.dev";
import type { ContextToolConfig } from "./types.js";

export function createClient(config: ContextToolConfig = {}): ContextDev {
  return new ContextDev({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });
}

/**
 * Runs a context.dev SDK call and rewraps the two error types an agent can
 * plausibly self-correct from mid-run with an actionable message. Every other
 * error is left to throw as-is: the AI SDK catches thrown errors from `execute`
 * automatically and surfaces them to the model as a tool-error step, so no
 * broad try/catch belongs here.
 */
export async function callContext<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof RateLimitError) {
      throw new Error(
        "context.dev rate limit reached. Wait before retrying, reduce request frequency, or upgrade your plan.",
      );
    }
    if (err instanceof AuthenticationError) {
      throw new Error(
        "context.dev authentication failed. Check that CONTEXT_DEV_API_KEY is set to a valid key.",
      );
    }
    throw err;
  }
}

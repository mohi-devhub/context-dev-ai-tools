import { describe, expect, it, vi } from "vitest";
import type { z } from "zod";

const screenshotMock = vi.fn();

vi.mock("context.dev", async (importOriginal) => {
  const actual = await importOriginal<typeof import("context.dev")>();
  return {
    ...actual,
    ContextDev: vi.fn().mockImplementation(function () {
      return { web: { screenshot: screenshotMock } };
    }),
  };
});

const { contextScreenshot } = await import("../../src/tools/screenshot.js");


describe("contextScreenshot", () => {
  it("maps boolean fullScreenshot to the API's 'true'/'false' string literal", async () => {
    screenshotMock.mockResolvedValue({ url: "https://cdn/x.png" });
    await contextScreenshot().execute!(
      { domain: "example.com", fullScreenshot: true },
      { toolCallId: "1", messages: [] } as any,
    );
    expect(screenshotMock).toHaveBeenCalledWith(expect.objectContaining({ domain: "example.com", fullScreenshot: "true" }));
  });

  it("rejects input with both domain and directUrl", () => {
    expect(() =>
      (contextScreenshot().inputSchema as z.ZodTypeAny).parse({
        domain: "example.com",
        directUrl: "https://example.com",
      }),
    ).toThrow();
  });

  it("rejects input with neither domain nor directUrl", () => {
    expect(() => (contextScreenshot().inputSchema as z.ZodTypeAny).parse({})).toThrow();
  });
});

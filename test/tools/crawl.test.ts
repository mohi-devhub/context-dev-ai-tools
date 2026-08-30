import { describe, expect, it, vi } from "vitest";
import type { z } from "zod";

const webCrawlMdMock = vi.fn();

vi.mock("context.dev", async (importOriginal) => {
  const actual = await importOriginal<typeof import("context.dev")>();
  return {
    ...actual,
    ContextDev: vi.fn().mockImplementation(function () {
      return { web: { webCrawlMd: webCrawlMdMock } };
    }),
  };
});

const { contextCrawl } = await import("../../src/tools/crawl.js");


describe("contextCrawl", () => {
  it("defaults maxPages to 10 when omitted, so an agent cannot trigger an unbounded crawl", async () => {
    webCrawlMdMock.mockResolvedValue({ pages: [] });
    const parsed = (contextCrawl().inputSchema as z.ZodTypeAny).parse({ url: "https://example.com" }) as {
      maxPages: number;
    };
    expect(parsed.maxPages).toBe(10);
  });

  it("forwards an explicit maxPages override", async () => {
    webCrawlMdMock.mockResolvedValue({ pages: [] });
    await contextCrawl().execute!(
      { url: "https://example.com", maxPages: 50 },
      { toolCallId: "1", messages: [] } as any,
    );
    expect(webCrawlMdMock).toHaveBeenCalledWith(expect.objectContaining({ maxPages: 50 }));
  });
});

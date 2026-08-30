import { describe, expect, it, vi } from "vitest";

const webScrapeMdMock = vi.fn();

vi.mock("context.dev", async (importOriginal) => {
  const actual = await importOriginal<typeof import("context.dev")>();
  return {
    ...actual,
    ContextDev: vi.fn().mockImplementation(function () {
      return { web: { webScrapeMd: webScrapeMdMock } };
    }),
  };
});

const { contextScrape } = await import("../../src/tools/scrape.js");


describe("contextScrape", () => {
  it("forwards the url and options to client.web.webScrapeMd", async () => {
    webScrapeMdMock.mockResolvedValue({ markdown: "# Title" });
    const result = await contextScrape().execute!(
      { url: "https://example.com", useMainContentOnly: true },
      { toolCallId: "1", messages: [] } as any,
    );
    expect(webScrapeMdMock).toHaveBeenCalledWith({ url: "https://example.com", useMainContentOnly: true });
    expect(result).toEqual({ markdown: "# Title" });
  });
});

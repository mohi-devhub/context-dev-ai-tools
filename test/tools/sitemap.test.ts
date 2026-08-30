import { describe, expect, it, vi } from "vitest";

const webScrapeSitemapMock = vi.fn();

vi.mock("context.dev", async (importOriginal) => {
  const actual = await importOriginal<typeof import("context.dev")>();
  return {
    ...actual,
    ContextDev: vi.fn().mockImplementation(function () {
      return { web: { webScrapeSitemap: webScrapeSitemapMock } };
    }),
  };
});

const { contextSitemap } = await import("../../src/tools/sitemap.js");


describe("contextSitemap", () => {
  it("forwards the domain and filters to client.web.webScrapeSitemap", async () => {
    webScrapeSitemapMock.mockResolvedValue({ urls: [] });
    const result = await contextSitemap().execute!(
      { domain: "example.com", search: "pricing" },
      { toolCallId: "1", messages: [] } as any,
    );
    expect(webScrapeSitemapMock).toHaveBeenCalledWith({ domain: "example.com", search: "pricing" });
    expect(result).toEqual({ urls: [] });
  });
});

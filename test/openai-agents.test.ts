import { describe, expect, it, vi } from "vitest";
import { RunContext } from "@openai/agents";

const searchMock = vi.fn();
const extractMock = vi.fn();

vi.mock("context.dev", async (importOriginal) => {
  const actual = await importOriginal<typeof import("context.dev")>();
  return {
    ...actual,
    ContextDev: vi.fn().mockImplementation(function () {
      return { web: { search: searchMock, extract: extractMock } };
    }),
  };
});

const { contextSearch, contextExtract, contextTools } = await import("../src/openai-agents/index.js");

describe("openai-agents wrappers", () => {
  it("names the tool and forwards invoke() input to the same execute logic as the AI SDK tool", async () => {
    searchMock.mockResolvedValue({ results: [{ title: "x" }] });
    const searchTool = contextSearch({ apiKey: "test" });

    expect(searchTool.name).toBe("contextSearch");

    const output = await searchTool.invoke(new RunContext(), JSON.stringify({ query: "hello", numResults: 20 }));

    expect(searchMock).toHaveBeenCalledWith({ query: "hello", numResults: 20 });
    expect(output).toEqual({ results: [{ title: "x" }] });
  });

  it("builds contextExtract with a non-strict JSON Schema, since its open-ended `schema` field can't satisfy OpenAI's strict structured-outputs format", async () => {
    extractMock.mockResolvedValue({ price: 42 });
    const extractTool = contextExtract({ apiKey: "test" });

    expect(extractTool.strict).toBe(false);

    const output = await extractTool.invoke(
      new RunContext(),
      JSON.stringify({ url: "https://example.com", schema: { type: "object", properties: { price: { type: "number" } } } }),
    );

    expect(extractMock).toHaveBeenCalledWith({
      url: "https://example.com",
      schema: { type: "object", properties: { price: { type: "number" } } },
    });
    expect(output).toEqual({ price: 42 });
  });

  it("bundles every tool, each named after its AI SDK counterpart", () => {
    const names = contextTools().map((t) => t.name);
    expect(names).toEqual([
      "contextSearch",
      "contextScrape",
      "contextCrawl",
      "contextSitemap",
      "contextExtract",
      "contextScreenshot",
      "contextBrand",
      "contextNews",
      "contextParse",
    ]);
  });
});

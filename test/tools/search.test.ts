import { describe, expect, it, vi } from "vitest";

const searchMock = vi.fn();

vi.mock("context.dev", async (importOriginal) => {
  const actual = await importOriginal<typeof import("context.dev")>();
  return {
    ...actual,
    ContextDev: vi.fn().mockImplementation(function () {
      return { web: { search: searchMock } };
    }),
  };
});

const { contextSearch } = await import("../../src/tools/search.js");


describe("contextSearch", () => {
  it("forwards mapped input to client.web.search and returns its result", async () => {
    searchMock.mockResolvedValue({ results: [{ title: "x" }] });
    const result = await contextSearch({ apiKey: "test" }).execute!(
      { query: "hello", numResults: 5, country: "us" },
      { toolCallId: "1", messages: [] } as any,
    );
    expect(searchMock).toHaveBeenCalledWith({ query: "hello", numResults: 5, country: "us" });
    expect(result).toEqual({ results: [{ title: "x" }] });
  });

  it("lets a thrown error propagate for the AI SDK to surface as a tool error", async () => {
    searchMock.mockImplementation(() => Promise.reject(new Error("upstream failure")));
    let caught: unknown;
    try {
      await contextSearch().execute!({ query: "hello" }, { toolCallId: "1", messages: [] } as any);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toBe("upstream failure");
  });
});

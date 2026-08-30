import { describe, expect, it, vi } from "vitest";

const extractMock = vi.fn();

vi.mock("context.dev", async (importOriginal) => {
  const actual = await importOriginal<typeof import("context.dev")>();
  return {
    ...actual,
    ContextDev: vi.fn().mockImplementation(function () {
      return { web: { extract: extractMock } };
    }),
  };
});

const { contextExtract } = await import("../../src/tools/extract.js");


describe("contextExtract", () => {
  it("forwards the url and JSON-schema object to client.web.extract", async () => {
    extractMock.mockResolvedValue({ data: { price: 9.99 } });
    const schema = { type: "object", properties: { price: { type: "number" } } };
    const result = await contextExtract().execute!(
      { url: "https://example.com/product", schema },
      { toolCallId: "1", messages: [] } as any,
    );
    expect(extractMock).toHaveBeenCalledWith({ url: "https://example.com/product", schema });
    expect(result).toEqual({ data: { price: 9.99 } });
  });
});

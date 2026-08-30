import { describe, expect, it, vi } from "vitest";

const handleMock = vi.fn();

vi.mock("context.dev", async (importOriginal) => {
  const actual = await importOriginal<typeof import("context.dev")>();
  return {
    ...actual,
    ContextDev: vi.fn().mockImplementation(function () {
      return { parse: { handle: handleMock } };
    }),
  };
});

const { contextParse } = await import("../../src/tools/parse.js");


describe("contextParse", () => {
  it("decodes base64 into a File and forwards it plus params to client.parse.handle", async () => {
    handleMock.mockResolvedValue({ markdown: "# Doc", success: true, type: "pdf" });
    const fileBase64 = Buffer.from("hello world").toString("base64");
    const result = await contextParse().execute!(
      { fileBase64, extension: "pdf", ocr: true },
      { toolCallId: "1", messages: [] } as any,
    );

    expect(handleMock).toHaveBeenCalledTimes(1);
    const [file, params] = handleMock.mock.calls[0]!;
    expect(await (file as File).text()).toBe("hello world");
    expect(params).toEqual({ extension: "pdf", ocr: true, includeImages: undefined, includeLinks: undefined });
    expect(result).toEqual({ markdown: "# Doc", success: true, type: "pdf" });
  });
});

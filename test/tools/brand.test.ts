import { describe, expect, it, vi } from "vitest";

const retrieveMock = vi.fn();

vi.mock("context.dev", async (importOriginal) => {
  const actual = await importOriginal<typeof import("context.dev")>();
  return {
    ...actual,
    ContextDev: vi.fn().mockImplementation(function () {
      return { brand: { retrieve: retrieveMock } };
    }),
  };
});

const { contextBrand } = await import("../../src/tools/brand.js");


describe("contextBrand", () => {
  it("always calls client.brand.retrieve with the by_domain discriminator", async () => {
    retrieveMock.mockResolvedValue({ name: "Stripe" });
    const result = await contextBrand().execute!(
      { domain: "stripe.com" },
      { toolCallId: "1", messages: [] } as any,
    );
    expect(retrieveMock).toHaveBeenCalledWith({ domain: "stripe.com", type: "by_domain", maxSpeed: undefined });
    expect(result).toEqual({ name: "Stripe" });
  });
});

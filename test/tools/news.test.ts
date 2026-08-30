import { describe, expect, it, vi } from "vitest";
import type { z } from "zod";

const newsSearchMock = vi.fn();

vi.mock("context.dev", async (importOriginal) => {
  const actual = await importOriginal<typeof import("context.dev")>();
  return {
    ...actual,
    ContextDev: vi.fn().mockImplementation(function () {
      return { news: { search: newsSearchMock } };
    }),
  };
});

const { contextNews } = await import("../../src/tools/news.js");


describe("contextNews", () => {
  it("the schema defaults entityType to 'name' when the model omits it", () => {
    const parsed = (contextNews().inputSchema as z.ZodTypeAny).parse({ entity: "Stripe" }) as {
      entityType: string;
    };
    expect(parsed.entityType).toBe("name");
  });

  it("builds the searchBy.entity union correctly for a name lookup", async () => {
    newsSearchMock.mockResolvedValue({ data: [] });
    await contextNews().execute!(
      { entity: "Stripe", entityType: "name" },
      { toolCallId: "1", messages: [] } as any,
    );
    expect(newsSearchMock).toHaveBeenCalledWith({
      searchBy: { type: "entity", entity: { type: "name", name: "Stripe" } },
      limit: undefined,
      sortBy: undefined,
    });
  });

  it("builds a domain-typed entity and a sortBy object when requested", async () => {
    newsSearchMock.mockResolvedValue({ data: [] });
    await contextNews().execute!(
      { entity: "stripe.com", entityType: "domain", sortBy: "relevance" },
      { toolCallId: "1", messages: [] } as any,
    );
    expect(newsSearchMock).toHaveBeenCalledWith({
      searchBy: { type: "entity", entity: { type: "domain", domain: "stripe.com" } },
      limit: undefined,
      sortBy: { type: "relevance" },
    });
  });
});

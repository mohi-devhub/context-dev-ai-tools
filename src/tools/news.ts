import { tool } from "ai";
import { z } from "zod";
import { createClient, callContext } from "../client.js";
import type { ContextToolConfig } from "../types.js";

const inputSchema = z.object({
  entity: z.string().describe("The company to search news for — a name, domain, or stock ticker, matching `entityType`."),
  entityType: z
    .enum(["name", "domain", "ticker"])
    .optional()
    .default("name")
    .describe("How to interpret `entity`. Defaults to 'name'."),
  limit: z.number().int().min(1).max(50).optional().describe("Maximum articles to return. Defaults to 10."),
  sortBy: z.enum(["relevance", "newest"]).optional().describe("Result ordering. Defaults to 'newest'."),
});

export const contextNews = (config: ContextToolConfig = {}) => {
  const client = createClient(config);
  return tool({
    description: "Search recent news articles about a company, identified by name, domain, or stock ticker.",
    inputSchema,
    execute: async ({ entity, entityType, limit, sortBy }) =>
      callContext(() =>
        client.news.search({
          searchBy: {
            type: "entity",
            entity:
              entityType === "domain"
                ? { type: "domain", domain: entity }
                : entityType === "ticker"
                  ? { type: "ticker", ticker: entity }
                  : { type: "name", name: entity },
          },
          limit,
          sortBy: sortBy ? { type: sortBy } : undefined,
        }),
      ),
  });
};

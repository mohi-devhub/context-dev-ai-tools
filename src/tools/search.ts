import { tool } from "ai";
import type { WebSearchParams } from "context.dev/resources/web";
import { z } from "zod";
import { createClient, callContext } from "../client.js";
import type { ContextToolConfig } from "../types.js";

const inputSchema = z.object({
  query: z
    .string()
    .describe(
      "Search query. Accepts natural language as well as Google-style operators such as site:, -site:, inurl:, intitle:, quoted phrases, and OR.",
    ),
  numResults: z.number().int().min(1).max(50).optional().describe("Number of results to return. Defaults to 10."),
  freshness: z
    .enum(["last_24_hours", "last_week", "last_month", "last_year"])
    .optional()
    .describe("Restrict results to content published within this window."),
  includeDomains: z.array(z.string()).optional().describe('Allowlist domains, e.g. ["arxiv.org", "github.com"].'),
  excludeDomains: z.array(z.string()).optional().describe('Blocklist domains, e.g. ["pinterest.com"].'),
  country: z
    .string()
    .length(2)
    .optional()
    .describe("Two-letter ISO 3166-1 alpha-2 country code to localize results, e.g. 'us', 'gb', 'de'."),
});

export const contextSearch = (config: ContextToolConfig = {}) => {
  const client = createClient(config);
  return tool({
    description: "Search the live web and get back structured results (title, url, snippet) using context.dev's real-time search index.",
    inputSchema,
    execute: async ({ country, ...rest }) =>
      callContext(() =>
        client.web.search({ ...rest, country: country as WebSearchParams["country"] }),
      ),
  });
};

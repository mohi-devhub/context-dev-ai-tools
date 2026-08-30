import { tool } from "ai";
import { z } from "zod";
import { createClient, callContext } from "../client.js";
import type { ContextToolConfig } from "../types.js";

const inputSchema = z.object({
  domain: z.string().describe("Domain to build/discover a sitemap for, e.g. 'example.com'."),
  search: z
    .string()
    .optional()
    .describe("Optional search phrase; the sitemap is filtered to pages whose URLs are about that phrase, most relevant first."),
  urlRegex: z.string().optional().describe("Only return URLs matching this regular expression."),
  maxLinks: z
    .number()
    .int()
    .min(1)
    .max(100_000)
    .optional()
    .describe("Maximum number of links to return. Defaults to 10,000."),
});

export const contextSitemap = (config: ContextToolConfig = {}) => {
  const client = createClient(config);
  return tool({
    description: "Discover a website's URLs via its sitemap, optionally filtered by a search phrase or regex. Useful for planning a crawl before running contextCrawl.",
    inputSchema,
    execute: async (input) => callContext(() => client.web.webScrapeSitemap(input)),
  });
};

import { tool } from "ai";
import { z } from "zod";
import { createClient, callContext } from "../client.js";
import type { ContextToolConfig } from "../types.js";

const inputSchema = z.object({
  url: z.string().url().describe("The starting URL for the crawl (must include http:// or https://)."),
  maxPages: z
    .number()
    .int()
    .min(1)
    .max(500)
    .optional()
    .default(10)
    .describe(
      "Maximum number of pages to crawl. Defaults to 10 and is capped here well below the API's own ceiling — crawling is credit-metered per page, so an agent should not be able to trigger a large crawl without the caller raising this explicitly.",
    ),
  maxDepth: z
    .number()
    .int()
    .min(0)
    .max(10)
    .optional()
    .describe("Maximum link depth from the starting URL (0 = only the starting page). No limit if omitted."),
  urlRegex: z.string().optional().describe("Only crawl URLs matching this regular expression."),
  followSubdomains: z
    .boolean()
    .optional()
    .describe("When true, also follow links on subdomains of the starting URL's domain."),
});

export const contextCrawl = (config: ContextToolConfig = {}) => {
  const client = createClient(config);
  return tool({
    description: "Crawl a website starting from a URL and return clean Markdown for every reachable page, up to the given limits.",
    inputSchema,
    execute: async (input) => callContext(() => client.web.webCrawlMd(input)),
  });
};

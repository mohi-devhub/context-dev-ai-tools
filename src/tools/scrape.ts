import { tool } from "ai";
import { z } from "zod";
import { createClient, callContext } from "../client.js";
import type { ContextToolConfig } from "../types.js";

const inputSchema = z.object({
  url: z.string().url().describe("Full URL to scrape into LLM-usable Markdown (must include http:// or https://)."),
  includeImages: z.boolean().optional().describe("Include image references in the Markdown output."),
  includeLinks: z.boolean().optional().describe("Preserve hyperlinks in the Markdown output."),
  useMainContentOnly: z
    .boolean()
    .optional()
    .default(true)
    .describe("Strip navigation, ads, and boilerplate, keeping only the main article/content region."),
});

export const contextScrape = (config: ContextToolConfig = {}) => {
  const client = createClient(config);
  return tool({
    description: "Scrape a single URL and return clean Markdown with navigation and ads stripped, ready for LLM context.",
    inputSchema,
    execute: async (input) => callContext(() => client.web.webScrapeMd(input)),
  });
};

import { tool } from "ai";
import { z } from "zod";
import { createClient, callContext } from "../client.js";
import type { ContextToolConfig } from "../types.js";

const inputSchema = z.object({
  url: z.string().url().describe("The starting website URL to crawl and extract structured data from (must include http:// or https://)."),
  schema: z
    .record(z.string(), z.unknown())
    .describe(
      "A JSON Schema object (not a Zod schema) describing the shape of data to extract, e.g. { type: 'object', properties: { price: { type: 'number' } } }.",
    ),
  instructions: z.string().optional().describe("Optional natural-language instructions to guide the extraction."),
  factCheck: z
    .boolean()
    .optional()
    .describe("When true, every returned value must be grounded in facts stated on the page; ungrounded fields come back null/empty."),
});

/** Shared with the `./openai-agents` subpath so both frameworks wrap the same schema and execute logic. */
export function extractToolSpec(config: ContextToolConfig = {}) {
  const client = createClient(config);
  return {
    description: "Extract structured data from a URL according to a JSON Schema you provide.",
    inputSchema,
    execute: async (input: z.infer<typeof inputSchema>) => callContext(() => client.web.extract(input)),
  };
}

export const contextExtract = (config: ContextToolConfig = {}) => tool(extractToolSpec(config));

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

export const contextExtract = (config: ContextToolConfig = {}) => {
  const client = createClient(config);
  return tool({
    description: "Extract structured data from a URL according to a JSON Schema you provide.",
    inputSchema,
    execute: async (input) => callContext(() => client.web.extract(input)),
  });
};

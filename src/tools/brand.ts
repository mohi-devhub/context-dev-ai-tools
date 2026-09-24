import { tool } from "ai";
import { z } from "zod";
import { createClient, callContext } from "../client.js";
import type { ContextToolConfig } from "../types.js";

const inputSchema = z.object({
  domain: z.string().describe("Domain to retrieve brand data for, e.g. 'stripe.com'."),
  maxSpeed: z
    .boolean()
    .optional()
    .describe("When true, skip time-consuming operations for a faster response at the cost of less comprehensive data."),
});

/** Shared with the `./openai-agents` subpath so both frameworks wrap the same schema and execute logic. */
export function brandToolSpec(config: ContextToolConfig = {}) {
  const client = createClient(config);
  return {
    description:
      "Look up a company's brand profile by domain — logo, colors, description, social profiles, and industry classification. Only the domain lookup variant is exposed; the underlying API also supports lookup by name/email/ticker.",
    inputSchema,
    execute: async ({ domain, maxSpeed }: z.infer<typeof inputSchema>) =>
      callContext(() => client.brand.retrieve({ domain, type: "by_domain", maxSpeed })),
  };
}

export const contextBrand = (config: ContextToolConfig = {}) => tool(brandToolSpec(config));

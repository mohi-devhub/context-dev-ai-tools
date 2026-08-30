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

export const contextBrand = (config: ContextToolConfig = {}) => {
  const client = createClient(config);
  return tool({
    description:
      "Look up a company's brand profile by domain — logo, colors, description, social profiles, and industry classification. Only the domain lookup variant is exposed; the underlying API also supports lookup by name/email/ticker.",
    inputSchema,
    execute: async ({ domain, maxSpeed }) =>
      callContext(() => client.brand.retrieve({ domain, type: "by_domain", maxSpeed })),
  });
};

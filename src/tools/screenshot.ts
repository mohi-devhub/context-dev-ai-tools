import { tool } from "ai";
import type { WebScreenshotParams } from "context.dev/resources/web";
import { z } from "zod";
import { createClient, callContext } from "../client.js";
import type { ContextToolConfig } from "../types.js";

const inputSchema = z
  .object({
    domain: z.string().optional().describe("Domain to screenshot, e.g. 'example.com'. Provide exactly one of domain or directUrl."),
    directUrl: z.string().url().optional().describe("A specific URL to screenshot directly. Provide exactly one of domain or directUrl."),
    fullScreenshot: z.boolean().optional().describe("Capture the full scrollable page instead of just the viewport."),
    colorScheme: z.enum(["light", "dark"]).optional().describe("Force the site's light or dark visual theme before capture."),
    clearPopups: z.boolean().optional().describe("Dismiss detected cookie/consent banners and other obstructive overlays before capture."),
  })
  .refine((v) => (v.domain ? !v.directUrl : !!v.directUrl), {
    message: "Provide exactly one of `domain` or `directUrl`.",
  });

export const contextScreenshot = (config: ContextToolConfig = {}) => {
  const client = createClient(config);
  return tool({
    description: "Capture a screenshot of a webpage (full page or viewport) and return an image URL.",
    inputSchema,
    execute: async ({ domain, directUrl, fullScreenshot, ...rest }) =>
      callContext(() =>
        client.web.screenshot({
          ...rest,
          ...(domain ? { domain } : { directUrl }),
          ...(fullScreenshot !== undefined && {
            fullScreenshot: (fullScreenshot ? "true" : "false") satisfies WebScreenshotParams["fullScreenshot"],
          }),
        }),
      ),
  });
};

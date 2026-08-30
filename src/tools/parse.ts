import { tool } from "ai";
import { toFile } from "context.dev";
import type { ParseHandleParams } from "context.dev/resources/parse";
import { z } from "zod";
import { createClient, callContext } from "../client.js";
import type { ContextToolConfig } from "../types.js";

const inputSchema = z.object({
  fileBase64: z.string().describe("The document's raw bytes, base64-encoded."),
  extension: z
    .string()
    .optional()
    .describe("File extension hint, e.g. 'pdf', 'docx', 'xlsx', 'pptx', 'html', 'csv'. Helps the parser pick the right strategy."),
  includeImages: z.boolean().optional().describe("Include image references in the Markdown output."),
  includeLinks: z.boolean().optional().describe("Preserve hyperlinks in the Markdown output."),
  ocr: z
    .boolean()
    .optional()
    .describe("For PDFs, OCR pages that have no usable text layer (scans) instead of skipping them."),
});

export const contextParse = (config: ContextToolConfig = {}) => {
  const client = createClient(config);
  return tool({
    description: "Parse an uploaded document (PDF, DOCX, PPTX, XLSX, HTML, CSV, and more) into clean Markdown.",
    inputSchema,
    execute: async ({ fileBase64, extension, ...rest }) =>
      callContext(async () =>
        client.parse.handle(await toFile(Buffer.from(fileBase64, "base64")), {
          ...rest,
          extension: extension as ParseHandleParams["extension"],
        }),
      ),
  });
};

import { tool } from "@openai/agents";
import { z } from "zod";
import { searchToolSpec } from "../tools/search.js";
import { scrapeToolSpec } from "../tools/scrape.js";
import { crawlToolSpec } from "../tools/crawl.js";
import { sitemapToolSpec } from "../tools/sitemap.js";
import { extractToolSpec } from "../tools/extract.js";
import { screenshotToolSpec } from "../tools/screenshot.js";
import { brandToolSpec } from "../tools/brand.js";
import { newsToolSpec } from "../tools/news.js";
import { parseToolSpec } from "../tools/parse.js";
import type { ContextToolConfig } from "../types.js";

// Each tool spec (`{ description, inputSchema, execute }`, the shape the AI SDK's
// `tool()` takes) is reused as-is; only the field names differ for the OpenAI
// Agents SDK's `tool()`, which wants `parameters` instead of `inputSchema` and
// requires an explicit `name`. Left as separate calls, rather than one generic
// helper, because `tool()`'s overloads don't resolve through a generic schema type.

export const contextSearch = (config: ContextToolConfig = {}) => {
  const { description, inputSchema, execute } = searchToolSpec(config);
  return tool({ name: "contextSearch", description, parameters: inputSchema, execute });
};

export const contextScrape = (config: ContextToolConfig = {}) => {
  const { description, inputSchema, execute } = scrapeToolSpec(config);
  return tool({ name: "contextScrape", description, parameters: inputSchema, execute });
};

export const contextCrawl = (config: ContextToolConfig = {}) => {
  const { description, inputSchema, execute } = crawlToolSpec(config);
  return tool({ name: "contextCrawl", description, parameters: inputSchema, execute });
};

export const contextSitemap = (config: ContextToolConfig = {}) => {
  const { description, inputSchema, execute } = sitemapToolSpec(config);
  return tool({ name: "contextSitemap", description, parameters: inputSchema, execute });
};

export const contextExtract = (config: ContextToolConfig = {}) => {
  const { description, inputSchema, execute } = extractToolSpec(config);
  // The `schema` field is an open-ended JSON Schema object (arbitrary caller-defined
  // keys), which OpenAI's strict structured-outputs mode can't represent — it requires
  // every property statically named with `additionalProperties: false`. Falling back to
  // a plain (non-strict) JSON Schema, converted from the same Zod schema, skips that
  // requirement; round-tripping through JSON also drops a stray `~standard` marker that
  // `zod`'s schema-conversion output carries and that `tool()` would otherwise mistake
  // for a Standard Schema library needing strict mode.
  const parameters = JSON.parse(JSON.stringify(z.toJSONSchema(inputSchema)));
  return tool({ name: "contextExtract", description, parameters, strict: false, execute });
};

export const contextScreenshot = (config: ContextToolConfig = {}) => {
  const { description, inputSchema, execute } = screenshotToolSpec(config);
  return tool({ name: "contextScreenshot", description, parameters: inputSchema, execute });
};

export const contextBrand = (config: ContextToolConfig = {}) => {
  const { description, inputSchema, execute } = brandToolSpec(config);
  return tool({ name: "contextBrand", description, parameters: inputSchema, execute });
};

export const contextNews = (config: ContextToolConfig = {}) => {
  const { description, inputSchema, execute } = newsToolSpec(config);
  return tool({ name: "contextNews", description, parameters: inputSchema, execute });
};

export const contextParse = (config: ContextToolConfig = {}) => {
  const { description, inputSchema, execute } = parseToolSpec(config);
  return tool({ name: "contextParse", description, parameters: inputSchema, execute });
};

export type { ContextToolConfig } from "../types.js";

/**
 * Convenience bundle of every tool in this package, ready to spread into an
 * Agent's `tools` array: `new Agent({ tools: contextTools() })`.
 */
export function contextTools(config: ContextToolConfig = {}) {
  return [
    contextSearch(config),
    contextScrape(config),
    contextCrawl(config),
    contextSitemap(config),
    contextExtract(config),
    contextScreenshot(config),
    contextBrand(config),
    contextNews(config),
    contextParse(config),
  ];
}

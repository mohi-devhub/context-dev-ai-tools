import { contextSearch } from "./tools/search.js";
import { contextScrape } from "./tools/scrape.js";
import { contextCrawl } from "./tools/crawl.js";
import { contextSitemap } from "./tools/sitemap.js";
import { contextExtract } from "./tools/extract.js";
import { contextScreenshot } from "./tools/screenshot.js";
import { contextBrand } from "./tools/brand.js";
import { contextNews } from "./tools/news.js";
import { contextParse } from "./tools/parse.js";
import type { ContextToolConfig } from "./types.js";

export { contextSearch } from "./tools/search.js";
export { contextScrape } from "./tools/scrape.js";
export { contextCrawl } from "./tools/crawl.js";
export { contextSitemap } from "./tools/sitemap.js";
export { contextExtract } from "./tools/extract.js";
export { contextScreenshot } from "./tools/screenshot.js";
export { contextBrand } from "./tools/brand.js";
export { contextNews } from "./tools/news.js";
export { contextParse } from "./tools/parse.js";
export type { ContextToolConfig } from "./types.js";

/**
 * Convenience bundle of every tool in this package, ready to spread into an
 * AI SDK `tools` object: `tools: { ...contextTools() }`.
 */
export function contextTools(config: ContextToolConfig = {}) {
  return {
    contextSearch: contextSearch(config),
    contextScrape: contextScrape(config),
    contextCrawl: contextCrawl(config),
    contextSitemap: contextSitemap(config),
    contextExtract: contextExtract(config),
    contextScreenshot: contextScreenshot(config),
    contextBrand: contextBrand(config),
    contextNews: contextNews(config),
    contextParse: contextParse(config),
  };
}

# context-dev-ai-tools

> **Community-built, unofficial.** This package wraps the official [`context.dev`](https://www.npmjs.com/package/context.dev) SDK as [Vercel AI SDK](https://ai-sdk.dev) tools. It is not published or maintained by context.dev — see [context.dev](https://www.context.dev/) and [docs.context.dev](https://docs.context.dev) for their official SDKs and MCP server.

Vercel AI SDK `tool()` wrappers for [context.dev](https://www.context.dev/)'s live web data API: search, scrape, crawl, structured extraction, document parsing, screenshots, brand intelligence, and news — ready to drop into `generateText`/`streamText`. Every example below was run against the real context.dev API; the sample output is real (trimmed for length), not illustrative.

## Contents

- [Install](#install)
- [Quick start](#quick-start)
- [Setup](#setup)
- [Tools](#tools)
  - [contextSearch](#contextsearch)
  - [contextScrape](#contextscrape)
  - [contextCrawl](#contextcrawl)
  - [contextSitemap](#contextsitemap)
  - [contextExtract](#contextextract)
  - [contextParse](#contextparse)
  - [contextScreenshot](#contextscreenshot)
  - [contextBrand](#contextbrand)
  - [contextNews](#contextnews)
- [The `contextTools()` bundle](#the-contexttools-bundle)
- [Error handling](#error-handling)
- [Not included (v1 scope)](#not-included-v1-scope)
- [TypeScript](#typescript)
- [Links](#links)

## Install

```bash
npm install context-dev-ai-tools ai zod
```

Requires an `ai` version in `^5.0.0 || ^6.0.0 || ^7.0.0` and a context.dev API key ([get one here](https://www.context.dev/) — the free tier includes 250-500 one-time credits, enough to try every tool below several times over).

## Quick start

```ts
import { generateText, stepCountIs } from "ai";
import { contextSearch, contextScrape } from "context-dev-ai-tools";

const result = await generateText({
  model: yourModel,
  prompt: "What did Stripe announce this week? Cite the source URL.",
  tools: {
    contextSearch: contextSearch(),
    contextScrape: contextScrape(),
  },
  stopWhen: stepCountIs(3),
});

console.log(result.text);
```

This exact pattern (asking a live question, letting the model pick a tool on its own) has been run end-to-end against the real API — see [`examples/smoke.ts`](./examples/smoke.ts).

## Setup

Each tool factory accepts an optional config object, or falls back to environment variables (the same ones the underlying `context.dev` SDK reads):

```ts
contextSearch({ apiKey: "...", baseURL: "..." });
```

| Env var | Purpose |
|---|---|
| `CONTEXT_DEV_API_KEY` | Your context.dev API key. Required if `apiKey` isn't passed explicitly. |
| `CONTEXT_DEV_BASE_URL` | Override the API base URL. Optional. |

## Tools

Every code sample below calls `.execute()` directly (bypassing a model) purely to show real input/output shapes — in normal use you hand the tool to `generateText`/`streamText` and the model decides when to call it, as in [Quick start](#quick-start).

### `contextSearch`

Search the live web; returns structured results with relevance and (optionally) inline markdown.

```ts
await contextSearch().execute({ query: "context.dev pricing", numResults: 10 });
```

`numResults` must be between **10 and 100** (defaults to 10) — this is a real API-enforced minimum, not a suggestion; passing less throws a validation error.

```json
{
  "results": [
    {
      "url": "https://www.context.dev/pricing",
      "title": "Pricing - Simple & Scalable Plans",
      "description": "Start free, build for $25, and scale to enterprise ・ $25/month Start building 10,000 credits per month...",
      "relevance": "high",
      "markdown": { "markdown": null, "code": "NOT_REQUESTED" }
    }
  ]
}
```

### `contextScrape`

Scrape one URL to clean Markdown, boilerplate stripped by default.

```ts
await contextScrape().execute({ url: "https://www.context.dev/pricing", useMainContentOnly: true });
```

```json
{
  "success": true,
  "markdown": "# Pricing that scales with your product\n\nStart with **250 credits...**\n\n### Free\n\nFor testing out the API\n\n$0/month\n..."
}
```

### `contextCrawl`

Crawl a site from a starting URL, page by page, to Markdown. `maxPages` defaults to **10** here (well under the API's own cap of 500) so an agent can't trigger a large, credit-metered crawl by omission — raise it explicitly for bigger jobs. `maxDepth` accepts `0` (crawl only the starting page).

```ts
await contextCrawl().execute({ url: "https://www.context.dev/pricing", maxPages: 2 });
```

```json
{
  "results": [
    {
      "markdown": "[New: Monitors. Watch any website for changes→](https://www.context.dev/blog/announcing-context-dev-monitors)\n\n[Context.dev](https://www.context.dev/)\n\nFeatures\n\n..."
    }
  ]
}
```

### `contextSitemap`

Discover a site's URLs via its sitemap; good for planning a crawl before running `contextCrawl`.

```ts
await contextSitemap().execute({ domain: "context.dev", maxLinks: 5 });
```

```json
{
  "success": true,
  "domain": "context.dev",
  "urls": [
    "https://www.context.dev",
    "https://www.context.dev/pricing",
    "https://www.context.dev/web-scraping-api",
    "https://www.context.dev/data-extraction-api",
    "https://www.context.dev/signup"
  ],
  "meta": { "sitemapsDiscovered": 1, "sitemapsFetched": 1, "sitemapsSkipped": 0, "errors": 0 },
  "key_metadata": { "credits_consumed": 1, "credits_remaining": 246 }
}
```

Note `key_metadata` — every response includes live credit accounting, so an agent's logs can show exactly what a call cost.

### `contextExtract`

Extract structured data from a URL using a JSON Schema you provide. Under the hood this can crawl a handful of linked pages to fill the schema, which is why it costs more credits than a single scrape.

```ts
await contextExtract().execute({
  url: "https://www.context.dev/pricing",
  schema: { type: "object", properties: { plans: { type: "array", items: { type: "string" } } } },
});
```

```json
{
  "status": "ok",
  "url": "https://www.context.dev/pricing",
  "urls_analyzed": ["https://www.context.dev/pricing", "https://www.context.dev/compare", "..."],
  "data": { "plans": ["Free", "Developer", "Pro", "Scale", "Enterprise"] },
  "metadata": { "numUrls": 5, "maxCrawlDepth": 1, "numSucceeded": 5, "numFailed": 0 },
  "key_metadata": { "credits_consumed": 10, "credits_remaining": 234 }
}
```

### `contextParse`

Parse an uploaded document (PDF, DOCX, PPTX, XLSX, HTML, CSV, and more) to Markdown. Input is a base64-encoded file.

```ts
const fileBase64 = Buffer.from("# Hello\n\nThis is a test document.").toString("base64");
await contextParse().execute({ fileBase64, extension: "md" });
```

```json
{
  "success": true,
  "markdown": "# Hello\n\nThis is a test document.",
  "type": "markdown",
  "key_metadata": { "credits_consumed": 1, "credits_remaining": 233 }
}
```

### `contextScreenshot`

Screenshot a page (viewport or full-page) by domain or direct URL; returns an image URL, not raw bytes.

```ts
await contextScreenshot().execute({ domain: "context.dev" });
```

```json
{
  "status": "ok",
  "domain": "context.dev",
  "screenshot": "https://media.brand.dev/screenshots/cache/18d2bd86ef6794b899022ec129f184d4.png",
  "screenshotType": "viewport",
  "width": 1920,
  "height": 1080,
  "cache_metadata": { "status": "hit", "age_ms": 50586303 }
}
```

### `contextBrand`

Look up a company's brand profile by domain — description, colors, logos, and more. Only the by-domain lookup is exposed here (the underlying API also supports by-name/email/ticker).

```ts
await contextBrand().execute({ domain: "stripe.com" });
```

```json
{
  "status": "ok",
  "brand": {
    "domain": "stripe.com",
    "title": "Stripe",
    "description": "Stripe is a global financial-infrastructure platform that enables businesses of all sizes to accept payments, manage billing, issue cards, and move money across borders...",
    "slogan": "Financial infrastructure to grow your revenue.",
    "colors": [
      { "hex": "#543cfc", "name": "Meteor Shower", "source": "logo" },
      { "hex": "#a494fc", "name": "Cobalite", "source": "logo" }
    ],
    "logos": [{ "url": "https://media.brand.dev/46054561-c3dc-4220-ae40-a170bf6deda8.svg", "mode": "dark" }]
  }
}
```

### `contextNews`

Search recent news about a company by name, domain, or ticker.

```ts
await contextNews().execute({ entity: "Stripe", entityType: "name", limit: 2 });
```

```json
{
  "data": [
    {
      "id": "8f8d0a7cce11510ef014dc29604b76721acda1c4c0da4a4ac18b8e2553c801c7",
      "url": "https://techinasia.com/meet-16yearold-builder-caught-stripes-attention",
      "title": "Meet the 16-year-old builder who caught Stripe's attention",
      "published_at": "2026-08-31T08:30:39.000Z",
      "source": { "name": "Tech in Asia", "domain": "techinasia.com", "direct": true },
      "match": { "level": "primary", "confidence": 0.72 }
    }
  ]
}
```

## The `contextTools()` bundle

Pull in every tool at once instead of importing each individually:

```ts
import { generateText, stepCountIs } from "ai";
import { contextTools } from "context-dev-ai-tools";

const result = await generateText({
  model: yourModel,
  prompt: "...",
  tools: { ...contextTools() },
  stopWhen: stepCountIs(5),
});
```

`contextTools(config?)` applies the same config (API key, base URL) to every tool it returns.

## Error handling

Every tool's `execute` lets thrown errors propagate — the AI SDK automatically catches them and surfaces a `tool-error` step the model can react to (retry, apologize, try different arguments), so nothing is silently swallowed. Two exceptions are rewrapped with an actionable message before propagating: a `RateLimitError` becomes "context.dev rate limit reached...", and an `AuthenticationError` becomes "...check that CONTEXT_DEV_API_KEY is set correctly." Every other error (the context.dev SDK's typed `APIError` subclasses — 400/404/409/422/5xx) passes through unmodified.

## Not included (v1 scope)

This package deliberately covers the tools that make sense as single-call agent actions, not the full ~40-method context.dev API surface. Not exposed here: monitor management (create/update/list/webhooks — stateful, not a single-shot call), batch job submission/polling, people enrichment, NAICS/SIC industry classification, transaction enrichment, competitor/font/styleguide extraction, and brand lookup by name/email/ticker (only by-domain is exposed). Use the official [`context.dev`](https://www.npmjs.com/package/context.dev) SDK directly for those.

## TypeScript

Fully typed — every tool's input schema is a Zod object, and `contextTools()` is typed as a `Record` of AI SDK `Tool`s.

## Links

- [context.dev](https://www.context.dev/)
- [context.dev docs](https://docs.context.dev)
- [context.dev TypeScript SDK](https://github.com/context-dot-dev/context-typescript-sdk) (the dependency this package wraps)
- [Vercel AI SDK docs](https://ai-sdk.dev)

## License

MIT

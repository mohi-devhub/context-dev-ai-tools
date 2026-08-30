# context-dev-ai-tools

> **Community-built, unofficial.** This package wraps the official [`context.dev`](https://www.npmjs.com/package/context.dev) SDK as [Vercel AI SDK](https://ai-sdk.dev) tools. It is not published or maintained by context.dev — see [context.dev](https://www.context.dev/) and [docs.context.dev](https://docs.context.dev) for their official SDKs and MCP server.

Vercel AI SDK `tool()` wrappers for [context.dev](https://www.context.dev/)'s live web data API: search, scrape, crawl, structured extraction, document parsing, brand intelligence, and news, ready to drop into `generateText`/`streamText`.

## Install

```bash
npm install context-dev-ai-tools ai zod
```

Requires an `ai` version in `^5.0.0 || ^6.0.0 || ^7.0.0` and a context.dev API key ([get one here](https://www.context.dev/)).

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

Or pull in every tool at once:

```ts
import { contextTools } from "context-dev-ai-tools";

const result = await generateText({
  model: yourModel,
  prompt: "...",
  tools: { ...contextTools() },
  stopWhen: stepCountIs(5),
});
```

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

| Tool | What it does |
|---|---|
| `contextSearch` | Search the live web; returns structured results. |
| `contextScrape` | Scrape one URL to clean Markdown. |
| `contextCrawl` | Crawl a site from a starting URL to Markdown, page by page. Defaults `maxPages` to 10 to keep an agent from triggering a large, credit-metered crawl unintentionally — raise it explicitly for bigger jobs. |
| `contextSitemap` | Discover a site's URLs via its sitemap; good for planning a crawl. |
| `contextExtract` | Extract structured data from a URL using a JSON Schema you provide. |
| `contextParse` | Parse an uploaded document (PDF, DOCX, PPTX, XLSX, HTML, CSV, ...) to Markdown. Input is a base64-encoded file. |
| `contextScreenshot` | Screenshot a page (viewport or full-page) by domain or direct URL. |
| `contextBrand` | Look up a company's brand profile by domain (logo, colors, socials, industry). |
| `contextNews` | Search recent news about a company by name, domain, or ticker. |

Every tool's `execute` lets thrown errors propagate — the AI SDK automatically surfaces them to the model as a `tool-error` step it can react to, so no result is silently swallowed. Rate-limit and auth failures are rewrapped with an actionable message; everything else (the context.dev SDK's typed `APIError` subclasses) passes through as-is.

### Not included (v1 scope)

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

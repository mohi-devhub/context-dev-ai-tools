/**
 * Manual end-to-end proof: runs a real generateText() call against real
 * context.dev and model APIs, using two of this package's tools. Not part of
 * `npm test` — run it by hand before publishing a release. Put your keys in
 * a `.env` file in the project root (already gitignored):
 *
 *   CONTEXT_DEV_API_KEY=...
 *   ANTHROPIC_API_KEY=...
 *
 * Then: npm run example:smoke
 */
import "dotenv/config";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, stepCountIs } from "ai";
import { contextSearch, contextScrape } from "../src/index.js";

const result = await generateText({
  model: anthropic("claude-sonnet-5"),
  system: "Use the available tools at most once each, then answer concisely with sources.",
  prompt: "What is context.dev's product, in one paragraph? Cite the URL you scraped.",
  tools: {
    contextSearch: contextSearch(),
    contextScrape: contextScrape(),
  },
  stopWhen: stepCountIs(3),
});

console.log(result.text);
console.log("\n--- steps ---");
for (const step of result.steps) {
  for (const call of step.toolCalls) console.log(`called ${call.toolName}`, call.input);
}

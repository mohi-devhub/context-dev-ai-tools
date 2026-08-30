export interface ContextToolConfig {
  /** Defaults to the CONTEXT_DEV_API_KEY environment variable. */
  apiKey?: string;
  /** Defaults to the CONTEXT_DEV_BASE_URL environment variable, or the SDK's built-in default. */
  baseURL?: string;
}

export const browserAdapters = {
  githubActions: {
    id: "github-actions",
    label: "GitHub Actions + Playwright",
    status: "ACTIVE",
    humanRequired: false,
    driver: "local chromium in cloud runner",
    secrets: [],
    objective: "Prove a zero-setup cloud browser can navigate real websites, click, screenshot, and publish evidence.",
    docs: "https://playwright.dev/"
  },
  browserbase: {
    id: "browserbase",
    label: "Browserbase",
    status: "NEEDS_SECRET",
    humanRequired: true,
    driver: "Playwright over CDP",
    secrets: ["BROWSERBASE_API_KEY", "BROWSERBASE_PROJECT_ID"],
    objective: "Human-in-the-loop login once, live browser takeover, then persist auth context across sessions.",
    signup: "https://www.browserbase.com/sign-up",
    dashboard: "https://www.browserbase.com/overview",
    docs: "https://www.browserbase.com/templates/playwright"
  },
  browserless: {
    id: "browserless",
    label: "Browserless",
    status: "NEEDS_SECRET",
    humanRequired: true,
    driver: "Playwright over CDP",
    secrets: ["BROWSERLESS_TOKEN"],
    objective: "Create a remote browser with an interactable Live URL and test reconnect/persisted auth.",
    signup: "https://www.browserless.io/sign-up",
    dashboard: "https://production-sfo.browserless.io/",
    docs: "https://docs.browserless.io/examples/playwright-connection"
  },
  cloudflare: {
    id: "cloudflare-browser-run",
    label: "Cloudflare Browser Run",
    status: "NEEDS_SECRET",
    humanRequired: true,
    driver: "Cloudflare Browser Rendering / Playwright",
    secrets: ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"],
    objective: "Prove a recurring low-cost/free daily automation runner for short browser tasks.",
    dashboard: "https://dash.cloudflare.com/",
    docs: "https://developers.cloudflare.com/browser-rendering/"
  },
  steel: {
    id: "steel",
    label: "Steel",
    status: "NEEDS_SECRET",
    humanRequired: true,
    driver: "Playwright over CDP",
    secrets: ["STEEL_API_KEY"],
    objective: "Compare live viewer quality, human takeover, session reliability, and developer ergonomics.",
    signup: "https://app.steel.dev/",
    dashboard: "https://app.steel.dev/settings/api-keys",
    docs: "https://docs.steel.dev/integrations/playwright"
  }
};

export function adapterReadiness(env = process.env) {
  return Object.values(browserAdapters).map(adapter => ({
    ...adapter,
    ready:
      adapter.status === "ACTIVE" ||
      adapter.secrets.every(name => Boolean(env[name]))
  }));
}

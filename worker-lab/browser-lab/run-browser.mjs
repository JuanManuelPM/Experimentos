import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve("worker-lab/browser-lab/out");
await fs.mkdir(outDir, { recursive: true });

const started = Date.now();
const runId = `gha-${process.env.GITHUB_RUN_ID || Date.now()}`;
const events = [];
const tests = [];
const screenshots = [];

function event(type, detail = "") {
  events.push({ ts: new Date().toISOString(), type, detail });
  console.log(`[${type}] ${detail}`);
}

async function shot(page, file, label) {
  const full = path.join(outDir, file);
  await page.screenshot({ path: full, fullPage: false });
  screenshots.push({ file, label });
  event("screenshot", file);
}

function pushTest(name, status, detail) {
  tests.push({ name, status, detail });
  event("test", `${name}: ${status} · ${detail}`);
}

let browser;
try {
  event("runner_start", `GitHub Actions · Node ${process.version}`);
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });
  event("chromium_launch", await browser.version());

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: "en-US",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
  });

  // TEST 1: deterministic navigation + click.
  {
    const page = await context.newPage();
    try {
      event("navigate", "https://example.com");
      await page.goto("https://example.com", {
        waitUntil: "domcontentloaded",
        timeout: 30000
      });
      const heading = (await page.locator("h1").first().textContent())?.trim() || "";
      await shot(page, "01-example.png", "Example.com loaded in cloud Chromium");

      event("click", "Example Domain → More information");
      await page.locator("a").first().click({ timeout: 10000 });
      await page.waitForLoadState("domcontentloaded", { timeout: 20000 });
      const after = page.url();
      await shot(page, "02-after-click.png", "Result after a real browser click");

      const ok = heading === "Example Domain" && /iana\.org/.test(after);
      pushTest(
        "Cloud browser navigation + click",
        ok ? "PASS" : "FAIL",
        `heading="${heading}" · final_url=${after}`
      );
    } catch (err) {
      pushTest("Cloud browser navigation + click", "FAIL", String(err?.message || err));
    } finally {
      await page.close();
    }
  }

  // TEST 2: real-world site. Search YouTube and try to open/play a result.
  {
    const page = await context.newPage();
    try {
      const searchUrl =
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent("Veritasium");
      event("navigate", searchUrl);
      await page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: 45000
      });

      // Best-effort consent handling. Never fabricate success.
      for (const name of [/Reject all/i, /Accept all/i, /Rechazar todo/i, /Aceptar todo/i]) {
        const button = page.getByRole("button", { name }).first();
        if (await button.count()) {
          try {
            await button.click({ timeout: 2500 });
            event("consent", String(name));
            break;
          } catch {}
        }
      }

      await page.waitForTimeout(3500);
      await shot(page, "03-youtube-search.png", "YouTube search for Veritasium");

      const candidates = [
        "ytd-video-renderer a#video-title",
        "a#video-title",
        'a[href*="/watch?v="]'
      ];

      let link = null;
      for (const sel of candidates) {
        const loc = page.locator(sel).first();
        if (await loc.count()) {
          try {
            await loc.waitFor({ state: "visible", timeout: 3000 });
            link = loc;
            event("selector", sel);
            break;
          } catch {}
        }
      }

      if (!link) {
        throw new Error(
          `No visible video result. url=${page.url()} title=${await page.title()}`
        );
      }

      const href = await link.getAttribute("href");
      event("click", `first YouTube result · ${href || "no href"}`);
      await link.click({ timeout: 10000 });
      await page.waitForLoadState("domcontentloaded", { timeout: 30000 });
      await page.waitForTimeout(4500);

      let played = false;
      let hasVideo = false;
      try {
        const video = page.locator("video").first();
        hasVideo = (await video.count()) > 0;
        if (hasVideo) {
          played = await video.evaluate(async (v) => {
            try {
              v.muted = true;
              await v.play();
              await new Promise(r => setTimeout(r, 800));
              return !v.paused;
            } catch {
              return false;
            }
          });
        }
      } catch {}

      await shot(page, "04-youtube-video.png", "YouTube video page after automated click");
      const finalUrl = page.url();
      const ok = /youtube\.com\/watch/.test(finalUrl) && hasVideo;

      pushTest(
        "YouTube search → open video",
        ok ? "PASS" : "FAIL",
        `final_url=${finalUrl} · video_element=${hasVideo} · playing=${played}`
      );
    } catch (err) {
      try {
        await shot(page, "04-youtube-failure.png", "YouTube state when the real-world test failed");
      } catch {}
      pushTest("YouTube search → open video", "FAIL", String(err?.message || err));
    } finally {
      await page.close();
    }
  }

  await context.close();
} catch (err) {
  event("fatal", String(err?.stack || err));
  pushTest("Browser runner", "FAIL", String(err?.message || err));
} finally {
  if (browser) {
    try {
      await browser.close();
      event("browser_close", "Chromium released");
    } catch {}
  }
}

const core = tests.find(t => t.name === "Cloud browser navigation + click");
const youtube = tests.find(t => t.name === "YouTube search → open video");
let overall = "FAIL";
if (core?.status === "PASS" && youtube?.status === "PASS") overall = "PASS";
else if (core?.status === "PASS") overall = "PARTIAL";

const finished = Date.now();
const result = {
  schema: "worker-lab.browser-result/v1",
  run_id: runId,
  runner: "github-actions-playwright",
  cloud: true,
  human_actions: 0,
  started_at: new Date(started).toISOString(),
  finished_at: new Date(finished).toISOString(),
  duration_ms: finished - started,
  overall,
  tests,
  screenshots,
  events
};

await fs.writeFile(
  path.join(outDir, "latest.json"),
  JSON.stringify(result, null, 2)
);

event("result_written", `overall=${overall}`);
console.log(JSON.stringify(result, null, 2));

if (core?.status !== "PASS") {
  process.exitCode = 1;
}

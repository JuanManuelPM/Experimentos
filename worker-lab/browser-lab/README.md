# Browser Lab

Isolated experiment inside `JuanManuelPM/Experimentos`. It does **not** touch Prometeo production.

## Goal

Prove that Worker Lab can use cloud browsers with progressively less human friction.

### Experiment ladder

1. **GitHub Actions + Playwright** — zero new account, zero secret. Real cloud Chromium, navigation, screenshots, evidence.
2. **Browserbase** — human-in-loop login once + persistent auth context.
3. **Browserless** — interactive Live URL + reconnect/state persistence.
4. **Cloudflare Browser Run** — recurring short automation runner.
5. **Steel** — compare live viewer and browser-session ergonomics.

## Human-friction rule

Automation continues by itself until a real identity boundary appears. At that point the UI must show one explicit action, such as:

- LOG IN
- COMPLETE 2FA
- CREATE/COPY API KEY
- CONFIRM SENSITIVE ACTION

No "go to settings and look around" instructions.

## GitHub Actions experiment

The workflow `.github/workflows/browser-lab.yml` runs `run-browser.mjs`, stores screenshots/logs as an Actions artifact, and publishes the latest evidence under GitHub Pages:

`/browser-lab/results/latest.json`

The first run is triggered automatically when the runner script is committed.

## Security

No external API keys are currently required. Future adapters must store secrets behind a backend/Vault boundary described in `backend-contract.json`.

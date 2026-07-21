# Chayya — The Shadow of Your Best Work

> Do a task once. Review the evidence. Reuse the job.

Chayya is a local-first workflow automation companion for people who repeat browser and desktop-adjacent work. It records a browser task once, turns the capture into a plain-English SOP and Rule Book, lets the owner review and safely optimize it, then reruns the approved job visibly or in the background. Every important decision, rule, and run is inspectable.

## Technical implementation: Codex + GPT-5.6

Codex with GPT-5.6 was used as a collaborative development agent to accelerate implementation, testing, debugging, and documentation. It did **not** become an opaque end-user agent or a required runtime service: the included demo runs locally without an OpenAI API key or model call.

| Key decision | Codex/GPT-5.6 contribution | Judge-visible outcome |
| --- | --- | --- |
| Model the workflow as **record → review → optimize → confirm → run → prove** | Translated the product concept into concrete UI states, API routes, persistence, and tests. | The captured steps, raw/optimized comparison, SOP, Rule Book, generated code, and execution proof are inspectable. |
| Replace fragile third-party demos with controlled first-party jobs | Identified live-site risks such as logins, CAPTCHAs, ads, changing layouts, and rate limits; helped create a stable demo strategy. | Five built-in jobs show the complete loop reliably with no external account or secret. |
| Preserve user intent during optimization | Helped define and test a deliberately narrow optimization rule: only exact adjacent duplicate navigation/form-entry actions are removed. | The original capture is preserved; Chayya does not silently compress a workflow into a different task. |
| Build explainable business automation | Helped implement the source invoices → documented rules → Excel mapping → FinanceHub/ExceptionDesk → proof pipeline. | The Back-office demo exposes decisions, exceptions, target queues, and downloadable proof. |
| Improve quality through rapid iteration | Assisted with Playwright recorder/browser-runtime debugging, security/redaction checks, test creation, and judge-facing documentation. | `npm run check` validates unit, integration, browser, Electron-security, and production-build paths. |

The project owner made the product, demo, and safety decisions; Codex accelerated execution by turning those decisions and feedback into focused, testable implementation changes. The detailed capability record is [testingnewGPTFeatures.md](../testingnewGPTFeatures.md).

## What judges should try

1. **Record → review → reuse:** Create a browser job, complete it once in the visible Playwright recorder, then review the exact recorded steps, SOP, Rule Book, and generated Playwright code.
2. **Safe optimization:** Select **Review & optimize job**. Chayya preserves the original and only removes exact adjacent duplicate navigation or form-entry actions. Compare the original with the transparent optimized version before running it.
3. **Visible proof:** Run the saved workflow in a visible browser, confirm the run, and inspect its result and history. Background replay is available only after that saved version has passed visibly.
4. **Stable demo jobs:** From **New browser job**, choose **Add five stable demo jobs (recommended)** for a reliable first-party demonstration with no third-party login, CAPTCHA, purchase, or live-data dependency.
5. **Back-office demo:** Select **Back-office demo** to see a local invoice-routing workflow: source website → explainable decision → Excel mapping → FinanceHub or ExceptionDesk target → built-in analytics.

## Demo

- Live app: local-first MVP; run it locally using the instructions below.
- Demo video: not included in this repository.
- Repository: <https://github.com/ThakurRanveerSingh/Chayya_OpenAIBuildWeek>
- License: [MIT](../LICENSE)
- Judge walkthrough: [docs/DEMO_RUNBOOK.md](../docs/DEMO_RUNBOOK.md)
- Technical implementation, HLD/LLD, intent path, and Codex record: [TECHNICAL_IMPLEMENTATION.md](TECHNICAL_IMPLEMENTATION.md)

## Prerequisites

- Node.js 20 or later (Node 24 used in development)
- npm 10 or later
- macOS or Windows for the Electron desktop shell
- Internet access only to download Playwright Chromium during setup; the stable demo jobs themselves are local

No OpenAI API key, production account, or real business credentials are required for the included demos.

## Setup

1. Clone the repository and enter the project folder.

   ```bash
   git clone https://github.com/ThakurRanveerSingh/Chayya_OpenAIBuildWeek.git
   cd Chayya_OpenAIBuildWeek
   ```

2. Install dependencies and the browser used by the recorder.

   ```bash
   npm install
   npm run install:browser
   ```

3. Optionally create a local environment file. The base demo works without secrets.

   ```bash
   cp .env.example .env
   ```

   Never commit `.env` or any account credentials. The POSable integration is optional and uses rotating public-demo credentials when configured.

## Run locally

Start the app:

```bash
npm run dev
```

Open <http://localhost:5173>, create an account, and choose **New browser job** → **Add five stable demo jobs (recommended)**. Record and review one of these first-party jobs, optimize it, confirm a visible run, and inspect the run history.

To open the desktop shell, leave the development server running and use a second terminal:

```bash
npm run desktop
```

## Judge navigation and sample data

Use this order for the quickest proof of the core value:

1. **New browser job** → **Add five stable demo jobs (recommended)**.
2. Open a demo job, run it in **Visible browser** mode, and inspect the execution proof.
3. Record the job once, close the recorder, and inspect the exact steps, SOP, Rule Book, and generated code.
4. Choose **Review & optimize job**; Chayya only removes exact adjacent duplicate navigation/form-entry actions and always preserves the original capture.
5. Open **Back-office demo** to process the included ten-invoice sample: source page → rules → Excel mapping → FinanceHub/ExceptionDesk → proof.

Sample data is bundled in [public/demo-websites](../public/demo-websites). No seed command, API key, external account, or real credentials are required. Runtime accounts/history are created in `data/anukriti.json`; generated scripts and evidence are written to `automations/` and `output/`.

## Project file guide

| Location | What to inspect |
| --- | --- |
| [src/main.jsx](../src/main.jsx) | Judge-visible React UI and navigation |
| [server/workflows.js](../server/workflows.js) | Recording, redaction, SOP/Rule Book, safe optimization, and replay logic |
| [server/backoffice.js](../server/backoffice.js) | Local invoice-routing workflow and proof generation |
| [server/security.js](../server/security.js) | URL validation and captured-secret protections |
| [public/demo-websites](../public/demo-websites) | Stable first-party demo pages |
| [docs/DEMO_RUNBOOK.md](../docs/DEMO_RUNBOOK.md) | Suggested judge walkthrough |

## Testing

Run the complete local verification suite and production build:

```bash
npm run check
```

This runs serial unit tests, API integration tests, browser end-to-end tests, the Electron security test, and a Vite production build.

## Safety and scope

Chayya is intentionally a local hackathon MVP, not an internet-facing automation service. It includes account roles, job ownership, protected script downloads, audit history, target URL checks, sensitive-value redaction, request limits, and job timeouts. It does not claim universal desktop/mobile recording or production multi-tenant security. See [docs/THREAT_MODEL.md](../docs/THREAT_MODEL.md) for the full boundary.

## Additional GPT-5.6 and Codex notes

GPT-5.6 and Codex were used as collaborative engineering tools throughout the project. They accelerated the move from an initial “teach an agent once, then rerun it” idea to a concrete workflow-automation architecture, scaffolding the React, Electron, Express, Playwright, and local-storage components and iterating quickly on the record → review → optimize → visible-run experience.

Specific implementation support included generating and refining the Playwright recording and replay paths, designing the transparent SOP/Rule Book and optimization rules, implementing local back-office adapters, writing safety checks/redaction tests, troubleshooting the Playwright browser-runtime setup, and producing the demo and architecture documentation. Codex reduced iteration time by turning feedback into small, testable changes and helping diagnose failures before demo rehearsal. Project decisions, scope boundaries, and final review remained human-directed.

## Further documentation

- [Architecture HLD](../docs/ARCHITECTURE-HLD.md)
- [Architecture LLD](../docs/ARCHITECTURE-LLD.md)
- [Back-office demo](../docs/BACKOFFICE_DEMO.md)
- [Release checklist](../docs/RELEASE_CHECKLIST.md)
- [GPT-5.6 capability record](../testingnewGPTFeatures.md)

## Repository access for judges

If this repository is private, grant access to:

- `testing@devpost.com`
- `build-week-event@openai.com`

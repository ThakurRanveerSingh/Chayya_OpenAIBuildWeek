# Chayya — The Shadow of Your Best Work

> Do a task once. Review the evidence. Reuse the job.

Chayya is a local-first workflow automation companion for people who repeat browser and desktop-adjacent work. It records a browser task once, turns the capture into a plain-English SOP and Rule Book, lets the owner review and safely optimize it, then reruns the approved job visibly or in the background. Every important decision, rule, and run is inspectable.

## What judges should try

1. **Record → review → reuse:** Create a browser job, complete it once in the visible Playwright recorder, then review the exact recorded steps, SOP, Rule Book, and generated Playwright code.
2. **Safe optimization:** Select **Review & optimize job**. Chayya preserves the original and only removes exact adjacent duplicate navigation or form-entry actions. Compare the original with the transparent optimized version before running it.
3. **Visible proof:** Run the saved workflow in a visible browser, confirm the run, and inspect its result and history. Background replay is available only after that saved version has passed visibly.
4. **Stable demo jobs:** From **New browser job**, choose **Add five stable demo jobs (recommended)** for a reliable first-party demonstration with no third-party login, CAPTCHA, purchase, or live-data dependency.
5. **Back-office demo:** Select **Back-office demo** to see a local invoice-routing workflow: source website → explainable decision → Excel mapping → FinanceHub or ExceptionDesk target → built-in analytics.
6. **Optional macOS Numbers bridge:** On macOS, open the included Numbers workbook and use **Numbers bridge** to inspect an active table or run the template-driven research workflow. The bridge only writes user-approved values to a designated results table.

## Demo

- Live app: local-first MVP; run it locally using the instructions below.
- Demo video: not included in this repository.
- Repository: <https://github.com/ThakurRanveerSingh/OpenAI_Build_Week_Chayya>
- Judge walkthrough: [docs/DEMO_RUNBOOK.md](../docs/DEMO_RUNBOOK.md)

## Prerequisites

- Node.js 20 or later (Node 24 used in development)
- npm 10 or later
- macOS or Windows for the Electron desktop shell
- Internet access only to download Playwright Chromium during setup; the stable demo jobs themselves are local

No OpenAI API key, production account, or real business credentials are required for the included demos.

## Setup

1. Clone the repository and enter the project folder.

   ```bash
   git clone https://github.com/ThakurRanveerSingh/OpenAI_Build_Week_Chayya.git
   cd OpenAI_Build_Week_Chayya
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

## Testing

Run the complete local verification suite and production build:

```bash
npm run check
```

This runs serial unit tests, API integration tests, browser end-to-end tests, the Electron security test, and a Vite production build.

## Safety and scope

Chayya is intentionally a local hackathon MVP, not an internet-facing automation service. It includes account roles, job ownership, protected script downloads, audit history, target URL checks, sensitive-value redaction, request limits, and job timeouts. It does not claim universal desktop/mobile recording or production multi-tenant security. See [docs/THREAT_MODEL.md](../docs/THREAT_MODEL.md) for the full boundary.

The macOS Numbers bridge is a narrow, user-approved workflow: it does not write arbitrary cells, formulas, or chart definitions. The Resume tailor produces a separate review copy, preserves the source resume, and does not invent experience.

## How GPT-5.6 and Codex were used

GPT-5.6 and Codex were used as collaborative engineering tools throughout the project. They helped turn the initial “teach an agent once, then rerun it” idea into a concrete workflow-automation architecture; scaffold the React, Electron, Express, Playwright, and local-storage components; and iterate on the record → review → optimize → visible-run experience.

Specific implementation support included generating and refining the Playwright recording and replay paths, designing the transparent SOP/Rule Book and optimization rules, implementing local back-office and Numbers-demo adapters, writing safety checks/redaction tests, troubleshooting the Playwright browser-runtime setup, and producing the demo and architecture documentation. Project decisions, scope boundaries, and final review remained human-directed.

## Further documentation

- [Architecture HLD](../docs/ARCHITECTURE-HLD.md)
- [Architecture LLD](../docs/ARCHITECTURE-LLD.md)
- [Back-office demo](../docs/BACKOFFICE_DEMO.md)
- [Numbers workflow](../docs/NUMBERS_DESKTOP_WORKFLOW.md)
- [Release checklist](../docs/RELEASE_CHECKLIST.md)
- [GPT-5.6 capability record](../testingnewGPTFeatures.md)

## Repository access for judges

If this repository is private, grant access to:

- `testing@devpost.com`
- `build-week-event@openai.com`

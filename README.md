# Chayya — The Shadow of Your Best Work

**Do a task once. Review the evidence. Reuse the job.**

Chayya records a browser workflow with Playwright, automatically creates a detailed SOP and Rule Book from every completed capture, presents the captured steps in plain English, saves a transparent optimized version, and lets the job owner run it again with explicit confirmation.

## Built with Codex + GPT-5.6

Codex with GPT-5.6 was used as the project’s collaborative software-engineering partner. It accelerated the path from product idea to a tested MVP by helping translate requirements into an implementable architecture, generate and refine the code, investigate failures, and turn testing feedback into small, verifiable improvements. It is not an end-user runtime dependency: Chayya’s included demos run locally without an OpenAI API key or model call.

| Development decision | How Codex/GPT-5.6 accelerated it | Result in Chayya |
| --- | --- | --- |
| **“Teach once, run again” loop** | Converted the product concept into explicit recording, review, optimization, confirmation, and proof states. | A user can inspect exact browser steps, preserve the raw capture, and reuse an approved automation. |
| **Reliable demo architecture** | Identified the risk of third-party sites, logins, CAPTCHAs, and changing layouts; helped design first-party controlled demo pages instead. | Five stable browser jobs let judges see the entire loop without external-account fragility. |
| **Safe optimization** | Helped set and test a conservative rule: remove only exact adjacent duplicate navigation/form-entry actions, never silently rewrite the user’s intent. | The UI shows raw versus optimized steps and retains the original recording. |
| **Transparent automation evidence** | Helped structure the SOP, Rule Book, run result, audit events, and execution-proof surfaces. | Judges can inspect what was captured, what changed, what ran, and the outcome. |
| **Back-office workflow** | Helped generate the local source → rules → Excel mapping → target queues → proof design and implementation. | The back-office demo shows explainable invoice routing rather than a black-box browser replay. |
| **Quality and debugging** | Helped troubleshoot recorder/browser-runtime setup, write tests, review security boundaries, and refine documentation. | `npm run check` exercises unit, integration, browser, Electron-security, and production-build checks. |

Human direction remained central: the project owner chose the scope, safety boundaries, demos, and product decisions; Codex accelerated implementation and iteration. See [testingnewGPTFeatures.md](testingnewGPTFeatures.md) for the capability record.


## Run locally

```bash
cd "/Users/ranveersinghthakur/Documents/Anukriti 2"
npm install
npm run install:browser
npm run dev
```

Open <http://localhost:5173>. Create an account first. The first local account is an administrator; later accounts are creators.

## Judge quick start

The fastest reliable demonstration uses only included, first-party sample data—no third-party login, API key, credit card, CAPTCHA, or live account is needed.

1. Sign in or create the first local account.
2. Select **New browser job** → **Add five stable demo jobs (recommended)**.
3. Open **Demo: FIFA World Cup briefing** (or any demo job), choose **Visible browser**, tick the confirmation box, and select **Open visible browser**. The app records a pass/fail result and execution proof.
4. Return to the job and select **Record this job**. Complete the short task in the visible recorder, close the recorder, then inspect the captured steps, SOP, Rule Book, and generated code.
5. Select **Review & optimize job** to compare the original recording with the conservative optimized version. Run it visibly again; **Background** becomes available only after an identical saved version passes visibly.
6. Select **Back-office demo** for the business workflow: load the ten local invoice records, review the rules, route the job, and inspect the proof, mapped Excel workbook, FinanceHub queue, and ExceptionDesk queue.

For a scripted 1–2 minute walkthrough, see [docs/DEMO_RUNBOOK.md](docs/DEMO_RUNBOOK.md).

## Sample data and local artifacts

All demos are self-contained.

- Browser-demo pages: [public/demo-websites](public/demo-websites)
- Back-office source invoices: [public/demo-websites/acme-invoices.html](public/demo-websites/acme-invoices.html)
- Back-office business rules: [docs/BACKOFFICE_RULES.md](docs/BACKOFFICE_RULES.md)
- Generated recordings, SOPs, and Playwright scripts: `automations/`
- Generated Excel proof/workbooks: `output/`
- Local app data, accounts, and run history: `data/anukriti.json` (created at runtime; do not commit it)

To reset the local experience, stop the app and delete `data/anukriti.json` plus any generated files you no longer need in `automations/` and `output/`.

## Project map

| Location | Purpose |
| --- | --- |
| [src/main.jsx](src/main.jsx) | React UI: sign-in, browser-job workflow, run proof, workday, back-office, and library views |
| [server/index.js](server/index.js) | Express API, authentication checks, workflow routes, and audit events |
| [server/workflows.js](server/workflows.js) | Playwright recording/replay, redaction, step analysis, SOP/Rule Book generation, and safe optimization |
| [server/backoffice.js](server/backoffice.js) | Local invoice-routing workflow and downloadable proof/workbook generation |
| [server/security.js](server/security.js) | URL validation, sensitive-value redaction, and reusable-workflow safety checks |
| [public/demo-websites](public/demo-websites) | Stable first-party pages used by the judge demo and end-to-end tests |
| [docs](docs) | Architecture, runbook, threat model, release checklist, and operational notes |
| [electron](electron) | Optional macOS/Windows desktop shell and its security test |

## Back-office automation demo

Select **Back-office demo** after sign-in to run a complete local 10-invoice routing sample: Website 1 source data → explainable decision → internal Excel mapping → FinanceHub or ExceptionDesk target → free built-in analytics. See the [back-office demo guide](docs/BACKOFFICE_DEMO.md) and the [judge-facing demo runbook](docs/DEMO_RUNBOOK.md).

## Stable hackathon demos

For a reliable 1–2 minute browser demonstration, select **New browser job** → **Add five stable demo jobs (recommended)**. These controlled first-party pages show the entire record → review → optimize → visible-run loop without a third-party CAPTCHA, changing ads, login, purchase, or live-data dependency. A Background replay becomes available only after the same saved version has passed visibly.

## User journey

1. Create a named browser job and optionally provide a public starting URL.
2. Select **Record this job**, complete the work once in the visible recorder, and close it.
3. Review the exact saved browser steps. Sensitive password/token-style form values are redacted to runtime placeholders.
4. While the recorder window is still open, use the football-themed **Matchday Bot** companion panel in Anukriti to queue a 0.5-, 1-, 2-, or 3-second wait after the latest observed action before you take the next one. After closing the recorder, use the same bot to adjust any captured step. The selected wait is visible in generated Playwright code and can be removed.
5. Select **Review & optimize job**. Anukriti only removes exact adjacent duplicate navigation or form-entry actions; it preserves the original recording.
6. Review the runnable Playwright code, choose **Visible browser** to watch the first/retry run or **Background** for a trusted repeat, check the confirmation box, and start the job.
7. Check the result and run history, including the selected run mode. Duplicate or delete jobs from the job page, and search the library when jobs grow.

## Safety boundary

The local MVP has account roles, job ownership, protected script downloads, audit history, basic request limits, target URL checks, redaction, and a job timeout. It is **not yet approved for internet-facing or multi-tenant production**. Read [the threat model](docs/THREAT_MODEL.md) before any deployment.

## Verify

```bash
npm run check
```

This runs serial unit, API integration, and browser end-to-end suites, then produces a production build. See the [HLD](docs/ARCHITECTURE-HLD.md), [LLD](docs/ARCHITECTURE-LLD.md), [pivot assessment](docs/PIVOT_ASSESSMENT.md), [SDLC evidence](docs/SDLC.md), [release checklist](docs/RELEASE_CHECKLIST.md), [back-office demo guide](docs/BACKOFFICE_DEMO.md), [demo runbook](docs/DEMO_RUNBOOK.md), [productivity iteration release](docs/PRODUCTIVITY_ITERATION_RELEASE.md), [project ledger](docs/PROJECT_LEDGER.md), and [GPT 5.6 capability record](testingnewGPTFeatures.md).


## Desktop shell

Start the API and UI with `npm run dev`, then run this in another terminal:

```bash
npm run desktop
```

## Free hackathon stack

For a local production-shaped demonstration using free Keycloak, PostgreSQL, Prometheus, and Grafana containers, see [the free hackathon deployment profile](docs/FREE_HACKATHON_DEPLOYMENT.md). This stack is local-only and does not make the app public-production ready.

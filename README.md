# Chayya — The Shadow of Your Best Work

**Do a task once. Review the evidence. Reuse the job.**

Chayya records a browser workflow with Playwright, automatically creates a detailed SOP and Rule Book from every completed capture, presents the captured steps in plain English, saves a transparent optimized version, and lets the job owner run it again with explicit confirmation.

It also includes a local **Resume tailor** workflow: select a text-based `.docx`, `.txt`, or `.md` resume, paste a job description, review the evidence matrix, choose review notes, and download a separate Word-compatible review copy plus proof. It never overwrites the original or invents experience.

## Run locally

```bash
cd "/Users/ranveersinghthakur/Documents/Anukriti 2"
npm install
npm run install:browser
npm run dev
```

Open <http://localhost:5173>. Create an account first. The first local account is an administrator; later accounts are creators.

## Back-office automation demo

Select **Back-office demo** after sign-in to run a complete local 10-invoice routing sample: Website 1 source data → explainable decision → internal Excel mapping → FinanceHub or ExceptionDesk target → free built-in analytics. See the [back-office demo guide](docs/BACKOFFICE_DEMO.md) and the [judge-facing demo runbook](docs/DEMO_RUNBOOK.md).

## Stable hackathon demos

For a reliable 1–2 minute browser demonstration, select **New browser job** → **Add five stable demo jobs (recommended)**. These controlled first-party pages show the entire record → review → optimize → visible-run loop without a third-party CAPTCHA, changing ads, login, purchase, or live-data dependency. A Background replay becomes available only after the same saved version has passed visibly. Full instructions and the macOS Numbers feasibility boundary are in the [productivity iteration release](docs/PRODUCTIVITY_ITERATION_RELEASE.md).

## Apple Numbers desktop bridge

On macOS, select **Numbers bridge** after opening a spreadsheet in Numbers. The basic inspector reads the active table, calculates local totals/averages, and displays an extraction proof. The desktop research workflow adds a separate, template-driven loop: read `Anukriti Research Input` → open visible Bing/approved-source research → save user-verified values and HTTPS evidence → review a table diff → explicitly approve a write to `Anukriti Research Results`. A native Numbers chart pre-bound to that results table refreshes when approved values are written. The app never writes arbitrary cells, formulas, or chart definitions. See the [Numbers desktop workflow](docs/NUMBERS_DESKTOP_WORKFLOW.md).

The ready-to-demo workbook is [Anukriti-Numbers-Research-Demo.numbers](output/Anukriti-Numbers-Research-Demo.numbers). It uses fixed controlled demo values until you replace them through the approved workflow.

## User journey

1. Create a named browser job and optionally provide a public starting URL.
2. Select **Record this job**, complete the work once in the visible recorder, and close it.
3. Review the exact saved browser steps. Sensitive password/token-style form values are redacted to runtime placeholders.
4. While the recorder window is still open, use the football-themed **Matchday Bot** companion panel in Anukriti to queue a 0.5-, 1-, 2-, or 3-second wait after the latest observed action before you take the next one. After closing the recorder, use the same bot to adjust any captured step. The selected wait is visible in generated Playwright code and can be removed.
5. Select **Review & optimize job**. Anukriti only removes exact adjacent duplicate navigation or form-entry actions; it preserves the original recording.
6. Review the runnable Playwright code, choose **Visible browser** to watch the first/retry run or **Background** for a trusted repeat, check the confirmation box, and start the job.
7. Check the result and run history, including the selected run mode. Duplicate or delete jobs from the job page, and search the library when jobs grow.

## Resume Alignment workflow

1. Select **Resume tailor** after signing in.
2. Choose an existing text-based `.docx`, `.txt`, or `.md` resume (up to 2 MB) and paste the job description.
3. Select **Analyze alignment** to see documented requirements, existing resume evidence, and clearly labelled not-evidenced items.
4. Select only truthful review notes, then choose **Generate separate Word review copy**.
5. Download the `.docx` and proof JSON. The original resume is unchanged; **Delete local analysis** removes the saved local analysis and generated copies.

This is deterministic local comparison, not an LLM rewrite or direct macOS Microsoft Word automation. It is designed as a safe, free hackathon vertical slice.

## Safety boundary

The local MVP has account roles, job ownership, protected script downloads, audit history, basic request limits, target URL checks, redaction, and a job timeout. It is **not yet approved for internet-facing or multi-tenant production**. Read [the threat model](docs/THREAT_MODEL.md) before any deployment.

## Verify

```bash
npm run check
```

This runs serial unit, API integration, and browser end-to-end suites, then produces a production build. See the [HLD](docs/ARCHITECTURE-HLD.md), [LLD](docs/ARCHITECTURE-LLD.md), [pivot assessment](docs/PIVOT_ASSESSMENT.md), [SDLC evidence](docs/SDLC.md), [release checklist](docs/RELEASE_CHECKLIST.md), [back-office demo guide](docs/BACKOFFICE_DEMO.md), [demo runbook](docs/DEMO_RUNBOOK.md), [Numbers desktop workflow](docs/NUMBERS_DESKTOP_WORKFLOW.md), [productivity iteration release](docs/PRODUCTIVITY_ITERATION_RELEASE.md), [project ledger](docs/PROJECT_LEDGER.md), and [GPT 5.6 capability record](testingnewGPTFeatures.md).

## Desktop shell

Start the API and UI with `npm run dev`, then run this in another terminal:

```bash
npm run desktop
```

## Free hackathon stack

For a local production-shaped demonstration using free Keycloak, PostgreSQL, Prometheus, and Grafana containers, see [the free hackathon deployment profile](docs/FREE_HACKATHON_DEPLOYMENT.md). This stack is local-only and does not make the app public-production ready.

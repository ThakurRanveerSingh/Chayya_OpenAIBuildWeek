# Productivity iteration release

## Product goal

Chayya lets a person teach a recurring task once, inspect the exact captured steps, save a safer reusable job, and run it again with visible proof. The purpose is to remove repeated manual effort without hiding what will happen.

## Design decisions

```mermaid
flowchart LR
  U[User performs task once] --> C[Exact capture]
  C --> P[Safety and repeatability preflight]
  P -->|pass| J[Reviewed saved job]
  P -->|needs work| R[Explain and re-record]
  J --> V[Visible or background run]
  V --> E[Run output and audit evidence]
  N[Named Apple Numbers input table] --> X[Local research adapter]
  X --> D[Reviewed output-table diff]
  D -->|explicit approval| O[Named results table and chart refresh]
```

- Browser capture is Playwright codegen. Raw capture remains visible and is never silently rewritten.
- Optimization removes only identical consecutive navigation or form-entry actions.
- The repeatability preflight blocks generic positional selectors such as `div … nth(3)` and embedded-frame body clicks. These were the cause of prior Bing/FIFA-style timeouts.
- CAPTCHA and bot-verification steps are rejected. Chayya does not bypass Cloudflare, Turnstile, reCAPTCHA, or hCaptcha.
- Visible execution is the default after a failed run; background execution is available only after review, fresh confirmation, and a successful visible rehearsal of the exact saved script version.

## Five demo jobs

The app now adds five first-party controlled demo jobs. They do not use live websites, advertisements, purchases, authentication, or CAPTCHAs.

| Job | Demonstrates | Expected result |
| --- | --- | --- |
| Demo: FIFA World Cup briefing | Fill a topic, build a research brief | `FIFA World Cup briefing ready` |
| Demo: Stock technical snapshot | Enter a stock symbol, produce a fixed demo snapshot | `AAPL technical snapshot` |
| Demo: Best-deals comparison | Enter an item and budget, compare fixed demo options | `Comparison ready` |
| Demo: Daily stand-up digest | Choose a workstream, create a concise local digest | `Daily stand-up digest ready` |
| Demo: Invoice exception check | Enter an invoice ID and review amount band | `Invoice check ready` |

Each is an already-saved job. It can be run immediately, or re-recorded on the controlled page to demonstrate the complete capture → review → optimize → visible-run loop.

## Demo runbook

1. Start Chayya and sign in as an admin or creator.
2. Select **New browser job** → **Add five stable demo jobs (recommended)**.
3. Open a job. To show execution, select **Visible browser**, check the review confirmation, and choose **Open visible browser**.
4. To show teaching once, choose **Record this job**. Complete the small task on the controlled page, close the recorder browser, check the saved steps, then choose **Review & optimize job** and run it visibly.
5. Repeat for the remaining four jobs. Each run has its own timestamp, output, and history entry.

The full local Playwright test runs all five jobs against the app's own pages and verifies one passing test per job.

## Daily productivity loop

1. Open **Today** at the start of the day, set a short intention, and select **Start today**. Nothing is tracked before this explicit action.
2. Add meaningful focus blocks. Job milestones are added automatically only while the workday is active: recording started, job created/prepared, and replay result.
3. When recording, use the live action rail to select an observed click or keyboard action and add a 0.5, 1, 2, or 3-second pause before continuing. The choice is saved immediately and inserted after that exact action when the capture closes.
4. At EOD, add a reflection and choose **Close today**. The timeline and summary preserve the proof of deliberate work and reusable output.

The Odyssey Assistant is available from sign-in through sign-out. It gives deterministic local guidance and navigation help; it does not send a prompt, call a model, operate a browser, or share user data.

## macOS Numbers feasibility

Numbers 14.4 is installed on this Mac. Its native scripting dictionary exposes documents, sheets, tables, cells, formulas, and charts.

Implemented now:

- Detect the local Numbers installation and version.
- On explicit user action, read the first table of the active sheet through a fixed AppleScript.
- Bound extraction to 200 rows and 30 columns; normalize unused Numbers cells; do not send data to a cloud service.
- Calculate totals, averages, minimums, and maximums from displayed numeric values.
- Show the extracted table and an in-app visual proof. The inspection is audited without retaining table values in the audit record.
- Capture only a named `Anukriti Research Input` table, with validated `Search term` and `Metric` columns.
- Open a visible Bing query in the desktop shell, save user-verified numeric values with public HTTPS evidence, and label the controlled fallback honestly.
- Create an immutable review proposal before writing only to the named `Anukriti Research Results` table after explicit confirmation.
- Update a native Numbers chart that the user has pre-bound to that results table; the chart definition is never modified by Anukriti.

Not enabled yet:

- Recording arbitrary mouse/keyboard actions in macOS applications.
- Modifying arbitrary spreadsheet cells, formulas, or chart definitions.
- Creating a native Numbers chart from an arbitrary workbook.

The implemented capability is template-driven: the user approves a dedicated Numbers template with a named input table and a pre-bound chart; Anukriti writes only to the named results table after showing a diff and receiving explicit approval. The chart then updates through Numbers' own data binding. This is safer and more repeatable than screen-coordinate automation.

## Feasibility boundaries

| Request | Status | Reason |
| --- | --- | --- |
| Record and replay stable browser work | Available | Exact Playwright capture, preflight, confirmation, and run history. |
| Run in a visible browser | Available | User can see the replay and intervene. |
| Run known public sites indefinitely | Not guaranteed | Page structure, logins, rate limits, and bot checks are external changes. |
| Bypass CAPTCHA or bot verification | Not supported | Unsafe and outside the product boundary. |
| Read an active Numbers table | Available on macOS | Uses a fixed, read-only AppleScript and explicit action. |
| Calculate from Numbers data and show a visual | Available | Calculation is local and transparent; preview is in Chayya. |
| Write approved values and update a pre-bound native Numbers chart | Available on macOS template mode | Requires the exact named tables, spare results rows, reviewed diff, confirmation, and macOS Automation permission. |
| Create or redesign a native Numbers chart | Not supported | The app never changes chart definitions or arbitrary workbook layout. |
| Replay arbitrary Mac desktop clicks | Not planned for this demo | Fragile and unsafe without app-specific accessibility contracts. |

## Verification evidence

- Unit/API/browser checks cover security, workflow capture, wait insertion, business process routing, resume safety, Numbers payload parsing, and RBAC.
- The Numbers adapter was exercised against a disposable native Numbers table. It correctly reduced the default 22×7 empty grid to the used 3×2 table and calculated Revenue total 2,000 and average 1,000.
- The Numbers research adapter was exercised against a separate disposable template: two named inputs were captured, two approved values were written to the named results table through the authenticated API, and the exact values were read back.
- The controlled demo integration test creates all five jobs, starts the local app server, and runs each job with real Playwright. All five pass.
- `npm test` is deliberately serial: API/browser tests bind their own temporary localhost server and must not compete for ports.

## Experience enhancement: mission progress

Browser jobs now use an evidence-based progress rail: **Define → Capture → Safety check → Visible rehearsal → Run & proof**. It is intentionally gamified through earned checkpoints rather than points, streaks, or unsupported time-saving claims. A background run remains locked until the same saved script fingerprint has passed visibly. Each run now produces an Execution proof card with mode, duration, version, step count, check result, recovery guidance when needed, and collapsed sanitized technical details.

During live capture, previews now redact sensitive values in memory only. The recorder's temporary codegen file is never rewritten while Playwright is still writing it.

## Remaining production polish

1. Package the Electron shell with signing/notarization and move the final macOS Automation execution behind the existing narrow preload/IPC boundary.
2. Add an optional rollback snapshot for the named results table before each approved write.
3. Add per-job selector health checks on each run and a repair suggestion flow for normal public-site changes.
4. Add signed application updates, encrypted local secrets, and automated backup/restore before a real production launch.
5. Add accessibility checks, screenshots/traces on failure, and CI execution on a clean macOS runner.

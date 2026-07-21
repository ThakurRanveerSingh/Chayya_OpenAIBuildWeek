# Project delivery ledger

| Item | Status |
| --- | --- |
| Goal | Provide trustworthy, local productivity workflows through Chayya: capture and replay browser work, track intentional work from morning through EOD, and preserve proof for browser, back-office, resume, and Numbers-assisted tasks. |
| Milestone | Recorder reliability preflight, live preview protection, an in-recording wait rail, a local productivity ledger, an always-available local guide, five controlled browser demos, and execution-proof results with exact-version visible rehearsal gates — 37 app tests, 1 desktop security test, and a production build. |
| Credits | Not exposed by this environment; the application makes no paid API calls. |
| Tokens | Not exposed by this environment; no runtime OpenAI token usage is measured or billed by the app. |
| Material risks | Browser sites can change or challenge automation; Bing is a research locator rather than a reliable structured-data API; Numbers writes require the named template, spare output rows, and explicit macOS permission; live stock technical data needs a vetted provider. The local workday ledger is not encrypted at rest. `npm audit` currently reports 5 dependency vulnerabilities that need remediation before production. |
| Decision | Preserve immutable raw browser capture; block known unstable selectors; use controlled first-party pages for demo evidence; write Numbers only to the fixed results table after a reviewed diff and explicit approval. Do not track a workday until its owner explicitly starts it; keep the assistant local and guidance-only; persist a wait against an exact captured action while the recorder is still open. A Background run requires a successful Visible rehearsal of the identical saved script fingerprint. |
| Next action | Add signed/notarized packaging, encrypted local storage, an optional rollback snapshot for the approved results table, a vetted structured data source, and configurable workday retention/export before treating desktop research as production-ready. |

Assessment: **on track for the browser, back-office, resume, Numbers-read, and approved Numbers-results-table demo; native chart creation and live stock dashboard remain deliberately out of scope** until their safety and provenance decisions are complete.

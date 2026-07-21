# GPT 5.6 capability test and usage record

**Date:** 2026-07-17  
**Scope:** Chayya is a free, local hackathon application. Its runtime uses local Express, React, Playwright, and JSON storage. It does **not** call the OpenAI API, does not require an API key, and has no API-token or API-credit cost today.

This record deliberately separates what was used in the delivery work from what is shipped in the application. A capability must not be presented as a product feature merely because it is available in a model.

## Outcome of this iteration

The run experience was redesigned around an explicit user choice:

| User choice | Actual behavior | Best use |
| --- | --- | --- |
| **Visible browser** | Playwright opens a normal browser window on the same computer. The user can watch the job work. | Default for a first run or retry after a failure. |
| **Background** | Playwright runs without opening a visible browser window. | A repeat job that has already been reviewed and trusted. |

The selected mode is sent to the API, passed to Playwright, recorded in the job's run result and run history, and included in the audit event. This is not a cosmetic toggle. Third-party web sites cannot safely be embedded inside the Chayya page; the visible option therefore opens a separate local browser window.

The Back-office demo now also has a separate, saved **business-process job** lifecycle: **Capture → Review → Optimize → Run → Proof**. The capture preserves Source table → Queue → Rules document → Background worker → FinanceHub / ExceptionDesk → Proof, along with source/rules fingerprints and execution history. Its optimized replay creates a fresh queue and runs the deterministic worker; it does not pretend that browser-selector replay can safely replace Excel mapping and policy logic.

## 2026-07-19 — Odyssey UI design iteration

This iteration made the visual system immersive without making automation look magical or autonomous. The entire local React interface now uses an original **Chayya** design system: midnight sea, parchment, bronze, laurel, evidence-based voyage milestones, a live wait rail that attaches pauses to an exact captured action while recording, and an always-available local Chayya Guide. The source is local CSS and an original local SVG; there is no third-party brand artwork, tracker, API key, or network asset.

The new **Today** workspace is a local, owner-scoped productivity ledger. Nothing is collected until the user explicitly chooses **Start today**; after that, intentional focus blocks and meaningful job milestones (recording started, job created/prepared, and replay outcome) form an EOD timeline. The assistant explains the product and can navigate the interface, but it never makes a model call, runs a browser action, or shares data.

The built-in image-generation capability was requested for an initial brand-mark exploration, but the provided image tool returned `403 Forbidden` in this environment. Rather than retry through a paid API or import an external image, the final logo was drawn as an original local SVG. This preserves the no-cost local build and keeps asset provenance clear.

The implementation work used Codex's programmatic workspace tools to inspect the interface, make focused patches, and run regression checks. It is still **not** an OpenAI API feature executed by the user's saved jobs. The current official model documentation confirms GPT-5.6 has Responses API tool support and configurable reasoning effort, but also lists no Free API tier for GPT-5.6. Therefore, no runtime GPT-5.6 call, prompt cache, persisted reasoning object, or multi-agent API invocation has been added to this free hackathon app. See [GPT-5.6 Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol) and [Models](https://developers.openai.com/api/docs/models).

The product-facing design decision is intentional:

| Capability | What this iteration actually used | What remains out of scope in the free local runtime |
| --- | --- | --- |
| Programmatic tool calling | Codex delivery tools for code, test, and visual-system work | Unattended model-directed browser or desktop actions |
| Multi-agent | Human-guided specialist review in the delivery workflow | A multi-agent API orchestration service or user-data sharing |
| Explicit prompt caching | No prompts exist to cache | Cache keys, cache billing, and API retention policy |
| Persisted reasoning | No model reasoning stored | Saving model context without consent and data-retention controls |
| Maximum reasoning effort | Used for the engineering/design reasoning in the Codex session | A cost-bearing runtime model call |
| Frontend design | Implemented: historic visual system, original SVG, responsive and reduced-motion behavior | — |
| Token efficiency | No runtime API tokens, credits, or API costs | Any hidden inference spend |
| Intent understanding | Existing deterministic workflow classification and explicit user controls retained | Unverifiable autonomous intent inference |

Detailed visual rationale, asset provenance, accessibility behavior, and verification targets are in [the Odyssey visual-system document](docs/ACHILLES_VISUAL_SYSTEM.md).

## GPT 5.6 feature-by-feature assessment

| Requested capability | Status in this delivery | Evidence and safe interpretation |
| --- | --- | --- |
| Programmatic Tool Calling | **Not shipped in the app.** | The delivery workflow used local programmatic tools to inspect, patch, and test the project. That is different from the OpenAI Responses API capability. Chayya does not send prompts or invoke API tools at runtime. A later opt-in assistant could use it only for bounded, read-only job diagnostics; it must never silently run, buy, send, or delete on a user's behalf. See [Programmatic Tool Calling](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling). |
| Multi-agent (beta) | **Used for this delivery review; not an end-user runtime feature.** | Architecture, business-UAT, and automation reviewers independently diagnosed the recorder race, reviewed a resume/stock pivot, and set acceptance criteria before the repair and Resume Alignment vertical slice were built. The official guide labels the feature beta and warns that parallelism can increase token use. See [Multi-agent guide](https://developers.openai.com/api/docs/guides/responses-multi-agent). |
| Explicit prompt caching | **Not used.** | There are no OpenAI prompts in the app to cache. If an opt-in API integration is added later, stable product instructions can be placed first and request-specific content last, with a `prompt_cache_key` / explicit cache point where supported. It needs measurement: cache writes can cost more than normal input. See [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching). |
| Persisted reasoning | **Not used.** | No model reasoning is stored. This is the correct free/local and privacy-preserving behavior. A future API feature would require explicit consent, a short retention policy, redaction, encryption, and a per-job delete control before any reasoning context is persisted. See [Reasoning](https://developers.openai.com/api/docs/guides/reasoning). |
| Maximum reasoning effort | **Not used in the app.** | The product has no model invocation. More reasoning effort is not automatically better: it adds latency and token cost. A future optional integration should start with a measured lower setting and only use higher effort for evaluated complex job-repair tasks. |
| Frontend design | **Implemented.** | The app now explains why background mode exists, defaults a first/failed job to a visible run, makes the choice accessible radio controls, blocks execution until the user confirms, and shows an execution-proof card rather than a raw terminal dump. Frontend design is a product practice, not an API switch. |
| Token efficiency | **No runtime API tokens or credits consumed.** | The free hackathon build avoids an OpenAI runtime dependency. The deterministic recorder, redaction, resume comparison, DOCX export, and back-office decision engine run locally. Multi-agent delivery review has development-model usage, but that is separate from application API billing and cannot be represented as user job credits. |
| Intent understanding | **Implemented deterministically, not by an LLM.** | The saved back-office job uses `structured_process_classification`; Resume Alignment uses `structured_local_comparison` to recognise resume input, JD requirements, evidence comparison, human review, DOCX export, and proof. The UI shows matched stages and avoids claiming that GPT inferred the user's intent. |

## Verification criteria for the new run behavior

- API rejects an unconfirmed run and an unknown run mode.
- API accepts `visible` and `background`, but enforces a successful visible rehearsal for the exact saved script before it accepts `background`; it stores mode, version fingerprint, and structured result proof.
- The browser UI exposes both modes, defaults an unrun/failed job to Visible browser, requires confirmation, and displays the selected mode with the result.
- Existing recorder → review → generate → run behavior remains covered by API and browser end-to-end tests.

### Test evidence (2026-07-17)

- `npm run check`: **37 app tests plus 1 desktop security test passed**, and the production frontend build succeeded. This includes the partial-codegen recorder race regression, popup-tab capture, raw-versus-optimized step preservation, in-recording wait persistence, exact-version visible-to-background gating, sanitized execution proof for pass/fail output, local workday start/focus/EOD tracking, assistant privacy behavior, saved back-office capture → optimize → replay → proof, local resume → JD → proof → DOCX browser journey, visible/background mode validation, and the desktop security check.
- Real background Playwright run: **4/4 passed** — FIFA World Cup insights, stocks technical indicators, Flowood house-price research, and best-deals shopping research.
- Real visible Playwright run: **1/1 passed** — FIFA World Cup insights opened in a local browser window and completed successfully.

The external starter jobs only check stable Bing search URLs/titles; they do not sign in, purchase, submit, or send data.

## What is intentionally deferred

Adding an OpenAI API key, model calls, persistent reasoning, caching, or autonomous tool execution would make the hackathon app cost-bearing and expand its security/privacy scope. Those changes need an explicit user decision, a budget, consent UX, secrets management, an evaluation set, and production controls. They are not silently introduced in this free local build.

## Source material

- [OpenAI Programmatic Tool Calling](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling)
- [OpenAI Responses API multi-agent guide](https://developers.openai.com/api/docs/guides/responses-multi-agent)
- [OpenAI prompt caching guide](https://developers.openai.com/api/docs/guides/prompt-caching)
- [OpenAI reasoning guide](https://developers.openai.com/api/docs/guides/reasoning)
- [OpenAI function calling guide](https://developers.openai.com/api/docs/guides/function-calling)

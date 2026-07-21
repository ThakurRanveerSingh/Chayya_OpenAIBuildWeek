# Stocks technical indicators research — SOP & Rule Book

**Rule book revision:** 1  
**Capture version:** 1  
**Generated:** 2026-07-21T00:07:29.358Z  
**Recorded steps:** 1  
**Replay readiness:** Capture reviewed for known selector risks; a visible rehearsal is still required before background use.

## Purpose and scope
Repeat “Stocks technical indicators research” using 1 observed browser action while preserving the exact capture and its review checkpoints.

This SOP is derived from the exact saved browser capture. It documents what was observed; it does not invent business logic, credentials, or unrecorded actions.

## Captured procedure
### Step 01 — navigate

**Captured action:** Open https://www.bing.com/search?q=stocks+technical+indicators

**Operating rule:** Open only the captured destination. If the route, account, or page context differs, stop and review the job before continuing.

**Captured evidence:**

```playwright

await page.goto('https://www.bing.com/search?q=stocks+technical+indicators', { waitUntil: 'domcontentloaded' });

```

## Saved business and review rules
- No additional business rules have been added. The exact capture remains the source of truth.

## Optimization record
- No provably redundant consecutive actions were found; the exact recorded flow was preserved.

## Reliability findings
- No known unstable selector pattern was detected in this capture.

## Mandatory safeguards
- Use the owner-approved account and data only. The recorded page state is not a substitute for an authorization check.
- Sensitive values recognised in the capture are redacted before this rule book is created; provide them only through the secure runtime when needed.
- Never automate bot verification, CAPTCHA, or an unexpected authentication challenge. Complete it manually or stop the run.
- If a named target, page, or result differs from this record, stop the replay and re-record the affected step rather than selecting by position or guesswork.

## Change control
Re-record when the target page, named controls, or business process changes. Adding a wait or review note creates a new rule-book revision. Run visibly after any recording or code change before enabling a background replay.

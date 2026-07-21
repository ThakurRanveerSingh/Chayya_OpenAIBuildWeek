# Search news — SOP & Rule Book

**Rule book revision:** 1  
**Capture version:** 1  
**Generated:** 2026-07-21T00:07:29.358Z  
**Recorded steps:** 1  
**Replay readiness:** Not replay-ready. Resolve the reliability findings below before preparing a reusable job.

## Purpose and scope
Repeat “Search news” using 1 observed browser action while preserving the exact capture and its review checkpoints.

This SOP is derived from the exact saved browser capture. It documents what was observed; it does not invent business logic, credentials, or unrecorded actions.

## Captured procedure
### Step 01 — navigate

**Captured action:** Open https://www.bing.com/search?q=WWE

**Operating rule:** Open only the captured destination. If the route, account, or page context differs, stop and review the job before continuing.

**Captured evidence:**

```playwright

await page.goto('https://www.bing.com/search?q=WWE', { waitUntil: 'domcontentloaded' });

```

## Saved business and review rules
- No additional business rules have been added. The exact capture remains the source of truth.

## Optimization record
- Replaced fragile Bing suggestion, card, or popup clicks with a direct search for “WWE”.

## Reliability findings
- **generic-position-selector:** This recording clicks a generic page element by position (for example, div … nth(3)). Search results and page banners can change that position. Fix: Re-record using a stable search URL, a labelled control, or a named link. Do not choose an item based only on its position in the page.

## Mandatory safeguards
- Use the owner-approved account and data only. The recorded page state is not a substitute for an authorization check.
- Sensitive values recognised in the capture are redacted before this rule book is created; provide them only through the secure runtime when needed.
- Never automate bot verification, CAPTCHA, or an unexpected authentication challenge. Complete it manually or stop the run.
- If a named target, page, or result differs from this record, stop the replay and re-record the affected step rather than selecting by position or guesswork.

## Change control
Re-record when the target page, named controls, or business process changes. Adding a wait or review note creates a new rule-book revision. Run visibly after any recording or code change before enabling a background replay.

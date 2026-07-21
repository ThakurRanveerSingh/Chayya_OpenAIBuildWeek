# Test — SOP & Rule Book

**Rule book revision:** 1  
**Capture version:** 1  
**Generated:** 2026-07-21T00:07:29.355Z  
**Recorded steps:** 9  
**Replay readiness:** Capture reviewed for known selector risks; a visible rehearsal is still required before background use.

## Purpose and scope
Repeat “Test” using 9 observed browser actions while preserving the exact capture and its review checkpoints.

This SOP is derived from the exact saved browser capture. It documents what was observed; it does not invent business logic, credentials, or unrecorded actions.

## Captured procedure
### Step 01 — navigate

**Captured action:** Open https://www.bing.com/

**Operating rule:** Open only the captured destination. If the route, account, or page context differs, stop and review the job before continuing.

**Captured evidence:**

```playwright

await page.goto('https://www.bing.com/');

```

### Step 02 — click

**Captured action:** Click combobox “Enter your search here -”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('combobox', { name: 'Enter your search here -' }).click();

```

### Step 03 — fill

**Captured action:** Enter information in combobox “Enter your search here -”

**Operating rule:** Enter only approved business data. Never record passwords, tokens, card data, or other secrets in this procedure.

**Captured evidence:**

```playwright

await page.getByRole('combobox', { name: 'Enter your search here -' }).fill('fif');

```

### Step 04 — click

**Captured action:** Click text “a world cup”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByText('a world cup', { exact: true }).click();

```

### Step 05 — click

**Captured action:** Click link “See more details about Spain”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Required wait:** Wait 2 seconds after this action before the next captured step.

**Captured evidence:**

```playwright

await page.getByRole('link', { name: 'See more details about Spain' }).click();

```

### Step 06 — click

**Captured action:** Click link “Ferran Torres”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Required wait:** Wait 3 seconds after this action before the next captured step.

**Captured evidence:**

```playwright

await page.getByRole('link', { name: 'Ferran Torres', exact: true }).first().click();

```

### Step 07 — click

**Captured action:** Click tab “Match Stats”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Required wait:** Wait 2 seconds after this action before the next captured step.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Match Stats' }).click();

```

### Step 08 — click

**Captured action:** Click tab “Lineups”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Required wait:** Wait 3 seconds after this action before the next captured step.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).click();

```

### Step 09 — click

**Captured action:** Click the page

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.locator('.bsp_game > div:nth-child(2) > div').first().click();

```

## Saved business and review rules
- Fifa World Cup!

## Optimization record
- The runnable-plan optimization has not been prepared yet. This SOP documents the exact capture.

## Reliability findings
- No known unstable selector pattern was detected in this capture.

## Mandatory safeguards
- Use the owner-approved account and data only. The recorded page state is not a substitute for an authorization check.
- Sensitive values recognised in the capture are redacted before this rule book is created; provide them only through the secure runtime when needed.
- Never automate bot verification, CAPTCHA, or an unexpected authentication challenge. Complete it manually or stop the run.
- If a named target, page, or result differs from this record, stop the replay and re-record the affected step rather than selecting by position or guesswork.

## Change control
Re-record when the target page, named controls, or business process changes. Adding a wait or review note creates a new rule-book revision. Run visibly after any recording or code change before enabling a background replay.

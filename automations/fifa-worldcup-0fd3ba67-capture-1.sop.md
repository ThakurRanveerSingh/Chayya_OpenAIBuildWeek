# Fifa WorldCup — SOP & Rule Book

**Rule book revision:** 1  
**Capture version:** 1  
**Generated:** 2026-07-21T00:07:29.355Z  
**Recorded steps:** 65  
**Replay readiness:** Capture reviewed for known selector risks; a visible rehearsal is still required before background use.

## Purpose and scope
Repeat “Fifa WorldCup” using 65 observed browser actions while preserving the exact capture and its review checkpoints.

This SOP is derived from the exact saved browser capture. It documents what was observed; it does not invent business logic, credentials, or unrecorded actions.

## Captured procedure
### Step 01 — navigate

**Captured action:** Open https://www.bing.com/?FORM=UNKSBD

**Operating rule:** Open only the captured destination. If the route, account, or page context differs, stop and review the job before continuing.

**Captured evidence:**

```playwright

await page.goto('https://www.bing.com/?FORM=UNKSBD');

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

await page.getByRole('combobox', { name: 'Enter your search here -' }).fill('Fifa');

```

### Step 04 — click

**Captured action:** Click option “fifa world cup”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('option', { name: 'fifa world cup', exact: true }).click();

```

### Step 05 — click

**Captured action:** Click link “See more details about Spain”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('link', { name: 'See more details about Spain' }).click();

```

### Step 06 — click

**Captured action:** Click tab “Match Stats”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Match Stats' }).click();

```

### Step 07 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Match Stats' }).press('ArrowDown');

```

### Step 08 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Match Stats' }).press('ArrowDown');

```

### Step 09 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Match Stats' }).press('ArrowDown');

```

### Step 10 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Match Stats' }).press('ArrowDown');

```

### Step 11 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Match Stats' }).press('ArrowDown');

```

### Step 12 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Match Stats' }).press('ArrowDown');

```

### Step 13 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Match Stats' }).press('ArrowDown');

```

### Step 14 — click

**Captured action:** Click tab “Lineups”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).click();

```

### Step 15 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 16 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 17 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 18 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 19 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 20 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 21 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 22 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 23 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 24 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 25 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 26 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 27 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 28 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 29 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 30 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 31 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 32 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 33 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 34 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 35 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 36 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 37 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 38 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 39 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 40 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 41 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 42 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 43 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 44 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 45 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 46 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 47 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 48 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 49 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 50 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 51 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 52 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 53 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 54 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 55 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 56 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 57 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 58 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 59 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 60 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 61 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 62 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 63 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 64 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

```

### Step 65 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('tab', { name: 'Lineups' }).press('ArrowDown');

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

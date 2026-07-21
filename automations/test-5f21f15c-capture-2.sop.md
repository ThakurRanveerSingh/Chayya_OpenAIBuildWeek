# test — SOP & Rule Book

**Rule book revision:** 1  
**Capture version:** 2  
**Generated:** 2026-07-21T00:07:29.356Z  
**Recorded steps:** 12  
**Replay readiness:** Capture reviewed for known selector risks; a visible rehearsal is still required before background use.

## Purpose and scope
Repeat “test” using 12 observed browser actions while preserving the exact capture and its review checkpoints.

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

await page.getByRole('combobox', { name: 'Enter your search here -' }).fill('fifa');

```

### Step 04 — click

**Captured action:** Click option “fifa world cup”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('option', { name: 'fifa world cup', exact: true }).click();

```

### Step 05 — popup

**Captured action:** Wait for a result to open in a new browser tab

**Operating rule:** Wait for the expected new tab, then continue only in that tab. Do not substitute an unrelated browser window.

**Captured evidence:**

```playwright

const page1Promise = page.waitForEvent('popup');

```

### Step 06 — click

**Captured action:** Click heading “FIFA World Cup 2026™”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('heading', { name: 'FIFA World Cup 2026™' }).getByRole('link').click();

```

### Step 07 — click

**Captured action:** In a new tab, click button “I\”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.getByRole('button', { name: 'I\'m OK with that' }).click();

```

### Step 08 — click

**Captured action:** In a new tab, click link “Discover”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.getByRole('link', { name: 'Discover' }).click();

```

### Step 09 — click

**Captured action:** In a new tab, click menuitem “FINAL”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.getByRole('menuitem', { name: 'FINAL' }).click();

```

### Step 10 — click

**Captured action:** In a new tab, click menuitem “FANTASY & GAMING”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.getByRole('menuitem', { name: 'FANTASY & GAMING' }).click();

```

### Step 11 — click

**Captured action:** In a new tab, click menuitem “PLAY ZONE”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.getByRole('menuitem', { name: 'PLAY ZONE' }).click();

```

### Step 12 — click

**Captured action:** In a new tab, click button “PLAY NOW”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.getByRole('button', { name: 'PLAY NOW' }).click();

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

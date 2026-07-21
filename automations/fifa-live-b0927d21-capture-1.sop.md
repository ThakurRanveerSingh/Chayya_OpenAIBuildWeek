# Fifa Live  — SOP & Rule Book

**Rule book revision:** 1  
**Capture version:** 1  
**Generated:** 2026-07-21T00:07:29.355Z  
**Recorded steps:** 24  
**Replay readiness:** Not replay-ready. Resolve the reliability findings below before preparing a reusable job.

## Purpose and scope
Repeat “Fifa Live ” using 24 observed browser actions while preserving the exact capture and its review checkpoints.

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

await page.getByRole('combobox', { name: 'Enter your search here -' }).fill('fifa ');

```

### Step 04 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('combobox', { name: 'Enter your search here -' }).press('ArrowDown');

```

### Step 05 — click

**Captured action:** Click option “fifa world cup”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('option', { name: 'fifa world cup', exact: true }).click();

```

### Step 06 — popup

**Captured action:** Wait for a result to open in a new browser tab

**Operating rule:** Wait for the expected new tab, then continue only in that tab. Do not substitute an unrelated browser window.

**Captured evidence:**

```playwright

const page1Promise = page.waitForEvent('popup');

```

### Step 07 — click

**Captured action:** Click heading “FIFA World Cup 2026™”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('heading', { name: 'FIFA World Cup 2026™' }).getByRole('link').click();

```

### Step 08 — click

**Captured action:** In a new tab, click the page

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.locator('.onetrust-pc-dark-filter').click();

```

### Step 09 — click

**Captured action:** In a new tab, click the page

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.locator('.onetrust-pc-dark-filter').click();

```

### Step 10 — click

**Captured action:** In a new tab, click button “I\”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.getByRole('button', { name: 'I\'m OK with that' }).click();

```

### Step 11 — click

**Captured action:** In a new tab, click the page

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.locator('svg').first().click();

```

### Step 12 — click

**Captured action:** In a new tab, click link “Explore”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.getByRole('link', { name: 'Explore' }).click();

```

### Step 13 — click

**Captured action:** In a new tab, click link “What the tournament stats”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.getByRole('link', { name: 'What the tournament stats' }).click();

```

### Step 14 — click

**Captured action:** In a new tab, click menuitem “TOURNAMENTS & EVENTS”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.getByRole('menuitem', { name: 'TOURNAMENTS & EVENTS' }).click();

```

### Step 15 — click

**Captured action:** In a new tab, click menuitem “TOURNAMENTS”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.getByRole('menuitem', { name: 'TOURNAMENTS', exact: true }).click();

```

### Step 16 — click

**Captured action:** In a new tab, click menuitem “FIFA World Cup 2026™”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page1.getByRole('menuitem', { name: 'FIFA World Cup 2026™' }).click();

```

### Step 17 — click

**Captured action:** Click searchbox “Enter your search here -”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('searchbox', { name: 'Enter your search here -' }).click();

```

### Step 18 — fill

**Captured action:** Enter information in searchbox “Enter your search here -”

**Operating rule:** Enter only approved business data. Never record passwords, tokens, card data, or other secrets in this procedure.

**Captured evidence:**

```playwright

await page.getByRole('searchbox', { name: 'Enter your search here -' }).fill('messi');

```

### Step 19 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('searchbox', { name: 'Enter your search here -' }).press('ArrowDown');

```

### Step 20 — action

**Captured action:** Perform a browser action

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('searchbox', { name: 'Enter your search here -' }).press('ArrowDown');

```

### Step 21 — click

**Captured action:** Click option “messi world cup”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('option', { name: 'messi world cup' }).click();

```

### Step 22 — click

**Captured action:** Click the page

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.locator('iframe[src="https://challenges.cloudflare.com/cdn-cgi/challenge-platform/h/b/turnstile/f/av0/rch/nyq7h/0x4AAAAAABgNScUsbCFCjwIZ/light/fbE/new/normal?lang=en"]').contentFrame().locator('body').click();

```

### Step 23 — click

**Captured action:** Click link “Search”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('link', { name: 'Search', exact: true }).click();

```

### Step 24 — click

**Captured action:** Click link “All”

**Operating rule:** Use the captured named control. If the control is missing, renamed, or behaves differently, stop and re-record instead of guessing.

**Captured evidence:**

```playwright

await page.getByRole('link', { name: 'All' }).click();

```

## Saved business and review rules
- No additional business rules have been added. The exact capture remains the source of truth.

## Optimization record
- No provably redundant consecutive actions were found; the exact recorded flow was preserved.

## Reliability findings
- **frame-body-click:** This recording clicks the body of an embedded frame, which is not a stable business action. Fix: Re-record only the named control you intend to use. Never record a bot-verification or embedded challenge frame.

## Mandatory safeguards
- Use the owner-approved account and data only. The recorded page state is not a substitute for an authorization check.
- Sensitive values recognised in the capture are redacted before this rule book is created; provide them only through the secure runtime when needed.
- Never automate bot verification, CAPTCHA, or an unexpected authentication challenge. Complete it manually or stop the run.
- If a named target, page, or result differs from this record, stop the replay and re-record the affected step rather than selecting by position or guesswork.

## Change control
Re-record when the target page, named controls, or business process changes. Adding a wait or review note creates a new rule-book revision. Run visibly after any recording or code change before enabling a background replay.

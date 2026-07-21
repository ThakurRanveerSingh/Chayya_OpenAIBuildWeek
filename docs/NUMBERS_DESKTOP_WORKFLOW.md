# macOS Numbers research desktop workflow

## What this delivers

Anukriti Desktop supports this local, reviewable workflow:

```text
Named Numbers input table
  → visible Bing or approved-source research
  → user-verified numeric value and HTTPS source
  → proposed Numbers table diff
  → explicit approval
  → named Numbers output table update
  → pre-bound native Numbers chart refresh
  → saved proof
```

The app does not scrape Bing, bypass bot checks, or treat a search-result page as a data contract. Bing is a visible research starting point. The user verifies the numeric value and its public HTTPS source before it can be written to Numbers.

## One-time local setup

```bash
cd "/Users/ranveersinghthakur/Documents/Anukriti 2"
npm install
npm run install:browser
npm run dev
```

In another terminal, launch the desktop shell:

```bash
npm run desktop
```

macOS may ask for Automation permission. Allow **Anukriti** or the terminal that runs the local app to control Numbers under **System Settings → Privacy & Security → Automation**.

## Numbers template contract

Use a dedicated sheet. Anukriti can read and write only these exact table names.

### Input table: `Anukriti Research Input`

The first row must contain these headers:

| Search term | Metric |
| --- | --- |
| Flowood MS | Median home price |
| AAPL | Momentum score |

Use up to 25 data rows. Both fields are required and each Search term + Metric pair must be unique.

### Output table: `Anukriti Research Results`

Create this table on the same active sheet with at least 26 rows: one header row and 25 blank output rows. The header row must be exact:

| Search term | Metric | Value | Source URL | Checked at | Status |
| --- | --- | --- | --- | --- | --- |

Create a native Numbers chart manually once and bind it to the `Value` column of this results table. When Anukriti replaces the approved result values, Numbers recalculates the bound chart without changing the chart definition.

For the saved demo workbook included in this project, run:

```bash
/usr/bin/osascript scripts/create-numbers-research-template.applescript \
  "/Users/ranveersinghthakur/Documents/Anukriti 2/output/Anukriti-Numbers-Research-Demo.numbers"
```

The script creates only the new path you provide. It does not open, alter, or overwrite an existing spreadsheet. Add a native chart manually to its `Anukriti Research Results` table before filming the chart-refresh moment.

For each retake, reset only the prepared output rows while this workbook is the front document in Numbers:

```bash
/usr/bin/osascript scripts/reset-numbers-research-demo.applescript
```

## User flow

1. Open the dedicated Numbers spreadsheet and make the sheet containing both named tables active.
2. In Anukriti, select **Numbers bridge**, then scroll to **Research in a browser. Return proof to Numbers.**
3. Select **Capture active Numbers research template**. The app reads only `Anukriti Research Input`; nothing is changed in Numbers.
4. For each row, select **Open Bing research**. Verify the value from an appropriate public HTTPS source.
5. Enter the numeric value and its source URL, then select **Save verified result**. Repeat for all rows.
6. Select **Review proposed Numbers update**. Check every proposed value, URL, timestamp, and status.
7. Check the explicit confirmation and select **Approve and write to Numbers**.
8. Return to Numbers. Only the prepared rows in `Anukriti Research Results` are replaced. The chart already bound to that table refreshes.
9. Keep the run proof displayed in Anukriti. It contains the input fingerprint, proposal fingerprint, output table, row count, and completion time.

## Safe failure behavior

- Wrong/missing table name or headers: the app refuses to read or write.
- More than 25 rows or duplicate inputs: the app refuses to create the research job.
- Missing result, malformed value, HTTP source, credentialed source, or local/private source: the row cannot be saved.
- Output table has insufficient rows: the app refuses the write; add blank template rows first.
- User does not check the approval box: the write endpoint rejects the request.
- The app never writes formulas, sheet names, chart definitions, or arbitrary cells.

## Demo fallback

**Load controlled demo values** creates fixed local values and labels them as `Controlled demo value`. They are not Bing results, live market data, or financial advice. Use this only if a live public website is unavailable during the hackathon demo.

## Verified locally

On macOS Numbers, the native bridge was exercised against a separate disposable document:

1. Read `Anukriti Research Input` with Flowood MS and AAPL rows.
2. Wrote approved values `286000` and `73.2` to `Anukriti Research Results`.
3. Read the results table back and confirmed the exact values, source URLs, timestamps, and statuses.

This validates the local Numbers adapter. It does not make third-party Bing page layouts or data availability guaranteed.

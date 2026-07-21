# Hackathon demo runbook

## What you will show

Anukriti takes **10 invoices** from a local source website, makes a transparent decision, maps passed invoices from internal Excel data, loads them into a FinanceHub target, routes exceptions to ExceptionDesk, and shows the team the result.

Expected result: **5 passed invoices / $11,430** in FinanceHub and **5 exceptions / $9,570** in ExceptionDesk.

## Before the demo

Open Terminal and run:

```bash
cd "/Users/ranveersinghthakur/Documents/Anukriti 2"
npm install
npm run install:browser
npm run dev
```

`npm install` and `npm run install:browser` are one-time setup commands. Leave the terminal running and open [http://localhost:5173](http://localhost:5173).

## The complete back-office demo

1. On the sign-in page, create an account. The first local account is an administrator.
2. In the top navigation, select **Back-office demo**.
3. Say: “This is the saved automation job. It uses a safe local source and target systems so the demo is repeatable without credentials.”
4. Select **Open Website 1: ACME source**. A new tab shows the 10 invoices waiting in the source queue. Close or leave this tab open.
5. Select **Capture this process as a reusable job**. Say: “This is a business-process recording, not a brittle list of browser clicks.”
6. In **Exact capture**, point out all six retained stages: Source table → Queue → Rules document → Background worker → FinanceHub / ExceptionDesk → Proof. The intent card identifies **Invoice routing orchestration** and shows the source/rules evidence it matched.
7. Select **Review & optimize saved process**. Say: “The original plan remains for audit. The optimized plan creates a fresh queue, loads the documented rules and mapping once, routes in the worker, and retains every decision and proof.”
8. Select **Run optimized saved job**. Say: “The server worker now creates a fresh queue and routes the records in the background. It does not replay browser clicks for Excel or business logic.”
9. When the proof completes, point out the rule hash, source hash, mapping count, timestamps, process-job linkage, and evidence timeline.
10. Point out the outcome card: **5 invoices posted automatically** and **5 exceptions safely routed for review**.
11. In **Automation throughput**, show: 10 invoices read, 5 passed, 5 exceptions, 50% pass rate, $11,430 passed, and $9,570 exceptions.
12. In **Decision log**, explain two outcomes:
   - A passed invoice has a supplier + PO match and is under its permitted limit.
   - An exception preserves the reason: missing PO, unmapped supplier, or amount over the no-touch limit.
13. Select **Download proof report** and **Download mapped Excel**. The JSON proves the exact saved process, source, policy, mappings, decisions, and target counts; the workbook is the FinanceHub payload.
14. Select **Open FinanceHub target**. Website 2 shows the five mapped records in its own queue.
15. Select **Open ExceptionDesk target**. Website 3 shows the five records needing a person, with each reason visible.
16. Select **Run optimized saved job** again. A new queue/run ID is created, while the target queues remain at five records each: the demo replaces the same source invoices rather than duplicating them.

## How browser recording fits the product

Do **not** claim that recording browser clicks alone performs the full invoice-routing job. The full demo includes server-side Excel mapping, decisioning, and target routing; those are shown and run through **Back-office demo**.

To demonstrate Anukriti's separate browser-recording capability:

1. Select **New browser job**.
2. Enter a name such as `Weekly back-office research` and a public starting page, for example `https://www.bing.com`.
3. Select **Create browser job**, then **Record this job**.
4. In the visible recorder browser, complete a harmless research task (for example, search for `back office automation trends`). Close the recorder when complete.
5. Back in Anukriti, select **Check saved steps**, review the plain-English capture, then select **Review & optimize job**.
6. Review the generated Playwright code, choose **Visible browser** for the first repeat, check the confirmation box, and select **Open visible browser**.
7. The run history records the result and the selected run mode. Use **Background** only after the job is trusted.

This sequence honestly demonstrates both product capabilities: recorded browser productivity jobs and the prebuilt 10-record back-office automation.

## Recovery if a demo step fails

- If the app does not open, confirm `npm run dev` is still running, then reload `http://localhost:5173`.
- If the Back-office button reports a role restriction, sign in with the account that created the workspace (administrator/creator/runner roles can run the demo).
- If the browser recorder does not open, run `npm run install:browser` once, restart `npm run dev`, and try again.
- The Back-office demo uses only local dummy data; rerunning it is safe.

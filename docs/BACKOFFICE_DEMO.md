# Back-office invoice-routing demo

## The business story

An operations team receives invoices in Website 1 and spends time checking purchase orders, looking up vendor codes, copying values into a finance system, and explaining failures. This sample job automates the repeatable work and sends only exceptions to a person.

## Run it

1. Start Anukriti and sign in.
2. Select **Back-office demo** in the navigation.
3. Optionally open **Website 1: ACME source** to see the static source page.
4. Select **Capture this process as a reusable job**. Review the preserved source → queue → rules → worker → targets → proof stages.
5. Select **Review & optimize saved process**. The app shows exactly what moves to the background worker and what cannot change.
6. Select **Run optimized saved job**. It creates a new 10-record queue automatically, then starts the background worker.
7. Review the decision log, target queues, throughput analytics, and **Download mapped Excel** export.

The older **1. Load 10 records into queue** and **2. Run background routing** controls remain as a useful teaching path. For the hackathon demonstration, use the saved-job path above: it proves the process was captured once and can be rerun without manual reassembly.

## End-to-end flow

```text
Website 1: ACME Invoice Portal (local static page)
        │ loads 10 records into a fingerprinted queue
        ▼
Rules document: BACKOFFICE_RULES.md
        │ versioned supplier + PO + amount checks
        ▼
Background server worker
  reads Excel mapping and routes without a browser window
        │
        ├── Passed → read internal Excel mapping → Website 2: FinanceHub mock
        │
        └── Exception → Website 3: ExceptionDesk mock
                                      │
                                      ▼
                         Built-in free analytics + downloadable proof report
```

## What is real in the demo

- **Recorded process job:** the dashboard captures an auditable semantic business plan, not fragile browser selectors: Source table → Queue → Rules document → Background worker → FinanceHub / ExceptionDesk → Proof. It stores the source and rules fingerprints, target names, raw plan, optimized plan, and execution history for the signed-in owner.
- **Intent recognition:** a transparent local classifier identifies the declared invoice-routing shape from the source, rules document, worker, targets, and proof stages. It shows the matching evidence in the UI; it is not an LLM or an OpenAI API call.
- **Website 1:** `public/demo-websites/acme-invoices.html` is a static source website. The source adapter reads its structured invoice payload rather than duplicating data in the UI.
- **Queue:** loading creates a durable batch with its own ID, record count, timestamp, and source fingerprint before any routing starts.
- **Rules document:** `docs/BACKOFFICE_RULES.md` contains the business-readable policy and versioned configuration. The worker parses it before routing; its version and fingerprint are stored in the proof.
- **Decision:** supplier/PO mapping, the mapped PO allowance, and the $5,000 no-touch limit are applied consistently in code from the document configuration. Every outcome retains a human-readable reason and target.
- **Internal Excel mapping:** on first run, the app generates and then reads `data/backoffice/internal-finance-mapping.xlsx`. It maps supplier + PO to ERP vendor ID, legal entity, cost center, and allowable amount.
- **Website 2 / Website 3:** FinanceHub and ExceptionDesk are durable local target-system mocks in Anukriti's data store. Their separate local pages can be opened from the dashboard after a run. A rerun replaces the same source invoices instead of duplicating them.
- **Background routing:** a server-side worker routes the queued records asynchronously. A saved-job replay always makes a fresh queue before it starts, then runs outside the browser; this is more robust than replaying clicks for rules and Excel processing.
- **Concrete proof:** the dashboard shows queue/job state, source and rule fingerprints, rule version, Excel mapping count, timestamps, process-job linkage, target counts, and a step-by-step evidence timeline. The FinanceHub payload and the proof JSON are downloadable.

## AI boundary

The free hackathon version uses an **explainable deterministic decision step**. It is deliberately labelled “AI-ready” rather than claiming an external model made the decision. An approved model can later be inserted at that boundary for document interpretation or policy explanation, but it needs a budget, data-governance review, an evaluation set, human oversight for exceptions, and explicit user consent.

## Demo result

The bundled data produces five FinanceHub loads ($11,430) and five ExceptionDesk records ($9,570). The unmapped supplier, high-value invoice, and missing-PO cases make the exception path visible in a short demo.

## Release verification evidence

The following user-visible journey was exercised on 2026-07-18 by the automated API and browser test suites:

| Journey | Expected result | Evidence |
| --- | --- | --- |
| Capture | A signed-in user captures an **Invoice routing orchestration** with all six business stages and evidence. | The saved raw plan has source, queue, rules, worker, targets, and proof stages. |
| Optimize | The raw plan remains retained; a safe optimized plan becomes ready to run. | The plan states that it creates a fresh queue, loads rules/mapping once, retains all outcomes, and emits proof. |
| Run | The saved job automatically creates a 10-record queue and starts the worker. | API returns `202`; the browser shows the live status and then the completed proof. |
| Route and prove | Every record is accounted for and artifacts are usable. | 5 FinanceHub / 5 ExceptionDesk, proof JSON download, and mapped Excel download succeed. |
| Replay | A second run does not duplicate target records. | A new queue/run is created; targets remain 5 FinanceHub / 5 ExceptionDesk. |
| Privacy | Another user cannot discover or run the owner’s saved job. | The endpoint returns `404` rather than exposing the process. |

`npm run check` passed **16/16 tests** and completed a production frontend build after this journey was added.

## Production replacement points

| Demo boundary | Production replacement |
| --- | --- |
| Static source adapter | UiPath ACME API, controlled browser adapter, or a connector with service credentials |
| Local JSON targets | Finance/ERP and case-management APIs with idempotency keys |
| Local Excel workbook | Governed master-data source, secure file store, or MDM API |
| Built-in dashboard | Existing BI environment or a governed analytics warehouse |

No external financial system, account, purchase, message, or production data is touched by this demo.

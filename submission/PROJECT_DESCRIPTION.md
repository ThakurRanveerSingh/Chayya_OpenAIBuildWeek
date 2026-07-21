# Chayya — The Shadow of Your Best Work

Chayya is a local-first workflow automation app built around one idea: **do a task once, review the evidence, then reuse the job safely.**

A user records a browser task in a visible Playwright browser. Chayya captures the exact steps, redacts recognized sensitive form values, and turns the recording into a plain-English SOP, Rule Book, and editable automation script. The user reviews the capture, gives feedback, and can apply a deliberately conservative optimization that removes only exact adjacent duplicate actions while preserving the original workflow.

The user can then rerun the approved job on demand. First runs are visible and require confirmation; background execution is unlocked only after the same saved version succeeds visibly. Each run produces inspectable proof: status, timing, step count, output, and audit history.

For a reliable demo, Chayya includes five stable first-party browser workflows with no external accounts, CAPTCHAs, or live-data dependency. It also includes a back-office invoice-routing demo that shows an explainable business process: local source invoices → documented rules → Excel mapping → FinanceHub or ExceptionDesk → downloadable proof.

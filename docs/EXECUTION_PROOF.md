# Browser-job execution proof

## What a result means

Chayya no longer shows raw Playwright terminal output as the primary result. Every browser replay now creates an **Execution proof** card with:

- Passed, Failed, or Running state and chosen run mode
- timestamp, duration, short run ID, saved job version, script fingerprint, and runnable-step count
- reported Playwright check count when the runner supplied it
- a plain-language explanation and safe next action
- a bounded, ANSI-free, secret-redacted technical log kept behind **Technical details for troubleshooting**

**Passed means the saved Playwright checks passed.** It does not automatically prove a broader business outcome (for example, that an external service accepted a request) unless that result was explicitly asserted by the saved job. The proof card states this boundary clearly.

## Safety gate for Background

Background execution is permitted only after a **Visible browser** replay passed for the identical saved script fingerprint and version. Re-recording, changing a wait, saving a new note, or generating code again requires a new visible rehearsal. The API enforces this rule; it cannot be bypassed by changing only the browser UI.

## Failure experience

Failed replays are classified conservatively as a changed page control, timeout, navigation problem, failed saved check, runner setup problem, bot verification, or unknown stop. The app offers a corresponding recovery step—for example, rehearse visibly and re-record the affected named action. Earlier captures and prior proof remain intact.

## Verification

- Unit coverage validates ANSI/secret cleanup, pass/fail proof generation, and version-fingerprint safety.
- API integration verifies a locator timeout, protected technical-log retrieval, initial Background rejection, and rejection after a code change.
- Browser E2E validates the proof card, fresh confirmation for each retry, and the collapsed technical-details interaction.
- The controlled demo suite runs all five first-party jobs visibly and then in the background, with the gate checked for each job.

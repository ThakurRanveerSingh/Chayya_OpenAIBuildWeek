# Anukriti SDLC Evidence

## Product requirement

**Job to be done:** a business user performs a recurring browser task once, reviews the captured process, and later runs the saved job without repeating manual work.

**Definition of done for the MVP:** a signed-in job owner can create a job, record it, review exact steps, see transparent optimization, confirm execution, see the outcome, and access only their own saved artefacts.

## Lifecycle controls

| SDLC stage | Evidence now in the repository | Remaining enterprise work |
| --- | --- | --- |
| Requirements | This document, user journey, defined MVP boundary | Formal stakeholder sign-off and measurable business KPIs |
| Architecture | React + Express + Playwright boundaries, ownership and audit model | Multi-tenant architecture review and managed identity design |
| Development | Small vertical-slice implementation, input validation, explicit errors | Formal code-review policy and branch protection |
| Testing | Unit, API integration, browser E2E tests via `npm test` | Load, accessibility, cross-browser, and resilience tests |
| Security | Authentication, roles, ownership, protected artefacts, target checks, redaction, headers, rate limiting | SSO/MFA, managed secrets, encrypted managed storage, worker isolation |
| Release | Build, test, release checklist, health endpoint, CI workflow | Staging/prod promotion, change approvals, rollback rehearsal |
| Operations | Structured request logs, health endpoint, run history | Central logs, metrics/alerts, on-call, backups and recovery exercise |

## Test matrix

| Journey | Expected result | Automated evidence |
| --- | --- | --- |
| Account and access | Anonymous access is rejected; owner may access job; another creator may not | recorder integration test |
| Browser job | Create → record → review → optimize → confirm → run | browser E2E test |
| Sensitive data | Sensitive form values are replaced before saved code is generated | security unit test |
| Target safety | Local/private/non-web/credentialed URLs are rejected | security unit and integration tests |
| Safe optimization | Only exact adjacent duplicate navigation/fill steps are removed | workflow unit test |

## Release command

```bash
npm run check
```

Release is blocked if tests or the production checklist fail.

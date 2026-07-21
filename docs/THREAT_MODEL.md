# Threat model and security boundary

## In scope

Anukriti stores browser-job metadata and recorded Playwright scripts. A job may navigate to an external website and can perform consequential actions such as sending, submitting, purchasing, or deleting.

## Controls implemented in this release

| Threat | Control |
| --- | --- |
| Unauthenticated use | Account registration/login and expiring bearer sessions |
| Excess privilege | `admin`, `creator`, `runner`, and `viewer` roles enforced by the API |
| Cross-user job access | Job owner checks on read, record, generate, run, download, duplicate, and delete |
| Public script exposure | Saved scripts require authenticated, authorised download |
| SSRF/local target access | HTTP(S)-only public-target validation; blocks localhost, private IPv4, local hostnames, credentialed URLs, and common private IPv6 ranges |
| Captured secret values | Recognised secret fields are redacted to runtime placeholders before the recording is persisted |
| Accidental consequential rerun | Risk flags and explicit confirmation before every job run |
| Basic abuse | Request body limits, basic response-security headers, in-memory per-IP rate limit, two-minute run timeout |
| Missing provenance | Bounded audit log records account, workflow, and run events |

## Explicit non-production boundary

This is a secure local/demo foundation, not a certified production platform. Before internet-facing or multi-tenant launch, use managed identity with MFA/SSO, HttpOnly secure cookies, a managed encrypted database, a secrets vault, DNS-aware egress controls, isolated job workers, malware/dependency scanning, central audit retention, monitoring/alerting, backups, and an incident-response process.

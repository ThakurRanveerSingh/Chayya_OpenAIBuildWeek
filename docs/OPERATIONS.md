# Local operations runbook

## Start

```bash
npm run dev
```

Open `http://localhost:5173`, create the first account, and create a browser job. The first local account is an administrator; later accounts begin as creators.

## Health

`GET /api/health` returns a simple API health response. Request logs are emitted as JSON to standard output.

## Job failures

1. Open the job and inspect the run output.
2. If the target site changed, record the job again and review the new steps.
3. If a secret was redacted, provide the matching `ANUKRITI_SECRET_n` only in the execution environment.
4. If a job exceeds two minutes, it is stopped and marked failed.

## Data and recovery

For the local MVP, state is stored in `data/anukriti.json` and scripts are in `automations/`. Back up those directories only to an approved encrypted location. Production must replace this with managed encrypted storage and tested backup/restore procedures.

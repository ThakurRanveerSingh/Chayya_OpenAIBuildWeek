# Free hackathon deployment profile

## Goal

This profile provides a no-license-cost, production-shaped local environment for a hackathon demo or controlled pilot. It is intentionally **not** a substitute for a hosted enterprise production environment.

## Selected free components

| Need | Selected component | Why |
| --- | --- | --- |
| Container runtime/orchestration | Docker Compose | One command starts the local stack; no cloud account is required. |
| Application runtime | Anukriti Node/Playwright container | Serves the built UI/API and runs browser jobs with the pinned Playwright runtime. |
| Identity foundation | Keycloak Community | Free self-hosted OpenID Connect/OAuth identity server; realm, client, and role definitions are included. |
| Identity database | PostgreSQL | Free relational database used by Keycloak in this profile. |
| Metrics storage/scraping | Prometheus | Collects application and Keycloak metrics locally. |
| Dashboard | Grafana | Provides a local dashboard UI with Prometheus preconfigured. |

Keycloak publishes official container and production-configuration guidance, including PostgreSQL, health, and metrics support. [Official Keycloak container documentation](https://www.keycloak.org/server/containers). Grafana documents the `grafana/grafana` Docker image and its local persistent-volume approach. [Official Grafana Docker documentation](https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/).

## What has been added

```text
compose.yaml
infra/Dockerfile
infra/.env.hackathon.example
infra/keycloak/anukriti-realm.json
infra/prometheus/prometheus.yml
infra/grafana/provisioning/datasources/prometheus.yml
```

The application additionally exposes:

- `GET /api/health` — liveness.
- `GET /api/ready` — local-store readiness.
- `GET /metrics` — Prometheus-format request, completed-job, and uptime metrics.

## Start locally

1. Install Docker Desktop or Docker Engine with Compose. This workspace does not currently have Docker installed, so container execution must be performed on a machine that does.
2. Copy the example environment file and replace every placeholder with a unique long value.

   ```bash
   cp infra/.env.hackathon.example infra/.env.hackathon
   ```

3. Start the stack.

   ```bash
   docker compose --env-file infra/.env.hackathon up --build
   ```

4. Open only from the local machine:

   - Anukriti: <http://localhost:3001>
   - Keycloak administration: <http://localhost:8080>
   - Prometheus: <http://localhost:9090>
   - Grafana: <http://localhost:3000>

5. Stop it after the demo:

   ```bash
   docker compose --env-file infra/.env.hackathon down
   ```

Use `docker compose ... down -v` only when intentionally deleting all local demo data.

## Identity/RBAC configuration

The imported `anukriti` realm defines `admin`, `creator`, `runner`, and `viewer` roles and an `anukriti-web` OIDC client. It is a ready free identity service for the next integration step.

**Current application behaviour:** Anukriti still uses its local account/session implementation. The Keycloak realm is intentionally not silently substituted for it; accepting identity tokens without implementing full OIDC validation and browser redirect flow would weaken security. Keycloak integration, secure-cookie sessions, and a migration from local JSON to managed application PostgreSQL are still required before public production.

## Security boundary

- Compose binds service ports only to `127.0.0.1`; do not expose this stack publicly.
- Keycloak uses `start-dev` for hackathon convenience. Keycloak explicitly warns that development mode has insecure defaults and must not be used for production.
- Passwords in `infra/.env.hackathon` are local demo secrets and must not be committed, copied into screenshots, or reused.
- Prometheus/Grafana are local demo observability tools, not an incident-management platform.
- The application must still reach approved external target sites to execute browser jobs; a real deployment needs an allowlisted egress proxy and isolated workers.

## Remaining promotion gates

Before a public launch, complete and independently verify:

1. OIDC login integration with Keycloak/enterprise IdP, MFA, secure HttpOnly session cookies, and token rotation.
2. Application data migration from JSON files to encrypted PostgreSQL with tenant/workspace scoping, migrations, backup, and restore tests.
3. Dedicated job queue and isolated Playwright workers with egress allowlisting, quotas, and retry policy.
4. TLS ingress/WAF, central logs/audits, alerting/on-call, and a tested incident/rollback process.
5. Dependency remediation, penetration testing, load testing, accessibility validation, and formal UAT approval.

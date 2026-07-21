# Release checklist

- [ ] `npm ci` completed from the lockfile.
- [ ] `npm run check` passes.
- [ ] Dependency audit reviewed and remediation decision recorded.
- [ ] Target-site job is rehearsed against an approved public test account.
- [ ] No secrets, customer data, recordings, or generated scripts are committed.
- [ ] Sensitive placeholders are supplied only through the secure runtime environment.
- [ ] Roles and job ownership are checked with at least two accounts.
- [ ] Consequential actions have an explicit business approval and rollback procedure.
- [ ] Health endpoint is monitored and run failures have an owner.
- [ ] For public launch: all remaining items in `docs/THREAT_MODEL.md` are implemented and independently verified.

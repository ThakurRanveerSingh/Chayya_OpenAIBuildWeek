import fs from 'node:fs';
import path from 'node:path';

const file = process.env.ANUKRITI_STORE_PATH ? path.resolve(process.env.ANUKRITI_STORE_PATH) : path.resolve('data/anukriti.json');
const initial = {
  shoppingProfile: { maxPrice: 100, priorities: ['value'], excludedBrands: [] },
  stewardProfile: { threshold: 500, requireDate: false, excludedIds: [] },
  workflows: [],
  history: [],
  users: [],
  audit: [],
  workdays: [],
  numbersResearchJobs: [],
  resumeJobs: [],
  backoffice: { runs: [], financeHub: [], exceptionDesk: [], queueBatches: [], jobs: [], processJobs: [] }
};

export function readStore() {
  if (!fs.existsSync(file)) return structuredClone(initial);
  return { ...structuredClone(initial), ...JSON.parse(fs.readFileSync(file, 'utf8')) };
}
export function writeStore(data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
export function record(type, result) {
  const db = readStore();
  db.history.unshift({ id: crypto.randomUUID(), type, at: new Date().toISOString(), result });
  db.history = db.history.slice(0, 30);
  writeStore(db);
  return db.history[0];
}

export function audit(db, user, action, resourceType, resourceId, metadata = {}) {
  db.audit = db.audit || [];
  db.audit.unshift({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    actorId: user.id,
    actorEmail: user.email,
    action,
    resourceType,
    resourceId,
    metadata
  });
  db.audit = db.audit.slice(0, 500);
}

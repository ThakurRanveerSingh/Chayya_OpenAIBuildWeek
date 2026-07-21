import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const availablePort = () => new Promise(resolve => {
  const server = net.createServer();
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address(); server.close(() => resolve(port));
  });
});
async function waitForHealth(port) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { if ((await fetch(`http://127.0.0.1:${port}/api/health`)).ok) return; } catch { /* Server is still starting. */ }
    await wait(100);
  }
  throw new Error('Controlled-demo server did not start.');
}
async function api(port, route, body, token, method) {
  const response = await fetch(`http://127.0.0.1:${port}${route}`, { method: method || (body === undefined ? 'GET' : 'POST'), headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}

test('runs all five controlled demo jobs against the local first-party pages', { timeout: 120_000 }, async t => {
  // Keep disposable test jobs below the project root so Playwright resolves
  // the app's @playwright/test dependency exactly as real saved jobs do.
  const directory = fs.mkdtempSync(path.join(projectRoot, '.anukriti-controlled-demo-'));
  const port = await availablePort();
  const server = spawn(process.execPath, [path.join(projectRoot, 'server/index.js')], { cwd: projectRoot, env: { ...process.env, PORT: String(port), ANUKRITI_STORE_PATH: path.join(directory, 'anukriti.json'), ANUKRITI_JOB_AUTOMATION_DIR: path.join(directory, 'automations') }, stdio: 'ignore' });
  t.after(() => { server.kill(); fs.rmSync(directory, { recursive: true, force: true }); });
  await waitForHealth(port);

  const page = await fetch(`http://127.0.0.1:${port}/demo-websites/anukriti-fifa-briefing.html`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /FIFA briefing builder/);
  const account = await api(port, '/api/auth/register', { name: 'Demo User', email: 'demo@example.com', password: 'correct-horse-battery-staple' });
  assert.equal(account.status, 201);
  const created = await api(port, '/api/workflows/controlled-demo-jobs', {}, account.data.token);
  assert.equal(created.status, 201);
  assert.equal(created.data.workflows.length, 5);

  for (const workflow of created.data.workflows) {
    const blockedBackground = await api(port, `/api/workflows/${workflow.id}/run`, { confirmed: true, runMode: 'background' }, account.data.token);
    assert.equal(blockedBackground.status, 409, `${workflow.name} must earn a visible rehearsal first`);
    for (const runMode of ['visible', 'background']) {
      const started = await api(port, `/api/workflows/${workflow.id}/run`, { confirmed: true, runMode }, account.data.token);
      assert.equal(started.status, 200, `${workflow.name} (${runMode})`);
      let finished;
      for (let attempt = 0; attempt < 120; attempt += 1) {
        finished = await api(port, `/api/workflows/${workflow.id}/run`, undefined, account.data.token);
        if (finished.data.lastRun?.status !== 'Running') break;
        await wait(250);
      }
      assert.equal(finished.data.lastRun?.status, 'Passed', `${workflow.name}: ${finished.data.lastRun?.technicalLog || 'no output'}`);
      assert.equal(finished.data.lastRun?.proof?.verdict, 'passed');
      assert.match(finished.data.lastRun.technicalLog, /1 passed/);
    }
  }
});

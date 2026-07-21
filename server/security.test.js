import test from 'node:test';
import assert from 'node:assert/strict';
import { assessRecordedReliability, redactSensitiveRecording, validateAutomationUrl, validateRecordedTargets } from './security.js';

test('blocks local, private, credentialed, and non-web browser targets', () => {
  for (const value of ['file:///etc/passwd', 'http://localhost:3000', 'http://10.1.2.3', 'http://192.168.1.10', 'https://user:password@example.com']) {
    assert.ok(validateAutomationUrl(value).error, value);
  }
  assert.equal(validateAutomationUrl('https://example.com/report').value, 'https://example.com/report');
  assert.ok(validateRecordedTargets("await page.goto('http://127.0.0.1:3000');").error);
  const challenge = validateRecordedTargets("await page.locator('iframe[src=\"https://challenges.cloudflare.com/cdn-cgi/challenge-platform\"]');");
  assert.match(challenge.error, /will not automate verification/);
});

test('allows only a server-provided controlled demo origin to use its own static pages', () => {
  const code = "await page.goto('http://127.0.0.1:3131/demo-websites/anukriti-fifa-briefing.html');";
  assert.ok(validateRecordedTargets(code).error);
  assert.deepEqual(validateRecordedTargets(code, { trustedLocalDemoOrigin: 'http://127.0.0.1:3131' }).value, ['http://127.0.0.1:3131/demo-websites/anukriti-fifa-briefing.html']);
  assert.ok(validateRecordedTargets("await page.goto('http://127.0.0.1:3131/api/state');", { trustedLocalDemoOrigin: 'http://127.0.0.1:3131' }).error);
});

test('redacts sensitive form values before a recording is saved', () => {
  const recording = "await page.getByLabel('Password').fill('do-not-save-me');\nawait page.getByLabel('Email').fill('ada@example.com');";
  const result = redactSensitiveRecording(recording);
  assert.equal(result.redacted, 1);
  assert.doesNotMatch(result.code, /do-not-save-me/);
  assert.match(result.code, /ANUKRITI_SECRET_1/);
  assert.match(result.code, /ada@example\.com/);
});

test('identifies generic positional selectors before a recording is presented as reusable', () => {
  const fragile = assessRecordedReliability("await page.locator('div').filter({ hasText: /^WWE$/ }).nth(3).click();");
  const stable = assessRecordedReliability("await page.getByRole('link', { name: 'World Cup scores' }).click();");

  assert.equal(fragile.ok, false);
  assert.equal(fragile.issues[0].code, 'generic-position-selector');
  assert.match(fragile.issues[0].fix, /stable search URL/);
  assert.equal(stable.ok, true);
});

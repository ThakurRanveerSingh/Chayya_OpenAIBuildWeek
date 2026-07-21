import net from 'node:net';

const blockedNames = new Set(['localhost', 'localhost.localdomain', 'metadata.google.internal']);

function privateIpv4(host) {
  const parts = host.split('.').map(Number);
  return parts.length === 4 && (parts[0] === 10 || parts[0] === 127 || parts[0] === 0 ||
    (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168));
}

export function validateAutomationUrl(value, { optional = true } = {}) {
  if (!value?.trim()) return optional ? { value: '' } : { error: 'A starting URL is required.' };
  let url;
  try { url = new URL(value); } catch { return { error: 'Enter a valid HTTPS or HTTP starting URL.' }; }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const ipv6Private = host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:');
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || blockedNames.has(host) || host.endsWith('.local') ||
    (net.isIP(host) === 4 && privateIpv4(host)) || ipv6Private) {
    return { error: 'Use a public HTTP(S) URL. Local, private-network, credentialed, and non-web URLs are blocked.' };
  }
  return { value: url.toString() };
}

export function validateRecordedTargets(code, { trustedLocalDemoOrigin = null } = {}) {
  if (/challenges\.cloudflare\.com|turnstile|recaptcha|hcaptcha/i.test(code)) {
    return { error: 'This recording includes a bot-verification challenge (Cloudflare, Turnstile, reCAPTCHA, or hCaptcha). Chayya will not automate verification. Re-record without the challenge step, stop at a public result page, or keep that verification as a manual user checkpoint.' };
  }
  const urls = [...code.matchAll(/\.goto\(\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
  for (const url of urls) {
    const result = validateAutomationUrl(url, { optional: false });
    if (!result.error) continue;
    let trustedDemo = false;
    try {
      const candidate = new URL(url); const origin = trustedLocalDemoOrigin ? new URL(trustedLocalDemoOrigin).origin : '';
      trustedDemo = Boolean(origin) && candidate.origin === origin && candidate.pathname.startsWith('/demo-websites/anukriti-');
    } catch { /* The normal URL validator owns malformed URL errors. */ }
    if (!trustedDemo) return result;
  }
  return { value: urls };
}

// Codegen keeps the user's exact actions, but an exact selector is not always
// repeatable. A generic element selected only by ordinal position is especially
// likely to shift when a search page adds a banner, advert, or cookie prompt.
// Preserve the raw recording for review and block only its reusable-job step.
export function assessRecordedReliability(code) {
  const issues = [];
  const genericPositionSelector = /\.locator\(\s*['"](?:div|span|a|button)['"]\s*\)\s*\.filter\([\s\S]*?\)\s*\.nth\(\s*\d+\s*\)/;
  if (genericPositionSelector.test(code)) {
    issues.push({
      code: 'generic-position-selector',
      message: 'This recording clicks a generic page element by position (for example, div … nth(3)). Search results and page banners can change that position.',
      fix: 'Re-record using a stable search URL, a labelled control, or a named link. Do not choose an item based only on its position in the page.'
    });
  }
  if (/\.contentFrame\(\)\.locator\(['"]body['"]\)\.click\(/.test(code)) {
    issues.push({
      code: 'frame-body-click',
      message: 'This recording clicks the body of an embedded frame, which is not a stable business action.',
      fix: 'Re-record only the named control you intend to use. Never record a bot-verification or embedded challenge frame.'
    });
  }
  return {
    ok: issues.length === 0,
    issues,
    summary: issues.length
      ? `${issues.length} reliability issue${issues.length === 1 ? '' : 's'} must be corrected before this capture can be saved as a reusable job.`
      : 'Reliability preflight passed. The recording contains no known unstable selector patterns.'
  };
}

export function redactSensitiveRecording(code) {
  let redacted = 0;
  const result = code.split('\n').map(line => {
    const isSensitive = /password|passcode|secret|api.?key|token|cvv|card.?number|social.?security/i.test(line);
    if (!isSensitive || !/\.fill\(\s*['"]/.test(line)) return line;
    redacted += 1;
    const replacement = `process.env.ANUKRITI_SECRET_${redacted} || ''`;
    const safeLine = line.replace(/\.fill\(\s*(['"])(?:\\.|(?!\1).)*\1\s*\)/, `.fill(${replacement})`);
    return `  // Chayya redacted a sensitive value. Supply ANUKRITI_SECRET_${redacted} only in the secure runtime.\n${safeLine}`;
  }).join('\n');
  return { code: result, redacted };
}

// Playwright output is diagnostic material, not a place to retain secrets.
// Keep the line-reporter evidence useful while removing terminal colouring and
// common credential-shaped values before it is persisted or shown to a person.
export function sanitizeTechnicalLog(value, maximumLength = 6000) {
  let log = String(value || '')
    .replace(/\u001B\[[0-?]*[ -\/]*[@-~]/g, '')
    .replace(/(authorization|password|passcode|secret|api[_ -]?key|token|cvv)\s*([:=])\s*([^\s,;]+)/gi, '$1$2[redacted]')
    .replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi, 'Bearer [redacted]');
  const redactedCapture = redactSensitiveRecording(log);
  log = redactedCapture.code;
  return log.slice(-maximumLength);
}

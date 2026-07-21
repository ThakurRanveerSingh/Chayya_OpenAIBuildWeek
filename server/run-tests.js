import { spawnSync } from 'node:child_process';

// Browser and API integration tests each own a local HTTP server. Run test
// files one at a time so their lifecycle, temporary stores, and ports remain
// isolated on every developer machine and CI runner.
const files = [
  'server/backoffice.test.js',
  'server/posable.test.js',
  'server/resume.test.js',
  'server/security.test.js',
  'server/workflows.test.js',
  'server/workday.test.js',
  'server/mac-numbers.test.js',
  'server/numbers-research.test.js',
  'server/recording.integration.test.js',
  'server/browser.e2e.test.js',
  'server/controlled-demo.e2e.test.js'
];

for (const file of files) {
  const result = spawnSync(process.execPath, ['--test', '--test-reporter=spec', file], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exitCode = result.status || 1;
    break;
  }
}

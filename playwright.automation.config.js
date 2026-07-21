import { defineConfig } from '@playwright/test';

const automationDirectory = process.env.ANUKRITI_AUTOMATION_DIR || './automations';
const selectedFile = process.env.ANUKRITI_TEST_FILE;
const runMode = process.env.ANUKRITI_RUN_MODE === 'visible' ? 'visible' : 'background';

export default defineConfig({
  testDir: automationDirectory,
  testMatch: selectedFile ? `**/${selectedFile}` : '**/*.spec.js',
  testIgnore: '**/*.recording.spec.js',
  timeout: 90_000,
  actionTimeout: 15_000,
  navigationTimeout: 30_000,
  use: {
    // A visible run opens a normal local browser window. Background is for
    // repeatable, already-reviewed jobs where showing every browser action is
    // unnecessary.
    headless: runMode !== 'visible',
    launchOptions: runMode === 'visible' ? { slowMo: 150 } : {}
  }
});

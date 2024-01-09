// @ts-check
import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Enables multiple "site projects"
 * 
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

if (!process.env.domain) {
  dotenv.config({
    path: path.resolve(process.cwd(), (process.env.projectname || '') + '.env')
  });
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({

  /* Sitewright customizations */

  // Add {-snapshotSuffix} to distinguish between platforms
  snapshotPathTemplate: '{testDir}/snapshots/{arg}{-projectName}{ext}',
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [
    ['list'],
    ['junit', { outputFile: './playwright-report/test-results.xml' }]
  ] : [
    ['html']
  ],

  /* Defaults */
  
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 3 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    /* Firefox */
    /*
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
    */

    /* Webkit */
    /*
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
        {
          name: 'Mobile Safari',
          use: { ...devices['iPhone 12'] },
        },
    */


    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});


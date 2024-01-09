# Sitewright CLI

- `npm i [wherever-we-put-the-tarball]`
- `npx sitewright init` TODO: ` -project demo -domain https://mysite.com`
- `npx sitewright test`

# Sitewright Template

A template for playwright visual regression tests based on sitemaps.

- [Sitewright CLI](#sitewright-cli)
- [Sitewright Template](#sitewright-template)
    - [Important](#important)
      - [⚠ Snapshot storage](#-snapshot-storage)
      - [⚠ Sitewright "Project" vs. Playwright "Project"](#-sitewright-project-vs-playwright-project)
  - [Getting started](#getting-started)
  - [Configuring a test suite](#configuring-a-test-suite)
    - [Bulding a suite from a sitemap](#bulding-a-suite-from-a-sitemap)
    - [Building suite from list of URLs](#building-suite-from-list-of-urls)
    - [Environment variables](#environment-variables)
    - [Validator function](#validator-function)
      - [Scrolling and waiting](#scrolling-and-waiting)
      - [Slow scrolling](#slow-scrolling)
    - [Playwright config customizations](#playwright-config-customizations)
      - [Loading project-specific environment files](#loading-project-specific-environment-files)
      - [Reporting and CI](#reporting-and-ci)
      - [Screenshot location](#screenshot-location)
  - [Running the tests](#running-the-tests)
    - [Filtering](#filtering)
    - [Flakyness](#flakyness)
    - [Examples](#examples)
  - [Updating snapshots](#updating-snapshots)
  - [Tips \& Tricks](#tips--tricks)
    - [Create a regex filter for failed/outdated tests](#create-a-regex-filter-for-failedoutdated-tests)

### Important

#### ⚠ Snapshot storage

By default snapshots are ignored by .gitignore.  
This template has two demo screenshots for demoing the GH pipeline.  
Steps should be taken to provide a script for downloading, (optionally also uploading) gold files from(/to) a central storage. 
Add said script to the GH pipeline if used.

#### ⚠ Sitewright "Project" vs. Playwright "Project"

Playwright uses the term "Project" to specify browser and device.  
The sitewright template use the term "Project" to specify different sitemaps and validators.
This documentation will use the term "Browser type" instead of Playwrights "Project".  
"Project" here will always refer to the set of environment-, sitemap- and validator-files.

## Getting started

`cd src/playwright`  
`npm install`  
`npx playwright install`

**For linux**

`sudo npx playwright install-deps`

## Configuring a test suite

The suite will use one or more transformed sitemap(s), custom function(s) and  environment variables to do the job.

### Bulding a suite from a sitemap

`cd src/playwright/`  
`./tools/Convert-Sitemap.ps1 [path to sitemap] | Set-Content ./projects/[projectname].json`  
or  
`./tools/Convert-Sitemap.ps1 [full URL to sitemap] | Set-Content ./projects/[projectname].json`

### Building suite from list of URLs

When no sitemap is available, a suite can be generated using `Convert-Urls.ps1` with an array of URLs.  
For instance when having a list of URLs separated by LF on the clipboard:

`cd src/playwright/`  
`./Convert-Urls.ps1 -urls (Get-Clipboard) | Set-Content ./projects/[projectname].json`

### Environment variables

Environment variables are put in `.env` files, optionally per project.  
Required environment variables are:

| Name | Description | Example |
| --- | --- | --- |
| projectname | Name of .env-file, sitemap file and validator function file | mysite |
| domain | Used to name the suite | https://www.mysite.com |
| jswhitelist | List of domains to load JS from | mysite.com,myothersite.com |

For non default projects, the `projectname` variable is set by `cross-env`,
and the rest in `[projectname].env`. 

### Validator function

A custom function named `validate` must be exported from `./src/playwright/projects/[projectname].js`.  
The injected `page` has a custom method called `validateScreenshot`.  
A barebones method looks like this:

```javascript
export async function validate(page, { url, parts }) {
    await page.goto(url);
    await page.validateScreenshot(parts, 'snapshot.png');
}
```

For pages with invisible content animating on scroll, one of two strategies can be chosen:

#### Scrolling and waiting

For most pages it might be enough to scroll to the bottom, optionally waiting for an element of choice to be visible.

```javascript
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
if ((await page.locator('.some-animated-class').all()).length) {
    await page.locator('.some-animated-class:last-of-type').waitFor();
}
await page.evaluate(() => window.scrollTo(0, 0));
```

#### Slow scrolling

Some pages might not show content unless it's in the viewport.  
Sitewright adds a `slowScroll()` method to `page`.  
⚠ Slow scrolling delays the test by 100ms per 100px height.

```javascript
await page.slowScroll();
await page.evaluate(() => window.scrollTo(0, 0));
```

### Playwright config customizations

#### Loading project-specific environment files

In order to run different "projects", dotenv is used to load .env-files based on the `projectname` environment variable.  
The latter is set using cross_env, while the project specific ones are in the project specific .env-file.

```javascript
require('dotenv').config({
  path: path.resolve(__dirname, (process.env.projectname || '') + '.env')
});
```

#### Reporting and CI

In order to output test reports that GitHub Actions can publish, the JUnit reporter is conditionally used for CI:

```javascript
module.exports = defineConfig({
  // ...
  reporter: process.env.CI ? [
    ['list'],
    ['junit', { outputFile: './playwright-report/test-results.xml' }]
  ] : [
    ['html']
  ],
  // ...
});
```

#### Screenshot location

All screenshots are put in a nicer path than under the test file name folder.

```javascript
module.exports = defineConfig({
  // ...
snapshotPathTemplate: '{testDir}/snapshots/{arg}{-projectName}{ext}',
  // ...
});
```

If screenshots differ between platforms, add `{-snapshotSuffix}`.

## Running the tests

### Filtering

All tests are named after the pattern `L[n] > /relative/url` where *n* is the depth of the relative path.  
It is recommended to always specify a range of levels to limit the depth of the test run.  
Limiting the range may be done by adding a regex with the `-g` option.  
For instance `-g L[0-1]` to verify the root page and all first level URLs.

### Flakyness

Several layouts may be flaky in several browsers.  
The only way to get consistent results may be to specify an amount of retries to get a golden result. Three is usually enough. Specify using the `--retries n` option.  

### Examples

Run all tests (not recommended for big sites):  
`npx playwright test --retries 3`

Run tests for level 0-2:  
`npx playwright test --retries 3 -g "L[0-2]\s`

Run tests for a named project:  
`npx cross-env sitename=other playwright test --retries 3 [-g ...]`

## Updating snapshots

Updating snapshots are done by adding the `-u` option.  
Snapshots that differ from the previous one will be overwritten.

`npx playwright test -u [-g ...]`

## Tips & Tricks

### Create a regex filter for failed/outdated tests

If your terminal supports block selection, block copy names of failed tests from the test output.  
Prepare a powershell terminal with the following statement:  
```powershell
[String]::Join("|", (get-clipboard | % { $_.Replace("─", "").Trim() + "$" }))
```
In the test output, start marking failed tests from the L*n* prefixes. Preferably the same browser type. For instance:

Test output:
```
[Chrome] › verify-site.spec.js:5:13 › https://my.site › L0 > / ─────────────────────
[Chrome] › verify-site.spec.js:5:13 › https://my.site › L1 > /contact-us/ ──────────
[Mobile Chrome] › verify-site.spec.js:5:13 › https://my.site › L0 > / ──────────────
[Mobile Chrome] › verify-site.spec.js:5:13 › https://my.site › L1 > /contact-us/ ───
```

Clipboard after operation:
```
L0 > / ──────────────
L1 > /contact-us/ ───
```

Copy the selection and press enter in the powershell terminal.  
Powershell will output a regex for all the failed tests. For instance:

```
L0 > /$|L1 > /contact-us/$
```

Copy that output an update the snapshots:

```powershell
npx playwright test -u -g "[paste expression here]"
```

The filter may even be piped directly to the clipboard:


```powershell
[String]::Join("|", (get-clipboard | % { $_.Replace("─", "").Trim() + "$" })) | clip
```

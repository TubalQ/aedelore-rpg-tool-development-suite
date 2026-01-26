# Aedelore E2E Tests

End-to-end tests using [Playwright](https://playwright.dev/).

## Prerequisites

- Node.js 18+
- Running Aedelore instance (default: http://localhost:9030)

## Setup

```bash
cd e2e
npm install
npx playwright install
```

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run with browser visible
npm run test:headed

# Run with UI mode (interactive)
npm run test:ui

# Debug mode
npm run test:debug

# Run specific test file
npx playwright test auth.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Reports

```bash
# View last test report
npm run report
```

## Test Structure

```
tests/
├── home.spec.ts          # Landing page tests
├── auth.spec.ts          # Login/register/logout tests
├── character-sheet.spec.ts   # Character sheet UI tests
├── dm-session.spec.ts    # DM tools tests
└── api.spec.ts           # API endpoint tests
```

## Configuration

Edit `playwright.config.ts` to change:

- `baseURL` - Target server (default: http://localhost:9030)
- `projects` - Browsers to test (Chromium, Firefox, WebKit, Mobile)
- `retries` - Number of retries for flaky tests

## Environment Variables

- `BASE_URL` - Override base URL (e.g., `BASE_URL=https://aedelore.nu npm test`)
- `CI` - Set in CI environments for stricter settings

## Writing Tests

```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Expected Text');
});
```

## CI Integration

Add to GitHub Actions:

```yaml
- name: Install Playwright
  run: cd e2e && npm ci && npx playwright install --with-deps

- name: Run E2E tests
  run: cd e2e && npm test
```

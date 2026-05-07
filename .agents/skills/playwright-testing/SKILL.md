---
name: playwright-testing
description: INVOKE THIS SKILL when writing or running Playwright E2E tests. Covers Playwright configuration, dark/light theme testing projects, test patterns for visual styling validation, and test execution.
---

<oneliner>
Write Playwright E2E tests with dual light/dark theme projects, test visual styling with `getComputedStyle`, and validate Tailwind dark mode behavior. Uses the built-in Next.js dev server via Playwright's `webServer` config.
</oneliner>

<config>
## Playwright Configuration

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: "light-theme",
      use: { colorScheme: "light", browserName: "chromium" },
    },
    {
      name: "dark-theme",
      use: { colorScheme: "dark", browserName: "chromium" },
    },
  ],
});
```

### Key patterns
- **Dual theme projects**: Tests run in both light and dark color schemes.
- **Auto dev server**: Playwright starts `npm run dev` automatically, reuses if already running.
- **Chromium only**: Both projects use Chromium for consistency.
- **No retries**: `retries: 0` for fast feedback in development.
</config>

<theme-testing>
## Theme Testing Patterns

### Testing computed styles
Use `page.evaluate()` with `getComputedStyle()` to validate Tailwind dark mode classes:

```typescript
test("body has correct background for color scheme", async ({ page }) => {
  await page.goto("/");

  const bgColor = await page.evaluate(() =>
    getComputedStyle(document.body).backgroundColor
  );

  const colorScheme = test.info().project.name;

  if (colorScheme === "dark-theme") {
    // dark:bg-gray-950 → low RGB values
    const match = bgColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
    expect(match).toBeTruthy();
    const [r, g, b] = [Number(match![1]), Number(match![2]), Number(match![3])];
    expect(r).toBeLessThan(30);
    expect(g).toBeLessThan(30);
    expect(b).toBeLessThan(30);
  } else {
    // bg-gray-50 → high RGB values
    const match = bgColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
    expect(match).toBeTruthy();
    const [r, g, b] = [Number(match![1]), Number(match![2]), Number(match![3])];
    expect(r).toBeGreaterThan(240);
    expect(g).toBeGreaterThan(240);
    expect(b).toBeGreaterThan(240);
  }
});
```

### Testing element styles by selector
```typescript
const cardBg = await page.evaluate(() => {
  const card = document.querySelector('[class*="rounded-2xl"][class*="shadow"]');
  return card ? getComputedStyle(card).backgroundColor : null;
});
```

### Testing border colors
```typescript
const borderColor = await page.evaluate(() => {
  const card = document.querySelector('[class*="rounded-2xl"][class*="border"]');
  return card ? getComputedStyle(card).borderColor : null;
});
```

### Conventions
- Use `test.info().project.name` to determine which theme is active.
- Parse RGB values with regex to validate color ranges (not exact values).
- Use CSS class attribute selectors to find elements.
- Test both themes in a single `test.describe` block.
</theme-testing>

<running-tests>
## Running Tests

```bash
cd frontend

# Install browsers (first time)
npx playwright install chromium

# Run all tests
npx playwright test

# Run specific project
npx playwright test --project=dark-theme

# Run with UI
npx playwright test --ui

# Show report
npx playwright show-report
```

### Test file location
Tests live in `frontend/tests/` (not `src/tests/`).
Name test files as `*.spec.ts`.
</running-tests>

import { test, expect } from "@playwright/test";

test.describe("System theme detection", () => {
  test("body has correct background color for the active color scheme", async ({
    page,
  }) => {
    await page.goto("/");

    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    const colorScheme = test.info().project.name;

    if (colorScheme === "dark-theme") {
      // dark:bg-gray-950 → Tailwind gray-950 ≈ rgb(3, 7, 18)
      expect(bgColor).not.toBe("rgb(255, 255, 255)");
      // Ensure it's a dark color (R, G, B all < 30)
      const match = bgColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
      expect(match).toBeTruthy();
      const [r, g, b] = [
        Number(match![1]),
        Number(match![2]),
        Number(match![3]),
      ];
      expect(r).toBeLessThan(30);
      expect(g).toBeLessThan(30);
      expect(b).toBeLessThan(30);
    } else {
      // bg-gray-50 → Tailwind gray-50 ≈ rgb(249, 250, 251)
      const match = bgColor.match(/rgb\((\d+), (\d+), (\d+)\)/);
      expect(match).toBeTruthy();
      const [r, g, b] = [
        Number(match![1]),
        Number(match![2]),
        Number(match![3]),
      ];
      expect(r).toBeGreaterThan(240);
      expect(g).toBeGreaterThan(240);
      expect(b).toBeGreaterThan(240);
    }
  });

  test("content card has correct background for the active color scheme", async ({
    page,
  }) => {
    await page.goto("/");

    // The main content card (.bg-white / dark:bg-gray-900)
    const cardBg = await page.evaluate(() => {
      const card = document.querySelector(
        '[class*="rounded-2xl"][class*="shadow"]'
      );
      return card ? getComputedStyle(card).backgroundColor : null;
    });

    expect(cardBg).toBeTruthy();

    const colorScheme = test.info().project.name;

    if (colorScheme === "dark-theme") {
      // dark:bg-gray-900 ≈ rgb(17, 24, 39)
      const match = cardBg!.match(/rgb\((\d+), (\d+), (\d+)\)/);
      expect(match).toBeTruthy();
      const [r, g, b] = [
        Number(match![1]),
        Number(match![2]),
        Number(match![3]),
      ];
      expect(r).toBeLessThan(50);
      expect(g).toBeLessThan(50);
      expect(b).toBeLessThan(50);
    } else {
      // bg-white → rgb(255, 255, 255)
      expect(cardBg).toBe("rgb(255, 255, 255)");
    }
  });

  test("card border adapts to the active color scheme", async ({ page }) => {
    await page.goto("/");

    const borderColor = await page.evaluate(() => {
      const card = document.querySelector(
        '[class*="rounded-2xl"][class*="shadow"]'
      );
      return card ? getComputedStyle(card).borderColor : null;
    });

    expect(borderColor).toBeTruthy();

    const colorScheme = test.info().project.name;

    if (colorScheme === "dark-theme") {
      // dark:border-gray-700 ≈ rgb(55, 65, 81)
      const match = borderColor!.match(/rgb\((\d+), (\d+), (\d+)\)/);
      expect(match).toBeTruthy();
      const r = Number(match![1]);
      expect(r).toBeLessThan(100);
    } else {
      // border-gray-200 ≈ rgb(229, 231, 235)
      const match = borderColor!.match(/rgb\((\d+), (\d+), (\d+)\)/);
      expect(match).toBeTruthy();
      const r = Number(match![1]);
      expect(r).toBeGreaterThan(200);
    }
  });

  test("text color adapts to the active color scheme", async ({ page }) => {
    await page.goto("/");

    const textColor = await page.evaluate(() => {
      const heading = document.querySelector("h2");
      return heading ? getComputedStyle(heading).color : null;
    });

    expect(textColor).toBeTruthy();

    const colorScheme = test.info().project.name;

    if (colorScheme === "dark-theme") {
      // dark:text-gray-100 ≈ rgb(243, 244, 246)
      const match = textColor!.match(/rgb\((\d+), (\d+), (\d+)\)/);
      expect(match).toBeTruthy();
      const r = Number(match![1]);
      expect(r).toBeGreaterThan(200);
    } else {
      // text-gray-900 ≈ rgb(17, 24, 39)
      const match = textColor!.match(/rgb\((\d+), (\d+), (\d+)\)/);
      expect(match).toBeTruthy();
      const r = Number(match![1]);
      expect(r).toBeLessThan(50);
    }
  });

  test("subtitle text color adapts to the active color scheme", async ({
    page,
  }) => {
    await page.goto("/");

    const subtitleColor = await page.evaluate(() => {
      const subtitle = document.querySelector("p.text-sm");
      return subtitle ? getComputedStyle(subtitle).color : null;
    });

    expect(subtitleColor).toBeTruthy();

    const colorScheme = test.info().project.name;

    if (colorScheme === "dark-theme") {
      // dark:text-gray-400 ≈ rgb(156, 163, 175)
      const match = subtitleColor!.match(/rgb\((\d+), (\d+), (\d+)\)/);
      expect(match).toBeTruthy();
      const r = Number(match![1]);
      expect(r).toBeGreaterThan(100);
      expect(r).toBeLessThan(220);
    } else {
      // text-gray-500 ≈ rgb(107, 114, 128)
      const match = subtitleColor!.match(/rgb\((\d+), (\d+), (\d+)\)/);
      expect(match).toBeTruthy();
      const r = Number(match![1]);
      expect(r).toBeGreaterThan(80);
      expect(r).toBeLessThan(160);
    }
  });
});

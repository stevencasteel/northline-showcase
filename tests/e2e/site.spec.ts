import { expect, test as base } from "@playwright/test";

const test = base.extend<{ projectName: string }>({
  projectName: async ({ page }, use, testInfo) => {
    void page;
    await use(testInfo.project.name);
  },
});

test.describe("Northline desktop interactions", () => {
  test.skip(
    ({ projectName }) => !projectName.endsWith("-desktop"),
    "Desktop interaction coverage",
  );

  test("navigation preserves sticky header and anchor offset", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Services" }).click();
    await expect(page.locator("#services")).toBeInViewport();
    const top = await page
      .locator("#services")
      .evaluate((element) => element.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(0);
    await expect(page.locator(".sticky-header-shell")).toBeVisible();
  });

  test("appointment modal survives open, close, focus, and scroll restoration", async ({
    page,
  }) => {
    await page.goto("/");
    const trigger = page.locator(".hero .button-primary");
    await trigger.click();
    await expect(
      page.getByRole("dialog", { name: "Book an Appointment" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Close appointment form" }),
    ).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(
      page.getByRole("button", { name: "Book My Free Appointment" }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Close appointment form" }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Book an Appointment" }),
    ).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    const backdrop = page.locator(".appointment-backdrop");
    await expect(
      page.getByRole("dialog", { name: "Book an Appointment" }),
    ).toBeVisible();
    await backdrop.dispatchEvent("pointerdown", { bubbles: true });
    await expect(
      page.getByRole("dialog", { name: "Book an Appointment" }),
    ).toBeHidden();
    await expect(trigger).toBeFocused();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(100);
    const before = await page.evaluate(() => window.scrollY);
    const footerTrigger = page
      .locator(".premium-footer-contact-rack button")
      .first();
    await footerTrigger.click();
    await expect(
      page.getByRole("dialog", { name: "Book an Appointment" }),
    ).toBeVisible();
    const footerDialog = page.getByRole("dialog", {
      name: "Book an Appointment",
    });
    await footerDialog
      .getByRole("button", { name: "Close appointment form" })
      .click();
    await expect(footerDialog).toBeHidden();
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 2000 })
      .toBeGreaterThanOrEqual(before - 1);
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 2000 })
      .toBeLessThanOrEqual(before + 1);
  });

  test("gallery modal navigates by controls, keyboard, thumbnail, and backdrop", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    const firstCard = page
      .getByRole("button", { name: /Open image 1:/ })
      .first();
    await firstCard.click();
    const dialog = page.getByRole("dialog", {
      name: "Roofscape gallery viewer",
    });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Next image" }).click();
    await expect(
      dialog.getByRole("button", { name: "View image 2:", exact: false }),
    ).toHaveAttribute("aria-current", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(
      dialog.getByRole("button", { name: "View image 1:", exact: false }),
    ).toHaveAttribute("aria-current", "true");
    await dialog
      .getByRole("button", { name: "View image 3:", exact: false })
      .click();
    await expect(
      dialog.getByRole("button", { name: "View image 3:", exact: false }),
    ).toHaveAttribute("aria-current", "true");
    await page.mouse.click(4, 4);
    await expect(dialog).toBeHidden();
    await firstCard.click();
    await expect(
      page.getByRole("dialog", { name: "Roofscape gallery viewer" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("gallery repeated keyboard navigation keeps the active thumbnail valid and visible", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    await page
      .getByRole("button", { name: /Open image 1:/ })
      .first()
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Roofscape gallery viewer",
    });
    const thumbnails = dialog.locator('[aria-label^="View image "]');
    const count = await thumbnails.count();
    const navigations = 7;

    await page.keyboard.down("ArrowRight");
    for (let index = 1; index < navigations; index += 1)
      await page.keyboard.down("ArrowRight");
    await page.keyboard.up("ArrowRight");

    const expectedIndex = navigations % count;
    const active = dialog.locator('[aria-current="true"]');
    await expect(thumbnails.nth(expectedIndex)).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(active).toHaveCount(1);
    await expect(active).toBeVisible();
    const isActiveThumbnailVisible = () =>
      active.evaluate((item) => {
        const listElement = item.parentElement;
        if (!listElement) return false;
        const listRect = listElement.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        return (
          itemRect.left >= listRect.left - 1 &&
          itemRect.right <= listRect.right + 1 &&
          itemRect.top >= listRect.top - 1 &&
          itemRect.bottom <= listRect.bottom + 1 &&
          listElement.scrollLeft >= 0 &&
          listElement.scrollTop >= 0 &&
          listElement.scrollLeft <=
            listElement.scrollWidth - listElement.clientWidth + 1 &&
          listElement.scrollTop <=
            listElement.scrollHeight - listElement.clientHeight + 1
        );
      });
    await expect.poll(isActiveThumbnailVisible, { timeout: 5000 }).toBe(true);
    await expect(
      dialog.locator(".gallery-modal-arrow.is-key-active"),
    ).toHaveCount(0);
    await expect(dialog.locator(".suppress-hover")).toHaveCount(0);
  });

  test("desktop comparison slider follows a pointer drag and remains usable", async ({
    page,
  }) => {
    await page.goto("/");
    const slider = page.getByRole("slider", { name: "Reveal underlayment" });
    await slider.scrollIntoViewIfNeeded();
    const initial = Number(await slider.inputValue());
    const box = await slider.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    const startX = box.x + box.width * (initial / 100);
    const targetX = box.x + (box.width * Math.min(96, initial + 22)) / 100;
    const y = box.y + box.height / 2;
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(targetX, y, { steps: 8 });
    await page.mouse.up();
    expect(Number(await slider.inputValue())).toBeGreaterThan(initial);
    await slider.press("ArrowLeft");
    expect(Number(await slider.inputValue())).toBeLessThan(initial + 22);
  });

  test("Material Library toggles and protection slider remain usable", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    const material = page.locator(".gallery-material-label").first();
    await expect(material).toHaveAttribute("aria-pressed", "false");
    await material.click();
    await expect(material).toHaveAttribute("aria-pressed", "true");
    await material.click();
    await expect(material).toHaveAttribute("aria-pressed", "false");

    const slider = page.getByRole("slider", { name: "Reveal underlayment" });
    await slider.scrollIntoViewIfNeeded();
    const initial = await slider.inputValue();
    await slider.press("ArrowRight");
    expect(Number(await slider.inputValue())).toBeGreaterThan(Number(initial));
  });

  test("footer email copy reaches copied state and phone link remains intact", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: async () => undefined },
        configurable: true,
      });
    });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const email = page.locator('button[aria-label^="Copy "]');
    await email.click();
    await expect(email).toHaveAttribute("data-raster-state", "copied");
    await expect(
      page.locator('.premium-footer-contact-rack a[href^="tel:"]'),
    ).toHaveAttribute("href", /^tel:/);
  });

  test("far stages wait for proximity and survive a 700px breakpoint resize", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".hero.is-hero-assets-ready")).toBeVisible();
    await expect(page.locator(".app")).not.toHaveClass(/asset-stage-footer/);
    for (const [id, stage] of [
      ["work", "gallery"],
      ["protection", "protection"],
      ["founder", "founder"],
      ["contact", "footer"],
    ] as const) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect(page.locator(".app")).toHaveClass(
        new RegExp(`asset-stage-${stage}`),
      );
      await page.setViewportSize({ width: 600, height: 844 });
      await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator(".app")).toHaveClass(
        new RegExp(`asset-stage-${stage}`),
      );
      await page.setViewportSize({ width: 1280, height: 800 });
    }
  });

  test("reduced motion preserves service geometry and stops continuous motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#services").scrollIntoViewIfNeeded();
    const service = page.locator(".service-slice").first();
    await expect(service).toHaveCSS("opacity", "1");
    expect(
      await service.evaluate((element) => getComputedStyle(element).clipPath),
    ).not.toBe("none");
    const skyTrack = page.locator(".hero-sky-track");
    const before = await skyTrack.evaluate(
      (element) => getComputedStyle(element).transform,
    );
    await page.waitForTimeout(100);
    const after = await skyTrack.evaluate(
      (element) => getComputedStyle(element).transform,
    );
    expect(after).toBe(before);
    await page.getByRole("link", { name: "Gallery" }).click();
    await page
      .getByRole("button", { name: /Open image 1:/ })
      .first()
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Roofscape gallery viewer",
    });
    await dialog.getByRole("button", { name: "Close gallery" }).click();
    await expect(dialog).toBeHidden();
  });
});

test.describe("Northline desktop Chromium visual snapshots", () => {
  test.skip(
    ({ projectName }) =>
      process.env.CI === "true" || projectName !== "chromium-desktop",
    "Chromium-only visual coverage",
  );

  test("stable desktop views remain visually consistent", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".hero.is-hero-assets-ready")).toBeVisible();
    await expect(page).toHaveScreenshot("desktop-hero-nav.png", {
      animations: "disabled",
      fullPage: false,
      maxDiffPixels: 100,
    });
    await page.locator("#work").scrollIntoViewIfNeeded();
    await expect(page.locator("#work.is-visible")).toBeVisible();
    await expect(page.locator(".gallery-material-library")).toHaveScreenshot(
      "desktop-gallery-material.png",
      { animations: "disabled", maxDiffPixels: 100 },
    );
  });
});

test.describe("Northline mobile interactions", () => {
  test.skip(
    ({ projectName }) => !projectName.endsWith("-mobile"),
    "Mobile interaction coverage",
  );

  test("Material Library toggles and the page has no horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    const material = page.locator(".gallery-material-label").first();
    await expect(material).toHaveAttribute("aria-pressed", "false");
    await material.tap();
    await expect(material).toHaveAttribute("aria-pressed", "true");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("mobile gallery modal and protection slider controls work", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    await page
      .getByRole("button", { name: /Open image 1:/ })
      .first()
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Roofscape gallery viewer",
    });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Next image" }).click();
    await dialog.getByRole("button", { name: "Close gallery" }).click();
    await expect(dialog).toBeHidden({ timeout: 10000 });
    const slider = page.getByRole("slider", { name: "Reveal underlayment" });
    await slider.scrollIntoViewIfNeeded();
    await slider.press("ArrowLeft");
    await expect(slider).toHaveAttribute("aria-valuetext", /finished roof/);
  });

  test("mobile comparison slider follows a touch-style pointer drag", async ({
    page,
  }) => {
    await page.goto("/");
    const slider = page.getByRole("slider", { name: "Reveal underlayment" });
    await slider.scrollIntoViewIfNeeded();
    const initial = Number(await slider.inputValue());
    await slider.evaluate((element, startValue) => {
      const input = element as HTMLInputElement;
      const rect = input.getBoundingClientRect();
      const startX = rect.left + rect.width * (startValue / 100);
      const targetX =
        rect.left + (rect.width * Math.min(96, startValue + 22)) / 100;
      const init = {
        bubbles: true,
        pointerId: 19,
        pointerType: "touch",
        clientY: rect.top + rect.height / 2,
      };
      input.dispatchEvent(
        new PointerEvent("pointerdown", { ...init, clientX: startX }),
      );
      input.dispatchEvent(
        new PointerEvent("pointermove", { ...init, clientX: startX + 6 }),
      );
      input.dispatchEvent(
        new PointerEvent("pointermove", { ...init, clientX: targetX }),
      );
      input.dispatchEvent(
        new PointerEvent("pointerup", { ...init, clientX: targetX }),
      );
      void startValue;
    }, initial);
    await expect
      .poll(async () => Number(await slider.inputValue()))
      .toBeGreaterThan(initial);
    await slider.press("ArrowLeft");
    await expect(slider).toHaveAttribute("aria-valuetext", /finished roof/);
  });

  test("customer-service hologram controls stay within mobile viewport bounds", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#reviews").scrollIntoViewIfNeeded();
    const hologram = page.locator(".customer-service-hologram.is-active");
    await expect(hologram).toBeVisible();
    const minimize = hologram.getByRole("button", {
      name: "Minimize customer service assistant",
    });
    await expect(minimize).toBeVisible();
    const cssViewportWidth = await page.evaluate(() => window.innerWidth);
    await expect
      .poll(() =>
        minimize.evaluate((element) => element.getBoundingClientRect().right),
      )
      .toBeLessThanOrEqual(cssViewportWidth);
    const geometry = await hologram.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const minimize = element.querySelector(
        ".customer-service-hologram-minimize",
      );
      const minimizeBounds = minimize?.getBoundingClientRect();
      return {
        viewportWidth: window.innerWidth,
        width: bounds.width,
        height: bounds.height,
        right: bounds.right,
        minimizeWidth: minimizeBounds?.width ?? 0,
        minimizeHeight: minimizeBounds?.height ?? 0,
        minimizeRight: minimizeBounds?.right ?? Number.POSITIVE_INFINITY,
      };
    });
    expect(geometry.width).toBeGreaterThan(0);
    expect(geometry.height).toBeGreaterThan(0);
    expect(geometry.minimizeWidth).toBeGreaterThan(0);
    expect(geometry.minimizeHeight).toBeGreaterThan(0);
    expect(geometry.minimizeRight).toBeLessThanOrEqual(geometry.viewportWidth);
  });
});

test.describe("Northline mobile Chromium visual snapshots", () => {
  test.skip(
    ({ projectName }) =>
      process.env.CI === "true" || projectName !== "chromium-mobile",
    "Chromium-only visual coverage",
  );

  test("stable mobile gallery view remains visually consistent", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    await expect(page.locator("#work.is-visible")).toBeVisible();
    await page.waitForFunction(() => {
      const image = document.querySelector<HTMLImageElement>(
        ".gallery-material-library img",
      );
      return Boolean(image?.complete && image.naturalWidth > 0);
    });
    await expect(page.locator(".gallery-material-library")).toHaveScreenshot(
      "mobile-gallery-material.png",
      { animations: "disabled", maxDiffPixels: 100 },
    );
  });
});

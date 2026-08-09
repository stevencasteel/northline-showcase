import { webkit } from "@playwright/test";

const browser = await webkit.launch();
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("about:blank");
  globalThis.console.log(
    "WebKit smoke test passed: browserContext.newPage() and about:blank succeeded.",
  );
  await context.close();
} finally {
  await browser.close();
}

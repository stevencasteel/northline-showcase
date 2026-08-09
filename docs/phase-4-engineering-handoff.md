# Northline Roofing — Engineering Optimization Handoff

## Current status

The Phase 4 corrections and the CI-focused browser separation are committed and pushed on `main`. Local macOS Chromium remains convenient while GitHub Actions Linux is authoritative for WebKit.

## Completed work

### Asset staging and responsive images

- Intersection staging now requires an intersecting entry, a known stage, and a stage that is neither pending nor already enabled.
- The observer root margin is derived from `window.innerHeight * 1.5` and is rebuilt when material viewport height changes.
- Enabled stages survive the 700px constrained-layout breakpoint transition.
- Disabled responsive assets use inert, layout-equivalent `img` placeholders with real width/height attributes and a tiny data URI.
- Placeholder markup preserves tag-based image selectors while preventing real responsive asset downloads.

### Scroll locking and modal behavior

- Body scroll-lock cleanup uses one shared release function.
- Nested locks release safely regardless of cleanup order.
- Modal scroll restoration uses an explicit `scrollBehavior: auto` path, preventing the appointment-modal close jump to the page top/contact section.

### Reduced motion

- Reduced motion removes delays and disables continuous loops.
- Service diagonal clipping, filters, crops, and other design geometry remain intact.
- Hero/reveal states resolve immediately without globally removing `clip-path` or `filter` styling.

### Asset validation

The responsive asset validator now checks:

- file existence and readability;
- expected output format;
- exact aspect-preserving dimensions;
- source-dimension tiering and no upscaling;
- alpha-channel preservation where required.

### Source context and browser coverage

- Source-context generation includes `tests`, `.github`, `playwright.config.ts`, and `.gitignore`.
- Test results, Playwright reports, browser directories, and binary snapshots are excluded from source context.
- Playwright projects cover Chromium and WebKit on desktop and mobile.
- Every project explicitly selects its engine with `browserName`: Chromium projects use Chromium and WebKit projects use WebKit.
- Visual screenshots remain Chromium-only; WebKit tests are behavioral.
- CI installs both Chromium and WebKit.
- `npm run test:e2e:chromium` runs only the two Chromium projects.
- `npm run test:e2e:webkit` runs only the two WebKit projects.
- `npm run test:e2e:webkit:smoke` verifies that WebKit can create a page before Northline tests begin.
- GitHub Actions reports Chromium and WebKit as separate steps.
- Chromium visual snapshots are skipped in CI because the checked-in snapshot corpus is macOS/Darwin-specific; local Chromium visual testing remains enabled.
- Repeated/held-style gallery keyboard navigation verifies the active image, exactly one current thumbnail, thumbnail visibility, valid scroll bounds, and control reset.
- Desktop mouse dragging and mobile touch-style pointer events exercise the comparison slider’s pointer path, followed by keyboard usability checks.
- Appointment coverage includes backdrop dismissal, Tab/Shift+Tab focus trapping, and opener focus restoration.
- Mobile customer-service coverage checks active hologram geometry and keeps the minimize control within the viewport.

## Verification results

Local checks passed:

- `npm run validate:assets` — 158 responsive asset families validated
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `git diff --check`
- `npm run test:e2e:chromium` — the final focused appointment regression passed; the full suite was also exercised during the correction pass
- `npm run test:e2e:webkit:smoke` remains blocked locally by macOS 14.4.1’s frozen WebKit runtime, as expected

The first GitHub Actions run for commit `d276ca6` successfully installed WebKit and reached Northline assertions on Ubuntu. It reported 22 passed, 32 skipped, 1 flaky, and 5 failed across the combined matrix. The follow-up changes separated the browser suites, skipped Darwin-only snapshots in CI, stabilized the affected assertions, and corrected modal focus/scroll restoration. The requested browser geometries remain 1280×800 and 390×844.

Final GitHub Actions run for commit `22df2db` passed on Ubuntu:

- Chromium projects (`chromium-desktop` = Chromium, `chromium-mobile` = Chromium): 13 passed, 17 skipped, 0 failed
- WebKit projects (`webkit-desktop` = WebKit, `webkit-mobile` = WebKit): 13 passed, 17 skipped, 0 failed
- WebKit smoke: passed; `browserContext.newPage()` and `about:blank` succeeded
- Build and artifact upload: passed

The appointment backdrop, focus trap, opener focus restoration, repeated gallery-keyboard regression, desktop/mobile pointer-drag slider coverage, and mobile customer-service bounds check all passed in their applicable Linux projects. The source context was regenerated and contains the current project files.

The source context was regenerated at `docs/northline-roofing_source_code.txt` and contains 48 readable project files.

## Files of interest

- `src/lib/assetStages.tsx` — staged loading and placeholders
- `src/hooks/useBodyScrollLock.ts` — nested scroll-lock lifecycle
- `src/styles.css` and `src/main.tsx` — reduced-motion behavior
- `scripts/validate-responsive-assets.js` — asset integrity checks
- `scripts/create-source-context.js` — handoff bundle generation
- `playwright.config.ts` — browser matrix
- `scripts/playwright-webkit-smoke.mjs` — isolated WebKit page-creation check
- `tests/e2e/site.spec.ts` — interaction and regression coverage
- `.github/workflows/build.yml` — CI checks and browser installation

## Review considerations for the next AI session

1. Review the staged-image placeholder strategy in the context of the site’s existing image selectors and browser loading behavior.
2. Confirm the shared scroll-lock baseline is appropriate if additional modal or drawer types are introduced.
3. Review the reduced-motion rules visually on service sections, hero transitions, and gallery modals.
4. Keep the separate GitHub Actions Chromium, WebKit smoke, and WebKit regression steps intact.
5. Treat local macOS WebKit failure as an environment limitation unless the runtime is upgraded; do not patch Playwright internals or the OS.
6. Consider adding an explicit nested-lock regression test if another independently mounted modal/drawer component is introduced.

## Git state

The CI-focused follow-up is committed and pushed on `main` in `22df2db` (following `806c158`, `cd2928b`, and `3a4641c`). The optional production-preview E2E change was not made; the existing Vite dev-server workflow remains in place to avoid unnecessary local/CI workflow complexity. No destructive git operations were performed.

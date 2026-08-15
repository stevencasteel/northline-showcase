# Northline Roofing — Phase 4 Test Results

## Final automated result

The final GitHub Actions Linux run for commit `3a1a3b3` passed:

| Project group      | Browser engine | Geometry               | Result                |
| ------------------ | -------------- | ---------------------- | --------------------- |
| `chromium-desktop` | Chromium       | 1280×800               | 13 passed, 17 skipped |
| `chromium-mobile`  | Chromium       | 390×844, touch enabled | Included above        |
| `webkit-desktop`   | WebKit         | 1280×800               | Included above        |
| `webkit-mobile`    | WebKit         | 390×844, touch enabled | Included above        |

The Playwright commands ran 30 project/test combinations per browser group. Skips were intentional: each project skipped the opposite viewport’s tests, and Chromium visual snapshots were not applicable to WebKit or Linux CI.

Additional CI results:

- WebKit smoke test: passed; WebKit launched, created a browser context and page, and loaded `about:blank`.
- Production build: passed.
- Build artifact upload: passed.
- Static checks: asset validation, TypeScript, ESLint, formatting, and `git diff --check` passed.

## Behavioral coverage

- Appointment modal: Escape dismissal, backdrop dismissal, Tab and Shift+Tab focus trapping, opener focus restoration, and scroll-position preservation.
- Gallery: normal navigation plus repeated/held-style keyboard navigation, active-image state, single `aria-current` thumbnail, thumbnail visibility, scroll bounds, and control-state reset.
- Comparison slider: keyboard controls, desktop mouse drag, and mobile touch-style pointer drag followed by usability checks.
- Customer-service hologram: mobile minimize-control bounds and association with the active hologram.
- Visual snapshots: three Chromium-only Darwin snapshots were used during validation; no WebKit snapshots were added.

## Local environment note

Local macOS Chromium coverage was usable. Local Playwright WebKit was blocked before the application loaded by the frozen macOS 14.4.1 WebKit runtime (`Page.overrideSetting: Unknown setting: PushAPIEnabled`). Linux GitHub Actions was therefore the authoritative WebKit environment.

## Retention decision

The validation work is complete and the automated test harness, screenshots, and Playwright-specific CI steps have been removed to keep the production repository lean. This report preserves the final evidence and decisions without retaining the test suite or binary artifacts.

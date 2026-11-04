# Gym Bro refinement and preservation audit

## Architecture and scope

Gym Bro remains a static, local-first application, with no backend, runtime package dependencies, build step, or framework. `index.html` contains the existing application views and state/controllers. `layout.css` now holds the original responsive component rules, extracted in their existing order and with the legacy purple palette normalized. `app.css` defines the shared charcoal/mint visual system and final component states. `data.js` provides nonmutating validation shared by imports and tests. Icons, native hash navigation, and relative hosting paths remain intact.

This is a targeted refinement, not a rewrite. Legacy component layout selectors remain where removing them could affect less common layouts; styles are now separate from application logic. A future component-by-component cleanup can remove more redundant selectors under browser coverage.

## Feature preservation inventory

| Area | Existing capabilities retained | Validation |
| --- | --- | --- |
| Workout | Plan selection; ordered exercise checklist; weight, reps, optional RIR; warm-up; date; live completion; draft restoration; complete workout saving; use-last and weight-increment shortcuts; technique guidance | Browser covers validation, all-set saving, warm-up, RIR, progression, persistence, edit/cancel and restoration. Shortcut implementations reviewed. |
| Plans | Create, rename/edit, exercise selection, add/remove/reorder, sets, rep ranges, starting weights, increments, per-plan drafts, switching/deleting plans | Browser covers create, reorder, remove, rename and delete while retaining history, plus switching plans during a history edit. Numeric limits tested directly. |
| History | Exercise snapshots, previous performance, editing historical sessions | Browser covers editing, cancellation, unknown imported exercise metadata, and 500 historical sessions. |
| Analytics | Gains Dashboard, Epley estimated 1RM for lower-rep exercises, heaviest-set metric for higher reps, progression and volume charts, PR counts, monthly review | Calculation implementations reviewed. Browser asserts suggested progression, total volume and distinct weekly days. No claim of exhaustive numeric fixtures for every chart. |
| Consistency | Weekly goal, current/best streak, calendar, achievement tracks/tiers, notifications | Existing logic retained; browser covers distinct weekly-day counts and opening achievement tiers. Every threshold/streak boundary is not separately simulated. |
| Body metrics | Weigh-ins, edits, targets, rolling seven-day means, measurements and trends, edit/delete measurements | Browser covers weight, goal and measurement saves, measurement editing/deletion, and canonical kg/cm conversion. Rolling mean implementation reviewed. |
| Training quality | Primary-muscle weekly set volume, load/effort comparisons, weekly review | Existing implementations reviewed and exercised through screen renders, saved workouts and measurements. |
| Photos | Local IndexedDB journal, resize, front/side/back classification, comparison, deletion, complete backup | Browser covers image upload/resizing, gallery, comparison and backup round trip. Deletion implementation reviewed; device photo-picker behavior remains manual. |
| Settings | Units, local storage protection, complete export/import | Browser covers unit toggles, unsaved-value conversions, exports/imports, malformed/cancelled imports, simulated storage failures. Persistent-storage permission is browser-dependent. |
| App shell | Workout/Tracking hash navigation, settings, safe-area/keyboard rules, standalone manifest, service worker, custom icons | Browser covers six widths, short screens, base-path assets and automatic offline caching. Native install prompts and physical keyboard behavior remain manual. |

A standalone strength-standards table and deletion of saved workout history were **not** implemented in the original repository. They have not been invented or removed. Existing strength goals/estimates and plan deletion are retained.

## Confirmed defects addressed

- Editing a saved workout previously saved changes into the active workout's draft key, then removed that draft when saving or cancelling. Historical edits now leave the original draft intact; saving/cancelling restores it, and refresh returns to that draft.
- Failed plan saves/deletes/switches could leave the live state changed despite storage failure. Mutations now roll back or wait for a successful write.
- A stale tab could overwrite workout history saved by another tab. Core history writes now check the last observed persisted revision and refuse stale overwrites. This is an optimistic guard, not a cross-tab database transaction.
- Import rollback omitted achievement storage and wrote it after committing photo changes. All affected localStorage keys are now included; the single IndexedDB photo transaction is the final write.
- Malformed tracking extensions could replace good data and fail on the next page load. All known backup sections are validated before confirmation or writes, with clear errors.
- Unknown imported exercise/session/set metadata was lost during normalization or historical edits. It is preserved alongside known fields. Unknown backup core metadata is retained; large photo payloads remain outside localStorage.
- Invalid plan ranges were silently clamped. Editing now validates the entered canonical ranges instead.
- Impossible calendar dates could pass workout validation. Calendar-aware validation rejects rollover dates.
- Unit changes did not consistently convert unsaved form entries and used displayed inches to validate canonical centimeter limits. Unsaved values now convert, and measurement validation uses cm.
- “Use last” could replace incomplete entered values without asking. Any entered values now trigger replacement confirmation.
- Draft storage failure was silent. A visible error now tells the user to keep the page open and export a backup.
- Error toasts inherited the success background. Explicit error/success states now preserve their distinction.
- Old styles kept some set inputs at 40px, mixed purple controls into the new theme, and biased the selected navigation appearance. Touch sizing and selected states now follow the current component contract.
- Repeated checklist labels and a missing browser favicon were corrected. Import inputs remain keyboard accessible, invalid fields are identified and focused, and full-screen settings now traps keyboard focus and restores it on close. Programmatic backup downloads no longer dismiss settings.

## Data compatibility

All original storage keys and the version-3 complete-backup format remain. Workouts and weights store kg; measurements store cm; photos remain in `gym_bro_private_photos_v23` IndexedDB. No migration or reset runs. Legacy core-only backups remain supported and do not erase tracking sections omitted from that backup. Unknown core properties survive import; unknown historical exercise/set/session properties survive edits.

Invalid known sections are rejected with an error instead of silently dropping their records. Backup restore remains destructive **only after explicit confirmation**. It is prudent to export a complete backup before any release. Rollback handles normal write failures; a browser/process crash between localStorage and IndexedDB commits is not an atomic cross-database transaction. Concurrent-tab protection cannot guarantee resolution of writes occurring at exactly the same instant. Prefer one editing tab per device.

## Automated checks

Run `node --test tests/*.test.cjs`. The browser suite uses Chromium through Playwright, a temporary local server, isolated browser contexts, and the actual `/GymBro/` deployment base path. It does not use real user storage. `tests/data.test.cjs` also validates all inline script syntax and malformed/legacy backup handling.

Browser checks inspect page errors and console errors, set logging and restore, navigation and control sizes at 320/375/390/430/768/1280px, narrow and landscape settings, settings keyboard focus and Escape, plan CRUD, canonical units, goals, measurements, image storage/comparison/export/import, rejected and cancelled imports, simulated storage failures, large history, and offline reload. Temporary screenshots are written outside the repository.

There is no production compilation or repository lint configuration. Syntax checks and `git diff --check` supplement the functional suite. Final executed result: **20 tests passed, 0 failed, 0 skipped**. A separate rendered-control check found no horizontally clipped buttons, inputs, selects, links or headings at all six target widths. `node --check data.js`, `node --check sw.js`, and `git diff --check` also passed.

## Manual release checks and limits

- Safari/iOS and Android installed-PWA launch, real soft keyboard/zoom, screen-reader announcements, and hardware safe areas.
- OS photo picker, camera images, browser-specific persistent-storage grants, printing, and large real-world photo libraries.
- Real GitHub Pages deployment and upgrade of an already installed older service worker. Base-path serving and offline behavior are tested locally, not a live deployment.
- Exhaustive chart mathematics, DST/streak boundaries, every achievement tier, quota/termination at every possible write boundary, and a full WCAG audit are not claimed.

## Deployment

Deploy `index.html`, `layout.css`, `app.css`, `data.js`, `sw.js`, `manifest.webmanifest`, and the entire `icons/` directory together at the existing Pages root. All paths remain relative. The worker cache version is bumped to v34 and preloads both stylesheets and the validation helper. It registers automatically on HTTPS and trustworthy localhost. After Pages finishes deploying, reopen/reload the app to activate the new assets. No environment publication, backend, schema migration, or dependency build is required.

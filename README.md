# Gym Bro

A mobile-first, local-first workout and progress tracker. Static hosting only; no backend, account, build step or application dependencies.

## Develop

Use the existing checkout. From the repository directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

The application works offline after its service worker installs on HTTPS or trustworthy localhost. Live server processes do not survive environment snapshots.

- `index.html`: existing screens and application controllers
- `layout.css`: consolidated responsive component layouts
- `app.css`: shared dark design tokens and refined component states
- `data.js`: calendar, form and backup validation
- `sw.js`: versioned offline asset cache
- `tests/`: data integrity and browser regression tests
- [Audit and QA notes](docs/QA.md): feature inventory, fixes, data compatibility, coverage and manual checks

## Test

Node 24, Python 3 (for manual serving), Chromium and Playwright are available in the prepared cloud environment. Run:

```sh
node --test tests/*.test.cjs
node --check data.js
node --check sw.js
git diff --check
```

For another development machine, install Playwright 1.62.1 as a development tool and either install Chromium or set `CHROMIUM_PATH` to its executable. For example, `npm install --no-save --package-lock=false playwright@1.62.1`. Application deployment does not need Node, npm, Playwright or the tests. The browser tests start and stop their own local server and use fresh storage.

## Deploy

Export a complete backup from Settings before upgrading. Publish `index.html`, `layout.css`, `app.css`, `data.js`, `manifest.webmanifest`, `sw.js`, and `icons/` together to the existing GitHub Pages repository root. The app also supports the repository base path `/GymBro/`. Refresh or reopen after deployment so the versioned service worker can update.

Storage keys and existing kg/cm data formats remain compatible. No reset or migration is required. Browser checks do not replace physical-phone and installed-PWA testing.

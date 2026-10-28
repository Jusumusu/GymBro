# Gym Bro Transformation — Installable web app

The **index.html** file contains the full workout plan, 20-set checklist, graph, streaks, progression suggestions, history and backup import/export. Existing backups remain compatible. All workout data is stored **on the device in browser/local web-app storage**, never uploaded to the host.

## Publish free on GitHub Pages

1. Create a GitHub account (if needed), then create a **public** repository such as `gym-bro-transformation`.
2. Upload **all files and folders** in this ZIP to the repository root: `index.html`, `manifest.webmanifest`, `sw.js`, and the `icons` folder. Keep the filenames unchanged.
3. In the GitHub repository open **Settings → Pages**. Under Build and deployment choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
4. When deployment finishes, visit `https://YOUR-USERNAME.github.io/gym-bro-transformation/` in Safari on your iPhone. Use your actual GitHub name and repository name.
5. In Safari, tap Share → Add to Home Screen. Enable **Open as Web App** if offered, then Add. Launch from the Home Screen. You can open once online so the app caches for offline use.

## Data safety

- Before moving from an older HTML tracker, open the older version and use **Export backup (.json)**. In the published version choose **Import backup**.
- The app cannot automatically migrate storage from an existing downloaded HTML file to a new website origin.
- The standalone Home Screen app may have separate storage from Safari depending on iOS. Import your backup into the version you use regularly.
- Keep JSON backups regularly. Clearing website data, reinstalling, or changing domains may remove local records.
- Streaks count completed workouts, 3 per Monday–Sunday week; they are **not** daily streaks.
- Offline caching needs a secure HTTPS host (or localhost for testing). Opening `index.html` directly from Files does **not** install the PWA.
- For future app updates, increment the cache version in sw.js so installed devices can refresh cached files.

## Privacy

No login or backend. Workout records stay locally on your device, except backups you explicitly export or share. A public GitHub Pages site publishes the app code, not your private workout data.

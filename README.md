# 🪩 Disco Lights

A full-screen, kid-friendly disco light for dance parties. Spinning colour beams,
a sparkling centre disco ball, and twinkling lights — reacts to music through the
microphone, or just runs a lovely animation on its own.

## Features

- **Pluggable themes** — Classic Disco, Pop Star Neon, Ice Kingdom, Wild Savanna,
  Unicorn Dreams, Under the Sea, Space Galaxy. Add more in [`src/themes.js`](src/themes.js).
- **Mic-reactive** — turn on the microphone and the lights pulse and spin faster
  with music or clapping. No mic access needed — it auto-animates by default.
- **Minimal, kid-safe controls** — tap anywhere to change the theme; a small
  settings gear (bottom-right) is for grown-ups to pick a theme directly, toggle
  the mic, or go fullscreen.
- **Installable** — "Add to Home Screen" on a phone/tablet for a fullscreen app-like experience.

## Local development

```bash
npm install
npm run dev
```

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))
that builds and deploys automatically on every push to `main`.

One-time setup after pushing this repo to GitHub:

1. Go to the repo's **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` — the workflow builds the site and publishes it to
   `https://<your-username>.github.io/<repo-name>/`.

No manual base-path configuration is needed — the workflow sets it automatically
from the repository name.

## Adding a new theme

Add an entry to the `THEMES` array in [`src/themes.js`](src/themes.js):

```js
{
  id: 'my-theme',
  name: 'My Theme',
  emoji: '✨',
  background: ['#innerHex', '#outerHex'],
  beamColors: ['#hex', '#hex', '#hex'],
  sparkleColors: ['#hex', '#hex'],
  ballTint: '#hex',
}
```

It'll automatically appear in the theme picker and the tap-to-cycle rotation.

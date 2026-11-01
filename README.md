# Gymbro

A Persian, RTL coaching studio built with Vite, React, TypeScript and Zustand.

## Development

Use Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

## Features

- Local coach profile and workout library with search and template filters.
- Create, edit, duplicate and delete plans; configure sessions, exercises, supersets, weekly schedule, notes and cardio.
- Three selectable layouts with custom accent colors and live preview.
- Download a complete high-resolution PNG, including all sessions.
- Warn before leaving an unsaved editor; native browser warning on reload or closing the tab after interaction.
- Self-hosted Vazirmatn font with no runtime CDN dependency.

The profile is a local workspace identity, not authenticated sign-in. Plans are stored in this browser's localStorage. They are not shared across devices, and clearing browser data removes them. The included plan is an editable example. Exporting an image does not save a plan.

## GitHub Pages

The Vite base path is `/gymbro/`. The workflow in `.github/workflows/deploy.yml` builds and deploys on pushes to `main`, or through manual workflow dispatch.

1. Push this repository to `https://github.com/hayyaun/gymbro.git`.
2. In **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. Run the workflow or push to `main`.

Expected URL after successful deployment: https://hayyaun.github.io/gymbro/

```sh
npm run build
npm run preview
```

Implementation references: [Vite deployment](https://vite.dev/guide/static-deploy), [Zustand persist](https://zustand.docs.pmnd.rs/reference/middlewares/persist), [html-to-image](https://github.com/bubkoo/html-to-image).

## Installable app (PWA)

- The app ID, launch URL and service worker scope are all `/gymbro/` for GitHub Pages.
- Open the deployed site once while online. The app shell, fonts, images and icons are precached for offline use; workout data remains in localStorage.
- Supported browsers show an in-app install button when installation is available. You can also use the browser's **Install app** menu; on iPhone/iPad use **Share → Add to Home Screen**.
- Updates prompt before reloading. During unsaved edits, the existing save/discard/cancel dialog runs first.
- Service workers are disabled in Vite development. To test the production PWA, run `npm run build` then `npm run preview` and open `/gymbro/`.
- `public/app-icon.svg` and the PNG install icons share the existing Lucide dumbbell, rotated to horizontal. Regenerate them with `npm run icons`.

PWA implementation: [Vite PWA React integration](https://vite-pwa-org.netlify.app/frameworks/react).

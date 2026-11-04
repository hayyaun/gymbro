# Gymbro

A Persian, RTL coaching studio built with Vite, React, TypeScript and Zustand.

## Development

Use Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Run the data-preservation and backup checks with `node --experimental-strip-types --test tests/*.test.mjs` (Node.js 22.18+).

Session dragging uses the current [dnd kit React API](https://dndkit.com/react/guides/sensors/), with a 250 ms touch hold on the handle and keyboard support.

## Features

- Local coach workspace and workout library with search and student filters.
- Student profiles with stable IDs, goals, available equipment, private coach notes and linked program history. Existing name-only programs gain profiles without changing their workouts. Renaming a student updates their linked programs.
- Manual tuition payment history per student: amounts in toman, dates displayed in the Persian calendar, payment method, period and notes. Profile changes, including payments, are committed with **Save profile**. These records never appear in workout PNGs.
- Searchable exercise names from a built-in list and your saved programs/blocks, with custom names supported. Enter advances from name to sets, reps, rest and a newly inserted movement; Tab reaches superset and note fields.
- Reusable workout blocks can be built in the library or saved from a session. Insert into an existing training day by appending, or explicitly choose replacement. Inserted movements have independent IDs; conflicting superset labels are separated.
- Versioned JSON backup/restore includes programs, profiles, tuition records, blocks, coach name and workspace preferences. Files are validated and previewed before confirmation. Merge keeps local records on ID conflicts and adds new payment IDs to existing profiles; full replacement restores the exact snapshot and removes records absent from it. No backend or automatic sync is involved.
- Select training weekdays in Saturday-first order to create matching sessions automatically. Deselecting a weekday requires confirmation before deleting that specific day's session and exercises; other days retain their content, including when a new earlier weekday is added. Reorder whole sessions with six-dot handles using touch hold, mouse or keyboard.
- Collapse sessions while editing; the first session starts open, others start collapsed, and newly added sessions open automatically. This editor-only state does not change saved workout data or PNG output.
- Three selectable layouts, Studio, Forge and Protocol, with custom accent colors and live preview. Saved plans using the retired Minimal or Bold layouts open as Studio with their workout content preserved.
- Forge anime poster template with dark/light backgrounds and purple, orange, lime or yellow palettes. Existing sample sessions remain unchanged; the new appearance settings are saved per program.
- Protocol industrial template with paper/dark backgrounds, red/orange/purple/cyan/green palettes and matching graphic patterns. Its labels and session counts use actual program data; barcode-like graphics are decorative. No additional image assets or network requests are required.
- Download a complete high-resolution PNG, including all sessions.
- Warn before leaving an unsaved editor; native browser warning on reload or closing the tab after interaction.
- Self-hosted Vazirmatn font with no runtime CDN dependency.

The coach profile is a local workspace identity, not authenticated sign-in. Data is stored in this browser's localStorage. Use JSON backup/restore to transfer it between devices; clearing browser data removes the local copy. Backup files contain private notes and payment records as plain JSON. The included plan is an editable example. Exporting an image does not save a plan.

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
- `public/app-icon.svg` and the PNG install icons preserve the original angled Lucide dumbbell inside an upright square. Regenerate them with `npm run icons`.

PWA implementation: [Vite PWA React integration](https://vite-pwa-org.netlify.app/frameworks/react).

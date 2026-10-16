# Aditya Singh — Pencil Artist Portfolio

An editorial, responsive artist portfolio built with React, Vite, Tailwind CSS v4, Motion for React, and Lucide React. Artwork is maintained in a single JavaScript array; no database or backend is needed.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build for production

```bash
npm run build
npm run preview
```

The production site is generated in `dist/`.

## Add a drawing

1. Copy the image into `public/images/`, for example `public/images/portrait-study.jpg`.
2. Add an artwork object to `src/data/artworks.js`:

```js
{
  id: "art-04", // unique and stable
  title: "Portrait Study",
  image: "/images/portrait-study.jpg",
  category: "Portraits",
  year: 2026,
  medium: "Graphite on paper",
  description: "A short sentence about the drawing. A second sentence about its details or inspiration."
}
```

3. Save the file. The gallery, category filters, category counts, collection statistics, and lightbox update automatically.

Use a unique `id`, and keep descriptions to two concise sentences. Categories can be any useful label; the filter row is generated from the entries.

The gallery currently contains sample entries and image paths. Replace them with accurate artwork details as drawings are supplied. Missing images are shown as intentional placeholders.

## Images

Put images in `public/images/`. The supplied artist portrait is `public/images/aditya.jpg` and is already used in the hero and About sections. Optional process photographs are read from `process-1.jpg`, `process-2.jpg`, and `process-3.jpg`. Gallery images can use any filename as long as its path in `src/data/artworks.js` matches.

## Edit biography and contact details

Edit the introduction and artist details in `src/App.jsx`. Replace `EDIT_EMAIL_ADDRESS@example.com` in the commission mailto form and footer with the artist's real email address before publishing. Replace `REPLACE_WITH_REAL_HANDLE` in the footer Instagram link with the artist's actual handle before publishing.

The commission form validates the enquiry and opens a prefilled email draft. It does not send the request itself: visitors must review and send the draft in their email app. No service, endpoint, or email delivery is configured.

## Deploy

Run `npm run build` and publish the contents of `dist/` on any static hosting provider that supports Vite-built sites, such as Netlify, Vercel, or GitHub Pages. For a non-root deployment path, configure Vite's `base` option in `vite.config.js` to match the hosted path.

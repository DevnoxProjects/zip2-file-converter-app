# Zip2 — PDF Tools App

Zip2 is a browser-based web app that provides a collection of PDF and file utilities (merge, split, compress, rotate, remove pages, protect/unlock, convert between formats, and more). Most processing happens locally in your browser.

---

## Features

- **Merge / Split** PDFs
- **Compress** PDFs to reduce file size
- **Rotate** pages
- **Remove / Organize** pages
- **Protect / Unlock** PDF security
- **Convert** between common formats (e.g., JPG → PDF, PDF → JPG, plus other tool routes)

---

## Tech stack

- React + React Router
- Vite
- Tailwind CSS
- PDF libraries: `pdf-lib`, `pdfjs-dist`

---

## Local development

### Prerequisites

- Node.js (LTS recommended)

### 1) Install dependencies

```bash
npm install
```

### 2) Environment variables

This app does not require environment variables to run most PDF tools.

### 3) Run the app

```bash
npm run dev
```

The dev server runs on **port 3000**.

---

## App routing

- **Home**: `/`
- **Tool pages**: `/tool/:id` (example: `/tool/compress-pdf`)

The available tools are defined in `src/constants.jsx` (the `TOOLS` array). `src/pages/ToolPage.jsx` selects the appropriate tool component based on the `:id`.

---

## Project structure (high level)

- `index.html` — Vite entry HTML
- `vite.config.js` — Vite configuration
- `src/main.jsx` — React bootstrap
- `src/App.jsx` — top-level layout + routes
- `src/pages/` — page components (Home, ToolPage, Login, Signup)
- `src/components/` — UI components
  - `src/components/layout/` (Navbar, Footer)
  - `src/components/home/` (ToolCard)
  - `src/components/tools/` (tool implementations)
- `src/lib/` — helper utilities (notably `pdf-utils.js`)

---

## Scripts

Common commands from `package.json`:

- `npm run dev` — start Vite dev server
- `npm run build` — build for production
- `npm run preview` — preview production build
- `npm run lint` — lint the codebase


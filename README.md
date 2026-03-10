# MeasurePro — Window Furnishing Consultant App

A professional, field-ready Progressive Web App for window furnishing consultants to measure, document, and export window measurements on-site.

## Overview

MeasurePro helps consultants:
- Create and manage measurement projects for clients
- Capture window photos that auto-convert to clean 2D technical drawings
- Record detailed measurements (dimensions, architrave, fit type, clearances, etc.)
- Document furnishing specs (roller blinds, shutters, curtains, venetian, external, etc.)
- Export professional PDF measure sheets and CSV data for quoting software

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** — styling
- **React Router v6** — navigation
- **Zustand** — state management with localStorage persistence
- **React Hook Form** + **Zod** — form validation
- **@react-pdf/renderer** — PDF generation
- **Lucide React** — icons
- **date-fns** — date formatting
- **vite-plugin-pwa** — PWA/offline support

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# Open http://localhost:5173
```

## Build

```bash
npm run build
```

Output is in `dist/`.

## Deploy to Netlify

### Via CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### Via Git Integration

1. Push to GitHub
2. Connect repo in Netlify dashboard
3. Build settings: command `npm run build`, publish `dist`

## PWA Installation

### iPad (Safari)
1. Open the app URL in Safari
2. Tap Share button → "Add to Home Screen"
3. Tap "Add" — app appears on home screen

### Android Tablet (Chrome)
1. Open the app URL in Chrome
2. Tap menu → "Install App" or "Add to Home Screen"

### Desktop Chrome
1. Look for install icon in address bar
2. Click "Install MeasurePro"

## Data Storage

All data is stored locally on each device using localStorage. Use the **Export All Data** / **Import Data** buttons on the Dashboard to backup and transfer projects between devices.

## Adding Team Members

In Netlify dashboard → Site Settings → Team — invite additional members. Each device maintains its own local data store.

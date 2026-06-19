# Daily Life Tracker

A local-first web app to track gym, work, diet, hydration, sleep, and daily notes — organized by time of day with dashboards for day, month, 6 months, and year.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Data is stored in your browser via IndexedDB.

## Deploy to GitHub Pages

Live URL (after setup): **https://venkataprabhakar.github.io/daily-life-tracker/**

### One-time GitHub setup

1. Open your repo: [github.com/VenkataPrabhakar/daily-life-tracker/settings/pages](https://github.com/VenkataPrabhakar/daily-life-tracker/settings/pages)
2. Under **Build and deployment → Source**, choose **GitHub Actions**
3. Push to `master` — the workflow in `.github/workflows/deploy.yml` builds and deploys automatically

### Test the production build locally

```bash
npm run build:gh-pages
npm run preview:gh-pages
```

Then open the URL shown (paths will use `/daily-life-tracker/` like on GitHub Pages).

## Features

- **Today** — Log entries by morning / afternoon / evening / night with quick-add for water and gym
- **Dashboard** — Day, month, 6-month, and year views with charts and goal progress
- **History** — Calendar and recent days list
- **Settings** — Daily goals, dark mode, export/import JSON backup

## Build

```bash
npm run build
npm run preview
```

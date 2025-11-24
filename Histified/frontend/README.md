# Histified Frontend

## Overview
Next.js app for the Histified UI. Provides upload flows, analysis results (image and article), and a polished interface.

## Requirements
- Node.js 18+
- pnpm/npm/yarn

## Setup
```bash
npm install
```

## Environment
Create `.env.local` with:
```env
# Backend base URL used by the frontend (falls back to /api)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Scripts
- `npm run dev` – start Next.js dev server
- `npm run build` – production build
- `npm run start` – start production server

## Development Notes
- API helper: `lib/api.js` uses `NEXT_PUBLIC_API_URL || /api`.
- Path alias: `@/*` is configured in `tsconfig.json`.
- Visual and article analysis results are rendered in `components/pages/results-page.tsx`.

## Project Structure
- `app/` – Next.js app router
- `components/` – UI and pages
- `lib/` – API helpers and utilities
- `public/` – static assets

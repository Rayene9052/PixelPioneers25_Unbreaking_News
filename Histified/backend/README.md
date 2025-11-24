# Histified Backend

## Overview
Express.js API that powers Histified. Provides endpoints for image and article analysis.

## Requirements
- Node.js 18+
- npm/pnpm/yarn

## Setup
```bash
npm install
```

## Environment
Create a `.env` file in `Backend/` with:
```env
# Port for the Express server
PORT=4000

# Allow requests from the frontend
FRONTEND_ORIGIN=http://localhost:3000

# Optional: any service keys your services might need
# OPENAI_API_KEY=...
```

## Scripts
- `npm run dev` – start dev server with nodemon
- `npm run start` – start production server

## Endpoints
Base URL: `http://localhost:4000/api`

- `POST /api/images/verify`
  - Body: `FormData` with key `image`
  - Returns: JSON analysis including `summary`, `metadataAnalysis`, `visualForensics`, `allWarnings`, `recommendations`.

- `POST /api/articles/verify`
  - Body: `FormData` with key `article` (PDF)
  - Returns: JSON analysis including `summary`, `documentInfo`, `detailedAnalysis`, `recommendations`.

## Code structure
- `src/app.js` – Express app setup, CORS, routes
- `src/routes/` – route definitions
- `src/controllers/` – route controllers
- `src/services/` – analysis services
- `server.js` – server bootstrap

## CORS
CORS is configured using `FRONTEND_ORIGIN`. Update it in `.env` for your deployment domain.

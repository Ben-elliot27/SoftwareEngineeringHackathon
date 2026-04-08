# Timesheet Frontend

React + Vite frontend for the SoftwareEngineeringHackathon backend.

## Run locally

```bash
npm install
npm run dev
```

## Backend connection

The frontend calls the backend REST API at:

- `VITE_API_BASE_URL` (if provided)
- otherwise defaults to `http://localhost:8000`

Example:

```bash
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

## Authentication

The UI signs in with `POST /api/v1/auth/login` and stores the returned bearer token in localStorage (`access_token`).
That token is then used for `/api/v1/users/me`, `/api/v1/time-codes`, and `/api/v1/timesheets` flows.

# Hospital Dashboard

This folder contains the React dashboard and the Node / Express bridge API for the Hospital Management System.

## Role in the Overall Project

The dashboard is the browser-based presentation layer. It does not store data by itself. Instead, it communicates with `server.js`, which reads and writes the shared hospital text files in the project root.

```text
React Dashboard -> Express API -> ../patients.txt, ../doctors.txt, ../appointments.txt, ../beds.txt, ../billing.txt
```

## Main Files

- `src/App.jsx`: Main React dashboard UI and API calls.
- `src/index.css`: Dashboard styling.
- `server.js`: Express API bridge to the shared text files.
- `dev.js`: Starts both `server.js` and Vite together.
- `package.json`: Scripts and dependencies.

## Run Dashboard and API Together

```powershell
cd D:\KACHRA\Hospital\dashboard
node dev.js
```

This starts:

- API: `http://localhost:5000`
- Dashboard: Vite local URL, usually `http://localhost:5173` or the next free port.

## Important

The dashboard forms require the API to be running. If only Vite is running, the page may load but adding patients, doctors, appointments, or bills will not save.

The dashboard shows a sync badge:

- `Synced`: API is reachable.
- `API Offline`: API is not reachable.

## Build

```powershell
node node_modules/vite/bin/vite.js build
```

Build output is written to `dist/`.

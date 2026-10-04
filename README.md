# Hospital Management System

A hybrid Hospital Management System combining a **C++ terminal application** with a **React dashboard**, using shared text files for data storage.

## Features

- Patient registration & lifecycle tracking
- Doctor management & availability
- Appointment booking/cancellation
- Bed allocation & occupancy
- Emergency priority queue
- Billing & revenue reporting
- Live dashboard synchronization

## Architecture

```text
React Dashboard
      ↓
Node / Express Bridge
      ↓
Shared Text Files
      ↑
C++ Hospital System
```

- **C++17** — Core hospital logic and OOP
- **React + Vite** — Web dashboard
- **Node.js / Express** — Bridge between dashboard and data
- **Text Files** — Shared storage

## Project Structure

```text
Hospital/
├── main.cpp
├── Hospital.cpp / .h
├── Patient.cpp / .h
├── Doctor.cpp / .h
├── Appointment.cpp / .h
├── Bed.cpp / .h
├── Billing.cpp / .h
├── Emergency.h
├── Logger.h
├── *.txt
└── dashboard/
    ├── server.js
    ├── dev.js
    └── src/
        ├── App.jsx
        └── index.css
```

## Running

### C++ Application

```powershell
.\HospitalSystem.exe
```

### Dashboard

```powershell
cd dashboard
node dev.js
```

## Data Synchronization

Both interfaces use the shared `.txt` files as the source of truth.

- C++ reads and writes the files directly.
- The dashboard accesses the same data through the bridge.
- Dashboard data refreshes automatically.
- C++ reloads data before operations.

## Limitations

- File-based storage instead of a database
- No authentication or role-based access
- Not designed for high-concurrency production use

## Future Improvements

- SQLite/PostgreSQL storage
- Authentication and role-based access
- Persistent emergency queue
- Automated testing
- Analytics and report exports

## Tech Stack

**C++17 · React · Vite · Node.js · Express.js · File-based Storage**
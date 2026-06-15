# SCBX IT Audit Intelligence

An interactive IT internal audit prototype that guides auditors from approach selection through evidence analysis and standardized reporting.

## Features

- Risk-based and compliance-based audit workflows
- Audit blueprints with required inputs, procedures, and expected outputs
- Browser-based CSV analysis with deterministic audit rules
- Executive summaries, exception registers, and auditor narratives
- Responsive desktop and mobile interface
- GitHub Pages deployment with no backend dependency

## Run locally

Open PowerShell in the project directory and run:

```powershell
.\run.ps1
```

Then open `http://127.0.0.1:4173`.

If Node.js 20 or newer is installed:

```powershell
npm start
```

## Example CSV

The required columns depend on the selected audit topic. Access Control accepts:

```csv
id,status,employment_status,approved,last_login_days
USR-001,active,active,yes,4
USR-002,active,terminated,yes,14
```

The **Use sample data** button provides a complete demo without uploading a file.

## Project structure

- `public/` static GitHub Pages application and client-side audit engine
- `server.mjs` optional local Node.js server and API
- `.github/workflows/pages.yml` GitHub Pages deployment workflow
- `Dockerfile` optional container deployment

The prototype uses deterministic audit rules so record totals and exceptions remain traceable. AI model integration, SSO, a database, and an approved control library can be connected in a production phase.

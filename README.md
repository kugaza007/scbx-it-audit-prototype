# SCBX IT Audit Intelligence

An interactive IT internal audit prototype that guides auditors from approach selection through evidence analysis and standardized reporting.

## Features

- Risk-based and compliance-based audit workflows
- Audit blueprints with required inputs, procedures, and expected outputs
- Browser-based CSV analysis with deterministic audit rules
- Executive summaries, exception registers, and auditor narratives
- Responsive desktop and mobile interface
- GitHub Pages deployment with no backend dependency
- Local Gradio production workspace with regulation upload, PDF/text extraction, evidence testing, and downloadable workpapers

## Run the static prototype locally

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

## Run the production-local Gradio app

Use this mode for local production-style testing where regulation and evidence files stay on your machine.

```powershell
.\run_gradio.ps1
```

Then open `http://127.0.0.1:7860`.

The Gradio app supports:

- Risk-based audit topic selection with mapped SCBX Group Standards references
- Compliance-based assessment using SCBX, BOT, internal security standards, or uploaded regulation files
- Regulation upload for `PDF`, `TXT`, `MD`, `CSV`, `LOG`, `XLSX`, and `XLS`
- Evidence upload for `CSV`, `XLSX`, `XLS`, `JSON`, `TXT`, and `LOG`
- Local deterministic testing with executive summary, exception register, compliance matrix, and auditor narrative
- Downloadable workpaper, exception register CSV, compliance matrix CSV, and session JSON

Generated export files are written to your local temporary folder under `scbx_it_audit_exports`.

## Project structure

- `public/` static GitHub Pages application and client-side audit engine
- `app.py` local Gradio production app
- `requirements-gradio.txt` Python dependencies for the Gradio app
- `run_gradio.ps1` Windows runner that creates a local virtual environment and starts Gradio
- `server.mjs` optional local Node.js server and API
- `.github/workflows/pages.yml` GitHub Pages deployment workflow
- `Dockerfile` optional container deployment

The prototype and Gradio app use deterministic audit rules so record totals and exceptions remain traceable. AI model integration, SSO, a database, and an approved control library can be connected in a later enterprise production phase.

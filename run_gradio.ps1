$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvPath = Join-Path $ProjectRoot ".venv-gradio"
$Python = Join-Path $VenvPath "Scripts\python.exe"

if (-not (Test-Path $Python)) {
  Write-Host "Creating local Python environment..."
  $PyLauncher = Get-Command py -ErrorAction SilentlyContinue
  $PythonCommand = Get-Command python -ErrorAction SilentlyContinue
  if ($PyLauncher) {
    py -3 -m venv $VenvPath
  } elseif ($PythonCommand) {
    python -m venv $VenvPath
  } else {
    throw "Python 3 was not found. Please install Python 3.11+ and run this script again."
  }
}

Write-Host "Installing / updating Gradio dependencies..."
& $Python -m pip install --upgrade pip
& $Python -m pip install -r (Join-Path $ProjectRoot "requirements-gradio.txt")

Write-Host "Starting SCBX IT Audit Intelligence Gradio app..."
Write-Host "Open http://127.0.0.1:7860 if the browser does not open automatically."
& $Python (Join-Path $ProjectRoot "app.py")

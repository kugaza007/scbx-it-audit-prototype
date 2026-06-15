$node = Get-Command node -ErrorAction SilentlyContinue

if ($node) {
    & $node.Source "server.mjs"
    exit $LASTEXITCODE
}

$bundledNode = "C:\Users\Kuga\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if (Test-Path $bundledNode) {
    & $bundledNode "server.mjs"
    exit $LASTEXITCODE
}

Write-Error "Node.js was not found. Install Node.js 20 or newer, then run npm start."
exit 1

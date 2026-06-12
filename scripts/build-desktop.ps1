$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

npm run build:web
npm --workspace @sudoku/desktop run tauri:build

Write-Host "Build desktop completado (Linux/Windows segun host)."

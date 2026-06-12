$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

npm run build:web
Write-Host "Build web finalizado en apps/web/dist"

param(
  [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js no esta instalado."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "npm no esta instalado."
}

if (-not $SkipInstall) {
  Write-Host "Instalando dependencias npm..."
  npm install
}

Write-Host "Bootstrap completado."

param(
  [switch]$SkipProjectDeps,
  [switch]$SkipAndroid,
  [switch]$SkipWindowsBuildTools
)

$ErrorActionPreference = 'Stop'

function Assert-Command($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

function Install-WingetPackage($id, $name) {
  Write-Host "Instalando $name..."
  winget install --id $id --accept-package-agreements --accept-source-agreements --silent
}

$setupDir = Join-Path $PSScriptRoot "win"

# Run modular sub-scripts
& (Join-Path $setupDir "install-system-deps.ps1")

if (-not $SkipWindowsBuildTools) {
  & (Join-Path $setupDir "install-vs-tools.ps1")
}

if (-not $SkipAndroid) {
  & (Join-Path $setupDir "install-android.ps1")
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $root

if (-not $SkipProjectDeps) {
  npm install
}

Write-Host "Setup Windows completado."

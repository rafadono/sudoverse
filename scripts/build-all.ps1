param(
  [switch]$WithAndroid,
  [switch]$WithFlatpak
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

powershell -ExecutionPolicy Bypass -File scripts/bootstrap.ps1
powershell -ExecutionPolicy Bypass -File scripts/build-web.ps1
powershell -ExecutionPolicy Bypass -File scripts/build-desktop.ps1

if ($WithAndroid) {
  powershell -ExecutionPolicy Bypass -File scripts/build-android.ps1
}

if ($WithFlatpak) {
  powershell -ExecutionPolicy Bypass -File scripts/build-flatpak.ps1
}

Write-Host "build-all completado."

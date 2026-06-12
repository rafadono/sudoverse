$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Get-Command flatpak-builder -ErrorAction SilentlyContinue)) {
  throw "flatpak-builder no esta instalado."
}

flatpak-builder build-dir apps/desktop/flatpak/com.sudokuvariant.app.yml --force-clean
flatpak-builder --user --install --force-clean build-dir apps/desktop/flatpak/com.sudokuvariant.app.yml

Write-Host "Flatpak instalado. Ejecuta: flatpak run com.sudokuvariant.app"

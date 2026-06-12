#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v flatpak-builder >/dev/null 2>&1; then
  echo "flatpak-builder no esta instalado."
  exit 1
fi

flatpak-builder build-dir apps/desktop/flatpak/com.sudokuvariant.app.yml --force-clean
flatpak-builder --user --install --force-clean build-dir apps/desktop/flatpak/com.sudokuvariant.app.yml

echo "Flatpak instalado. Ejecuta: flatpak run com.sudokuvariant.app"

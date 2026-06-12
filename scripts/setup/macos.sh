#!/usr/bin/env bash
set -euo pipefail

SKIP_PROJECT_DEPS=false
SKIP_ANDROID=false

for arg in "$@"; do
  case "$arg" in
    --skip-project-deps) SKIP_PROJECT_DEPS=true ;;
    --skip-android) SKIP_ANDROID=true ;;
    *) echo "Argumento desconocido: $arg"; exit 1 ;;
  esac
done

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew no esta instalado. Instala desde https://brew.sh"
  exit 1
fi

brew update
brew install node@20 rustup-init flatpak android-platform-tools openjdk@17
brew install --cask android-studio

if ! command -v rustup >/dev/null 2>&1; then
  rustup-init -y
fi

if [[ "$SKIP_ANDROID" == "false" ]]; then
  echo "Abre Android Studio para instalar SDK cmdline/build-tools y acepta licencias."
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [[ "$SKIP_PROJECT_DEPS" == "false" ]]; then
  cd "$ROOT_DIR"
  npm install
fi

echo "Setup macOS completado."

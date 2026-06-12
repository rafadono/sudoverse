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

if [[ $EUID -ne 0 ]]; then
  echo "Ejecuta como root o con sudo: sudo bash scripts/setup/ubuntu.sh"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run modular sub-scripts
bash "$SCRIPT_DIR/linux/install-system-deps.sh"
bash "$SCRIPT_DIR/linux/install-node.sh"
bash "$SCRIPT_DIR/linux/install-rust.sh"

if [[ "$SKIP_ANDROID" == "false" ]]; then
  bash "$SCRIPT_DIR/linux/install-android.sh"
fi

ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
if [[ "$SKIP_PROJECT_DEPS" == "false" ]]; then
  su - "${SUDO_USER:-$USER}" -c "cd '$ROOT_DIR' && npm install"
fi

echo "Setup Ubuntu/Debian completado."

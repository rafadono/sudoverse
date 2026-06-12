#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js no esta instalado."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm no esta instalado."
  exit 1
fi

echo "Instalando dependencias npm..."
npm install

echo "Bootstrap completado."

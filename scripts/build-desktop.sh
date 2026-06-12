#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

npm run build:web
npm --workspace @sudoku/desktop run tauri:build

echo "Build desktop completado (Linux/Windows segun host)."

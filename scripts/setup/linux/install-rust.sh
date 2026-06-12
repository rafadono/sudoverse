#!/usr/bin/env bash
# Instala Rust y Rustup.
set -euo pipefail

if ! command -v rustup >/dev/null 2>&1; then
  echo "Instalando Rust y Rustup..."
  su - "${SUDO_USER:-$USER}" -c "curl https://sh.rustup.rs -sSf | sh -s -- -y"
else
  echo "Rust/Rustup ya está instalado: $(rustup --version)"
fi

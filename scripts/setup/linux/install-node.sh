#!/usr/bin/env bash
# Instala Node.js v20 si no se encuentra instalado.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Debe ejecutarse como root/sudo."
  exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! node -v | grep -q '^v20\.'; then
  echo "Instalando Node.js v20..."
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  elif command -v dnf >/dev/null 2>&1; then
    dnf -y module disable nodejs || true
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    dnf -y install nodejs
  else
    echo "Gestor de paquetes no soportado para instalación automática de Node.js."
    exit 1
  fi
else
  echo "Node.js v20 ya está instalado: $(node -v)"
fi

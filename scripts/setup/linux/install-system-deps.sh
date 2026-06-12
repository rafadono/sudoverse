#!/usr/bin/env bash
# Instala las dependencias base del sistema según la distribución.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Debe ejecutarse como root/sudo."
  exit 1
fi

if command -v apt-get >/dev/null 2>&1; then
  echo "Detectado sistema basado en Debian/Ubuntu. Instalando dependencias..."
  apt-get update
  apt-get install -y ca-certificates curl gnupg unzip zip xz-utils jq git flatpak flatpak-builder \
    build-essential wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev \
    libwebkit2gtk-4.1-dev openjdk-17-jdk adb
elif command -v dnf >/dev/null 2>&1; then
  echo "Detectado sistema basado en Fedora. Instalando dependencias..."
  dnf -y update
  dnf -y install curl unzip zip jq git flatpak flatpak-builder \
    gcc gcc-c++ make pkgconf-pkg-config openssl-devel libappindicator-gtk3 librsvg2-devel \
    webkit2gtk4.1-devel xdotool java-17-openjdk-devel android-tools
else
  echo "Gestor de paquetes no soportado para instalación automática."
  exit 1
fi

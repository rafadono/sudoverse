#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" == "Darwin" ]]; then
  bash "$(dirname "$0")/macos.sh" "$@"
  exit 0
fi

if [[ -f /etc/os-release ]]; then
  . /etc/os-release
  case "${ID:-}" in
    ubuntu|debian|linuxmint|pop)
      bash "$(dirname "$0")/ubuntu.sh" "$@"
      ;;
    fedora)
      bash "$(dirname "$0")/fedora.sh" "$@"
      ;;
    *)
      if [[ "${ID_LIKE:-}" == *"debian"* ]]; then
        bash "$(dirname "$0")/ubuntu.sh" "$@"
      elif [[ "${ID_LIKE:-}" == *"fedora"* ]]; then
        bash "$(dirname "$0")/fedora.sh" "$@"
      else
        echo "Distro no soportada automaticamente: ${ID:-unknown}"
        exit 1
      fi
      ;;
  esac
else
  echo "No se pudo detectar plataforma."
  exit 1
fi

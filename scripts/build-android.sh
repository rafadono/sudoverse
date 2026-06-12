#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

npx expo prebuild --platform android --non-interactive --project-dir apps/mobile
(
  cd apps/mobile/android
  ./gradlew assembleRelease
)

echo "APK release generado en apps/mobile/android/app/build/outputs/apk/release"

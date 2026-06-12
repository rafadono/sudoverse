#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

(
  cd apps/mobile
  CI=1 npx expo prebuild --platform android
)
(
  cd apps/mobile/android
  ./gradlew assembleRelease
)

echo "APK release generado en apps/mobile/android/app/build/outputs/apk/release"

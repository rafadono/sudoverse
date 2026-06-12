#!/usr/bin/env bash
# Instala y configura el SDK de Android en Linux.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Debe ejecutarse como root/sudo."
  exit 1
fi

echo "Configurando Android SDK..."
SDK_ROOT="/opt/android-sdk"
mkdir -p "$SDK_ROOT/cmdline-tools"

if [[ ! -d "$SDK_ROOT/cmdline-tools/latest" ]]; then
  TMP_ZIP="/tmp/cmdline-tools.zip"
  curl -L -o "$TMP_ZIP" "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
  rm -rf /tmp/cmdline-tools
  unzip -q "$TMP_ZIP" -d /tmp/cmdline-tools
  mv /tmp/cmdline-tools/cmdline-tools "$SDK_ROOT/cmdline-tools/latest"
fi

export ANDROID_SDK_ROOT="$SDK_ROOT"
export ANDROID_HOME="$SDK_ROOT"
export PATH="$PATH:$SDK_ROOT/cmdline-tools/latest/bin:$SDK_ROOT/platform-tools"

yes | sdkmanager --licenses || true
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "cmdline-tools;latest"

PROFILE_FILE="/etc/profile.d/android-sdk.sh"
cat > "$PROFILE_FILE" <<'EOF'
export ANDROID_SDK_ROOT=/opt/android-sdk
export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools
EOF

echo "Android SDK configurado correctamente en $SDK_ROOT"

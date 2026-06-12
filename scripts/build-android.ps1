$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

npx expo prebuild --platform android --non-interactive --project-dir apps/mobile

Push-Location apps/mobile/android
./gradlew.bat assembleRelease
Pop-Location

Write-Host "APK release generado en apps/mobile/android/app/build/outputs/apk/release"

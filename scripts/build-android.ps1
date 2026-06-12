$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Push-Location apps/mobile
$env:CI = "1"
npx expo prebuild --platform android
Pop-Location

Push-Location apps/mobile/android
./gradlew.bat assembleRelease
Pop-Location

Write-Host "APK release generado en apps/mobile/android/app/build/outputs/apk/release"

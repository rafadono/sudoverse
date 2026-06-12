$ErrorActionPreference = 'Stop'

function Install-WingetPackage($id, $name) {
  Write-Host "Instalando $name..."
  winget install --id $id --accept-package-agreements --accept-source-agreements --silent
}

Install-WingetPackage "EclipseAdoptium.Temurin.17.JDK" "JDK 17"
Install-WingetPackage "Google.AndroidStudio" "Android Studio"
Write-Host "Android Studio y JDK 17 instalados. Abre Android Studio y ejecuta SDK Manager para asegurar platform-tools, build-tools y cmdline-tools."

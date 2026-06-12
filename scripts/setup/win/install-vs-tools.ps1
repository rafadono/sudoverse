$ErrorActionPreference = 'Stop'

function Install-WingetPackage($id, $name) {
  Write-Host "Instalando $name..."
  winget install --id $id --accept-package-agreements --accept-source-agreements --silent
}

Install-WingetPackage "Microsoft.VisualStudio.2022.BuildTools" "Visual Studio Build Tools"

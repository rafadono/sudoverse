$ErrorActionPreference = 'Stop'

function Assert-Command($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

function Install-WingetPackage($id, $name) {
  Write-Host "Instalando $name..."
  winget install --id $id --accept-package-agreements --accept-source-agreements --silent
}

if (-not (Assert-Command winget)) {
  throw "winget no esta disponible. Actualiza App Installer de Microsoft Store e intenta de nuevo."
}

Install-WingetPackage "Git.Git" "Git"
Install-WingetPackage "OpenJS.NodeJS.LTS" "Node.js LTS"
Install-WingetPackage "Rustlang.Rustup" "Rustup"
Install-WingetPackage "Microsoft.EdgeWebView2Runtime" "WebView2 Runtime"

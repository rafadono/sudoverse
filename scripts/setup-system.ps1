param(
  [switch]$SkipProjectDeps,
  [switch]$SkipAndroid,
  [switch]$SkipWindowsBuildTools
)

$script = Join-Path $PSScriptRoot "setup\windows.ps1"

$cmd = @("-ExecutionPolicy", "Bypass", "-File", "`"$script`"")
if ($SkipProjectDeps) { $cmd += "-SkipProjectDeps" }
if ($SkipAndroid) { $cmd += "-SkipAndroid" }
if ($SkipWindowsBuildTools) { $cmd += "-SkipWindowsBuildTools" }

Start-Process -FilePath "powershell" -ArgumentList $cmd -Wait -NoNewWindow

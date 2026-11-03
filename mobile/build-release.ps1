# Compatibility entry point: collect signing passwords securely in the maintained script.
$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'build-release-secure.ps1')

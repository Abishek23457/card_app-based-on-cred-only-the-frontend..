@echo off
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies...
  call npm.cmd install
)

echo Building project...
call npm.cmd run build

echo Opening CRED React website...
start "" "http://127.0.0.1:4173"
call npm.cmd run preview

@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 20.19 or later, then try again.
  pause
  exit /b 1
)
start "" "http://localhost:4173"
node server.mjs
pause

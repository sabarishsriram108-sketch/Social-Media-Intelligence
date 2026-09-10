@echo off
title Onam Cloud Studio
cd /d "%~dp0"

if not exist "node_modules" (
  echo First-time setup - installing dependencies. This can take a few minutes.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo Install failed - see the error above.
    pause
    exit /b 1
  )
  echo.
)

echo Starting Onam Cloud Studio...
echo A browser window will open automatically once it is ready.
echo.
echo Keep this window open while you work. Closing it stops the app.
echo.
call npm start

echo.
echo Onam Cloud Studio has stopped.
pause

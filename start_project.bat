@echo off
title SIH Hazard System Launcher
cd /d "%~dp0"

echo ===================================================
echo   SIH Hazard Red Zone Alert and Rescue System
echo   The Invincible Trident - IIT Madras BS Degree
echo ===================================================
echo.

echo Starting Node.js backend API (port 5000)...
start "SIH Backend Server" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 4 /nobreak >nul

echo Starting React dashboard (port 5173)...
start "SIH Frontend Server" cmd /k "cd /d "%~dp0" && npm run dev"

timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo Dashboard: http://localhost:5173
echo Backend:   http://localhost:5000/api/health
echo ===================================================
pause

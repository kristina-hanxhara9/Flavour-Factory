@echo off
REM START BAKERY SCANNER - ENTERPRISE EDITION

echo ================================
echo BAKERY SCANNER ENTERPRISE
echo ================================
echo.
echo Starting your AI-powered bakery system...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python found!
    echo.
    echo Starting server at http://localhost:8000
    echo.
    echo To access from phone/tablet:
    echo    1. Connect to same WiFi
    echo    2. Find this computer's IP: ipconfig
    echo    3. Open http://[IP]:8000 on device
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
) else (
    echo Python not found!
    echo.
    echo Opening app directly in browser...
    echo Note: Camera features work best with a server
    echo.
    start index.html
    echo.
    echo To install Python:
    echo Visit https://www.python.org/downloads/
)

pause
@echo off
title Sistemi i Skanimit për Furra - Enhanced Setup
color 0B

cls
echo 🥖====================================================🥖
echo        SISTEMI I SKANIMIT PËR FURRA - SETUP
echo 🥖====================================================🥖
echo.
echo Zgjidhni versionin që doni të përdorni:
echo.
echo 1) 📱 BASIC VERSION (index.html)
echo    - Skanim bazë me AI
echo    - Menaxhim shitjesh
echo    - Raporte të thjeshta
echo    - Pa cloud backup
echo    - Ideal për biznes të vogla
echo.
echo 2) 🚀 ENTERPRISE VERSION (enhanced-index.html)
echo    - AI i vërtetë me TensorFlow.js
echo    - Menaxhim ndërrimesh
echo    - Analitika të avancuara
echo    - Cloud backup ^& sync
echo    - Sistem printimi
echo    - Dashboard enterprise
echo    - Ideal për biznes profesionalë
echo.
echo 3) 📖 Lexo dokumentacionin
echo.
echo 4) ❌ Dil
echo.
set /p choice="Zgjidhni një opsion (1-4): "

if "%choice%"=="1" goto basic
if "%choice%"=="2" goto enterprise
if "%choice%"=="3" goto docs
if "%choice%"=="4" goto exit
echo.
echo ❌ Zgjedhje e pavlefshme. Provoni përsëri.
pause
exit

:basic
echo.
echo 🚀 Po hapemi BASIC VERSION...
echo.

if not exist "index.html" (
    echo ❌ ERROR: index.html nuk u gjet!
    echo Sigurohuni që të gjithë skedarët janë në dosjen e njëjtë.
    pause
    exit
)

start index.html

echo ✅ BASIC VERSION u hap me sukses!
echo.
echo 📋 Hapat e ardhshëm:
echo 1. Lejoni aksesin në kamerë
echo 2. Shkoni te 'Trajnimi' dhe shtoni produktet
echo 3. Përdorni 'Skanimin' për të shitur
echo.
goto success

:enterprise
echo.
echo 🚀 Po hapemi ENTERPRISE VERSION...
echo.

if not exist "enhanced-index.html" (
    echo ❌ ERROR: enhanced-index.html nuk u gjet!
    echo Sigurohuni që të gjithë skedarët janë në dosjen e njëjtë.
    pause
    exit
)

start enhanced-index.html

echo ✅ ENTERPRISE VERSION u hap me sukses!
echo.
echo 🎯 Karakteristika të Reja:
echo • 🤖 AI i vërtetë me TensorFlow.js
echo • 👥 Menaxhim ndërrimesh
echo • 📊 Analitika të avancuara
echo • ☁️ Cloud backup automatik
echo • 🖨️ Printim faturash
echo • ⚙️ Cilësime të avancuara
echo.
echo 📋 Hapat e ardhshëm:
echo 1. Konfiguroni informacionet e biznesit (Cilësimet)
echo 2. Aktivizoni cloud backup (Cilësimet → Cloud Backup)
echo 3. Konfiguroni printerin (Cilësimet → Printer)
echo 4. Trajnoni produktet me AI (Trajnimi)
echo 5. Filloni një ndërrim (Ndërrimet)
echo 6. Përdorni sistemin e plotë!
echo.
goto success

:docs
echo.
echo 📖 Po hapemi dokumentacioni...
echo.

if exist "ENTERPRISE-README.md" (
    start ENTERPRISE-README.md
    echo ✅ Dokumentacioni u hap!
) else (
    echo ❌ Dokumentacioni nuk u gjet. Hapeni README.md manualisht.
)
echo.
goto success

:success
echo.
echo 🎉 SISTEMI ËSHTË GATI PËR PËRDORIM!
echo.
echo 💡 Këshilla:
echo • Për AI më të saktë, shtoni së paku 15-20 foto per produkt
echo • Përdorni dritë të mirë kur skanoni produktet
echo • Bëni backup të rregullt të të dhënave
echo • Kontrolloni raportet çdo ditë
echo.
echo 📞 Për mbështetje teknike:
echo • Lexoni dokumentacionin e plotë
echo • Kontrolloni README.md për udhëzime detale
echo • Kontaktoni zhvilluesin për ndihmë
echo.
echo 🚀 Shijoni përdorimin e sistemit tuaj të ri enterprise!
echo.
pause
exit

:exit
echo.
echo 👋 Faleminderit që përdorni Sistemin e Skanimit për Furra!
echo.
pause
exit
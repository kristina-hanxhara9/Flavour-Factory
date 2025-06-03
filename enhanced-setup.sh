#!/bin/bash

# Enhanced Bakery Scanner Setup Script
# Choose between Basic and Enterprise versions

clear
echo "🥖====================================================🥖"
echo "       SISTEMI I SKANIMIT PËR FURRA - SETUP"
echo "🥖====================================================🥖"
echo ""
echo "Zgjidhni versionin që doni të përdorni:"
echo ""
echo "1) 📱 BASIC VERSION (index.html)"
echo "   - Skanim bazë me AI"
echo "   - Menaxhim shitjesh"
echo "   - Raporte të thjeshta"
echo "   - Pa cloud backup"
echo "   - Ideal për biznes të vogla"
echo ""
echo "2) 🚀 ENTERPRISE VERSION (enhanced-index.html)"
echo "   - AI i vërtetë me TensorFlow.js"
echo "   - Menaxhim ndërrimesh"
echo "   - Analitika të avancuara"
echo "   - Cloud backup & sync"
echo "   - Sistem printimi"
echo "   - Dashboard enterprise"
echo "   - Ideal për biznes profesionalë"
echo ""
echo "3) 📖 Lexo dokumentacionin"
echo ""
echo "4) ❌ Dil"
echo ""
read -p "Zgjidhni një opsion (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Po hapemi BASIC VERSION..."
        echo ""
        
        # Check if basic files exist
        if [ ! -f "index.html" ]; then
            echo "❌ ERROR: index.html nuk u gjet!"
            echo "Sigurohuni që të gjithë skedarët janë në dosjen e njëjtë."
            exit 1
        fi
        
        # Open basic version
        if command -v open &> /dev/null; then
            open index.html
        elif command -v xdg-open &> /dev/null; then
            xdg-open index.html
        elif command -v start &> /dev/null; then
            start index.html
        else
            echo "Hapeni 'index.html' manualisht në shfletuesin tuaj."
        fi
        
        echo "✅ BASIC VERSION u hap me sukses!"
        echo ""
        echo "📋 Hapat e ardhshëm:"
        echo "1. Lejoni aksesin në kamerë"
        echo "2. Shkoni te 'Trajnimi' dhe shtoni produktet"
        echo "3. Përdorni 'Skanimin' për të shitur"
        echo ""
        ;;
        
    2)
        echo ""
        echo "🚀 Po hapemi ENTERPRISE VERSION..."
        echo ""
        
        # Check if enhanced files exist
        if [ ! -f "enhanced-index.html" ]; then
            echo "❌ ERROR: enhanced-index.html nuk u gjet!"
            echo "Sigurohuni që të gjithë skedarët janë në dosjen e njëjtë."
            exit 1
        fi
        
        # Open enterprise version
        if command -v open &> /dev/null; then
            open enhanced-index.html
        elif command -v xdg-open &> /dev/null; then
            xdg-open enhanced-index.html
        elif command -v start &> /dev/null; then
            start enhanced-index.html
        else
            echo "Hapeni 'enhanced-index.html' manualisht në shfletuesin tuaj."
        fi
        
        echo "✅ ENTERPRISE VERSION u hap me sukses!"
        echo ""
        echo "🎯 Karakteristika të Reja:"
        echo "• 🤖 AI i vërtetë me TensorFlow.js"
        echo "• 👥 Menaxhim ndërrimesh"
        echo "• 📊 Analitika të avancuara"
        echo "• ☁️ Cloud backup automatik"
        echo "• 🖨️ Printim faturash"
        echo "• ⚙️ Cilësime të avancuara"
        echo ""
        echo "📋 Hapat e ardhshëm:"
        echo "1. Konfiguroni informacionet e biznesit (Cilësimet)"
        echo "2. Aktivizoni cloud backup (Cilësimet → Cloud Backup)"
        echo "3. Konfiguroni printerin (Cilësimet → Printer)"
        echo "4. Trajnoni produktet me AI (Trajnimi)"
        echo "5. Filloni një ndërrim (Ndërrimet)"
        echo "6. Përdorni sistemin e plotë!"
        echo ""
        ;;
        
    3)
        echo ""
        echo "📖 Po hapemi dokumentacioni..."
        echo ""
        
        # Open documentation
        if [ -f "ENTERPRISE-README.md" ]; then
            if command -v open &> /dev/null; then
                open ENTERPRISE-README.md
            elif command -v xdg-open &> /dev/null; then
                xdg-open ENTERPRISE-README.md
            elif command -v start &> /dev/null; then
                start ENTERPRISE-README.md
            else
                echo "Hapeni 'ENTERPRISE-README.md' manualisht."
            fi
            echo "✅ Dokumentacioni u hap!"
        else
            echo "❌ Dokumentacioni nuk u gjet. Hapeni README.md manualisht."
        fi
        ;;
        
    4)
        echo ""
        echo "👋 Faleminderit që përdorni Sistemin e Skanimit për Furra!"
        echo ""
        exit 0
        ;;
        
    *)
        echo ""
        echo "❌ Zgjedhje e pavlefshme. Provoni përsëri."
        echo ""
        exit 1
        ;;
esac

echo ""
echo "🎉 SISTEMI ËSHTË GATI PËR PËRDORIM!"
echo ""
echo "💡 Këshilla:"
echo "• Për AI më të saktë, shtoni së paku 15-20 foto per produkt"
echo "• Përdorni dritë të mirë kur skanoni produktet"
echo "• Bëni backup të rregullt të të dhënave"
echo "• Kontrolloni raportet çdo ditë"
echo ""
echo "📞 Për mbështetje teknike:"
echo "• Lexoni dokumentacionin e plotë"
echo "• Kontrolloni README.md për udhëzime detale"
echo "• Kontaktoni zhvilluesin për ndihmë"
echo ""
echo "🚀 Shijoni përdorimin e sistemit tuaj të ri enterprise!"
echo ""
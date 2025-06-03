#!/bin/bash
# BAKERY SCANNER - EASY START
# Bëje executable: chmod +x FILLO-TANI.sh

echo "🥐 BAKERY SCANNER - DUKE U NISUR..."
echo "=================================="
echo ""

# Change to app directory
cd "$(dirname "$0")"

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python nuk u gjet!"
    echo "Duke hapur direkt në browser..."
    open index.html
    echo ""
    echo "⚠️  KUJDES: Kamera nuk do punojë pa server!"
    echo "Instalo Python: brew install python3"
    exit 1
fi

# Start server
echo "✅ Duke nisur serverin..."
echo ""
echo "🌐 Aplikacioni do hapet në: http://localhost:8000"
echo ""
echo "📱 Për telefon/tablet:"
echo "   1. Sigurohu që je në të njëjtin WiFi"
echo "   2. Gjej IP: ifconfig | grep 'inet '"
echo "   3. Hap në telefon: http://[IP]:8000"
echo ""
echo "🔧 SETUP I SHPEJTË:"
echo "   1. Lejo kamerën kur të pyesë"
echo "   2. Shto punonjës: Settings → Add Employee"
echo "   3. Trajno produkt: Training tab"
echo ""
echo "💡 NDIHMË:"
echo "   - Google Drive: open setup-google-drive-printer.html"
echo "   - Probleme: open ZGJIDHJA-PROBLEMEVE.md"
echo "   - Deploy online: open DEPLOY-ONLINE-FREE.md"
echo ""
echo "Shtyp Ctrl+C për të ndaluar"
echo ""

# Open browser after 2 seconds
(sleep 2 && open http://localhost:8000) &

# Start Python server
python3 -m http.server 8000
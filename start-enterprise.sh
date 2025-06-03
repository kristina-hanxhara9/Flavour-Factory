#!/bin/bash
# Make executable: chmod +x start-enterprise.sh
# START BAKERY SCANNER - ENTERPRISE EDITION

echo "🥐 BAKERY SCANNER ENTERPRISE"
echo "============================"
echo ""
echo "Starting your AI-powered bakery system..."
echo ""

# Check if Python 3 is installed
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
    echo ""
    echo "🚀 Starting server at http://localhost:8000"
    echo ""
    echo "📱 To access from phone/tablet:"
    echo "   1. Connect to same WiFi"
    echo "   2. Find this computer's IP address"
    echo "   3. Open http://[IP]:8000 on device"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8000
else
    echo "❌ Python 3 not found!"
    echo ""
    echo "Alternative: Open index.html directly in Chrome/Firefox"
    echo "Note: Camera features work best with a server"
    echo ""
    echo "To install Python 3:"
    echo "- Mac: brew install python3"
    echo "- Ubuntu: sudo apt install python3"
    echo "- Windows: Download from python.org"
fi
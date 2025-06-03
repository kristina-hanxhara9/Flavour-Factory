#!/bin/bash
# Make this file executable with: chmod +x setup.sh

# Bakery Scanner Setup Script
echo "🥐 Bakery Scanner Setup"
echo "======================"

# Create icon placeholder (base64 encoded simple bread icon)
ICON_BASE64="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iI0ZGRjhEQyIvPgogIDx0ZXh0IHg9IjI1NiIgeT0iMjgwIiBmb250LXNpemU9IjIwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzhCNDUxMyI+8J+lkDwvdGV4dD4KPC9zdmc+"

# Function to create icon files
create_icons() {
    echo "Creating placeholder icons..."
    
    # Create a simple HTML file that generates icons
    cat > generate_icons.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
</head>
<body>
    <h2>Bakery Scanner Icon Generator</h2>
    <p>Right-click and save each icon:</p>
    
    <script>
        const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
        
        sizes.forEach(size => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            // Background
            ctx.fillStyle = '#FFF8DC';
            ctx.fillRect(0, 0, size, size);
            
            // Border
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = size * 0.02;
            ctx.strokeRect(5, 5, size - 10, size - 10);
            
            // Emoji
            ctx.font = `${size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🥐', size / 2, size / 2);
            
            // Create download link
            const link = document.createElement('a');
            link.download = `icon-${size}x${size}.png`;
            link.href = canvas.toDataURL();
            link.textContent = `${size}x${size}`;
            link.style.display = 'block';
            link.style.margin = '10px';
            
            document.body.appendChild(canvas);
            document.body.appendChild(link);
        });
    </script>
</body>
</html>
EOF
    
    echo "✅ Icon generator created: generate_icons.html"
    echo "   Open this file in a browser to generate and save icons"
}

# Function to start local server
start_server() {
    echo ""
    echo "Starting local server..."
    echo "Choose your preferred method:"
    echo "1) Python 3 (recommended)"
    echo "2) Node.js (npx serve)"
    echo "3) PHP"
    echo "4) Skip server"
    
    read -p "Select option (1-4): " choice
    
    case $choice in
        1)
            echo "Starting Python server on http://localhost:8000"
            python3 -m http.server 8000
            ;;
        2)
            echo "Starting Node.js server..."
            npx serve .
            ;;
        3)
            echo "Starting PHP server on http://localhost:8000"
            php -S localhost:8000
            ;;
        4)
            echo "Skipping server setup."
            echo "You can open index.html directly in your browser."
            ;;
        *)
            echo "Invalid option. Skipping server setup."
            ;;
    esac
}

# Function to check requirements
check_requirements() {
    echo "Checking requirements..."
    
    # Check for modern browser
    if command -v google-chrome &> /dev/null; then
        echo "✅ Chrome detected"
    elif command -v firefox &> /dev/null; then
        echo "✅ Firefox detected"
    else
        echo "⚠️  No modern browser detected. Please install Chrome or Firefox."
    fi
    
    # Check for Python (for local server)
    if command -v python3 &> /dev/null; then
        echo "✅ Python 3 detected"
    else
        echo "⚠️  Python 3 not found (optional, for local server)"
    fi
    
    echo ""
}

# Main setup flow
main() {
    check_requirements
    create_icons
    
    echo ""
    echo "📋 Setup Complete!"
    echo "=================="
    echo ""
    echo "Next steps:"
    echo "1. Generate icons using generate_icons.html"
    echo "2. Move icon files to the assets/ folder"
    echo "3. Start the application"
    echo ""
    
    read -p "Would you like to start the server now? (y/n): " start_now
    
    if [[ $start_now == "y" || $start_now == "Y" ]]; then
        start_server
    else
        echo ""
        echo "To start manually, run one of these commands:"
        echo "  python3 -m http.server 8000"
        echo "  npx serve ."
        echo "  php -S localhost:8000"
        echo ""
        echo "Then open http://localhost:8000 in your browser"
    fi
}

# Run main function
main
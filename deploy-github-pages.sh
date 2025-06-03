#!/bin/bash
# QUICK DEPLOY TO GITHUB PAGES - FREE HOSTING

echo "🚀 BAKERY SCANNER - QUICK ONLINE DEPLOY"
echo "======================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed!"
    echo "Please install git first:"
    echo "Mac: brew install git"
    echo "Linux: sudo apt install git"
    exit 1
fi

# Get GitHub username
echo "📝 Enter your GitHub username:"
read -p "Username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Username cannot be empty!"
    exit 1
fi

# Initialize git if needed
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add all files
echo "📁 Adding all files..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Deploy Bakery Scanner Enterprise" || echo "No changes to commit"

# Set main branch
git branch -M main

# Add remote
echo "🔗 Connecting to GitHub..."
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/${GITHUB_USERNAME}/bakery-scanner.git"

echo ""
echo "⚠️  IMPORTANT STEPS:"
echo "=================="
echo ""
echo "1. Create repository on GitHub:"
echo "   👉 Go to: https://github.com/new"
echo "   👉 Name: bakery-scanner"
echo "   👉 Set to PUBLIC (required for free hosting)"
echo "   👉 DON'T initialize with README"
echo "   👉 Click 'Create repository'"
echo ""
echo "2. Press ENTER when repository is created..."
read -p ""

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Files uploaded successfully!"
    echo ""
    echo "🔧 NOW ENABLE GITHUB PAGES:"
    echo "=========================="
    echo ""
    echo "1. Go to: https://github.com/${GITHUB_USERNAME}/bakery-scanner/settings/pages"
    echo "2. Source: Deploy from a branch"
    echo "3. Branch: main"
    echo "4. Folder: / (root)"
    echo "5. Click Save"
    echo ""
    echo "⏳ Wait 2-5 minutes for deployment..."
    echo ""
    echo "🌐 Your app will be live at:"
    echo "👉 https://${GITHUB_USERNAME}.github.io/bakery-scanner/"
    echo ""
    echo "🎉 THAT'S IT! 100% FREE HOSTING!"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "1. Repository exists on GitHub"
    echo "2. You're logged in to git"
    echo ""
    echo "To login to git:"
    echo "git config --global user.name '${GITHUB_USERNAME}'"
    echo "git config --global user.email 'your-email@example.com'"
fi
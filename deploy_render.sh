#!/bin/bash

# Render.com Quick Deployment Script
# This script helps prepare your project for Render.com deployment

echo "🚀 Preparing Pionex Trading Bot GUI for Render.com deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Check if we're in the right directory
if [ ! -f "gui_app.py" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Step 2: Create Render-specific files
print_status "Creating Render.com configuration files..."

# Create render.yaml if it doesn't exist
if [ ! -f "render.yaml" ]; then
    cat > render.yaml << 'EOF'
services:
  - type: web
    name: pionex-trading-bot-gui
    env: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: python main.py
    envVars:
      - key: PIONEX_API_KEY
        value: your_actual_pionex_api_key
      - key: PIONEX_SECRET_KEY
        value: your_actual_pionex_secret_key
      - key: SECRET_KEY
        value: your_secure_random_secret_key_here
      - key: DATABASE_URL
        value: sqlite:///data/trading_bot.db
      - key: LOG_LEVEL
        value: INFO
      - key: GUI_HOST
        value: 0.0.0.0
      - key: GUI_PORT
        value: 10000
      - key: GUI_DEBUG
        value: false
      - key: RENDER
        value: true
EOF
    print_status "Created render.yaml"
fi

# Create render-build.sh if it doesn't exist
if [ ! -f "render-build.sh" ]; then
    cat > render-build.sh << 'EOF'
#!/bin/bash
# Render build script for Pionex Trading Bot GUI

echo "🚀 Starting Pionex Trading Bot GUI build on Render.com..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Step 1: Install dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt

# Step 2: Create necessary directories
print_status "Creating necessary directories..."
mkdir -p data
mkdir -p logs
mkdir -p static/css
mkdir -p static/js
mkdir -p templates

# Step 3: Set permissions
print_status "Setting proper permissions..."
chmod 755 data/
chmod 755 logs/

# Step 4: Create database if not exists
print_status "Initializing database..."
python -c "
import sqlite3
import os
from pathlib import Path

# Create data directory if it doesn't exist
data_dir = Path('data')
data_dir.mkdir(exist_ok=True)

# Create database file if it doesn't exist
db_path = data_dir / 'trading_bot.db'
if not db_path.exists():
    conn = sqlite3.connect(db_path)
    conn.close()
    print('Database created successfully')
else:
    print('Database already exists')
"

# Step 5: Verify environment
print_status "Checking environment variables..."
if [ -z "$PIONEX_API_KEY" ]; then
    print_warning "PIONEX_API_KEY not set - please configure in Render dashboard"
fi

if [ -z "$PIONEX_SECRET_KEY" ]; then
    print_warning "PIONEX_SECRET_KEY not set - please configure in Render dashboard"
fi

if [ -z "$SECRET_KEY" ]; then
    print_warning "SECRET_KEY not set - please configure in Render dashboard"
fi

# Step 6: Final verification
print_status "Build completed successfully!"
print_status "Application will start on port: ${PORT:-10000}"
print_status "Host: ${HOST:-0.0.0.0}"

echo "✅ Render build script completed!"
EOF
    chmod +x render-build.sh
    print_status "Created render-build.sh"
fi

# Step 3: Update main.py for Render if needed
if [ -f "main.py" ]; then
    print_status "Checking main.py for Render compatibility..."
    
    # Check if main.py already has Render configuration
    if ! grep -q "PORT.*10000" main.py; then
        print_warning "Consider updating main.py to use PORT environment variable"
        print_warning "Example: port = int(os.environ.get('PORT', 10000))"
    fi
fi

# Step 4: Check requirements.txt
if [ -f "requirements.txt" ]; then
    print_status "Requirements.txt found"
else
    print_error "requirements.txt not found - please create it"
    exit 1
fi

# Step 5: Create .gitignore for Render
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
env.bak/
venv.bak/

# Environment variables
.env
.env.local
.env.production

# Database
*.db
*.sqlite
*.sqlite3

# Logs
*.log
logs/

# Data
data/
trading_bot.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Render
.render-buildlogs/
EOF
    print_status "Created .gitignore"
fi

# Step 6: Final instructions
echo ""
print_status "🎉 Render.com deployment preparation completed!"
echo ""
print_warning "NEXT STEPS:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo "   git push origin main"
echo ""
echo "2. Go to Render.com dashboard:"
echo "   https://dashboard.render.com"
echo ""
echo "3. Create new Web Service:"
echo "   - Connect your GitHub repository"
echo "   - Service Name: pionex-trading-bot-gui"
echo "   - Environment: Python 3"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: python main.py"
echo ""
echo "4. Add Environment Variables in Render dashboard:"
echo "   - PIONEX_API_KEY=your_actual_api_key"
echo "   - PIONEX_SECRET_KEY=your_actual_secret_key"
echo "   - SECRET_KEY=your_random_secret_key"
echo "   - RENDER=true"
echo ""
echo "5. Deploy and wait for build to complete"
echo ""
print_status "Your application will be available at: https://your-app-name.onrender.com"
echo ""
print_status "Deployment preparation script completed!" 
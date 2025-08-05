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
#!/bin/bash

# Pionex Trading Bot GUI - VPS Deployment Script
# Run this script on your VPS to automatically deploy the application

echo "🚀 Starting Pionex Trading Bot GUI Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# Step 1: System Update
print_status "Updating system packages..."
apt update && apt upgrade -y

# Step 2: Install essential packages
print_status "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common python3 python3-pip python3-venv nginx ufw

# Step 3: Create project directory
print_status "Setting up project directory..."
mkdir -p /opt/pionex-trading-bot
cd /opt/pionex-trading-bot

# Step 4: Clone repository (if not already present)
if [ ! -d ".git" ]; then
    print_status "Cloning repository..."
    git clone https://github.com/Telegram-Airdrop-Bot/pionex-trading-bot.git .
else
    print_status "Repository already exists, pulling latest changes..."
    git pull origin main
fi

# Step 5: Setup virtual environment
print_status "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Step 6: Install Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Step 7: Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p data
mkdir -p static/css
mkdir -p static/js
mkdir -p templates

# Step 8: Setup environment file
print_status "Setting up environment configuration..."
if [ ! -f ".env" ]; then
    cp env_gui_example.txt .env
    print_warning "Please edit .env file with your actual API credentials"
    print_warning "Run: nano /opt/pionex-trading-bot/.env"
fi

# Step 9: Set permissions
print_status "Setting proper permissions..."
chown -R root:root /opt/pionex-trading-bot
chmod -R 755 /opt/pionex-trading-bot
chmod 644 trading_bot.db 2>/dev/null || true

# Step 10: Create systemd service
print_status "Creating systemd service..."
cat > /etc/systemd/system/pionex-trading-bot.service << EOF
[Unit]
Description=Pionex Trading Bot GUI
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/pionex-trading-bot
Environment=PATH=/opt/pionex-trading-bot/venv/bin
ExecStart=/opt/pionex-trading-bot/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Step 11: Setup Nginx configuration
print_status "Setting up Nginx configuration..."
cat > /etc/nginx/sites-available/pionex-trading-bot << EOF
server {
    listen 80;
    server_name _;  # Replace with your domain

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Static files
    location /static/ {
        alias /opt/pionex-trading-bot/static/;
        expires 30d;
    }
}
EOF

# Step 12: Enable Nginx site
print_status "Enabling Nginx site..."
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/pionex-trading-bot /etc/nginx/sites-enabled/

# Step 13: Setup firewall
print_status "Setting up firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443

# Step 14: Enable and start services
print_status "Starting services..."
systemctl daemon-reload
systemctl enable pionex-trading-bot
systemctl start pionex-trading-bot
systemctl enable nginx
systemctl start nginx

# Step 15: Test configuration
print_status "Testing configurations..."
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors"
fi

# Step 16: Check service status
print_status "Checking service status..."
systemctl status pionex-trading-bot --no-pager -l

# Step 17: Final instructions
echo ""
print_status "🎉 Deployment completed successfully!"
echo ""
print_warning "IMPORTANT: Please complete these steps manually:"
echo "1. Edit the environment file: nano /opt/pionex-trading-bot/.env"
echo "2. Add your Pionex API credentials to the .env file"
echo "3. Restart the service: systemctl restart pionex-trading-bot"
echo "4. Access the application at: http://your_vps_ip"
echo ""
print_status "Useful commands:"
echo "- Check service status: systemctl status pionex-trading-bot"
echo "- View logs: journalctl -u pionex-trading-bot -f"
echo "- Restart service: systemctl restart pionex-trading-bot"
echo "- Check nginx logs: tail -f /var/log/nginx/access.log"
echo ""
print_status "Deployment script completed!" 
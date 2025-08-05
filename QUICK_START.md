# 🚀 Quick Start Guide - VPS Deployment (বাংলা)

## ⚡ দ্রুত Deployment (5 মিনিটে)

### Step 1: VPS এ Login করুন
```bash
ssh root@your_vps_ip_address
```

### Step 2: Deployment Script Download করুন
```bash
wget https://raw.githubusercontent.com/Telegram-Airdrop-Bot/pionex-trading-bot/main/deploy.sh
chmod +x deploy.sh
```

### Step 3: Script Run করুন
```bash
./deploy.sh
```

### Step 4: API Credentials Setup করুন
```bash
nano /opt/pionex-trading-bot/.env
```

এই file এ আপনার Pionex API credentials দিন:
```env
PIONEX_API_KEY=your_actual_api_key
PIONEX_SECRET_KEY=your_actual_secret_key
SECRET_KEY=your_random_secret_key
```

### Step 5: Service Restart করুন
```bash
systemctl restart pionex-trading-bot
```

### Step 6: Access করুন
Browser এ visit করুন: `http://your_vps_ip`

## 🔧 Manual Deployment (Step-by-Step)

### 1. System Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install packages
sudo apt install -y python3 python3-pip python3-venv nginx git
```

### 2. Project Setup
```bash
# Create directory
mkdir -p /opt/pionex-trading-bot
cd /opt/pionex-trading-bot

# Clone repository
git clone https://github.com/Telegram-Airdrop-Bot/pionex-trading-bot.git .

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configuration
```bash
# Copy environment file
cp env_gui_example.txt .env

# Edit environment file
nano .env
```

### 4. Service Setup
```bash
# Create service file
sudo nano /etc/systemd/system/pionex-trading-bot.service
```

Service file content:
```ini
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
```

### 5. Start Services
```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable pionex-trading-bot
sudo systemctl start pionex-trading-bot

# Check status
sudo systemctl status pionex-trading-bot
```

## 📊 Monitoring Commands

### Service Management
```bash
# Check status
systemctl status pionex-trading-bot

# View logs
journalctl -u pionex-trading-bot -f

# Restart service
systemctl restart pionex-trading-bot

# Stop service
systemctl stop pionex-trading-bot
```

### Application Logs
```bash
# View application logs
tail -f /opt/pionex-trading-bot/logs/trading_bot.log

# View system logs
sudo journalctl -u pionex-trading-bot -f
```

### Network Check
```bash
# Check if port is listening
netstat -tlnp | grep :5000

# Check nginx status
systemctl status nginx
```

## 🔒 Security Setup

### Firewall Configuration
```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### SSL Certificate (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your_domain.com
```

## 🚨 Troubleshooting

### Common Issues:

1. **Service won't start:**
   ```bash
   # Check logs
   journalctl -u pionex-trading-bot -f
   
   # Check permissions
   sudo chown -R root:root /opt/pionex-trading-bot
   sudo chmod -R 755 /opt/pionex-trading-bot
   ```

2. **Port already in use:**
   ```bash
   # Find process using port 5000
   sudo lsof -i :5000
   
   # Kill process
   sudo kill -9 <PID>
   ```

3. **Import errors:**
   ```bash
   # Reinstall dependencies
   cd /opt/pionex-trading-bot
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Database issues:**
   ```bash
   # Fix database permissions
   sudo chmod 644 /opt/pionex-trading-bot/trading_bot.db
   ```

## 📞 Support

যদি কোন সমস্যা হয়:

1. **Logs check করুন:**
   ```bash
   journalctl -u pionex-trading-bot -f
   tail -f /opt/pionex-trading-bot/logs/trading_bot.log
   ```

2. **Service status check করুন:**
   ```bash
   systemctl status pionex-trading-bot
   ```

3. **Configuration verify করুন:**
   ```bash
   cat /opt/pionex-trading-bot/.env
   ```

4. **Network test করুন:**
   ```bash
   curl -I http://localhost:5000
   ```

## 🎯 Success Indicators

Deployment successful হলে আপনি দেখতে পাবেন:

✅ Service running: `systemctl status pionex-trading-bot`  
✅ Port listening: `netstat -tlnp | grep :5000`  
✅ Web interface accessible: `http://your_vps_ip`  
✅ Logs showing: `journalctl -u pionex-trading-bot -f`

এই guide follow করে আপনি quickly এবং easily VPS এ Pionex Trading Bot GUI deploy করতে পারবেন! 
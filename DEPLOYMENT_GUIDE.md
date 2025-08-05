# Pionex Trading Bot GUI - VPS Deployment Guide (বাংলা)

## 🚀 VPS এ Deploy করার Step-by-Step Process

### Step 1: VPS Setup এবং Preparation

#### 1.1 VPS কিনুন/Setup করুন
- **DigitalOcean, Vultr, Linode, AWS EC2** - যেকোনো একটি থেকে VPS কিনুন
- **Minimum Requirements:**
  - RAM: 2GB (4GB recommended)
  - Storage: 20GB SSD
  - CPU: 1 Core (2 Core recommended)
  - OS: Ubuntu 20.04 LTS বা 22.04 LTS

#### 1.2 VPS এ Connect করুন
```bash
# SSH দিয়ে VPS এ connect করুন
ssh root@your_vps_ip_address

# বা যদি key-based authentication থাকে
ssh -i your_key.pem root@your_vps_ip_address
```

#### 1.3 System Update করুন
```bash
# System update
sudo apt update && sudo apt upgrade -y

# Essential packages install করুন
sudo apt install -y curl wget git unzip software-properties-common
```

### Step 2: Python Environment Setup

#### 2.1 Python Install করুন
```bash
# Python 3.9+ install করুন
sudo apt install -y python3 python3-pip python3-venv

# Python version check করুন
python3 --version
```

#### 2.2 Project Directory Create করুন
```bash
# Project directory create করুন
mkdir -p /opt/pionex-trading-bot
cd /opt/pionex-trading-bot

# Git repository clone করুন
git clone https://github.com/Telegram-Airdrop-Bot/pionex-trading-bot.git .
```

#### 2.3 Virtual Environment Setup করুন
```bash
# Virtual environment create করুন
python3 -m venv venv

# Virtual environment activate করুন
source venv/bin/activate

# Requirements install করুন
pip install -r requirements.txt
```

### Step 3: Environment Configuration

#### 3.1 Environment File Setup করুন
```bash
# .env file create করুন
cp env_gui_example.txt .env

# .env file edit করুন
nano .env
```

#### 3.2 .env File এ এই Information দিন:
```env
# Pionex API Credentials (Required)
PIONEX_API_KEY=your_actual_pionex_api_key
PIONEX_SECRET_KEY=your_actual_pionex_secret_key

# Flask Secret Key (Required for session management)
SECRET_KEY=your_secure_random_secret_key_here

# Database Configuration
DATABASE_URL=sqlite:///trading_bot.db

# Logging Level
LOG_LEVEL=INFO

# GUI Configuration
GUI_HOST=0.0.0.0
GUI_PORT=5000
GUI_DEBUG=false
```

### Step 4: Database Setup

#### 4.1 Database Initialize করুন
```bash
# Database directory create করুন
mkdir -p logs
mkdir -p data

# Database permissions set করুন
chmod 755 data/
chmod 644 trading_bot.db
```

### Step 5: Systemd Service Setup

#### 5.1 Service File Create করুন
```bash
# Service file create করুন
sudo nano /etc/systemd/system/pionex-trading-bot.service
```

#### 5.2 Service File এ এই Content দিন:
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

#### 5.3 Service Enable করুন
```bash
# Service reload করুন
sudo systemctl daemon-reload

# Service enable করুন
sudo systemctl enable pionex-trading-bot

# Service start করুন
sudo systemctl start pionex-trading-bot

# Service status check করুন
sudo systemctl status pionex-trading-bot
```

### Step 6: Nginx Setup (Reverse Proxy)

#### 6.1 Nginx Install করুন
```bash
# Nginx install করুন
sudo apt install -y nginx

# Nginx start করুন
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 6.2 Nginx Configuration
```bash
# Default site disable করুন
sudo rm /etc/nginx/sites-enabled/default

# New site configuration create করুন
sudo nano /etc/nginx/sites-available/pionex-trading-bot
```

#### 6.3 Nginx Configuration File এ এই Content দিন:
```nginx
server {
    listen 80;
    server_name your_domain.com;  # আপনার domain name দিন

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Static files
    location /static/ {
        alias /opt/pionex-trading-bot/static/;
        expires 30d;
    }
}
```

#### 6.4 Nginx Configuration Enable করুন
```bash
# Site enable করুন
sudo ln -s /etc/nginx/sites-available/pionex-trading-bot /etc/nginx/sites-enabled/

# Nginx configuration test করুন
sudo nginx -t

# Nginx reload করুন
sudo systemctl reload nginx
```

### Step 7: Firewall Setup

#### 7.1 UFW Firewall Setup করুন
```bash
# UFW install করুন
sudo apt install -y ufw

# Default policies set করুন
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH allow করুন
sudo ufw allow ssh

# HTTP এবং HTTPS allow করুন
sudo ufw allow 80
sudo ufw allow 443

# UFW enable করুন
sudo ufw enable

# UFW status check করুন
sudo ufw status
```

### Step 8: SSL Certificate Setup (Optional but Recommended)

#### 8.1 Let's Encrypt SSL Install করুন
```bash
# Certbot install করুন
sudo apt install -y certbot python3-certbot-nginx

# SSL certificate obtain করুন
sudo certbot --nginx -d your_domain.com

# Auto-renewal setup করুন
sudo crontab -e
# Add this line: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Step 9: Monitoring এবং Logs

#### 9.1 Log Monitoring Setup করুন
```bash
# Log directory permissions set করুন
sudo chown -R root:root /opt/pionex-trading-bot/logs
sudo chmod -R 755 /opt/pionex-trading-bot/logs

# Log rotation setup করুন
sudo nano /etc/logrotate.d/pionex-trading-bot
```

#### 9.2 Log Rotation Configuration:
```
/opt/pionex-trading-bot/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

### Step 10: Testing এবং Verification

#### 10.1 Application Test করুন
```bash
# Service status check করুন
sudo systemctl status pionex-trading-bot

# Logs check করুন
sudo journalctl -u pionex-trading-bot -f

# Port check করুন
sudo netstat -tlnp | grep :5000
```

#### 10.2 Web Interface Access করুন
- Browser এ `http://your_vps_ip` বা `https://your_domain.com` visit করুন
- GUI interface দেখতে পাবেন

### Step 11: Maintenance Commands

#### 11.1 Service Management
```bash
# Service restart
sudo systemctl restart pionex-trading-bot

# Service stop
sudo systemctl stop pionex-trading-bot

# Service start
sudo systemctl start pionex-trading-bot

# Service status
sudo systemctl status pionex-trading-bot
```

#### 11.2 Logs Check
```bash
# Application logs
tail -f /opt/pionex-trading-bot/logs/trading_bot.log

# System logs
sudo journalctl -u pionex-trading-bot -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### 11.3 Update Process
```bash
# Code update
cd /opt/pionex-trading-bot
git pull origin main

# Dependencies update
source venv/bin/activate
pip install -r requirements.txt

# Service restart
sudo systemctl restart pionex-trading-bot
```

## 🔧 Troubleshooting

### Common Issues:

1. **Port 5000 Already in Use:**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **Permission Issues:**
   ```bash
   sudo chown -R root:root /opt/pionex-trading-bot
   sudo chmod -R 755 /opt/pionex-trading-bot
   ```

3. **Database Issues:**
   ```bash
   sudo chmod 644 /opt/pionex-trading-bot/trading_bot.db
   ```

4. **Nginx Issues:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 📊 Monitoring Tools

### 1. System Monitoring
```bash
# CPU, Memory, Disk usage
htop
df -h
free -h
```

### 2. Application Monitoring
```bash
# Process monitoring
ps aux | grep python
ps aux | grep pionex
```

### 3. Network Monitoring
```bash
# Network connections
netstat -tlnp
ss -tlnp
```

## 🔒 Security Best Practices

1. **SSH Security:**
   ```bash
   # SSH key-based authentication setup করুন
   # Password authentication disable করুন
   sudo nano /etc/ssh/sshd_config
   ```

2. **Firewall Rules:**
   ```bash
   # Only necessary ports open করুন
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   ```

3. **Regular Updates:**
   ```bash
   # System updates
   sudo apt update && sudo apt upgrade -y
   ```

## 📞 Support

যদি কোন সমস্যা হয়:
1. Logs check করুন
2. Service status check করুন
3. Network connectivity test করুন
4. Configuration files verify করুন

এই guide follow করে আপনি successfully VPS এ Pionex Trading Bot GUI deploy করতে পারবেন। 
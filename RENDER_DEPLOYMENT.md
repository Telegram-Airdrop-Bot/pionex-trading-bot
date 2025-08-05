# 🚀 Render.com এ Pionex Trading Bot GUI Deploy করার Guide (বাংলা)

## 📋 Render.com এ Deploy করার Step-by-Step Process

### Step 1: Render.com Account Setup

#### 1.1 Render.com এ Account Create করুন
- [Render.com](https://render.com) এ visit করুন
- Sign up করুন (GitHub, Google, বা Email দিয়ে)
- Email verify করুন

#### 1.2 GitHub Repository Connect করুন
- GitHub account connect করুন
- আপনার repository access দিন: `Telegram-Airdrop-Bot/pionex-trading-bot`

### Step 2: Render.com এ New Service Create করুন

#### 2.1 New Web Service Create করুন
```bash
# Render Dashboard এ যান
# "New" → "Web Service" click করুন
# GitHub repository select করুন: pionex-trading-bot
```

#### 2.2 Service Configuration Setup করুন
```
Service Name: pionex-trading-bot-gui
Environment: Python 3
Region: Singapore (Asia) বা আপনার নিকটবর্তী region
Branch: main
Root Directory: . (leave empty)
```

### Step 3: Build Configuration

#### 3.1 Build Command Setup করুন
```bash
# Build Command:
pip install -r requirements.txt

# Start Command:
python main.py
```

#### 3.2 Environment Variables Setup করুন
Render Dashboard এ "Environment" tab এ যান এবং এই variables add করুন:

```env
# Required Environment Variables
PIONEX_API_KEY=your_actual_pionex_api_key
PIONEX_SECRET_KEY=your_actual_pionex_secret_key
SECRET_KEY=your_secure_random_secret_key_here

# Optional Configuration
DATABASE_URL=sqlite:///trading_bot.db
LOG_LEVEL=INFO
GUI_HOST=0.0.0.0
GUI_PORT=10000
GUI_DEBUG=false
```

### Step 4: Application Configuration

#### 4.1 Render-specific Configuration
Render.com এ port 10000 use করতে হবে। `gui_app.py` file এ এই changes করুন:

```python
# Render.com configuration
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"🚀 Starting Pionex Trading Bot GUI on {host}:{port}")
    
    # Start the application
    socketio.run(app, host=host, port=port, debug=False)
```

#### 4.2 Requirements.txt Update করুন
```txt
# Core Flask Framework
Flask==2.3.3
Flask-SocketIO==5.3.6
python-socketio==5.8.0
python-engineio==4.7.1

# Environment and Configuration
python-dotenv==1.0.0
PyYAML==6.0.1

# Database
SQLAlchemy==2.0.21

# HTTP Requests
requests==2.31.0
urllib3==2.0.4

# Cryptography and Security
cryptography==41.0.4

# Data Processing
pandas==2.0.3
numpy==1.24.3

# Technical Analysis
ta==0.10.2
scipy==1.11.1

# WebSocket Support
websocket-client==1.6.1

# Additional Utilities
schedule==1.2.0
psutil==5.9.5

# Production Server
gunicorn==21.2.0
eventlet==0.33.3
```

### Step 5: Database Configuration

#### 5.1 SQLite Database Setup
Render.com এ persistent storage এর জন্য:

```python
# Database configuration for Render
import os
from pathlib import Path

# Create data directory
data_dir = Path("/opt/render/project/src/data")
data_dir.mkdir(exist_ok=True)

# Database path
DATABASE_PATH = data_dir / "trading_bot.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
```

#### 5.2 Logs Directory Setup
```python
# Logs directory setup
logs_dir = Path("/opt/render/project/src/logs")
logs_dir.mkdir(exist_ok=True)
```

### Step 6: Deploy Configuration Files

#### 6.1 Create `render.yaml` Configuration
```yaml
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
```

#### 6.2 Create `render-build.sh` Script
```bash
#!/bin/bash
# Render build script

echo "🚀 Starting Pionex Trading Bot GUI build..."

# Install dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p data
mkdir -p logs
mkdir -p static/css
mkdir -p static/js
mkdir -p templates

# Set permissions
chmod 755 data/
chmod 755 logs/

echo "✅ Build completed successfully!"
```

### Step 7: Application Code Updates

#### 7.1 Update `main.py` for Render
```python
#!/usr/bin/env python3
"""
Pionex Trading Bot GUI - Main Entry Point for Render.com
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def main():
    """Main entry point for the GUI on Render.com"""
    print("🚀 Starting Pionex Trading Bot GUI on Render.com...")
    
    # Create necessary directories
    data_dir = Path("/opt/render/project/src/data")
    logs_dir = Path("/opt/render/project/src/logs")
    
    data_dir.mkdir(exist_ok=True)
    logs_dir.mkdir(exist_ok=True)
    
    # Import and run the GUI
    try:
        from gui_app import main as gui_main
        gui_main()
        return 0
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Please ensure all dependencies are installed.")
        return 1
    except Exception as e:
        print(f"❌ Error starting GUI: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
```

#### 7.2 Update `gui_app.py` for Render
```python
# Render.com specific configuration
import os
from pathlib import Path

# Render.com environment setup
if os.environ.get('RENDER'):
    # Render.com specific paths
    DATA_DIR = Path("/opt/render/project/src/data")
    LOGS_DIR = Path("/opt/render/project/src/logs")
    
    DATA_DIR.mkdir(exist_ok=True)
    LOGS_DIR.mkdir(exist_ok=True)
    
    # Update database path
    DATABASE_PATH = DATA_DIR / "trading_bot.db"
    DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
    
    # Update logs path
    LOG_PATH = LOGS_DIR / "trading_bot.log"
    
    # Render.com port configuration
    PORT = int(os.environ.get("PORT", 10000))
    HOST = os.environ.get("HOST", "0.0.0.0")
else:
    # Local development configuration
    PORT = int(os.environ.get("PORT", 5000))
    HOST = os.environ.get("HOST", "127.0.0.1")

# Update the main function
def main():
    """Main function for Render.com deployment"""
    print(f"🚀 Starting Pionex Trading Bot GUI on {HOST}:{PORT}")
    
    # Start the application
    socketio.run(app, host=HOST, port=PORT, debug=False)

if __name__ == "__main__":
    main()
```

### Step 8: Deploy to Render.com

#### 8.1 Manual Deployment Steps
1. **Render Dashboard এ যান**
2. **"New Web Service" click করুন**
3. **GitHub repository connect করুন**
4. **Service configuration setup করুন:**
   ```
   Name: pionex-trading-bot-gui
   Environment: Python 3
   Region: Singapore (Asia)
   Branch: main
   Build Command: pip install -r requirements.txt
   Start Command: python main.py
   ```

#### 8.2 Environment Variables Setup
Render Dashboard এ "Environment" tab এ এই variables add করুন:

```env
# Required
PIONEX_API_KEY=your_actual_pionex_api_key
PIONEX_SECRET_KEY=your_actual_pionex_secret_key
SECRET_KEY=your_secure_random_secret_key_here

# Optional
DATABASE_URL=sqlite:///data/trading_bot.db
LOG_LEVEL=INFO
GUI_HOST=0.0.0.0
GUI_PORT=10000
GUI_DEBUG=false
RENDER=true
```

### Step 9: Post-Deployment Configuration

#### 9.1 Service Verification
Deployment complete হওয়ার পর:

1. **Service URL check করুন**
2. **Logs verify করুন**
3. **Environment variables confirm করুন**

#### 9.2 Custom Domain Setup (Optional)
```bash
# Render Dashboard এ "Settings" tab এ যান
# "Custom Domains" section এ custom domain add করুন
# DNS records update করুন
```

### Step 10: Monitoring এবং Maintenance

#### 10.1 Render.com Monitoring
- **Logs**: Render Dashboard → Your Service → Logs
- **Metrics**: Render Dashboard → Your Service → Metrics
- **Deployments**: Render Dashboard → Your Service → Deployments

#### 10.2 Application Monitoring
```python
# Add health check endpoint
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'pionex-trading-bot-gui'
    })
```

### Step 11: Troubleshooting

#### 11.1 Common Issues

1. **Build Failures:**
   ```bash
   # Check requirements.txt
   # Verify Python version compatibility
   # Check for missing dependencies
   ```

2. **Runtime Errors:**
   ```bash
   # Check Render logs
   # Verify environment variables
   # Check database permissions
   ```

3. **Port Issues:**
   ```python
   # Ensure using PORT environment variable
   port = int(os.environ.get("PORT", 10000))
   ```

4. **Database Issues:**
   ```python
   # Ensure data directory exists
   # Check file permissions
   # Verify database path
   ```

#### 11.2 Debug Commands
```bash
# Check Render logs
# Render Dashboard → Your Service → Logs

# Check environment variables
# Render Dashboard → Your Service → Environment

# Restart service
# Render Dashboard → Your Service → Manual Deploy
```

### Step 12: Security Best Practices

#### 12.1 Environment Variables Security
- **Never commit API keys** to Git
- **Use Render environment variables**
- **Rotate keys regularly**

#### 12.2 Application Security
```python
# Add security headers
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response
```

### Step 13: Performance Optimization

#### 13.1 Render.com Optimization
```python
# Enable gzip compression
from flask_compress import Compress
compress = Compress()
compress.init_app(app)

# Cache static files
@app.after_request
def add_cache_headers(response):
    if 'static' in request.path:
        response.cache_control.max_age = 31536000
    return response
```

#### 13.2 Database Optimization
```python
# SQLite optimization for Render
import sqlite3

def optimize_database():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA cache_size=10000")
    conn.close()
```

## 🎯 Success Indicators

Render.com deployment successful হলে আপনি দেখতে পাবেন:

✅ **Service Status**: Active  
✅ **Build Status**: Build successful  
✅ **Deployment URL**: https://your-app-name.onrender.com  
✅ **Health Check**: `/health` endpoint responding  
✅ **Logs**: No errors in Render logs  

## 📞 Support

যদি কোন সমস্যা হয়:

1. **Render Logs check করুন**
2. **Environment variables verify করুন**
3. **Build logs analyze করুন**
4. **Service status check করুন**

এই guide follow করে আপনি successfully Render.com এ Pionex Trading Bot GUI deploy করতে পারবেন! 
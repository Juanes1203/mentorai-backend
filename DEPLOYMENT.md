# 🚀 MentorAI Deployment Guide for Ubuntu

This guide will help you deploy the MentorAI application on an Ubuntu server.

## 📋 Prerequisites

- Ubuntu 20.04 LTS or later
- Root or sudo access
- A domain name (optional but recommended)
- At least 2GB RAM and 20GB storage

## 🛠️ Dependencies Required

### Core Dependencies
- **Node.js 20.x** - JavaScript runtime
- **npm** - Package manager
- **MySQL 8.0** - Database server
- **PM2** - Process manager
- **nginx** - Web server and reverse proxy

### Audio Processing Dependencies (for WhisperX)
- **FFmpeg** - Audio/video processing
- **Python 3.8+** - For WhisperX dependencies
- **PyTorch** - Machine learning framework
- **Additional codecs** - For audio format support

### System Libraries
- **Build tools** - For compiling native modules
- **Graphics libraries** - For WhisperX processing
- **Audio libraries** - For audio processing

## 🚀 Quick Setup

### 1. Run the Setup Script

```bash
# Download and run the setup script
wget https://raw.githubusercontent.com/Juanes1203/mentorai-backend/main/ubuntu-setup.sh
chmod +x ubuntu-setup.sh
./ubuntu-setup.sh
```

### 2. Run the Deployment Script

```bash
# Download and run the deployment script
wget https://raw.githubusercontent.com/Juanes1203/mentorai-backend/main/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

## 📦 Manual Installation

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Install MySQL

```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql_secure_installation
```

### 4. Install PM2

```bash
sudo npm install -g pm2
```

### 5. Install nginx

```bash
sudo apt install -y nginx
```

### 6. Install Audio Processing Dependencies

```bash
# FFmpeg and codecs
sudo apt install -y ffmpeg libavcodec-extra

# Python and PyTorch
sudo apt install -y python3 python3-pip
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Additional libraries
sudo apt install -y libgl1-mesa-glx libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1
```

### 7. Configure Firewall

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # Backend API
sudo ufw --force enable
```

## 🗄️ Database Setup

### 1. Create Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE mentorai_db;
USE mentorai_db;
SOURCE /path/to/mentorai-backend/database/schema.sql;
EXIT;
```

### 2. Create Database User (Recommended)

```sql
CREATE USER 'mentorai_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON mentorai_db.* TO 'mentorai_user'@'localhost';
FLUSH PRIVILEGES;
```

## ⚙️ Configuration

### 1. Backend Configuration

Create `/var/www/mentorai/backend/.env`:

```env
# Production Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=mentorai_user
DB_PASSWORD=your_secure_password
DB_NAME=mentorai_db
DB_PORT=3306

# Frontend URL
FRONTEND_URL=https://your-domain.com

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_super_secure_jwt_secret_here

# CORS Configuration
CORS_ORIGIN=https://your-domain.com
```

### 2. Frontend Configuration

Create `/var/www/mentorai/frontend/.env`:

```env
# Production Environment Variables
VITE_API_BASE_URL=https://your-domain.com/api

# API Keys
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here
VITE_STRAICO_API_KEY=your_straico_key_here

# Development Settings
VITE_DEV_MODE=false
VITE_DEBUG_ENABLED=false
```

## 🚀 Deployment Steps

### 1. Clone Repositories

```bash
sudo mkdir -p /var/www/mentorai
sudo chown $USER:$USER /var/www/mentorai
cd /var/www/mentorai

git clone https://github.com/Juanes1203/mentorai-backend.git backend
git clone https://github.com/Juanes1203/mentorai-frontend.git frontend
```

### 2. Install Dependencies

```bash
# Backend
cd /var/www/mentorai/backend
npm install
npm run build

# Frontend
cd /var/www/mentorai/frontend
npm install
npm run build
```

### 3. Start Backend with PM2

```bash
cd /var/www/mentorai/backend
pm2 start dist/index.js --name mentorai-backend
pm2 save
pm2 startup
```

### 4. Configure nginx

Create `/etc/nginx/sites-available/mentorai`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /var/www/mentorai/frontend/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

Enable the site:

```bash
sudo ln -sf /etc/nginx/sites-available/mentorai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL Configuration (Recommended)

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Get SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 📊 Management Commands

### PM2 Commands
```bash
pm2 status                    # Check application status
pm2 logs mentorai-backend    # View backend logs
pm2 restart mentorai-backend # Restart backend
pm2 stop mentorai-backend    # Stop backend
pm2 delete mentorai-backend  # Remove from PM2
```

### nginx Commands
```bash
sudo nginx -t                 # Test configuration
sudo systemctl restart nginx  # Restart nginx
sudo systemctl status nginx   # Check nginx status
```

### MySQL Commands
```bash
sudo systemctl status mysql   # Check MySQL status
sudo systemctl restart mysql  # Restart MySQL
mysql -u root -p             # Access MySQL
```

## 🔧 Troubleshooting

### Check Logs
```bash
# Backend logs
pm2 logs mentorai-backend

# nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### Common Issues

1. **Port 3000 already in use:**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Permission denied:**
   ```bash
   sudo chown -R $USER:$USER /var/www/mentorai
   ```

3. **Database connection failed:**
   - Check MySQL service: `sudo systemctl status mysql`
   - Verify credentials in `.env` file
   - Test connection: `mysql -u mentorai_user -p mentorai_db`

4. **Frontend not loading:**
   - Check nginx configuration: `sudo nginx -t`
   - Verify build files exist: `ls -la /var/www/mentorai/frontend/dist`

## 📈 Monitoring

### System Resources
```bash
htop                    # System resources
df -h                   # Disk usage
free -h                 # Memory usage
```

### Application Monitoring
```bash
pm2 monit              # PM2 monitoring dashboard
pm2 logs --lines 100   # Recent logs
```

## 🔄 Updates

### Update Application
```bash
cd /var/www/mentorai/backend
git pull origin main
npm install
npm run build
pm2 restart mentorai-backend

cd /var/www/mentorai/frontend
git pull origin main
npm install
npm run build
sudo systemctl restart nginx
```

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

## 📞 Support

If you encounter issues:

1. Check the logs using the commands above
2. Verify all dependencies are installed correctly
3. Ensure firewall rules are properly configured
4. Test database connectivity
5. Verify nginx configuration syntax

For additional help, check the GitHub repositories:
- Backend: https://github.com/Juanes1203/mentorai-backend
- Frontend: https://github.com/Juanes1203/mentorai-frontend 
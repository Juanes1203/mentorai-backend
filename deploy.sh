#!/bin/bash

# MentorAI Deployment Script
# This script deploys the MentorAI application on Ubuntu

set -e  # Exit on any error

echo "🚀 Starting MentorAI Deployment..."
echo "=================================="

# Configuration
APP_DIR="/var/www/mentorai"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
DB_NAME="mentorai_db"

# Create application directory structure
echo "📁 Creating application directory structure..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
mkdir -p $BACKEND_DIR $FRONTEND_DIR

# Clone repositories
echo "📥 Cloning repositories..."
cd $BACKEND_DIR
git clone https://github.com/Juanes1203/mentorai-backend.git .
cd $FRONTEND_DIR
git clone https://github.com/Juanes1203/mentorai-frontend.git .

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd $BACKEND_DIR
npm install
npm run build

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd $FRONTEND_DIR
npm install
npm run build

# Set up database
echo "🗄️ Setting up database..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
mysql -u root -p $DB_NAME < $BACKEND_DIR/database/schema.sql

# Create production environment files
echo "⚙️ Creating production environment files..."

# Backend .env
cat > $BACKEND_DIR/.env << EOF
# Production Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=$DB_NAME
DB_PORT=3306

# Frontend URL
FRONTEND_URL=https://your-domain.com

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your_super_secure_jwt_secret_here_change_this_in_production

# CORS Configuration
CORS_ORIGIN=https://your-domain.com
EOF

# Frontend .env
cat > $FRONTEND_DIR/.env << EOF
# Production Environment Variables
VITE_API_BASE_URL=https://your-domain.com/api

# API Keys (if needed)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here
VITE_STRAICO_API_KEY=your_straico_key_here

# Development Settings
VITE_DEV_MODE=false
VITE_DEBUG_ENABLED=false
EOF

# Create PM2 ecosystem file
echo "⚡ Creating PM2 configuration..."
cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'mentorai-backend',
      cwd: '$BACKEND_DIR',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/mentorai/backend-error.log',
      out_file: '/var/log/mentorai/backend-out.log',
      log_file: '/var/log/mentorai/backend-combined.log',
      time: true
    }
  ]
};
EOF

# Create log directory
sudo mkdir -p /var/log/mentorai
sudo chown $USER:$USER /var/log/mentorai

# Start backend with PM2
echo "🚀 Starting backend with PM2..."
cd $BACKEND_DIR
pm2 start ecosystem.config.js

# Configure nginx
echo "🌐 Configuring nginx..."
sudo tee /etc/nginx/sites-available/mentorai << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root $FRONTEND_DIR/dist;
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/mentorai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Save PM2 configuration
pm2 save
pm2 startup

echo ""
echo "✅ Deployment completed successfully!"
echo "===================================="
echo ""
echo "🔗 Application URLs:"
echo "   Frontend: http://your-domain.com"
echo "   Backend API: http://your-domain.com/api"
echo ""
echo "📊 Management commands:"
echo "   pm2 status                    # Check application status"
echo "   pm2 logs mentorai-backend    # View backend logs"
echo "   pm2 restart mentorai-backend # Restart backend"
echo "   sudo systemctl restart nginx # Restart nginx"
echo ""
echo "🔧 Configuration files:"
echo "   Backend .env: $BACKEND_DIR/.env"
echo "   Frontend .env: $FRONTEND_DIR/.env"
echo "   Nginx config: /etc/nginx/sites-available/mentorai"
echo ""
echo "⚠️  IMPORTANT: Update the following in production:"
echo "   1. Replace 'your-domain.com' with your actual domain"
echo "   2. Update database password in backend .env"
echo "   3. Change JWT_SECRET to a secure random string"
echo "   4. Update API keys in frontend .env"
echo "   5. Configure SSL certificate with Let's Encrypt"
echo "" 
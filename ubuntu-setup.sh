#!/bin/bash

# Ubuntu Setup Script for MentorAI Application
# This script installs all necessary dependencies for deploying MentorAI

set -e  # Exit on any error

echo "🚀 Starting MentorAI Ubuntu Setup..."
echo "======================================"

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential build tools
echo "🔧 Installing essential build tools..."
sudo apt install -y curl wget git unzip build-essential

# Install Node.js 20.x (LTS)
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install MySQL Server
echo "🗄️ Installing MySQL Server..."
sudo apt install -y mysql-server

# Start and enable MySQL service
echo "🔄 Starting MySQL service..."
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
echo "🔒 Securing MySQL installation..."
sudo mysql_secure_installation

# Install PM2 for process management
echo "⚡ Installing PM2 process manager..."
sudo npm install -g pm2

# Install nginx for reverse proxy (optional)
echo "🌐 Installing nginx..."
sudo apt install -y nginx

# Install additional dependencies for development
echo "📚 Installing additional development dependencies..."
sudo apt install -y python3 python3-pip

# Install FFmpeg for audio processing (needed for WhisperX)
echo "🎵 Installing FFmpeg for audio processing..."
sudo apt install -y ffmpeg

# Install additional audio codecs
echo "🎼 Installing audio codecs..."
sudo apt install -y libavcodec-extra

# Install Python dependencies for WhisperX
echo "🐍 Installing Python dependencies for WhisperX..."
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install additional system libraries
echo "📚 Installing additional system libraries..."
sudo apt install -y libgl1-mesa-glx libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/mentorai
sudo chown $USER:$USER /var/www/mentorai

# Configure firewall (optional)
echo "🔥 Configuring firewall..."
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # Backend API
sudo ufw allow 8080  # Frontend (if needed)
sudo ufw --force enable

echo ""
echo "✅ Ubuntu setup completed successfully!"
echo "======================================"
echo ""
echo "📋 Next steps:"
echo "1. Clone your repositories:"
echo "   git clone https://github.com/Juanes1203/mentorai-backend.git"
echo "   git clone https://github.com/Juanes1203/mentorai-frontend.git"
echo ""
echo "2. Set up the database:"
echo "   mysql -u root -p"
echo "   CREATE DATABASE mentorai_db;"
echo "   USE mentorai_db;"
echo "   SOURCE /path/to/your/schema.sql;"
echo ""
echo "3. Configure environment variables:"
echo "   - Copy .env.example to .env"
echo "   - Update database credentials"
echo "   - Set JWT_SECRET"
echo ""
echo "4. Install application dependencies:"
echo "   cd mentorai-backend && npm install"
echo "   cd mentorai-frontend && npm install"
echo ""
echo "5. Build and start the application:"
echo "   # Backend"
echo "   cd mentorai-backend && npm run build"
echo "   pm2 start dist/index.js --name mentorai-backend"
echo ""
echo "   # Frontend"
echo "   cd mentorai-frontend && npm run build"
echo "   # Serve with nginx or PM2"
echo ""
echo "🔗 Useful commands:"
echo "   pm2 status          # Check running processes"
echo "   pm2 logs            # View logs"
echo "   pm2 restart all     # Restart all processes"
echo "   sudo systemctl status mysql  # Check MySQL status"
echo "" 
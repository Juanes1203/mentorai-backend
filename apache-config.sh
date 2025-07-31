#!/bin/bash

# Apache Configuration Script for MentorAI Application
# This script configures Apache to serve the frontend and proxy to the backend

set -e  # Exit on any error

echo "🌐 Configuring Apache for MentorAI..."
echo "====================================="

# Configuration
FRONTEND_DIR="/var/www/mentorai/frontend"
BACKEND_DIR="/var/www/mentorai/backend"
APACHE_SITE_DIR="/etc/apache2/sites-available"
APACHE_ENABLED_DIR="/etc/apache2/sites-enabled"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Apache is installed
print_status "Checking Apache installation..."
if ! command -v apache2 &> /dev/null; then
    print_error "Apache is not installed. Please install it first:"
    echo "sudo apt install apache2"
    exit 1
fi

print_success "Apache is installed"

# Enable required Apache modules
print_status "Enabling required Apache modules..."
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl

# Create Apache virtual host configuration
print_status "Creating Apache virtual host configuration..."
sudo tee $APACHE_SITE_DIR/mentorai.conf << 'EOF'
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    DocumentRoot /var/www/mentorai/frontend/dist

    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
    Header always set Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'"

    # Frontend files
    <Directory /var/www/mentorai/frontend/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Cache static assets
    <LocationMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, immutable"
    </LocationMatch>

    # No cache for HTML files
    <LocationMatch "\.html$">
        Header set Cache-Control "no-cache, no-store, must-revalidate"
        Header set Pragma "no-cache"
        Header set Expires "0"
    </LocationMatch>

    # Backend API proxy
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api

    # Proxy settings
    ProxyTimeout 60
    ProxyBadHeader Ignore

    # Logs
    ErrorLog ${APACHE_LOG_DIR}/mentorai_error.log
    CustomLog ${APACHE_LOG_DIR}/mentorai_access.log combined
</VirtualHost>
EOF

# Disable default site
print_status "Disabling default Apache site..."
sudo a2dissite 000-default.conf

# Enable MentorAI site
print_status "Enabling MentorAI site..."
sudo a2ensite mentorai.conf

# Test Apache configuration
print_status "Testing Apache configuration..."
if sudo apache2ctl configtest; then
    print_success "Apache configuration is valid!"
else
    print_error "Apache configuration test failed!"
    exit 1
fi

# Restart Apache
print_status "Restarting Apache..."
sudo systemctl restart apache2

# Create test script
print_status "Creating test script..."
cat > /tmp/test-mentorai.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing MentorAI Installation..."
echo "=================================="

# Test Apache status
echo "1. Testing Apache status..."
if sudo systemctl is-active --quiet apache2; then
    echo "✅ Apache is running"
else
    echo "❌ Apache is not running"
fi

# Test backend
echo "2. Testing backend..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend is not responding"
fi

# Test frontend files
echo "3. Testing frontend files..."
if [ -d "/var/www/mentorai/frontend/dist" ] && [ "$(ls -A /var/www/mentorai/frontend/dist)" ]; then
    echo "✅ Frontend build files exist"
else
    echo "❌ Frontend build files missing"
fi

# Test Apache proxy
echo "4. Testing Apache proxy..."
if curl -s http://localhost/api/health > /dev/null; then
    echo "✅ Apache proxy is working"
else
    echo "❌ Apache proxy is not working"
fi

# Test frontend access
echo "5. Testing frontend access..."
if curl -s http://localhost/ | grep -q "MentorAI\|OnTrack"; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

echo ""
echo "🎯 Test completed!"
echo "Access your application at: http://your-server-ip"
EOF

chmod +x /tmp/test-mentorai.sh

print_success "Apache configuration completed successfully!"
echo ""
echo "🌐 Apache Configuration Summary"
echo "=============================="
echo ""
echo "📁 Frontend directory: $FRONTEND_DIR/dist"
echo "📁 Backend directory: $BACKEND_DIR"
echo "🌐 Apache config: $APACHE_SITE_DIR/mentorai.conf"
echo "📊 Log directory: /var/log/apache2/"
echo ""
echo "🔧 Configuration needed:"
echo "   1. Update domain in: $APACHE_SITE_DIR/mentorai.conf"
echo "   2. Update API keys in frontend .env file"
echo "   3. Configure SSL certificate (recommended)"
echo ""
echo "📋 Useful commands:"
echo "   sudo systemctl status apache2    # Check Apache status"
echo "   sudo apache2ctl configtest       # Test Apache config"
echo "   sudo systemctl restart apache2   # Restart Apache"
echo "   sudo tail -f /var/log/apache2/mentorai_error.log  # View errors"
echo "   /tmp/test-mentorai.sh            # Run tests"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://your-server-ip"
echo "   Backend API: http://your-server-ip/api"
echo ""
print_warning "Remember to replace 'your-domain.com' with your actual domain!"
echo "" 
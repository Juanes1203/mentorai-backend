#!/bin/bash

# Test Script for MentorAI Installation
# This script tests all components of the MentorAI application

set -e  # Exit on any error

echo "🧪 Testing MentorAI Installation..."
echo "=================================="

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

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo ""
    print_status "Testing: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "$test_name - PASSED"
        ((TESTS_PASSED++))
    else
        print_error "$test_name - FAILED"
        ((TESTS_FAILED++))
    fi
}

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "🌐 Server IP: $SERVER_IP"
echo ""

# Test 1: Check if Node.js is installed
run_test "Node.js Installation" "command -v node"

# Test 2: Check if npm is installed
run_test "npm Installation" "command -v npm"

# Test 3: Check if MySQL is running
run_test "MySQL Service" "sudo systemctl is-active --quiet mysql"

# Test 4: Check if Apache is running
run_test "Apache Service" "sudo systemctl is-active --quiet apache2"

# Test 5: Check if backend directory exists
run_test "Backend Directory" "[ -d '/var/www/mentorai/backend' ]"

# Test 6: Check if frontend directory exists
run_test "Frontend Directory" "[ -d '/var/www/mentorai/frontend' ]"

# Test 7: Check if backend is running on port 3000
run_test "Backend Port 3000" "curl -s http://localhost:3000/api/health > /dev/null"

# Test 8: Check if frontend build files exist
run_test "Frontend Build Files" "[ -d '/var/www/mentorai/frontend/dist' ] && [ \"\$(ls -A /var/www/mentorai/frontend/dist)\" ]"

# Test 9: Check if Apache proxy is working
run_test "Apache Proxy" "curl -s http://localhost/api/health > /dev/null"

# Test 10: Check if frontend is accessible via Apache
run_test "Frontend via Apache" "curl -s http://localhost/ | grep -q 'MentorAI\|OnTrack\|html'"

# Test 11: Check if database connection works
run_test "Database Connection" "mysql -u root -e 'USE mentorai_db; SELECT 1;' > /dev/null 2>&1"

# Test 12: Check if PM2 is managing backend
run_test "PM2 Backend Process" "pm2 list | grep -q 'mentorai-backend'"

# Test 13: Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    print_success "Disk Space ($DISK_USAGE%) - PASSED"
    ((TESTS_PASSED++))
else
    print_warning "Disk Space ($DISK_USAGE%) - WARNING"
    ((TESTS_FAILED++))
fi

# Test 14: Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEMORY_USAGE" -lt 90 ]; then
    print_success "Memory Usage ($MEMORY_USAGE%) - PASSED"
    ((TESTS_PASSED++))
else
    print_warning "Memory Usage ($MEMORY_USAGE%) - WARNING"
    ((TESTS_FAILED++))
fi

# Test 15: Check if firewall allows HTTP
run_test "Firewall HTTP" "sudo ufw status | grep -q '80.*ALLOW'"

# Test 16: Check if firewall allows HTTPS
run_test "Firewall HTTPS" "sudo ufw status | grep -q '443.*ALLOW'"

echo ""
echo "📊 Test Results Summary"
echo "======================"
echo "✅ Tests Passed: $TESTS_PASSED"
echo "❌ Tests Failed: $TESTS_FAILED"
echo "📈 Success Rate: $(( (TESTS_PASSED * 100) / (TESTS_PASSED + TESTS_FAILED) ))%"

echo ""
echo "🌐 Application URLs"
echo "=================="
echo "Frontend: http://$SERVER_IP"
echo "Backend API: http://$SERVER_IP/api"
echo "Health Check: http://$SERVER_IP/api/health"

echo ""
echo "🔧 Troubleshooting Commands"
echo "=========================="
echo "sudo systemctl status apache2          # Check Apache"
echo "sudo systemctl status mysql            # Check MySQL"
echo "pm2 status                             # Check PM2 processes"
echo "pm2 logs mentorai-backend             # View backend logs"
echo "sudo tail -f /var/log/apache2/mentorai_error.log  # View Apache errors"
echo "curl http://localhost:3000/api/health # Test backend directly"
echo "curl http://localhost/api/health       # Test backend via proxy"

echo ""
echo "📋 Manual Tests"
echo "==============="
echo "1. Open http://$SERVER_IP in your browser"
echo "2. Try to login with: maria.gonzalez@mentorai.com / teacher123"
echo "3. Check if the dashboard loads correctly"
echo "4. Test API endpoints via browser developer tools"

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "🎉 All tests passed! Your MentorAI installation is working correctly!"
else
    print_warning "⚠️  Some tests failed. Please check the troubleshooting commands above."
fi

echo "" 
#!/bin/bash

echo "🚀 Setting up FOGO Bot on server..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Install dependencies
echo "📦 Installing bot dependencies..."
npm install

# Set proper permissions
echo "🔒 Setting file permissions..."
chmod 600 .env
chmod +x *.js

# Create database if it doesn't exist
echo "🗄️ Initializing database..."
touch fogo_requests.db

echo ""
echo "✅ Server setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration:"
echo "   nano .env"
echo ""
echo "2. Start the bots:"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "3. Save PM2 configuration:"
echo "   pm2 save"
echo ""
echo "4. Set up auto-start on boot:"
echo "   pm2 startup"
echo ""
echo "5. Monitor your bots:"
echo "   pm2 status"
echo "   pm2 logs"
echo ""
echo "🎉 Your FOGO bot will now run 24/7!" 
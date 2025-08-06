# 🚀 FOGO Bot Server Deployment Guide

## 📋 Prerequisites

- A VPS/Cloud server (Ubuntu 20.04+ recommended)
- Node.js 16+ installed
- Git installed
- PM2 for process management

## 🔧 Server Setup

### Step 1: Connect to Your Server
```bash
ssh root@your-server-ip
```

### Step 2: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 3: Install Node.js
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 4: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Step 5: Create Bot Directory
```bash
mkdir ~/fogo-bot
cd ~/fogo-bot
```

### Step 6: Upload Your Bot Files
```bash
# Option A: Clone from Git (if you have a repository)
git clone https://github.com/your-username/fogo-bot.git .

# Option B: Upload files via SCP
# scp -r ./pyron-bot/* root@your-server-ip:~/fogo-bot/
```

### Step 7: Install Dependencies
```bash
npm install
```

### Step 8: Set Up Environment Variables
```bash
# Copy environment template
cp env.example .env

# Edit with your actual values
nano .env
```

**Required .env values:**
```env
DISCORD_TOKEN=your_discord_bot_token_here
FOGO_RPC_URL=https://testnet.fogo.io
FOGO_TOKEN_MINT=So11111111111111111111111111111111111111112
BOT_WALLET_PRIVATE_KEY=your_bot_wallet_private_key_here
DATABASE_PATH=./fogo_requests.db
```

### Step 9: Create PM2 Configuration
```bash
# Create ecosystem file
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    {
      name: 'fogo-bot',
      script: 'fogo-bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/fogo-bot-error.log',
      out_file: './logs/fogo-bot-out.log',
      log_file: './logs/fogo-bot-combined.log',
      time: true
    },
    {
      name: 'test-fogo-bot',
      script: 'test-fogo-bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/test-fogo-bot-error.log',
      out_file: './logs/test-fogo-bot-out.log',
      log_file: './logs/test-fogo-bot-combined.log',
      time: true
    }
  ]
};
```

### Step 10: Create Logs Directory
```bash
mkdir logs
```

### Step 11: Start the Bots
```bash
# Start both bots
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

### Step 12: Monitor Your Bots
```bash
# Check status
pm2 status

# View logs
pm2 logs fogo-bot
pm2 logs test-fogo-bot

# Monitor in real-time
pm2 monit
```

## 🔄 Management Commands

### Start/Stop Bots
```bash
# Start all bots
pm2 start ecosystem.config.js

# Stop all bots
pm2 stop all

# Restart all bots
pm2 restart all

# Stop specific bot
pm2 stop fogo-bot
pm2 stop test-fogo-bot
```

### View Logs
```bash
# View all logs
pm2 logs

# View specific bot logs
pm2 logs fogo-bot
pm2 logs test-fogo-bot

# Follow logs in real-time
pm2 logs --follow
```

### Update Bot
```bash
# Stop bots
pm2 stop all

# Pull latest code (if using Git)
git pull

# Install new dependencies
npm install

# Start bots
pm2 start ecosystem.config.js

# Save new configuration
pm2 save
```

## 📊 Monitoring & Maintenance

### Check Bot Status
```bash
pm2 status
```

### Monitor Resources
```bash
pm2 monit
```

### Check Database
```bash
# View database file
ls -la fogo_requests.db

# Check database size
du -h fogo_requests.db
```

### Backup Database
```bash
# Create backup
cp fogo_requests.db fogo_requests_backup_$(date +%Y%m%d_%H%M%S).db
```

## 🔒 Security Best Practices

### 1. Firewall Setup
```bash
# Install UFW
sudo apt install ufw

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS if needed
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

### 2. Secure Environment Variables
```bash
# Set proper permissions
chmod 600 .env

# Don't commit .env to Git
echo ".env" >> .gitignore
```

### 3. Regular Updates
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
npm update
```

## 🚨 Troubleshooting

### Bot Not Starting
```bash
# Check logs
pm2 logs fogo-bot

# Check environment variables
cat .env

# Test bot manually
node fogo-bot.js
```

### High Memory Usage
```bash
# Check memory usage
pm2 monit

# Restart if needed
pm2 restart fogo-bot
```

### Database Issues
```bash
# Check database file
ls -la *.db

# Backup and recreate if corrupted
cp fogo_requests.db fogo_requests_corrupted.db
rm fogo_requests.db
```

## 📈 Scaling Options

### Multiple Instances
```bash
# Scale to multiple instances
pm2 scale fogo-bot 2
pm2 scale test-fogo-bot 2
```

### Load Balancer
- Use Nginx as reverse proxy
- Set up multiple servers
- Use cloud load balancer

## 💰 Cost Estimation

### Monthly Costs (Approximate)
- **DigitalOcean Droplet**: $5-10/month
- **AWS EC2 t3.micro**: $8-12/month
- **Vultr**: $2.50-5/month
- **Linode**: $5-10/month

### Free Options
- **Railway**: Free tier available
- **Render**: Free tier available
- **Heroku**: Free tier (limited)

## 🎯 Quick Start Script

Create a setup script:
```bash
#!/bin/bash
# setup-bot.sh

echo "🚀 Setting up FOGO Bot..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create directory
mkdir -p ~/fogo-bot
cd ~/fogo-bot

# Install dependencies
npm install

# Create logs directory
mkdir logs

echo "✅ Setup complete! Edit .env file and run: pm2 start ecosystem.config.js"
```

Make it executable:
```bash
chmod +x setup-bot.sh
./setup-bot.sh
```

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check system resources: `htop`
3. Verify environment variables: `cat .env`
4. Test bot manually: `node fogo-bot.js` 
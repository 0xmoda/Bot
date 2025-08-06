#!/bin/bash

echo "🤖 FOGO Bot Monitoring Dashboard"
echo "=================================="
echo ""

# Check PM2 status
echo "📊 PM2 Status:"
pm2 status
echo ""

# Check bot logs (last 10 lines)
echo "📝 Recent Main Bot Logs:"
pm2 logs fogo-bot --lines 10 --nostream
echo ""

echo "📝 Recent Test Bot Logs:"
pm2 logs test-fogo-bot --lines 10 --nostream
echo ""

# Check system resources
echo "💻 System Resources:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "Memory Usage: $(free | grep Mem | awk '{printf("%.2f%%", $3/$2 * 100.0)}')"
echo "Disk Usage: $(df -h / | awk 'NR==2 {print $5}')"
echo ""

# Check database
echo "🗄️ Database Status:"
if [ -f "fogo_requests.db" ]; then
    echo "✅ Database exists"
    echo "📏 Database size: $(du -h fogo_requests.db | cut -f1)"
    echo "📅 Last modified: $(stat -c %y fogo_requests.db)"
else
    echo "❌ Database not found"
fi
echo ""

# Check environment variables
echo "🔧 Environment Check:"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    if grep -q "DISCORD_TOKEN" .env; then
        echo "✅ Discord token configured"
    else
        echo "❌ Discord token missing"
    fi
    if grep -q "BOT_WALLET_PRIVATE_KEY" .env; then
        echo "✅ Bot wallet configured"
    else
        echo "❌ Bot wallet missing"
    fi
else
    echo "❌ .env file not found"
fi
echo ""

# Check network connectivity
echo "🌐 Network Connectivity:"
if curl -s --connect-timeout 5 https://testnet.fogo.io > /dev/null; then
    echo "✅ Fogo network accessible"
else
    echo "❌ Cannot connect to Fogo network"
fi

if curl -s --connect-timeout 5 https://discord.com > /dev/null; then
    echo "✅ Discord accessible"
else
    echo "❌ Cannot connect to Discord"
fi
echo ""

echo "🎯 Quick Commands:"
echo "• View real-time logs: pm2 logs --follow"
echo "• Monitor resources: pm2 monit"
echo "• Restart bots: pm2 restart all"
echo "• Stop bots: pm2 stop all"
echo "• Start bots: pm2 start ecosystem.config.js"
echo "" 
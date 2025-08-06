# 🤖 FOGO Discord Bot

A Discord bot that allows users to request FOGO(Native) tokens through an interactive button interface.

## ✨ Features

- **Interactive Button Interface**: Users click a button to open a modal for wallet input
- **24-Hour Cooldown**: Prevents spam requests
- **Balance Checking**: Verifies user wallet balance before sending tokens
- **SQLite Database**: Stores user requests and timestamps locally
- **Input Validation**: Validates Solana wallet addresses
- **Test Mode**: Includes a test bot for safe testing
- **Friendly Error Messages**: Clear feedback for all scenarios

## 🚀 Quick Deploy

### Railway (Recommended - 5 minutes)
1. Fork this repository
2. Go to [Railway.app](https://railway.app/)
3. Connect your GitHub account
4. Deploy from this repository
5. Add environment variables (see below)

### Other Platforms
- **Render**: Free tier available
- **Heroku**: Classic choice
- **DigitalOcean App Platform**: Simple deployment

## 📋 Prerequisites

- Discord Bot Token
- Fogo RPC URL
- FOGO Token Mint Address
- Bot Wallet Private Key

## 🔧 Environment Variables

Create a `.env` file with:

```env
DISCORD_TOKEN=your_discord_bot_token
FOGO_RPC_URL=https://testnet.fogo.io
FOGO_TOKEN_MINT=So11111111111111111111111111111111111111112
BOT_WALLET_PRIVATE_KEY=your_private_key
DATABASE_PATH=./fogo_requests.db
```

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run main bot
npm run fogo

# Run test bot
npm run test-fogo

# Generate wallet
npm run wallet generate

# Check wallet balance
npm run wallet balance <address>

# Post faucet message
npm run post-faucet main <channel_id>
```

## 📁 Project Structure

```
pyron-bot/
├── fogo-bot.js          # Main bot logic
├── test-fogo-bot.js     # Test bot for safe testing
├── wallet-utils.js      # Wallet utilities
├── post-faucet.js       # Faucet message poster
├── ecosystem.config.js   # PM2 configuration
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables (not in repo)
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🎯 Bot Commands

### Main Bot
- **Button Interface**: Users click "Request FOGO Tokens" button
- **Modal Input**: Users enter wallet address in modal
- **Token Amount**: 0.1 FOGO(Native) per request
- **Cooldown**: 24 hours between requests

### Test Bot
- **Same Interface**: Identical to main bot
- **Simulated Transfers**: No real tokens sent
- **Safe Testing**: Perfect for testing functionality

## 🔒 Security Features

- **Input Validation**: Wallet address format checking
- **Balance Verification**: Prevents sending to wallets with sufficient balance
- **Cooldown Enforcement**: Database tracking of user requests
- **Error Handling**: Comprehensive error messages
- **Environment Variables**: Secure credential management

## 📊 Database Schema

```sql
CREATE TABLE user_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    request_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    amount REAL DEFAULT 0.1,
    transaction_signature TEXT,
    status TEXT DEFAULT 'pending'
);
```

## 🚨 Troubleshooting

### Common Issues

1. **"Unknown Integration" Error**
   - Ensure bot has proper permissions
   - Check Discord Developer Portal settings
   - Restart bot to re-register commands

2. **"Missing Access" Error**
   - Verify bot permissions in Discord channel
   - Check channel permissions

3. **Transaction Failures**
   - Verify RPC URL is correct
   - Check bot wallet has sufficient balance
   - Validate wallet addresses

### Logs and Monitoring

```bash
# View PM2 logs
pm2 logs fogo-bot

# Monitor resources
pm2 monit

# Check bot status
pm2 status
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review logs for error messages
3. Verify environment variables
4. Test with the test bot first

---

**Made with ❤️ for the Fogo Network community** # pyron-bot

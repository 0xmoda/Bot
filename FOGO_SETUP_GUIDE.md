# 🚀 Quick Setup Guide - FOGO Token Bot

## Step 1: Environment Setup

1. **Copy environment template**:
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file** with your configuration:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   FOGO_RPC_URL=https://fogo-rpc-endpoint.com
   FOGO_TOKEN_MINT=your_fogo_token_mint_address_here
   BOT_WALLET_PRIVATE_KEY=your_bot_wallet_private_key_here
   ```

## Step 2: Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section → "Add Bot"
4. Copy the bot token to your `.env` file
5. Enable "Message Content Intent" in bot settings
6. Invite bot to your server with these permissions:
   - Send Messages
   - Use Slash Commands
   - Read Message History

## Step 3: Fogo Network Setup

1. **Get Fogo RPC endpoint** from your network provider
2. **Get FOGO token mint address** from the network
3. **Create a bot wallet** with FOGO tokens:
   ```bash
   npm run wallet generate
   ```
4. **Add the private key** to your `.env` file

## Step 4: Test Your Setup

1. **Test network connection**:
   ```bash
   npm run wallet test
   ```

2. **Check bot wallet**:
   ```bash
   npm run wallet bot
   ```

3. **Test the bot** (no real transfers):
   ```bash
   npm run test-fogo
   ```

## Step 5: Run the Bot

### Development Mode (with auto-restart):
```bash
npm run fogo-dev
```

### Production Mode:
```bash
npm run fogo
```

## Step 6: Test Commands

Once the bot is running, test these commands in Discord:

- `/request wallet:YOUR_WALLET_ADDRESS` - Request FOGO tokens
- `/test-request wallet:YOUR_WALLET_ADDRESS` - Test without real transfer

## Troubleshooting

### Common Issues:

1. **"Invalid Wallet Address"**
   - Use a valid Solana wallet address
   - Example: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`

2. **"Bot not responding"**
   - Check Discord bot token is correct
   - Verify bot is online in Discord
   - Check bot permissions in server

3. **"Transfer Failed"**
   - Verify bot wallet has FOGO tokens
   - Check Fogo RPC endpoint is accessible
   - Ensure private key is correct

### Debug Commands:

```bash
# Check wallet balance
npm run wallet balance YOUR_WALLET_ADDRESS

# Validate wallet address
npm run wallet validate YOUR_WALLET_ADDRESS

# Check bot wallet status
npm run wallet bot
```

## File Structure

```
pyron-bot/
├── fogo-bot.js              # Main FOGO bot
├── test-fogo-bot.js         # Test bot (no real transfers)
├── wallet-utils.js          # Wallet utilities
├── .env                     # Environment variables
├── fogo_requests.db         # User requests database
├── FOGO_BOT_README.md      # Detailed documentation
└── FOGO_SETUP_GUIDE.md     # This file
```

## Next Steps

1. **Read the full documentation**: `FOGO_BOT_README.md`
2. **Customize the bot**: Modify cooldown periods, token amounts, etc.
3. **Monitor usage**: Check the SQLite database for user requests
4. **Add features**: Extend with admin commands, analytics, etc.

## Support

- Check the troubleshooting section in `FOGO_BOT_README.md`
- Review Discord.js and Solana web3.js documentation
- Verify all environment variables are set correctly

---

**🎉 Your FOGO token bot is ready to use!** 
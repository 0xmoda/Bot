# FOGO Token Discord Bot

A Discord bot that allows users to request 1 FOGO (native) token by submitting their wallet address through a simple slash command.

## Features

- ✅ **24-hour cooldown**: Users can only request tokens once every 24 hours
- ✅ **Wallet balance checking**: Verifies if the wallet already has 1+ FOGO tokens
- ✅ **Automatic token transfer**: Sends 1 FOGO token from bot wallet to user's wallet
- ✅ **Local database storage**: SQLite database stores user requests and timestamps
- ✅ **Input validation**: Validates Solana wallet address format
- ✅ **Friendly error messages**: Clear feedback for all scenarios
- ✅ **Discord embeds**: Beautiful success/error messages with transaction details

## Prerequisites

- Node.js 16+ installed
- A Discord bot token
- A funded Fogo wallet with FOGO tokens
- Fogo network RPC endpoint
- FOGO token mint address

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Discord Bot Token (get from Discord Developer Portal)
   DISCORD_TOKEN=your_discord_bot_token_here
   
   # Discord Server (Guild) ID
   GUILD_ID=your_guild_id_here
   
   # Role name to assign (default: "test")
   ROLE_NAME=test
   
   # Fogo Network Configuration
   FOGO_RPC_URL=https://fogo-rpc-endpoint.com
   FOGO_TOKEN_MINT=your_fogo_token_mint_address_here
   
   # Bot Wallet Configuration (Private key in base58 format)
   BOT_WALLET_PRIVATE_KEY=your_bot_wallet_private_key_here
   
   # Database Configuration
   DATABASE_PATH=./fogo_requests.db
   ```

3. **Configure Discord Bot**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to "Bot" section and create a bot
   - Copy the bot token to your `.env` file
   - Enable "Message Content Intent" in bot settings
   - Invite the bot to your server with appropriate permissions

4. **Set up bot wallet**:
   - Create a Fogo wallet with sufficient FOGO tokens
   - Export the private key in base58 format
   - Add it to your `.env` file

## Usage

### Starting the Bot

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### Using the Bot

Users can request FOGO tokens using the slash command:

```
/request wallet:YOUR_WALLET_ADDRESS
```

**Example**:
```
/request wallet:7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

## Bot Responses

### Success Response
- ✅ Green embed with transaction signature
- Shows the wallet address and transaction hash

### Error Responses
- ❌ **Invalid Wallet**: Invalid Solana address format
- ⏰ **Cooldown Active**: User tried to request before 24 hours passed
- 💰 **Already Has Tokens**: Wallet already has 1+ FOGO tokens
- ❌ **Transfer Failed**: Network or wallet issues
- ❌ **Unexpected Error**: General error handling

## Database Schema

The bot uses SQLite to store user requests:

```sql
CREATE TABLE token_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_user_id TEXT UNIQUE,
    wallet_address TEXT,
    last_request_time INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Security Features

- **Private responses**: All bot responses are ephemeral (only visible to the user)
- **Input validation**: Strict Solana address validation
- **Rate limiting**: 24-hour cooldown per user
- **Balance checking**: Prevents sending to wallets that already have tokens
- **Error handling**: Comprehensive error catching and user-friendly messages

## Configuration Options

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Discord bot token | ✅ |
| `FOGO_RPC_URL` | Fogo network RPC endpoint | ✅ |
| `FOGO_TOKEN_MINT` | FOGO token mint address | ✅ |
| `BOT_WALLET_PRIVATE_KEY` | Bot wallet private key (base58) | ✅ |
| `DATABASE_PATH` | SQLite database file path | ❌ |

### Customization

You can modify the following in the code:
- **Cooldown period**: Change `24 * 60 * 60 * 1000` in `checkCooldown()`
- **Token amount**: Modify the transfer amount in `sendTokens()`
- **Error messages**: Customize embed messages in `sendErrorEmbed()`
- **Success messages**: Customize success messages in `sendSuccessEmbed()`

## Troubleshooting

### Common Issues

1. **"Invalid Wallet Address"**
   - Ensure the wallet address is a valid Solana address
   - Check for typos or extra characters

2. **"Transfer Failed"**
   - Verify bot wallet has sufficient FOGO tokens
   - Check Fogo RPC endpoint is accessible
   - Ensure bot wallet private key is correct

3. **"Cooldown Active"**
   - Wait for the 24-hour period to complete
   - Check database for last request time

4. **Bot not responding**
   - Verify Discord bot token is correct
   - Check bot has proper permissions in server
   - Ensure bot is online and connected

### Debug Mode

Add debug logging by modifying the bot code:

```javascript
// Add to constructor
this.debug = true;

// Add debug logs
if (this.debug) {
    console.log('Debug:', message);
}
```

## Development

### Project Structure

```
pyron-bot/
├── fogo-bot.js          # Main bot file
├── package.json          # Dependencies
├── .env                 # Environment variables
├── fogo_requests.db     # SQLite database
└── FOGO_BOT_README.md  # This file
```

### Adding New Features

1. **New slash commands**: Add to `setupCommands()`
2. **Database changes**: Modify `initDatabase()`
3. **New validations**: Add methods to the `FogoBot` class
4. **Custom responses**: Create new embed methods

## License

This project is licensed under the ISC License.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Discord.js and Solana web3.js documentation
3. Verify all environment variables are set correctly
4. Check bot permissions in Discord server 
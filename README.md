# FOGO Token Discord Bot

A Discord bot for distributing FOGO(Native) tokens on the Fogo network. Users can request 0.1 FOGO tokens once every 24 hours through an interactive button interface. **Team members with the "Pyron Team" role can bypass the 24-hour cooldown limit.**

## Features

- 🎯 **Token Distribution**: Send 0.1 FOGO(Native) tokens to eligible wallets
- ⏰ **24-Hour Cooldown**: Prevent spam requests with automatic cooldown tracking
- 🛡️ **Team Role Bypass**: Pyron Team members can request tokens without cooldown
- 💰 **Balance Checking**: Verify wallet balance before sending tokens
- 🗄️ **SQLite Database**: Persistent storage for user requests and timestamps
- 🔒 **Input Validation**: Secure wallet address validation
- 🎨 **Interactive UI**: Button-based interface with modal for wallet input
- 🐳 **Docker Support**: Easy deployment with Docker containers
- 🧪 **Test Environment**: Separate test bot for development and testing

## Quick Start

### Prerequisites

- Node.js 18+ or Docker
- Discord Bot Token
- Fogo RPC URL
- Funded Bot Wallet

### Environment Setup

1. Copy the environment template:
```bash
cp env.example .env
```

2. Fill in your configuration:
```env
DISCORD_TOKEN=your_discord_bot_token
FOGO_RPC_URL=https://testnet.fogo.io
FOGO_TOKEN_MINT=So11111111111111111111111111111111111111112
BOT_WALLET_PRIVATE_KEY=your_bot_wallet_private_key
DATABASE_PATH=./data/fogo_requests.db
TARGET_CHANNEL_ID=1402734319755202640
```

### Local Development

```bash
# Install dependencies
npm install

# Start the main bot
npm run fogo

# Start the test bot
npm run test-fogo

# Development with hot reload
npm run fogo-dev
```

### Channel Configuration

The faucet bot is configured to work in a specific channel. By default, it targets channel ID `1402734319755202640`.

#### Setting Up a New Channel

1. **Update Environment Variable**: Set `TARGET_CHANNEL_ID` in your `.env` file:
   ```env
   TARGET_CHANNEL_ID=your_channel_id_here
   ```

2. **Verify Channel Access**: Run the setup script to verify the bot can access the channel:
   ```bash
   node setup-faucet-channel.js
   ```

3. **Bot Permissions**: Ensure the bot has the following permissions in the target channel:
   - Send Messages
   - Use External Emojis
   - Read Message History

#### Channel-Specific Features

- **Targeted Interactions**: The bot only responds to interactions in the configured channel
- **Auto Message Creation**: A faucet message is automatically created when the bot starts
- **Isolated Functionality**: Token requests are only processed from the target channel

### Docker Deployment

#### Quick Start with Docker

```bash
# Build and start with Docker
./docker-scripts.sh build
./docker-scripts.sh start

# Or use npm scripts
npm run docker:build
npm run docker:start
```

#### Development Environment

```bash
# Start development environment with hot reload
./docker-scripts.sh dev

# View development logs
./docker-scripts.sh logs-dev fogo-bot-dev
```

#### Production Environment

```bash
# Start production environment
./docker-scripts.sh prod

# View production logs
./docker-scripts.sh logs-prod fogo-bot-prod
```

#### Docker Management Commands

```bash
# Build Docker image
./docker-scripts.sh build

# Start different environments
./docker-scripts.sh start    # Basic environment
./docker-scripts.sh dev      # Development environment
./docker-scripts.sh prod     # Production environment

# View logs
./docker-scripts.sh logs fogo-bot
./docker-scripts.sh logs-dev test-fogo-bot-dev
./docker-scripts.sh logs-prod fogo-bot-prod

# Check status
./docker-scripts.sh status

# Stop all containers
./docker-scripts.sh stop

# Clean up Docker resources
./docker-scripts.sh clean
```

## Bot Usage

### Main Bot
- **Button Interface**: Users click a button to open a modal
- **Wallet Input**: Users enter their Solana wallet address in the modal
- **Automatic Validation**: Bot validates wallet format and checks balance
- **Token Distribution**: Sends 0.1 FOGO(Native) tokens if eligible
- **Team Role Support**: Users with "Pyron Team" role bypass cooldown limits

### Test Bot
- **Simulated Transfers**: No real tokens are sent
- **Same Interface**: Identical user experience for testing
- **Separate Database**: Uses `test_fogo_requests.db`
- **Team Role Support**: Same team role functionality as main bot

### Team Role Functionality
- **Role Name**: "Pyron Team" (case-insensitive)
- **Bypass Cooldown**: Team members can request tokens without 24-hour wait
- **No Database Tracking**: Team requests don't affect cooldown tracking
- **Special Messages**: Team requests show "🛡️ Team Member Request" in success messages

## Deployment Options

### 1. Docker (Recommended)
- **Local**: `./docker-scripts.sh prod`
- **Cloud**: Deploy Docker containers to any cloud platform
- **Kubernetes**: Use the Docker images in Kubernetes clusters

### 2. Railway.app
- Connect your GitHub repository
- Railway will automatically detect and deploy the Docker setup
- Environment variables are set through Railway dashboard

### 3. Render.com
- Connect your GitHub repository
- Use the Docker deployment option
- Set environment variables in Render dashboard

### 4. Google Cloud Platform
- Follow the detailed guide in `deploy-guide.md`
- Use Docker containers for easier deployment
- Set up monitoring with Google Cloud Logging

### 5. Heroku
- Use the `Procfile` for traditional deployment
- Or use Docker containers with Heroku Container Registry

## Project Structure

```
pyron-bot/
├── fogo-bot.js              # Main bot logic
├── test-fogo-bot.js         # Test bot logic
├── wallet-utils.js          # Wallet utilities
├── post-faucet.js          # Faucet message poster
├── package.json             # Dependencies and scripts
├── Dockerfile               # Production Docker image
├── Dockerfile.dev           # Development Docker image
├── docker-compose.yml       # Basic Docker setup
├── docker-compose.dev.yml   # Development environment
├── docker-compose.prod.yml  # Production environment
├── docker-scripts.sh        # Docker management script
├── .dockerignore            # Docker build exclusions
├── .env                     # Environment variables
├── env.example              # Environment template
├── README.md                # This file
├── FOGO_SETUP_GUIDE.md     # Quick setup guide
├── deploy-guide.md          # Detailed deployment guide
├── ecosystem.config.js      # PM2 configuration
├── setup-server.sh          # Server setup script
├── monitor-bot.sh           # Bot monitoring script
├── railway.json             # Railway deployment config
├── Procfile                 # Heroku deployment config
└── data/                    # Database files
    ├── fogo_requests.db     # Main bot database
    └── test_fogo_requests.db # Test bot database
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Discord bot token | Yes |
| `FOGO_RPC_URL` | Fogo network RPC endpoint | Yes |
| `FOGO_TOKEN_MINT` | FOGO token mint address | Yes |
| `BOT_WALLET_PRIVATE_KEY` | Bot wallet private key (base58) | Yes |
| `DATABASE_PATH` | SQLite database path | No (default: `./data/fogo_requests.db`) |

## Scripts

### NPM Scripts
```bash
npm run fogo              # Start main bot
npm run test-fogo         # Start test bot
npm run fogo-dev          # Start main bot with nodemon
npm run wallet            # Run wallet utilities
npm run post-faucet       # Post faucet messages
```

### Docker Scripts
```bash
npm run docker:build      # Build Docker image
npm run docker:start      # Start basic environment
npm run docker:dev        # Start development environment
npm run docker:prod       # Start production environment
npm run docker:stop       # Stop all containers
npm run docker:logs       # View logs
npm run docker:status     # Check status
npm run docker:clean      # Clean up resources
```

## Monitoring

### Docker Monitoring
```bash
# Check container status
./docker-scripts.sh status

# View logs
./docker-scripts.sh logs-prod fogo-bot-prod

# Monitor resource usage
docker stats
```

### Local Monitoring
```bash
# Use the monitoring script
./monitor-bot.sh

# Check PM2 status (if using PM2)
pm2 status
pm2 logs fogo-bot
```

## Security Features

- **Non-root User**: Docker containers run as non-root user
- **Environment Variables**: Sensitive data stored in environment variables
- **Input Validation**: Wallet addresses are validated before processing
- **Rate Limiting**: 24-hour cooldown prevents abuse (bypassed for team members)
- **Balance Checking**: Prevents sending tokens to wallets with sufficient balance
- **Role-Based Access**: Team members have special privileges

## Troubleshooting

### Common Issues

1. **"Unknown Integration" Error**
   - Re-invite bot with correct permissions
   - Ensure bot has `applications.commands` scope
   - Wait for Discord to propagate commands

2. **Docker Build Fails**
   - Check Docker is installed and running
   - Ensure `.env` file exists
   - Verify Dockerfile syntax

3. **Bot Not Responding**
   - Check container logs: `./docker-scripts.sh logs-prod fogo-bot-prod`
   - Verify environment variables are set
   - Check Discord bot permissions

4. **Database Issues**
   - Ensure `data/` directory exists and is writable
   - Check SQLite file permissions
   - Verify database path in environment variables

5. **Team Role Not Working**
   - Verify the role is named exactly "Pyron Team" (case-insensitive)
   - Check bot has permission to read member roles
   - Ensure the user has the role assigned

### Getting Help

1. Check the logs: `./docker-scripts.sh logs-prod fogo-bot-prod`
2. Verify environment variables are set correctly
3. Test wallet connection: `npm run wallet bot`
4. Check Discord bot permissions and invite link

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker: `./docker-scripts.sh dev`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the logs for error messages
- Ensure all environment variables are set correctly
- Verify Discord bot permissions and invite link

---

**Repository**: [https://github.com/pyron-finance/discord-faucet-bot](https://github.com/pyron-finance/discord-faucet-bot)
**Organization**: Pyron Finance

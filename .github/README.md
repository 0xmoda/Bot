# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the FOGO Faucet Bot.

## Workflows

### Continuous Deployment (`cd.yml`)
Simple deployment workflow that includes:
- **Testing**: Runs npm test with all environment variables
- **Production Deployment**: Deploys when pushing to main branch
- **Staging Deployment**: Deploys when pushing to test branch
- **Environment**: Full environment variable support including TARGET_CHANNEL_ID

## Required GitHub Secrets

To use these workflows, you need to configure the following secrets in your GitHub repository:

### Core Secrets
- `DISCORD_TOKEN` - Your Discord bot token
- `FOGO_RPC_URL` - Fogo network RPC endpoint
- `BOT_WALLET_PRIVATE_KEY` - Bot wallet private key (base58 format)

### New Channel Configuration
- `TARGET_CHANNEL_ID` - Discord channel ID for the faucet bot (default: `1402734319755202640`)

## Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the appropriate value

### Example Secret Values
```
DISCORD_TOKEN=your_discord_bot_token_here
FOGO_RPC_URL=https://testnet.fogo.io
BOT_WALLET_PRIVATE_KEY=your_bot_wallet_private_key_here
TARGET_CHANNEL_ID=1402734319755202640
```

## Workflow Triggers

### Push Events
- `main` branch → Production deployment
- `test` branch → Staging deployment
- `develop` branch → Testing only

### Pull Request Events
- Any PR to `main` or `develop` → Full validation and testing

## Environment Variables in Workflows

All workflows include the following environment variables:
- `DISCORD_TOKEN`
- `FOGO_RPC_URL`
- `BOT_WALLET_PRIVATE_KEY`
- `TARGET_CHANNEL_ID` (NEW)
- `DATABASE_PATH`

## Local Testing

Before pushing, you can test locally:
```bash
# Test environment configuration
node test-local.js

# Test channel access
node setup-faucet-channel.js

# Test the bot
node fogo-bot.js
```

## Troubleshooting

### Common Issues
1. **Missing Secrets**: Ensure all required secrets are configured
2. **Invalid Channel ID**: Verify the channel ID exists and bot has access
3. **Permission Issues**: Check bot permissions in the target channel
4. **Environment Variables**: Ensure all variables are properly set

### Debugging
- Check workflow logs in GitHub Actions tab
- Verify secrets are correctly configured
- Test locally before pushing changes 
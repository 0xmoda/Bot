# Quick Setup Guide

## 🚀 Get Your Bot Running in 5 Minutes

### Step 1: Create Discord Bot
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" → Give it a name
3. Go to "Bot" section → Click "Add Bot"
4. Copy the **Bot Token** (you'll need this)

### Step 2: Get Server ID
1. In Discord, enable Developer Mode: Settings → Advanced → Developer Mode
2. Right-click your server name → "Copy Server ID"

### Step 3: Create Role
1. In your Discord server, go to Server Settings → Roles
2. Create a new role named "test"
3. Make sure the bot role is above the "test" role in the hierarchy

### Step 4: Invite Bot to Server
1. In Discord Developer Portal, go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`
3. Select permissions: `Manage Roles`, `Read Messages/View Channels`
4. Copy the generated URL and open it in browser
5. Select your server and authorize

### Step 5: Configure Environment
Create a `.env` file in the project root:

```env
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_server_id_here
ROLE_NAME=test
```

### Step 6: Test and Run
```bash
# Test CSV file
npm run test-csv

# Run the bot
npm start
```

## ✅ Your CSV file is ready!
- **474 unique usernames** found
- **Column name**: `discord`
- **Format**: Perfect ✅

## 🎯 What the bot will do:
1. Connect to your Discord server
2. Find the "test" role
3. Process all 474 usernames from your CSV
4. Assign the "test" role to users found in your server
5. Show progress and summary statistics

## ⚠️ Important Notes:
- Make sure users from the CSV are actually in your Discord server
- The bot will skip users who already have the role
- Rate limiting is built-in to respect Discord's API limits
- Check the console output for detailed progress and any errors 
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

class FaucetPoster {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.client.once('ready', () => {
            console.log(`🤖 ${this.client.user.tag} is ready for posting faucet messages!`);
            console.log('\n📋 Available commands:');
            console.log('• node post-faucet.js main <channel_id> - Post main faucet message');
            console.log('• node post-faucet.js test <channel_id> - Post test faucet message');
            console.log('• node post-faucet.js help - Show this help message');
        });
    }

    async createMainFaucetMessage() {
        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🎉 FOGO(Native) Faucet')
            .setDescription('Welcome to the FOGO(Native) Faucet!\n\n**How it works:**\n• Click the button below to request tokens\n• Enter your Fogo wallet address\n• Receive 0.1 FOGO(Native) tokens\n• One request per 24 hours\n\n**Requirements:**\n• Valid Solana wallet address\n• Wallet must not already have 0.1+ FOGO tokens\n• 24-hour cooldown between requests')
            .addFields(
                { name: '💰 Token Amount', value: '0.1 FOGO(Native)', inline: true },
                { name: '⏰ Cooldown', value: '24 hours', inline: true },
                { name: '🌐 Network', value: 'Fogo Testnet', inline: true }
            )
            .setFooter({ text: 'Powered by Fogo Network' })
            .setTimestamp();

        const button = new ButtonBuilder()
            .setCustomId('request_tokens')
            .setLabel('Request FOGO Tokens')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎁');

        const row = new ActionRowBuilder().addComponents(button);

        return { embeds: [embed], components: [row] };
    }

    async createTestFaucetMessage() {
        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        
        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('🧪 Test FOGO(Native) Faucet')
            .setDescription('Welcome to the **TEST** FOGO(Native) Faucet!\n\n**How it works:**\n• Click the button below to test token requests\n• Enter your Fogo wallet address\n• Simulate receiving 0.1 FOGO(Native) tokens\n• One test request per 24 hours\n\n**⚠️ This is a TEST - No real tokens are sent!**')
            .addFields(
                { name: '💰 Token Amount', value: '0.1 FOGO(Native) (Test)', inline: true },
                { name: '⏰ Cooldown', value: '24 hours', inline: true },
                { name: '🌐 Network', value: 'Fogo Testnet', inline: true }
            )
            .setFooter({ text: 'TEST MODE - No real transfers' })
            .setTimestamp();

        const button = new ButtonBuilder()
            .setCustomId('test_request_tokens')
            .setLabel('Test Request FOGO Tokens')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🧪');

        const row = new ActionRowBuilder().addComponents(button);

        return { embeds: [embed], components: [row] };
    }

    async postMessage(channelId, messageType) {
        try {
            const channel = await this.client.channels.fetch(channelId);
            if (!channel) {
                console.error('❌ Channel not found!');
                return;
            }

            let message;
            if (messageType === 'main') {
                message = await this.createMainFaucetMessage();
                console.log('✅ Posted main faucet message!');
            } else if (messageType === 'test') {
                message = await this.createTestFaucetMessage();
                console.log('✅ Posted test faucet message!');
            } else {
                console.error('❌ Invalid message type. Use "main" or "test"');
                return;
            }

            await channel.send(message);
            console.log(`📝 Message posted in #${channel.name}`);
            
        } catch (error) {
            console.error('❌ Error posting message:', error.message);
        }
    }

    showHelp() {
        console.log(`
🎉 FOGO Faucet Message Poster

Usage: node post-faucet.js [command] [channel_id]

Commands:
  main <channel_id> - Post main faucet message with button
  test <channel_id> - Post test faucet message with button
  help             - Show this help message

Examples:
  node post-faucet.js main 1234567890123456789
  node post-faucet.js test 1234567890123456789

To get channel ID:
  1. Enable Developer Mode in Discord
  2. Right-click on the channel
  3. Click "Copy Channel ID"
        `);
    }

    start() {
        this.client.login(process.env.DISCORD_TOKEN);
    }
}

// CLI interface
async function main() {
    const poster = new FaucetPoster();
    const command = process.argv[2];

    if (command === 'help' || !command) {
        poster.showHelp();
        return;
    }

    if (command === 'main' || command === 'test') {
        const channelId = process.argv[3];
        if (!channelId) {
            console.log('❌ Please provide a channel ID');
            console.log('Usage: node post-faucet.js main <channel_id>');
            return;
        }

        poster.start();
        
        // Wait for bot to be ready, then post message
        poster.client.once('ready', async () => {
            await poster.postMessage(channelId, command);
            process.exit(0);
        });
    } else {
        poster.showHelp();
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = FaucetPoster; 
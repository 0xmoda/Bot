require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

// Configuration
const TARGET_CHANNEL_ID = '1402734319755202640';

async function setupFaucetChannel() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    client.once('ready', async () => {
        console.log(`🤖 Bot logged in as ${client.user.tag}`);
        
        try {
            // Fetch the target channel
            const channel = await client.channels.fetch(TARGET_CHANNEL_ID);
            
            if (!channel) {
                console.error(`❌ Channel ${TARGET_CHANNEL_ID} not found`);
                console.log('Please make sure:');
                console.log('1. The bot has access to the channel');
                console.log('2. The channel ID is correct');
                console.log('3. The bot has permission to send messages in the channel');
                return;
            }

            console.log(`✅ Found channel: ${channel.name} (${channel.id})`);
            console.log(`📝 Channel type: ${channel.type}`);
            console.log(`🏠 Guild: ${channel.guild.name}`);
            
            // Check bot permissions
            const permissions = channel.permissionsFor(client.user);
            if (!permissions.has('SendMessages')) {
                console.error('❌ Bot does not have permission to send messages in this channel');
                return;
            }
            
            if (!permissions.has('UseExternalEmojis')) {
                console.warn('⚠️  Bot may not be able to use custom emojis');
            }
            
            console.log('✅ Bot has necessary permissions');
            console.log('\n🎯 Setup complete! The faucet bot will now:');
            console.log(`• Only respond to interactions in channel ${TARGET_CHANNEL_ID}`);
            console.log('• Create a faucet message when the bot starts');
            console.log('• Handle token requests from this channel only');
            
        } catch (error) {
            console.error('❌ Error setting up faucet channel:', error.message);
        } finally {
            client.destroy();
        }
    });

    client.on('error', error => {
        console.error('❌ Discord client error:', error);
    });

    client.login(process.env.DISCORD_TOKEN);
}

// Run the setup
if (require.main === module) {
    setupFaucetChannel();
}

module.exports = { setupFaucetChannel }; 
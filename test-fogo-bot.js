const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { Connection, PublicKey, Keypair, Transaction, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const sqlite3 = require('sqlite3').verbose();
const bs58 = require('bs58');
require('dotenv').config();

class TestFogoBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        // Initialize Fogo network connection
        this.connection = new Connection(process.env.FOGO_RPC_URL, 'confirmed');
        
        // Initialize bot wallet (for testing, we'll use a mock wallet)
        this.botWallet = Keypair.generate();
        
        // Initialize database
        this.db = new sqlite3.Database('./test_fogo_requests.db');
        this.initDatabase();
        
        this.setupEventHandlers();
    }

    initDatabase() {
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS token_requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    discord_user_id TEXT UNIQUE,
                    wallet_address TEXT,
                    last_request_time INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
        });
    }

    setupEventHandlers() {
        this.client.once('ready', () => {
            console.log(`🧪 Test Bot ${this.client.user.tag} is ready!`);
        });

        this.client.on('interactionCreate', async (interaction) => {
            try {
                // Handle button clicks
                if (interaction.isButton()) {
                    if (interaction.customId === 'test_request_tokens') {
                        await this.showWalletModal(interaction);
                    }
                }
                
                // Handle modal submissions
                if (interaction.isModalSubmit()) {
                    if (interaction.customId === 'test_wallet_modal') {
                        await this.handleTestRequest(interaction);
                    }
                }
            } catch (error) {
                console.error('Error handling interaction:', error);
                await this.sendErrorEmbed(interaction, '❌ Unexpected Error', 
                    'An unexpected error occurred. Please try again later.');
            }
        });
    }

    async showWalletModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('test_wallet_modal')
            .setTitle('Test FOGO(Native) Token Request');

        const walletInput = new TextInputBuilder()
            .setCustomId('wallet_address')
            .setLabel('Your Fogo Wallet Address')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter your Solana wallet address...')
            .setRequired(true)
            .setMinLength(32)
            .setMaxLength(44);

        const firstActionRow = new ActionRowBuilder().addComponents(walletInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    }

    async handleTestRequest(interaction) {
        const walletAddress = interaction.fields.getTextInputValue('wallet_address');
        const userId = interaction.user.id;

        try {
            console.log(`🧪 Test request from user ${userId} for wallet ${walletAddress}`);

            // Validate wallet address format
            if (!this.isValidSolanaAddress(walletAddress)) {
                await this.sendErrorEmbed(interaction, '❌ Invalid Wallet Address', 
                    'Please provide a valid Solana wallet address.');
                return;
            }

            // Check cooldown
            const cooldownCheck = await this.checkCooldown(userId);
            if (!cooldownCheck.canRequest) {
                await this.sendErrorEmbed(interaction, '⏰ Cooldown Active', 
                    `You can request tokens again in ${cooldownCheck.remainingTime} hours.`);
                return;
            }

            // Check wallet balance
            const balanceCheck = await this.checkWalletBalance(walletAddress);
            if (balanceCheck.hasEnough) {
                await this.sendErrorEmbed(interaction, '💰 Already Has Tokens', 
                    'This wallet already has 0.1 or more FOGO(Native) tokens.');
                return;
            }

            // Simulate token transfer
            const transferResult = await this.simulateTokenTransfer(walletAddress);
            if (transferResult.success) {
                // Update database
                await this.updateUserRequest(userId, walletAddress);
                
                await this.sendSuccessEmbed(interaction, '🎉 Test Transfer Successful!', 
                    `0.1 FOGO(Native) token would be sent to \`${walletAddress}\`\nTest Transaction: \`${transferResult.signature}\`\n\n⚠️ This was a test - no actual tokens were transferred.`);
            } else {
                await this.sendErrorEmbed(interaction, '❌ Test Transfer Failed', 
                    `Failed to simulate transfer: ${transferResult.error}`);
            }

        } catch (error) {
            console.error('Error handling test request:', error);
            await this.sendErrorEmbed(interaction, '❌ Unexpected Error', 
                'An unexpected error occurred. Please try again later.');
        }
    }

    isValidSolanaAddress(address) {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    }

    async checkCooldown(userId) {
        return new Promise((resolve) => {
            this.db.get(
                'SELECT last_request_time FROM token_requests WHERE discord_user_id = ?',
                [userId],
                (err, row) => {
                    if (err) {
                        console.error('Database error:', err);
                        resolve({ canRequest: true, remainingTime: 0 });
                        return;
                    }

                    if (!row) {
                        resolve({ canRequest: true, remainingTime: 0 });
                        return;
                    }

                    const now = Date.now();
                    const lastRequest = row.last_request_time;
                    const timeDiff = now - lastRequest;
                    const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

                    if (timeDiff < cooldownPeriod) {
                        const remainingMs = cooldownPeriod - timeDiff;
                        const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
                        resolve({ canRequest: false, remainingTime: remainingHours });
                    } else {
                        resolve({ canRequest: true, remainingTime: 0 });
                    }
                }
            );
        });
    }

    async checkWalletBalance(walletAddress) {
        try {
            const walletPubkey = new PublicKey(walletAddress);
            
            // For SOL, we check the native balance
            const balance = await this.connection.getBalance(walletPubkey);
            const solBalance = balance / LAMPORTS_PER_SOL;

            return { hasEnough: solBalance >= 0.1, balance: solBalance };
        } catch (error) {
            console.error('Error checking wallet balance:', error);
            return { hasEnough: false, balance: 0 };
        }
    }

    async simulateTokenTransfer(recipientAddress) {
        try {
            // Generate a fake transaction signature for testing
            const fakeSignature = 'test_' + Math.random().toString(36).substring(2, 15);
            
            console.log(`🧪 Simulating transfer of 0.1 FOGO(Native) to ${recipientAddress}`);
            console.log(`🧪 Fake transaction signature: ${fakeSignature}`);
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return { success: true, signature: fakeSignature };
        } catch (error) {
            console.error('Error simulating token transfer:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserRequest(userId, walletAddress) {
        return new Promise((resolve) => {
            this.db.run(
                'INSERT OR REPLACE INTO token_requests (discord_user_id, wallet_address, last_request_time) VALUES (?, ?, ?)',
                [userId, walletAddress, Date.now()],
                (err) => {
                    if (err) {
                        console.error('Error updating user request:', err);
                    }
                    resolve();
                }
            );
        });
    }

    async sendSuccessEmbed(interaction, title, description) {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    async sendErrorEmbed(interaction, title, description) {
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Method to create the test faucet message with button
    async createTestFaucetMessage(channel) {
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

    start() {
        this.client.login(process.env.DISCORD_TOKEN);
    }
}

// Start the test bot
const testBot = new TestFogoBot();
testBot.start(); 
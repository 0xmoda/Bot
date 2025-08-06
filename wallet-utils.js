const { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const bs58 = require('bs58');
require('dotenv').config();

class WalletUtils {
    constructor() {
        this.connection = new Connection(process.env.FOGO_RPC_URL, 'confirmed');
    }

    // Generate a new wallet keypair
    generateWallet() {
        const keypair = Keypair.generate();
        console.log('🔑 New Wallet Generated:');
        console.log('Public Key:', keypair.publicKey.toString());
        console.log('Private Key (base58):', bs58.encode(keypair.secretKey));
        console.log('\n⚠️  Save the private key securely!');
        return keypair;
    }

    // Check wallet balance
    async checkBalance(walletAddress, tokenMint = process.env.FOGO_TOKEN_MINT) {
        try {
            const walletPubkey = new PublicKey(walletAddress);
            
            // Check if this is SOL (native token)
            if (tokenMint === 'So11111111111111111111111111111111111111112') {
                console.log(`🔍 Checking FOGO(Native) balance for wallet: ${walletAddress}`);
                
                const balance = await this.connection.getBalance(walletPubkey);
                const solBalance = balance / LAMPORTS_PER_SOL;
                
                console.log(`✅ FOGO(Native) balance: ${solBalance} FOGO`);
                return { balance: solBalance, hasAccount: true };
            } else {
                // For other tokens, use associated token accounts
                const mintPubkey = new PublicKey(tokenMint);
                console.log(`🔍 Checking token balance for wallet: ${walletAddress}`);
                console.log(`Token mint: ${tokenMint}`);

                // Get associated token account
                const associatedTokenAccount = await getAssociatedTokenAddress(
                    mintPubkey,
                    walletPubkey,
                    false,
                    TOKEN_PROGRAM_ID,
                    ASSOCIATED_TOKEN_PROGRAM_ID
                );

                console.log(`Associated token account: ${associatedTokenAccount.toString()}`);

                // Check if token account exists
                const tokenAccountInfo = await this.connection.getAccountInfo(associatedTokenAccount);
                
                if (!tokenAccountInfo) {
                    console.log('❌ No token account found for this wallet');
                    return { balance: 0, hasAccount: false };
                }

                // Get token balance
                const tokenAccount = await this.connection.getTokenAccountBalance(associatedTokenAccount);
                const balance = tokenAccount.value.uiAmount || 0;

                console.log(`✅ Token balance: ${balance} tokens`);
                return { balance, hasAccount: true };
            }
        } catch (error) {
            console.error('❌ Error checking balance:', error.message);
            return { balance: 0, hasAccount: false, error: error.message };
        }
    }

    // Check bot wallet status
    async checkBotWallet() {
        if (!process.env.BOT_WALLET_PRIVATE_KEY) {
            console.log('❌ BOT_WALLET_PRIVATE_KEY not set in environment');
            return;
        }

        try {
            const privateKeyBytes = bs58.decode(process.env.BOT_WALLET_PRIVATE_KEY);
            const botWallet = Keypair.fromSecretKey(privateKeyBytes);
            
            console.log('🤖 Bot Wallet Status:');
            console.log('Public Key:', botWallet.publicKey.toString());

            // Check SOL balance
            const solBalance = await this.connection.getBalance(botWallet.publicKey);
            console.log('FOGO(Native) Balance:', solBalance / LAMPORTS_PER_SOL, 'FOGO');

            // Check FOGO token balance (if it's not SOL)
            if (process.env.FOGO_TOKEN_MINT !== 'So11111111111111111111111111111111111111112') {
                const tokenBalance = await this.checkBalance(botWallet.publicKey.toString());
                
                if (tokenBalance.hasAccount) {
                    console.log('Token Balance:', tokenBalance.balance, 'tokens');
                } else {
                    console.log('❌ No token account found');
                }
            } else {
                console.log('✅ Using native FOGO - no separate token account needed');
            }

        } catch (error) {
            console.error('❌ Error checking bot wallet:', error.message);
        }
    }

    // Validate wallet address
    validateAddress(address) {
        try {
            new PublicKey(address);
            console.log('✅ Valid Solana address:', address);
            return true;
        } catch (error) {
            console.log('❌ Invalid Solana address:', address);
            return false;
        }
    }

    // Test network connection
    async testConnection() {
        try {
            console.log('🌐 Testing Fogo network connection...');
            const version = await this.connection.getVersion();
            console.log('✅ Connected to Fogo network');
            console.log('Version:', version);
            
            const slot = await this.connection.getSlot();
            console.log('Current slot:', slot);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to Fogo network:', error.message);
            return false;
        }
    }

    // Show help
    showHelp() {
        console.log(`
🔧 FOGO Wallet Utilities

Usage: node wallet-utils.js [command]

Commands:
  generate    - Generate a new wallet keypair
  balance <address> - Check FOGO(Native) balance for wallet address
  bot         - Check bot wallet status
  validate <address> - Validate a wallet address
  test        - Test network connection
  help        - Show this help message

Examples:
  node wallet-utils.js generate
  node wallet-utils.js balance 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
  node wallet-utils.js validate 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
  node wallet-utils.js bot
  node wallet-utils.js test
        `);
    }
}

// CLI interface
async function main() {
    const utils = new WalletUtils();
    const command = process.argv[2];

    switch (command) {
        case 'generate':
            utils.generateWallet();
            break;
            
        case 'balance':
            const address = process.argv[3];
            if (!address) {
                console.log('❌ Please provide a wallet address');
                console.log('Usage: node wallet-utils.js balance <address>');
                return;
            }
            await utils.checkBalance(address);
            break;
            
        case 'bot':
            await utils.checkBotWallet();
            break;
            
        case 'validate':
            const addr = process.argv[3];
            if (!addr) {
                console.log('❌ Please provide a wallet address');
                console.log('Usage: node wallet-utils.js validate <address>');
                return;
            }
            utils.validateAddress(addr);
            break;
            
        case 'test':
            await utils.testConnection();
            break;
            
        case 'help':
        default:
            utils.showHelp();
            break;
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = WalletUtils; 
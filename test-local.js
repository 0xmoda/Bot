require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

console.log('🧪 Running Local Test for FOGO Faucet Bot\n');

// Test 1: Environment Variables
console.log('1️⃣ Testing Environment Variables:');
const requiredEnvVars = [
    'DISCORD_TOKEN',
    'FOGO_RPC_URL', 
    'BOT_WALLET_PRIVATE_KEY',
    'TARGET_CHANNEL_ID'
];

let envTestPassed = true;
requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
        console.log(`   ✅ ${varName}: ${varName.includes('PRIVATE_KEY') ? '***SET***' : process.env[varName]}`);
    } else {
        console.log(`   ❌ ${varName}: NOT SET`);
        envTestPassed = false;
    }
});

// Test 2: Dependencies
console.log('\n2️⃣ Testing Dependencies:');
try {
    require('discord.js');
    require('@solana/web3.js');
    require('@solana/spl-token');
    require('sqlite3');
    require('bs58');
    console.log('   ✅ All required dependencies are installed');
} catch (error) {
    console.log(`   ❌ Missing dependency: ${error.message}`);
    envTestPassed = false;
}

// Test 3: Channel Configuration
console.log('\n3️⃣ Testing Channel Configuration:');
const targetChannelId = process.env.TARGET_CHANNEL_ID || '1402734319755202640';
console.log(`   🎯 Target Channel ID: ${targetChannelId}`);

// Test 4: Database
console.log('\n4️⃣ Testing Database:');
const fs = require('fs');
const dbPath = process.env.DATABASE_PATH || './fogo_requests.db';
if (fs.existsSync(dbPath)) {
    console.log(`   ✅ Database file exists: ${dbPath}`);
} else {
    console.log(`   ⚠️  Database file will be created: ${dbPath}`);
}

// Test 5: Bot Token Validation
console.log('\n5️⃣ Testing Bot Token:');
const token = process.env.DISCORD_TOKEN;
if (token && token.length > 50) {
    console.log('   ✅ Bot token appears valid (length check)');
} else {
    console.log('   ❌ Bot token appears invalid or missing');
    envTestPassed = false;
}

// Summary
console.log('\n📊 Test Summary:');
if (envTestPassed) {
    console.log('   ✅ All tests passed! The bot should work correctly.');
    console.log('\n🚀 Ready to start the bot with:');
    console.log('   node fogo-bot.js');
    console.log('\n🧪 Or test with:');
    console.log('   node test-fogo-bot.js');
} else {
    console.log('   ❌ Some tests failed. Please check the configuration.');
    console.log('\n💡 Make sure to:');
    console.log('   1. Copy env.example to .env');
    console.log('   2. Fill in all required environment variables');
    console.log('   3. Install dependencies with: npm install');
}

console.log('\n🎯 Channel Configuration:');
console.log(`   The bot will target channel: ${targetChannelId}`);
console.log('   Make sure the bot has permission to send messages in this channel!'); 
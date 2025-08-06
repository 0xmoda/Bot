require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

// Validate environment variables
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN is required in .env file');
  process.exit(1);
}

if (!process.env.GUILD_ID) {
  console.error('❌ GUILD_ID is required in .env file');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.GuildMember],
});

const ROLE_NAME = process.env.ROLE_NAME || 'test';
const PYRONAUTS_ROLE = 'Pyronauts';
const CSV_FILE = 'users.csv';

// Rate limiting helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

client.once('ready', async () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
  console.log(`🎯 Target role: "${ROLE_NAME}"`);
  console.log(`🏆 Checking for existing "${PYRONAUTS_ROLE}" role`);
  console.log(`📁 Processing CSV file: ${CSV_FILE}`);

  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    console.log(`🏠 Connected to guild: ${guild.name}`);

    // Find the target role
    const role = guild.roles.cache.find(r => r.name.toLowerCase() === ROLE_NAME.toLowerCase());
    
    if (!role) {
      console.error(`❌ Role "${ROLE_NAME}" not found in the server.`);
      console.log('Available roles:');
      guild.roles.cache.forEach(r => {
        if (!r.managed && r.name !== '@everyone') {
          console.log(`  - ${r.name}`);
        }
      });
      return;
    }

    console.log(`✅ Found role: ${role.name} (ID: ${role.id})`);

    // Find the Pyronauts role
    const pyronautsRole = guild.roles.cache.find(r => r.name.toLowerCase() === PYRONAUTS_ROLE.toLowerCase());
    
    if (!pyronautsRole) {
      console.log(`⚠️  Role "${PYRONAUTS_ROLE}" not found. Will only track "${ROLE_NAME}" assignments.`);
    } else {
      console.log(`✅ Found Pyronauts role: ${pyronautsRole.name} (ID: ${pyronautsRole.id})`);
    }

    // Process CSV file
    const results = [];
    const processedUsers = new Set();
    let successCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;
    let alreadyHadPyronautsCount = 0;
    let newlyGotPyronautsCount = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', (row) => {
          results.push(row);
        })
        .on('end', async () => {
          console.log(`📊 Found ${results.length} users in CSV`);
          
          for (let i = 0; i < results.length; i++) {
            const row = results[i];
            const username = row.discord || row.username || Object.values(row)[0];
            
            if (!username || processedUsers.has(username)) {
              continue;
            }
            
            processedUsers.add(username);
            console.log(`\n🔄 Processing ${i + 1}/${results.length}: ${username}`);
            
            try {
              // Try to find member by username
              const member = await findMemberByUsername(guild, username);
              
              if (member) {
                // Check if user already has the target role
                if (member.roles.cache.has(role.id)) {
                  console.log(`ℹ️  ${username} already has the "${ROLE_NAME}" role`);
                  
                  // Check if they also have Pyronauts role
                  if (pyronautsRole && member.roles.cache.has(pyronautsRole.id)) {
                    console.log(`🏆 ${username} also has "${PYRONAUTS_ROLE}" role`);
                    alreadyHadPyronautsCount++;
                  }
                  continue;
                }
                
                // Check if they already had Pyronauts role before getting test role
                const hadPyronautsBefore = pyronautsRole ? member.roles.cache.has(pyronautsRole.id) : false;
                
                // Add target role
                await member.roles.add(role);
                console.log(`✅ Added "${ROLE_NAME}" role to ${username}`);
                successCount++;
                
                // Check if they have Pyronauts role now
                if (pyronautsRole) {
                  if (hadPyronautsBefore) {
                    console.log(`🏆 ${username} already had "${PYRONAUTS_ROLE}" role`);
                    alreadyHadPyronautsCount++;
                  } else if (member.roles.cache.has(pyronautsRole.id)) {
                    console.log(`🏆 ${username} has both "${ROLE_NAME}" and "${PYRONAUTS_ROLE}" roles`);
                    newlyGotPyronautsCount++;
                  }
                }
                
                // Rate limiting - Discord allows 5 requests per 2 seconds
                if (i % 5 === 0 && i > 0) {
                  console.log('⏳ Rate limiting... waiting 2 seconds');
                  await delay(2000);
                }
              } else {
                console.log(`⚠️  User ${username} not found in server`);
                notFoundCount++;
              }
            } catch (error) {
              console.error(`❌ Error processing ${username}: ${error.message}`);
              errorCount++;
            }
          }
          
          console.log('\n📈 Summary:');
          console.log(`✅ Successfully added "${ROLE_NAME}" role: ${successCount}`);
          console.log(`⚠️  Users not found: ${notFoundCount}`);
          console.log(`❌ Errors: ${errorCount}`);
          
          if (pyronautsRole) {
            console.log(`\n🏆 Pyronauts Role Analysis:`);
            console.log(`👥 Users with both "${ROLE_NAME}" and "${PYRONAUTS_ROLE}" roles: ${alreadyHadPyronautsCount + newlyGotPyronautsCount}`);
            console.log(`   - Already had "${PYRONAUTS_ROLE}" before: ${alreadyHadPyronautsCount}`);
            console.log(`   - Got "${PYRONAUTS_ROLE}" after "${ROLE_NAME}": ${newlyGotPyronautsCount}`);
          }
          
          console.log('🎉 Processing complete!');
          
          resolve();
        })
        .on('error', reject);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
});

async function findMemberByUsername(guild, username) {
  try {
    // First, try to find by exact username match
    let member = guild.members.cache.find(m => 
      m.user.username.toLowerCase() === username.toLowerCase()
    );
    
    if (member) return member;
    
    // Try to find by display name
    member = guild.members.cache.find(m => 
      m.displayName.toLowerCase() === username.toLowerCase()
    );
    
    if (member) return member;
    
    // Try to find by partial username match
    member = guild.members.cache.find(m => 
      m.user.username.toLowerCase().includes(username.toLowerCase()) ||
      m.displayName.toLowerCase().includes(username.toLowerCase())
    );
    
    if (member) return member;
    
    // If still not found, try to fetch all members (if bot has permission)
    if (guild.members.cache.size < guild.memberCount) {
      console.log('📥 Fetching all guild members...');
      await guild.members.fetch();
      
      // Try again with full member list
      member = guild.members.cache.find(m => 
        m.user.username.toLowerCase() === username.toLowerCase() ||
        m.displayName.toLowerCase() === username.toLowerCase() ||
        m.user.username.toLowerCase().includes(username.toLowerCase()) ||
        m.displayName.toLowerCase().includes(username.toLowerCase())
      );
    }
    
    return member || null;
  } catch (error) {
    console.error(`Error finding member ${username}:`, error.message);
    return null;
  }
}

// Error handling
client.on('error', error => {
  console.error('❌ Discord client error:', error);
});

client.on('warn', warning => {
  console.warn('⚠️  Discord client warning:', warning);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down bot...');
  client.destroy();
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
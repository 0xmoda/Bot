require('dotenv').config();
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

const PYRONAUTS_ROLE = 'Pyronauts';

// List of usernames to remove Pyronauts role from
const usernamesToRemoveRole = [
  'bjorcaa', 'bodia9475', 'chak3372_70383', 'noob2711', 'altafbhay',
  'pelasan', 'koneko5241', 'akton0208', 'bimasee33', 'alhisyam',
  'budi846', 'baconcheese21', '.dodori', 'edward_243', 'kesoonho',
  'batiiiix', 'grishaiv', 'hiroshi_50712', 'phucvo652', 'ariamandra'
];

// Rate limiting helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

client.once('ready', async () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
  console.log(`🗑️  Removing "${PYRONAUTS_ROLE}" role from users`);
  console.log(`📋 Processing ${usernamesToRemoveRole.length} usernames`);

  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    console.log(`🏠 Connected to guild: ${guild.name}`);

    // Find the Pyronauts role
    const pyronautsRole = guild.roles.cache.find(r => r.name.toLowerCase() === PYRONAUTS_ROLE.toLowerCase());
    
    if (!pyronautsRole) {
      console.error(`❌ Role "${PYRONAUTS_ROLE}" not found in the server.`);
      console.log('Available roles:');
      guild.roles.cache.forEach(r => {
        if (!r.managed && r.name !== '@everyone') {
          console.log(`  - ${r.name}`);
        }
      });
      return;
    }

    console.log(`✅ Found role: ${pyronautsRole.name} (ID: ${pyronautsRole.id})`);

    const results = {
      success: [],
      alreadyNoRole: [],
      notFound: [],
      errors: []
    };

    console.log('\n🔄 Removing roles...\n');

    for (let i = 0; i < usernamesToRemoveRole.length; i++) {
      const username = usernamesToRemoveRole[i];
      console.log(`\n🔄 Processing ${i + 1}/${usernamesToRemoveRole.length}: ${username}`);
      
      try {
        const member = await findMemberByUsername(guild, username);
        
        if (member) {
          // Check if user has the Pyronauts role
          if (member.roles.cache.has(pyronautsRole.id)) {
            // Remove role
            await member.roles.remove(pyronautsRole);
            console.log(`✅ Removed "${PYRONAUTS_ROLE}" role from ${username}`);
            results.success.push(username);
          } else {
            console.log(`ℹ️  ${username} doesn't have the "${PYRONAUTS_ROLE}" role`);
            results.alreadyNoRole.push(username);
          }
          
          // Rate limiting - Discord allows 5 requests per 2 seconds
          if (i % 5 === 0 && i > 0) {
            console.log('⏳ Rate limiting... waiting 2 seconds');
            await delay(2000);
          }
        } else {
          console.log(`⚠️  ${username} not found in server`);
          results.notFound.push(username);
        }
      } catch (error) {
        console.error(`❌ Error processing ${username}: ${error.message}`);
        results.errors.push(username);
      }
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Successfully removed "${PYRONAUTS_ROLE}" role: ${results.success.length}`);
    console.log(`ℹ️  Already didn't have "${PYRONAUTS_ROLE}" role: ${results.alreadyNoRole.length}`);
    console.log(`⚠️  Users not found in server: ${results.notFound.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);

    if (results.success.length > 0) {
      console.log('\n✅ Successfully removed role from:');
      results.success.forEach(username => console.log(`  - ${username}`));
    }

    if (results.alreadyNoRole.length > 0) {
      console.log('\nℹ️  Users who already didn\'t have the role:');
      results.alreadyNoRole.forEach(username => console.log(`  - ${username}`));
    }

    if (results.notFound.length > 0) {
      console.log('\n⚠️  Users not found in server:');
      results.notFound.forEach(username => console.log(`  - ${username}`));
    }

    console.log('\n🎉 Role removal complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
});

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
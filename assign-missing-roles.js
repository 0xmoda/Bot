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

const ROLE_NAME = process.env.ROLE_NAME || 'test';

// List of usernames that need the test role (from the check results)
const usernamesToAssign = [
  'burhan_gm', 'flintfogo', 'fogofox_1', '0xgloryoum', 'wizzingg', 'jakeones11',
  'kengv6740', 'ember_pyron', 'thee_holy_son', 'shr1nko', 'minhduc2510.it',
  'poqi.sol', 'phong2461', 'wwkol', 'gabup77', 'arfprks98', 'orang2ancrypto',
  'blackkucing_', 'xhena6', 'zhzh_22', 'kharather', 'oxygen_web3', 'kingofwar0295',
  'billgusssss', 'bittime', 'imkuvalda', 'harmansyah0215_95897', 'bhavin07',
  'demon_bi99', 'nuel0751', 'dretan12', 'nunis0', 'ngocthanhwin.161', 'cryptospot27',
  'burak7058', '0xsmile_', 'sidus0759', 'auroraevm', '0xmybaba', 'marinaafesa',
  'yash_2214', 'diki21', 'nongwaan', 'baconcheese21', 'badjon1', 'bodia9475',
  '.dancrypto', 'dovvvv', 'eno8322', 'flaha_dter', 'joshey9854', 'notuzz.sol',
  'oldtora', '0regan0flakes', 'rickpeak', 'rogalevlion', 'waytoff', 'jong3928',
  'major5599', 'cmfeint', 'cm_gon', 'itsjowe'
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
  console.log(`🎯 Assigning "${ROLE_NAME}" role to missing users`);
  console.log(`📋 Processing ${usernamesToAssign.length} usernames`);

  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    console.log(`🏠 Connected to guild: ${guild.name}`);

    // Find the role
    const role = guild.roles.cache.find(r => r.name.toLowerCase() === ROLE_NAME.toLowerCase());
    
    if (!role) {
      console.error(`❌ Role "${ROLE_NAME}" not found in the server.`);
      return;
    }

    console.log(`✅ Found role: ${role.name} (ID: ${role.id})`);

    const results = {
      success: [],
      alreadyHasRole: [],
      notFound: [],
      errors: []
    };

    console.log('\n🔄 Assigning roles...\n');

    for (let i = 0; i < usernamesToAssign.length; i++) {
      const username = usernamesToAssign[i];
      console.log(`\n🔄 Processing ${i + 1}/${usernamesToAssign.length}: ${username}`);
      
      try {
        const member = await findMemberByUsername(guild, username);
        
        if (member) {
          // Check if user already has the role
          if (member.roles.cache.has(role.id)) {
            console.log(`ℹ️  ${username} already has the "${ROLE_NAME}" role`);
            results.alreadyHasRole.push(username);
            continue;
          }
          
          // Add role
          await member.roles.add(role);
          console.log(`✅ Added "${ROLE_NAME}" role to ${username}`);
          results.success.push(username);
          
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
    console.log(`✅ Successfully added "${ROLE_NAME}" role: ${results.success.length}`);
    console.log(`ℹ️  Already had "${ROLE_NAME}" role: ${results.alreadyHasRole.length}`);
    console.log(`⚠️  Users not found in server: ${results.notFound.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);

    if (results.success.length > 0) {
      console.log('\n✅ Successfully assigned role to:');
      results.success.forEach(username => console.log(`  - ${username}`));
    }

    if (results.notFound.length > 0) {
      console.log('\n⚠️  Users not found in server:');
      results.notFound.forEach(username => console.log(`  - ${username}`));
    }

    console.log('\n🎉 Role assignment complete!');
    
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
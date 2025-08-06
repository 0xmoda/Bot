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

// List of usernames to check
const usernamesToCheck = [
  'burhan_gm', 'flintfogo', 'fogofox_1', '0xgloryoum', 'wizzingg', 'jakeones11',
  'kengv6740', 'ember_pyron', 'thee_holy_son', 'shr1nko', 'minhduc2510.it',
  'poqi.sol', 'bablgun', 'phong2461', 'wwkol', 'gabup77', 'arfprks98',
  'orang2ancrypto', 'blackkucing_', 'xhena6', 'zhzh_22', 'kharather',
  'oxygen_web3', 'kingofwar0295', 'billgusssss', 'bittime', 'imkuvalda',
  'harmansyah0215_95897', 'bhavin07', 'demon_bi99', 'nuel0751', 'dretan12',
  'nunis0', 'ngocthanhwin.161', 'cryptospot27', 'burak7058', '0xsmile_',
  'sidus0759', 'auroraevm', '0xmybaba', 'marinaafesa', 'yash_2214', 'diki21',
  'nongwaan', 'baconcheese21', 'badjon1', 'pff7430', 'bodia9475', '.dancrypto',
  'dovvvv', 'eno8322', 'flaha_dter', 'good_boy98', 'joshey9854', 'koldovantus',
  'notuzz.sol', 'oldtora', '0regan0flakes', 'paulinjohitmask', 'rickpeak',
  'rogalevlion', 's1qed', 'savip.', 'sebmontgomery', '0xstryke', 'waytoff',
  'yurii760', 'GigaBlaze', 'appl22', 'crankywakker', '.dodori', 'jong3928',
  'major5599', 'cmfeint', 'cmgambit', 'cm_gon', 'itsjowe'
];

// Remove duplicates
const uniqueUsernames = [...new Set(usernamesToCheck)];

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
  console.log(`🎯 Checking for "${ROLE_NAME}" role`);
  console.log(`📋 Checking ${uniqueUsernames.length} unique usernames`);

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
      hasRole: [],
      missingRole: [],
      notFound: [],
      errors: []
    };

    console.log('\n🔍 Checking usernames...\n');

    for (let i = 0; i < uniqueUsernames.length; i++) {
      const username = uniqueUsernames[i];
      console.log(`\n🔄 Checking ${i + 1}/${uniqueUsernames.length}: ${username}`);
      
      try {
        const member = await findMemberByUsername(guild, username);
        
        if (member) {
          if (member.roles.cache.has(role.id)) {
            console.log(`✅ ${username} HAS the "${ROLE_NAME}" role`);
            results.hasRole.push(username);
          } else {
            console.log(`❌ ${username} MISSING the "${ROLE_NAME}" role`);
            results.missingRole.push(username);
          }
        } else {
          console.log(`⚠️  ${username} not found in server`);
          results.notFound.push(username);
        }
      } catch (error) {
        console.error(`❌ Error checking ${username}: ${error.message}`);
        results.errors.push(username);
      }
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Users WITH "${ROLE_NAME}" role: ${results.hasRole.length}`);
    console.log(`❌ Users MISSING "${ROLE_NAME}" role: ${results.missingRole.length}`);
    console.log(`⚠️  Users not found in server: ${results.notFound.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);

    if (results.hasRole.length > 0) {
      console.log('\n✅ Users WITH role:');
      results.hasRole.forEach(username => console.log(`  - ${username}`));
    }

    if (results.missingRole.length > 0) {
      console.log('\n❌ Users MISSING role:');
      results.missingRole.forEach(username => console.log(`  - ${username}`));
    }

    if (results.notFound.length > 0) {
      console.log('\n⚠️  Users not found in server:');
      results.notFound.forEach(username => console.log(`  - ${username}`));
    }

    console.log('\n🎉 Role check complete!');
    
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
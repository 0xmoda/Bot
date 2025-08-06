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

const TEST_ROLE = process.env.ROLE_NAME || 'test';
const PYRONAUTS_ROLE = 'Pyronauts';

client.once('ready', async () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
  console.log(`🔍 Analyzing role overlap between "${TEST_ROLE}" and "${PYRONAUTS_ROLE}"`);

  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    console.log(`🏠 Connected to guild: ${guild.name}`);

    // Find the roles
    const testRole = guild.roles.cache.find(r => r.name.toLowerCase() === TEST_ROLE.toLowerCase());
    const pyronautsRole = guild.roles.cache.find(r => r.name.toLowerCase() === PYRONAUTS_ROLE.toLowerCase());
    
    if (!testRole) {
      console.error(`❌ Role "${TEST_ROLE}" not found in the server.`);
      return;
    }

    if (!pyronautsRole) {
      console.error(`❌ Role "${PYRONAUTS_ROLE}" not found in the server.`);
      return;
    }

    console.log(`✅ Found "${TEST_ROLE}" role: ${testRole.name} (ID: ${testRole.id})`);
    console.log(`✅ Found "${PYRONAUTS_ROLE}" role: ${pyronautsRole.name} (ID: ${pyronautsRole.id})`);

    // Fetch all members to get complete data
    console.log('\n📥 Fetching all guild members...');
    await guild.members.fetch();

    const results = {
      testOnly: [],
      pyronautsOnly: [],
      bothRoles: [],
      neitherRole: []
    };

    console.log('\n🔍 Analyzing member roles...\n');

    guild.members.cache.forEach(member => {
      const hasTest = member.roles.cache.has(testRole.id);
      const hasPyronauts = member.roles.cache.has(pyronautsRole.id);
      const username = member.user.username;

      if (hasTest && hasPyronauts) {
        results.bothRoles.push(username);
        console.log(`🏆 ${username} has BOTH "${TEST_ROLE}" and "${PYRONAUTS_ROLE}" roles`);
      } else if (hasTest && !hasPyronauts) {
        results.testOnly.push(username);
        console.log(`✅ ${username} has "${TEST_ROLE}" role only`);
      } else if (!hasTest && hasPyronauts) {
        results.pyronautsOnly.push(username);
        console.log(`🏆 ${username} has "${PYRONAUTS_ROLE}" role only`);
      } else {
        results.neitherRole.push(username);
      }
    });

    // Summary
    console.log('\n📊 ROLE ANALYSIS SUMMARY:');
    console.log(`🏆 Users with BOTH "${TEST_ROLE}" and "${PYRONAUTS_ROLE}" roles: ${results.bothRoles.length}`);
    console.log(`✅ Users with "${TEST_ROLE}" role only: ${results.testOnly.length}`);
    console.log(`🏆 Users with "${PYRONAUTS_ROLE}" role only: ${results.pyronautsOnly.length}`);
    console.log(`❌ Users with neither role: ${results.neitherRole.length}`);
    console.log(`📊 Total members analyzed: ${guild.members.cache.size}`);

    // Calculate percentages
    const totalMembers = guild.members.cache.size;
    const testRoleHolders = results.bothRoles.length + results.testOnly.length;
    const pyronautsRoleHolders = results.bothRoles.length + results.pyronautsOnly.length;
    
    console.log('\n📈 PERCENTAGES:');
    console.log(`📊 ${TEST_ROLE} role holders: ${testRoleHolders} (${((testRoleHolders/totalMembers)*100).toFixed(1)}%)`);
    console.log(`📊 ${PYRONAUTS_ROLE} role holders: ${pyronautsRoleHolders} (${((pyronautsRoleHolders/totalMembers)*100).toFixed(1)}%)`);
    console.log(`📊 Overlap (both roles): ${results.bothRoles.length} (${((results.bothRoles.length/totalMembers)*100).toFixed(1)}%)`);

    if (testRoleHolders > 0) {
      const overlapPercentage = ((results.bothRoles.length / testRoleHolders) * 100).toFixed(1);
      console.log(`📊 Of ${TEST_ROLE} holders, ${overlapPercentage}% also have ${PYRONAUTS_ROLE} role`);
    }

    if (results.bothRoles.length > 0) {
      console.log('\n🏆 Users with BOTH roles:');
      results.bothRoles.forEach(username => console.log(`  - ${username}`));
    }

    if (results.testOnly.length > 0) {
      console.log(`\n✅ Users with "${TEST_ROLE}" role only (first 10):`);
      results.testOnly.slice(0, 10).forEach(username => console.log(`  - ${username}`));
      if (results.testOnly.length > 10) {
        console.log(`  ... and ${results.testOnly.length - 10} more`);
      }
    }

    console.log('\n🎉 Analysis complete!');
    
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
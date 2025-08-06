const fs = require('fs');
const csv = require('csv-parser');

console.log('🔍 Testing CSV file format...\n');

const results = [];
const usernames = new Set();

fs.createReadStream('users.csv')
  .pipe(csv())
  .on('data', (row) => {
    results.push(row);
    
    // Extract username from various possible column names
    const username = row.discord || row.username || Object.values(row)[0];
    
    if (username) {
      usernames.add(username);
    }
  })
  .on('end', () => {
    console.log(`📊 CSV Analysis:`);
    console.log(`Total rows: ${results.length}`);
    console.log(`Unique usernames: ${usernames.size}`);
    console.log(`\n📋 Column names found: ${Object.keys(results[0] || {}).join(', ')}`);
    
    console.log('\n👥 First 10 usernames that will be processed:');
    Array.from(usernames).slice(0, 10).forEach((username, index) => {
      console.log(`${index + 1}. ${username}`);
    });
    
    if (usernames.size > 10) {
      console.log(`... and ${usernames.size - 10} more`);
    }
    
    console.log('\n✅ CSV file is ready for processing!');
  })
  .on('error', (error) => {
    console.error('❌ Error reading CSV file:', error.message);
  }); 
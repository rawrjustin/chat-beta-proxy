// Test script for character configs API
require('dotenv').config();
const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testCharactersAPI() {
  console.log('🧪 Testing Character Configs API\n');
  console.log('=' .repeat(60));
  console.log();

  try {
    // Test: Get multiple character configs
    console.log('1️⃣  Get Multiple Character Configs');
    console.log('-'.repeat(60));
    
    const configIds = [
      'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4',
      // Add more config IDs here as needed
    ];

    const response = await fetch(`${BASE_URL}/api/configs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config_ids: configIds })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Error:', response.status, error);
    } else {
      const data = await response.json();
      console.log('✅ Success!');
      console.log('   Requested:', data.requested);
      console.log('   Retrieved:', data.retrieved);
      console.log('   Config IDs:', Object.keys(data.configs));
      console.log();
      
      // Show sample config structure
      const firstConfigId = Object.keys(data.configs)[0];
      if (firstConfigId) {
        const config = data.configs[firstConfigId];
        console.log(`   Sample config (${firstConfigId}):`);
        console.log('   Keys:', Object.keys(config).slice(0, 10).join(', '), '...');
      }
    }
    console.log();

    // Test: Get single character config (existing endpoint)
    console.log('2️⃣  Get Single Character Config (existing endpoint)');
    console.log('-'.repeat(60));
    
    const singleConfigId = 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4';
    const singleResponse = await fetch(`${BASE_URL}/api/config/${singleConfigId}`);
    
    if (singleResponse.ok) {
      const config = await singleResponse.json();
      console.log('✅ Single config retrieved');
      console.log('   Config keys:', Object.keys(config).slice(0, 10).join(', '), '...');
    } else {
      console.log('⚠️  Single config fetch:', singleResponse.status);
    }
    console.log();

    console.log('=' .repeat(60));
    console.log('🎉 Character API tests complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testCharactersAPI();


// Test preprompts feature
require('dotenv').config();
const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONFIG_ID = 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4';

async function testPreprompts() {
  console.log('🧪 Testing Preprompts Feature\n');
  console.log('='.repeat(60));
  console.log();

  try {
    // Test 1: Health Check
    console.log('1️⃣  Health Check');
    console.log('-'.repeat(60));
    const healthRes = await fetch(`${BASE_URL}/health`);
    if (!healthRes.ok) {
      throw new Error(`Server not running: ${healthRes.status}`);
    }
    const health = await healthRes.json();
    console.log('✅ Server is running');
    console.log('   Status:', health.status);
    console.log();

    // Test 2: Send Chat Message and Check for Preprompts
    console.log('2️⃣  Test Chat Endpoint with Preprompts');
    console.log('-'.repeat(60));
    
    const chatRes = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: '',
        config_id: CONFIG_ID,
        input: 'Hello! Tell me something interesting about yourself.'
      })
    });

    if (!chatRes.ok) {
      const error = await chatRes.text();
      throw new Error(`Chat request failed: ${chatRes.status} ${error}`);
    }

    const chatResponse = await chatRes.json();
    console.log('✅ Chat response received');
    console.log('   Session ID:', chatResponse.session_id);
    console.log('   AI Response:', chatResponse.ai ? chatResponse.ai.substring(0, 100) + '...' : 'N/A');
    
    // Check for preprompts
    if (chatResponse.preprompts) {
      console.log('   ✅ Preprompts found:', chatResponse.preprompts.length);
      console.log('   Preprompts structure:');
      chatResponse.preprompts.forEach((p, i) => {
        console.log(`      ${i + 1}. [${p.type}] "${p.simplified_text}"`);
        console.log(`         Full: "${p.prompt}"`);
      });
      
      // Validate structure
      if (Array.isArray(chatResponse.preprompts) && chatResponse.preprompts.length === 4) {
        console.log('   ✅ Valid: Exactly 4 preprompts returned');
        
        const hasRequiredFields = chatResponse.preprompts.every(p => 
          p.type && p.prompt && p.simplified_text
        );
        if (hasRequiredFields) {
          console.log('   ✅ Valid: All preprompts have required fields (type, prompt, simplified_text)');
        } else {
          console.log('   ⚠️  Warning: Some preprompts missing required fields');
        }
        
        const roleplayCount = chatResponse.preprompts.filter(p => p.type === 'roleplay').length;
        const conversationCount = chatResponse.preprompts.filter(p => p.type === 'conversation').length;
        console.log(`   ✅ Types: ${roleplayCount} roleplay, ${conversationCount} conversation`);
      } else {
        console.log(`   ⚠️  Warning: Expected 4 preprompts, got ${chatResponse.preprompts.length}`);
      }
    } else {
      console.log('   ⚠️  Warning: No preprompts in response');
      console.log('   Response keys:', Object.keys(chatResponse));
    }
    console.log();

    // Test 3: Test Followups Endpoint
    console.log('3️⃣  Test Followups Endpoint');
    console.log('-'.repeat(60));
    
    const followupsRes = await fetch(`${BASE_URL}/api/followups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_turn: 'What do you think about artificial intelligence?',
        assistant_turn: 'I think AI is fascinating! It has the potential to transform many aspects of our lives, from healthcare to education. What specific area interests you?'
      })
    });

    if (!followupsRes.ok) {
      const error = await followupsRes.text();
      console.log('   ⚠️  Followups request failed:', followupsRes.status, error.substring(0, 200));
    } else {
      const followupsResponse = await followupsRes.json();
      console.log('✅ Followups response received');
      
      if (followupsResponse.preprompts) {
        console.log('   ✅ Preprompts found:', followupsResponse.preprompts.length);
        console.log('   Preprompts structure:');
        followupsResponse.preprompts.forEach((p, i) => {
          console.log(`      ${i + 1}. [${p.type}] "${p.simplified_text}"`);
          console.log(`         Full: "${p.prompt}"`);
        });
        
        // Validate structure
        if (Array.isArray(followupsResponse.preprompts) && followupsResponse.preprompts.length === 4) {
          console.log('   ✅ Valid: Exactly 4 preprompts returned');
        } else {
          console.log(`   ⚠️  Warning: Expected 4 preprompts, got ${followupsResponse.preprompts?.length || 0}`);
        }
      } else {
        console.log('   ⚠️  Warning: No preprompts in response');
        console.log('   Response:', JSON.stringify(followupsResponse, null, 2));
      }
    }
    console.log();

    // Summary
    console.log('='.repeat(60));
    console.log('🎉 Preprompts Feature Test Completed!');
    console.log();
    console.log('Summary:');
    console.log('  ✅ Server is running');
    console.log('  ✅ Chat endpoint tested');
    console.log('  ✅ Followups endpoint tested');
    console.log();

  } catch (error) {
    console.error();
    console.error('❌ Test Failed:', error.message);
    console.error();
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

testPreprompts();


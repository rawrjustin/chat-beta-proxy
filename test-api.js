// Simple test script to demonstrate API usage
// Run with: node test-api.js

const BASE_URL = 'http://localhost:3000';
const CONFIG_ID = 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4';

async function testAPI() {
  try {
    console.log('🧪 Testing Chat Proxy API\n');

    // Step 1: Health check
    console.log('1. Health check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const health = await healthResponse.json();
    console.log('✅ Health:', health.status, '\n');

    // Step 2: Create a session
    console.log('2. Creating chat session...');
    const sessionResponse = await fetch(`${BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config_id: CONFIG_ID })
    });

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      throw new Error(`Failed to create session: ${error}`);
    }

    const session = await sessionResponse.json();
    console.log('✅ Session created:', session.id, '\n');

    // Step 3: Send a chat message
    console.log('3. Sending chat message...');
    const chatResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: session.id,
        config_id: CONFIG_ID,
        input: 'Hello! How are you doing today?'
      })
    });

    if (!chatResponse.ok) {
      const error = await chatResponse.text();
      throw new Error(`Failed to send chat: ${error}`);
    }

    const chat = await chatResponse.json();
    console.log('✅ Chat response received:');
    console.log('   AI:', chat.ai);
    console.log('   Session ID:', chat.session_id, '\n');

    // Step 4: Send another message in the same session
    console.log('4. Sending follow-up message...');
    const followUpResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: session.id,
        config_id: CONFIG_ID,
        input: 'Tell me a joke!'
      })
    });

    if (!followUpResponse.ok) {
      const error = await followUpResponse.text();
      throw new Error(`Failed to send follow-up: ${error}`);
    }

    const followUp = await followUpResponse.json();
    console.log('✅ Follow-up response:');
    console.log('   AI:', followUp.ai, '\n');

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run tests
testAPI();

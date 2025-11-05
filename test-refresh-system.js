// Comprehensive refresh system test
require('dotenv').config();
const fetch = require('node-fetch');
const { jwtDecode } = require('jwt-decode');

const TOKEN_REFRESH_URL = process.env.TOKEN_REFRESH_URL || 'https://api.genies.com/auth/v2/refresh-session';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

async function testRefreshSystem() {
  console.log('🧪 Comprehensive Token Refresh System Test\n');
  console.log('=' .repeat(60));
  console.log();

  // 1. Check current token status
  console.log('1️⃣ Current Token Status');
  console.log('-'.repeat(60));
  
  if (!AUTH_TOKEN) {
    console.log('❌ AUTH_TOKEN not set');
    return;
  }

  try {
    const decoded = jwtDecode(AUTH_TOKEN);
    const exp = new Date(decoded.exp * 1000);
    const now = new Date();
    const mins = Math.floor((exp - now) / 60000);
    const seconds = Math.floor((exp - now) / 1000) % 60;
    
    console.log('Token expires:', exp.toISOString());
    console.log('Current time:', now.toISOString());
    console.log('Time until expiry:', mins > 0 ? `${mins} minutes ${seconds} seconds` : 'EXPIRED');
    console.log('Token is valid:', mins > 0 ? '✅ YES' : '❌ NO');
    console.log();
  } catch (error) {
    console.log('❌ Error decoding token:', error.message);
    return;
  }

  // 2. Test refresh token availability
  console.log('2️⃣ Refresh Token Status');
  console.log('-'.repeat(60));
  console.log('REFRESH_TOKEN:', REFRESH_TOKEN ? '✅ SET' : '❌ NOT SET');
  console.log('REFRESH_TOKEN value:', REFRESH_TOKEN ? `${REFRESH_TOKEN.substring(0, 10)}...` : 'N/A');
  console.log();

  if (!REFRESH_TOKEN) {
    console.log('❌ Cannot test refresh - REFRESH_TOKEN not set');
    return;
  }

  // 3. Test refresh endpoint
  console.log('3️⃣ Testing Refresh Endpoint');
  console.log('-'.repeat(60));
  
  try {
    // Extract organizationId from access token
    let organizationId = null;
    try {
      const decoded = jwtDecode(AUTH_TOKEN);
      organizationId = decoded.org_id || null;
      if (organizationId) {
        console.log('Found organizationId in token:', organizationId);
      }
    } catch (error) {
      console.log('Could not extract organizationId from token');
    }

    const requestBody = {
      refreshToken: REFRESH_TOKEN,
    };
    
    if (organizationId) {
      requestBody.organizationId = organizationId;
    }

    console.log('Endpoint:', TOKEN_REFRESH_URL);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    console.log();

    const startTime = Date.now();
    const response = await fetch(TOKEN_REFRESH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseTime = Date.now() - startTime;
    console.log('Response Status:', response.status, response.statusText);
    console.log('Response Time:', `${responseTime}ms`);
    console.log();

    const responseText = await response.text();
    console.log('Response Body:', responseText);
    console.log();

    if (!response.ok) {
      console.log('❌ Token refresh FAILED!');
      console.log('Status:', response.status);
      console.log('Error:', responseText);
      console.log();
      console.log('⚠️  This means the refresh token is invalid or expired.');
      console.log('   The service will work with the current access token until it expires.');
      console.log('   When the access token expires, you will need to manually update it.');
      return;
    }

    try {
      const data = JSON.parse(responseText);
      console.log('✅ Token refresh SUCCESSFUL!');
      console.log();
      
      if (data.accessToken) {
        const newDecoded = jwtDecode(data.accessToken);
        const newExp = new Date(newDecoded.exp * 1000);
        const newMins = Math.floor((newExp - Date.now()) / 60000);
        
        console.log('New Access Token:');
        console.log('  - Expires:', newExp.toISOString());
        console.log('  - Valid for:', `${newMins} minutes`);
        console.log('  - User:', newDecoded.email || newDecoded.sub);
        console.log();
      }
      
      if (data.refreshToken) {
        console.log('New Refresh Token received:', data.refreshToken.substring(0, 15) + '...');
        console.log('  ⚠️  Update REFRESH_TOKEN in .env with this new token');
        console.log();
      }

      console.log('✅ Refresh system is WORKING!');
      console.log('   Tokens will be automatically refreshed when needed.');
      
    } catch (parseError) {
      console.log('⚠️  Response is not valid JSON:', parseError.message);
      console.log('Raw response:', responseText);
    }

  } catch (error) {
    console.log('❌ Error calling refresh endpoint:');
    console.log('Error:', error.message);
    if (error.stack) {
      console.log('Stack:', error.stack.split('\n').slice(0, 3).join('\n'));
    }
  }

  console.log();
  console.log('=' .repeat(60));
  console.log('🎉 Test Complete');
}

testRefreshSystem();


// Debug token refresh mechanism
require('dotenv').config();
const fetch = require('node-fetch');
const { jwtDecode } = require('jwt-decode');

const TOKEN_REFRESH_URL = process.env.TOKEN_REFRESH_URL || 'https://api.genies.com/auth/v2/refresh-session';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

async function debugTokenRefresh() {
  console.log('🔍 Token Refresh Debug\n');
  console.log('=' .repeat(60));
  console.log();

  // Check tokens
  console.log('1️⃣ Token Configuration');
  console.log('-'.repeat(60));
  console.log('AUTH_TOKEN:', AUTH_TOKEN ? '✅ SET' : '❌ NOT SET');
  console.log('REFRESH_TOKEN:', REFRESH_TOKEN ? '✅ SET' : '❌ NOT SET');
  console.log('TOKEN_REFRESH_URL:', TOKEN_REFRESH_URL);
  console.log();

  if (!REFRESH_TOKEN) {
    console.log('❌ REFRESH_TOKEN not set. Cannot test refresh.');
    return;
  }

  // Check current token expiry
  if (AUTH_TOKEN) {
    try {
      const decoded = jwtDecode(AUTH_TOKEN);
      const exp = new Date(decoded.exp * 1000);
      const now = new Date();
      const mins = Math.floor((exp - now) / 60000);
      console.log('Current AUTH_TOKEN expires:', exp.toISOString());
      console.log('Time until expiry:', mins > 0 ? `${mins} minutes` : 'EXPIRED');
    } catch (error) {
      console.log('⚠️  Error decoding AUTH_TOKEN:', error.message);
    }
    console.log();
  }

  // Test refresh endpoint
  console.log('2️⃣ Testing Token Refresh Endpoint');
  console.log('-'.repeat(60));
  
  try {
    console.log('Calling:', TOKEN_REFRESH_URL);
    console.log('Method: POST');
    console.log('Body:', JSON.stringify({ refreshToken: REFRESH_TOKEN }, null, 2));
    console.log();

    const response = await fetch(TOKEN_REFRESH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: REFRESH_TOKEN,
      }),
    });

    console.log('Response Status:', response.status, response.statusText);
    console.log('Response Headers:', JSON.stringify(Object.fromEntries(response.headers), null, 2));
    console.log();

    const responseText = await response.text();
    console.log('Response Body:', responseText);
    console.log();

    if (!response.ok) {
      console.log('❌ Token refresh failed!');
      console.log('Status:', response.status);
      console.log('Error:', responseText);
      return;
    }

    try {
      const data = JSON.parse(responseText);
      console.log('✅ Token refresh successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
      
      if (data.accessToken) {
        const decoded = jwtDecode(data.accessToken);
        const exp = new Date(decoded.exp * 1000);
        console.log('New access token expires:', exp.toISOString());
      }
      
      if (data.refreshToken) {
        console.log('New refresh token received:', data.refreshToken.substring(0, 20) + '...');
      }
    } catch (parseError) {
      console.log('⚠️  Response is not valid JSON:', parseError.message);
    }

  } catch (error) {
    console.log('❌ Error calling refresh endpoint:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }

  console.log();
  console.log('=' .repeat(60));
  console.log('🔍 Debug complete');
}

debugTokenRefresh();


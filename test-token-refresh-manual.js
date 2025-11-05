// Test script to manually trigger token refresh
// This tests the refresh token functionality

require('dotenv').config();
const fetch = require('node-fetch');

const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const TOKEN_REFRESH_URL = process.env.TOKEN_REFRESH_URL || 'https://api.genies.com/auth/v2/refresh-session';

async function testTokenRefresh() {
  console.log('🔄 Testing Token Refresh\n');

  if (!REFRESH_TOKEN) {
    console.error('❌ REFRESH_TOKEN not found in environment');
    console.log('   Make sure REFRESH_TOKEN is set in .env file');
    process.exit(1);
  }

  console.log('Refresh Token:', REFRESH_TOKEN.substring(0, 20) + '...');
  console.log('Refresh URL:', TOKEN_REFRESH_URL);
  console.log();

  try {
    console.log('Calling token refresh endpoint...');
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Token refresh failed:');
      console.error('   Status:', response.status);
      console.error('   Error:', errorText);
      process.exit(1);
    }

    const data = await response.json();
    
    console.log('\n✅ Token refresh successful!');
    console.log('New Access Token:', data.accessToken ? data.accessToken.substring(0, 50) + '...' : 'N/A');
    console.log('New Refresh Token:', data.refreshToken ? data.refreshToken.substring(0, 20) + '...' : 'N/A');
    console.log();

    if (data.accessToken) {
      const { jwtDecode } = require('jwt-decode');
      try {
        const decoded = jwtDecode(data.accessToken);
        const expiresAt = new Date(decoded.exp * 1000);
        const now = new Date();
        const timeUntilExpiry = expiresAt - now;
        const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
        const minutesUntilExpiry = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60));

        console.log('Token Information:');
        console.log('  User ID:', decoded.sub);
        console.log('  Email:', decoded.email || 'N/A');
        console.log('  Expires At:', expiresAt.toISOString());
        console.log('  Time Until Expiry:', `${hoursUntilExpiry}h ${minutesUntilExpiry}m`);
        console.log();
      } catch (e) {
        console.log('Could not decode token:', e.message);
      }
    }

    console.log('🎉 Token refresh test completed successfully!');

  } catch (error) {
    console.error('❌ Error during token refresh:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testTokenRefresh();


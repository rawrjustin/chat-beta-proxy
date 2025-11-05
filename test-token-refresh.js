// Test script to demonstrate token refresh functionality
// This simulates what happens when token refresh is enabled

const { jwtDecode } = require('jwt-decode');

const token = process.env.AUTH_TOKEN || 'eyJhbGciOiJSUzI1NiIsImtpZCI6InNzb19vaWRjX2tleV9wYWlyXzAxSzRORzJHMTdOSzU2MlNYMjlSMVdLTVNTIn0.eyJzdWJqZWN0IjoidXNlcl8wMUs3UUNBMVlSN1A4ODU4VFA1VFFGMUc5MiIsImVtYWlsIjoic2VpamlAZ2VuaWVzLmNvbSIsImdlbmllc19pZCI6ImJjODA3NGVkLTQ2ZjQtNDM1YS04MjA2LTYyY2JiNTA2NmU0MyIsImFwcF9pZCI6IiIsImF1ZCI6ImNsaWVudF8wMUs0TkcyR0EwQVQ3NFkzNk1RUjlLRkFGWCIsImlzcyI6Imh0dHBzOi8vYXBpLndvcmtvcy5jb20vdXNlcl9tYW5hZ2VtZW50L2NsaWVudF8wMUs0TkcyR0EwQVQ3NFkzNk1RUjlLRkFGWCIsInN1YiI6InVzZXJfMDFLN1FDQTFZUjdQODg1OFRQNVRRRjFHOTIiLCJzaWQiOiJzZXNzaW9uXzAxSzk4TVpUS1dXTVBaQ1JRNzJLN04zSllBIiwianRpIjoiMDFLOThSOFgyODhTRE5YN1pDUjQ5TUJOQVAiLCJvcmdfaWQiOiJvcmdfMDFLNzJHR0s5OEcxQjRLWFZGWTlOOFc2TVAiLCJyb2xlIjoibWVtYmVyIiwicm9sZXMiOlsibWVtYmVyIl0sInBlcm1pc3Npb25zIjpbXSwiZXhwIjoxNzYyMzA3ODI2LCJpYXQiOjE3NjIzMDQyMjZ9.uJH5DkEA5jRcXm6GzImlCHvRoDk1eUTXBL8x-08NtnGUwPBN2LntJscG28V3XDNgmwE9Jhme27aHJSsmyaeTewihg9HS98toRdSUEJhwGfWHeVZiJInC5BUhpPslAp2kMZhvW5bN-JsTEfmWkSiB2cSx23yxqmR9u6Ngno5zLFcd-gHLe4WCW601PgsZQ2sCuOjIeTTnMp0lOc3Y8oW6Np2lx0niny-A6YPrRoIILYkEzsbZMNBY_jsVvBq5fHX-8hhff2p-koPoCYMCI2Mfl0HU8PwoOjcBdEwS9_JB_gZ2eLx1s56Sb_MOaLpNv9qiy4ZvLyF2Xmf7oysvND7BBg';

console.log('🔐 Token Refresh Test\n');

try {
  const decoded = jwtDecode(token);

  console.log('Token Information:');
  console.log('==================');
  console.log('User ID:', decoded.sub);
  console.log('Email:', decoded.email || 'N/A');
  console.log('Issuer:', decoded.iss);
  console.log('Organization:', decoded.org_id || 'N/A');
  console.log();

  const issuedAt = new Date(decoded.iat * 1000);
  const expiresAt = new Date(decoded.exp * 1000);
  const now = new Date();

  console.log('Token Timestamps:');
  console.log('=================');
  console.log('Issued At:', issuedAt.toISOString());
  console.log('Expires At:', expiresAt.toISOString());
  console.log('Current Time:', now.toISOString());
  console.log();

  const timeUntilExpiry = expiresAt - now;
  const daysUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60 * 24));
  const hoursUntilExpiry = Math.floor((timeUntilExpiry % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  console.log('Token Status:');
  console.log('=============');
  if (timeUntilExpiry > 0) {
    console.log('✅ Token is VALID');
    console.log(`Time until expiry: ${daysUntilExpiry} days, ${hoursUntilExpiry} hours`);

    if (daysUntilExpiry > 365) {
      console.log('\n⚠️  This is a long-lived token (expires in ' + Math.floor(daysUntilExpiry / 365) + '+ years)');
      console.log('   Token refresh is not urgently needed but is still implemented.');
    }
  } else {
    console.log('❌ Token is EXPIRED');
    console.log('   Token refresh would be triggered automatically if enabled.');
  }

  console.log('\n📋 Token Refresh Configuration:');
  console.log('================================');
  console.log('Refresh Interval: Every 30 minutes (default)');
  console.log('Refresh Buffer: 5 minutes before expiry');
  console.log('Status: ' + (process.env.REFRESH_TOKEN ? 'ENABLED ✅' : 'DISABLED (no REFRESH_TOKEN set) ⚠️'));
  console.log();

  if (!process.env.REFRESH_TOKEN) {
    console.log('💡 To enable automatic token refresh:');
    console.log('   1. Add REFRESH_TOKEN to .env file');
    console.log('   2. Optionally set TOKEN_REFRESH_INTERVAL (default: 30 minutes)');
    console.log('   3. Restart the server');
  }

} catch (error) {
  console.error('❌ Error decoding token:', error.message);
}

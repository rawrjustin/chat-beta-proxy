// Show the exact API call being made for token refresh
require('dotenv').config();
const { jwtDecode } = require('jwt-decode');

const TOKEN_REFRESH_URL = process.env.TOKEN_REFRESH_URL || 'https://api.genies.com/auth/v2/refresh-session';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

console.log('🔍 Full Token Refresh API Call Details\n');
console.log('=' .repeat(70));
console.log();

// Extract organizationId from access token
let organizationId = null;
if (AUTH_TOKEN) {
  try {
    const decoded = jwtDecode(AUTH_TOKEN);
    organizationId = decoded.org_id || null;
  } catch (error) {
    console.log('⚠️  Could not extract organizationId from token');
  }
}

// Build request body
const requestBody = {
  refreshToken: REFRESH_TOKEN,
};

if (organizationId) {
  requestBody.organizationId = organizationId;
}

console.log('📡 HTTP Request Details:');
console.log('-'.repeat(70));
console.log('Method: POST');
console.log('URL:', TOKEN_REFRESH_URL);
console.log();
console.log('Headers:');
console.log('  Content-Type: application/json');
console.log();
console.log('Request Body (JSON):');
console.log(JSON.stringify(requestBody, null, 2));
console.log();

console.log('📋 Full cURL Command:');
console.log('-'.repeat(70));
const curlBody = JSON.stringify(requestBody).replace(/"/g, '\\"');
console.log(`curl -X POST "${TOKEN_REFRESH_URL}" \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -d "${curlBody}"`);
console.log();

console.log('📋 Full fetch/JavaScript Example:');
console.log('-'.repeat(70));
console.log(`fetch('${TOKEN_REFRESH_URL}', {`);
console.log(`  method: 'POST',`);
console.log(`  headers: {`);
console.log(`    'Content-Type': 'application/json',`);
console.log(`  },`);
console.log(`  body: JSON.stringify(${JSON.stringify(requestBody, null, 4)})`);
console.log(`});`);
console.log();

console.log('📋 Full Node.js Example:');
console.log('-'.repeat(70));
console.log(`const fetch = require('node-fetch');`);
console.log();
console.log(`const response = await fetch('${TOKEN_REFRESH_URL}', {`);
console.log(`  method: 'POST',`);
console.log(`  headers: {`);
console.log(`    'Content-Type': 'application/json',`);
console.log(`  },`);
console.log(`  body: JSON.stringify(${JSON.stringify(requestBody, null, 4)})`);
console.log(`});`);
console.log();
console.log('=' .repeat(70));


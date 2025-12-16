#!/usr/bin/env node

/**
 * Generate a secure random secret for JWT
 * Usage: node scripts/generate-secret.js
 */

const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('base64');

console.log('\n✅ Generated JWT Secret:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(secret);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📝 Add this to your .env.production file:');
console.log(`JWT_SECRET=${secret}\n`);


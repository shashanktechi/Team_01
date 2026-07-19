const crypto = require('crypto');
const fs = require('fs');

function createJWT(payload, secretBase64) {
  const header = { alg: 'HS256' };
  const encodeBase64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedHeader = encodeBase64Url(header);
  const encodedPayload = encodeBase64Url(payload);
  const secret = Buffer.from(secretBase64, 'base64');
  const signature = crypto.createHmac('sha256', secret).update(encodedHeader + '.' + encodedPayload).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

const JWT_SECRET = 'fb1NzLk/Pzn3ccmgHGq5EFt4ZHD5vEp24V6THvPE4wg=';
const BASE_URL = 'http://localhost:8080/api';

async function req(method, path, token, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(BASE_URL + path, opts);
    return { status: res.status, data: await res.text().catch(()=>'') };
}

async function run() {
    console.log("=== STARTING FULL API TESTS ===");
    
    // 1. Get Admin Token
    const adminToken = createJWT({ sub: 'shashankdany8712@gmail.com', role: 'SYSTEM_ADMIN', userId: 1, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }, JWT_SECRET);
    
    // Generate new users with unique emails to avoid conflicts
    const rand = Math.floor(Math.random() * 10000);
    const customerEmail = `cust${rand}@example.com`;
    const storeEmail = `store${rand}@example.com`;
    const deliveryEmail = `deliv${rand}@example.com`;

    console.log("Generating tokens by bypassing login...");
    // Let's first register them properly to ensure they exist in DB
    // Since we don't have OTPs easily, we will just use the DB or mock JWTs if they already exist.
    // Actually, we can generate a mock JWT and use it for an authenticated endpoint. If it returns 404/401 because the user ID doesn't exist in the DB, we have a problem.
    // Some endpoints like `GET /customer/profile` lookup the user by ID from the JWT.
    // So we MUST have the users in the database.
    // Let's insert them using the Admin token? No, admin doesn't have a create user endpoint.
}

run();

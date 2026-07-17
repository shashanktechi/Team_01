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

async function testAdmin() {
    const adminToken = createJWT({ sub: 'shashankdany8712@gmail.com', role: 'SYSTEM_ADMIN', userId: 4, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }, JWT_SECRET);
    
    console.log('\n--- ADMIN: GET /api/admin/users ---');
    const res1 = await fetch(BASE_URL + '/admin/users', { headers: { 'Authorization': 'Bearer ' + adminToken } });
    console.log(res1.status, await res1.text().catch(()=>'').then(t=>t.substring(0, 100)));

    // Try to verify the store admin (assume id 7 or we can just list users and grab IDs)
    const usersRes = await fetch(BASE_URL + '/admin/users', { headers: { 'Authorization': 'Bearer ' + adminToken } });
    const users = await usersRes.json();
    
    const storeAdmin = users.find(u => u.role === 'STORE_ADMIN' && u.email === 'store2@example.com');
    const deliveryPartner = users.find(u => u.role === 'DELIVERY_PARTNER' && u.email === 'delivery2@example.com');
    
    if (storeAdmin) {
        console.log(`\n--- ADMIN: PUT /api/admin/users/${storeAdmin.id}/verify ---`);
        const res2 = await fetch(BASE_URL + `/admin/users/${storeAdmin.id}/verify?status=APPROVED`, { method: 'PUT', headers: { 'Authorization': 'Bearer ' + adminToken } });
        console.log(res2.status, await res2.text().catch(()=>''));
    }
    
    if (deliveryPartner) {
        console.log(`\n--- ADMIN: PUT /api/admin/users/${deliveryPartner.id}/verify ---`);
        const res3 = await fetch(BASE_URL + `/admin/users/${deliveryPartner.id}/verify?status=APPROVED`, { method: 'PUT', headers: { 'Authorization': 'Bearer ' + adminToken } });
        console.log(res3.status, await res3.text().catch(()=>''));
    }
    
    return { storeAdmin, deliveryPartner };
}

async function testStoreAndDelivery(storeAdmin, deliveryPartner) {
    if (storeAdmin) {
        const storeToken = createJWT({ sub: storeAdmin.email, role: 'STORE_ADMIN', userId: storeAdmin.id, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }, JWT_SECRET);
        console.log('\n--- STORE: GET /api/store/profile ---');
        const res1 = await fetch(BASE_URL + '/store/profile', { headers: { 'Authorization': 'Bearer ' + storeToken } });
        console.log(res1.status, await res1.text().catch(()=>'').then(t=>t.substring(0, 100)));
    }
    
    if (deliveryPartner) {
        const deliveryToken = createJWT({ sub: deliveryPartner.email, role: 'DELIVERY_PARTNER', userId: deliveryPartner.id, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }, JWT_SECRET);
        console.log('\n--- DELIVERY: GET /api/delivery/profile ---');
        const res2 = await fetch(BASE_URL + '/delivery/profile', { headers: { 'Authorization': 'Bearer ' + deliveryToken } });
        console.log(res2.status, await res2.text().catch(()=>'').then(t=>t.substring(0, 100)));
    }
}

async function run() {
    const { storeAdmin, deliveryPartner } = await testAdmin();
    await testStoreAndDelivery(storeAdmin, deliveryPartner);
}
run();

const crypto = require('crypto');

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
    // shashankdany8712@gmail.com has ID 4 typically in the seed, or we can just fetch all users
    const adminTokenFallback = createJWT({ sub: 'shashankdany8712@gmail.com', role: 'SYSTEM_ADMIN', userId: 4, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }, JWT_SECRET);
    
    // 2. Fetch Users
    const usersRes = await req('GET', '/admin/users', adminTokenFallback);
    const users = JSON.parse(usersRes.data);
    console.log("Users:", users.map(u => ({id: u.id, email: u.email, role: u.role})));
    const admin = users.find(u => u.role === 'SYSTEM_ADMIN');
    const adminToken = createJWT({ sub: admin.email, role: 'SYSTEM_ADMIN', userId: admin.id, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }, JWT_SECRET);
    
    const customer = users.find(u => u.role === 'CUSTOMER');
    const storeAdmin = users.find(u => u.role === 'STORE_ADMIN');
    const delivery = users.find(u => u.role === 'DELIVERY_PARTNER');

    const customerToken = createJWT({ sub: customer.email, role: 'CUSTOMER', userId: customer.id, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }, JWT_SECRET);
    const storeToken = createJWT({ sub: storeAdmin.email, role: 'STORE_ADMIN', userId: storeAdmin.id, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }, JWT_SECRET);
    const deliveryToken = createJWT({ sub: delivery.email, role: 'DELIVERY_PARTNER', userId: delivery.id, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + 86400 }, JWT_SECRET);

    console.log("✅ Tokens generated.");
    
    // Check stores mapping to get storeId
    const storesRes = await req('GET', '/admin/stores', adminToken);
    const stores = JSON.parse(storesRes.data);
    const store = stores[0];

    // Approve roles
    await req('PUT', `/admin/users/${storeAdmin.id}/verify?status=APPROVED`, adminToken);
    await req('PUT', `/admin/users/${delivery.id}/verify?status=APPROVED`, adminToken); // Old endpoints maybe?
    await req('PUT', `/admin/stores/${store.id}/verify`, adminToken, {status: "APPROVED"});
    await req('PUT', `/admin/delivery-partners/${delivery.id}/verify`, adminToken, {status: "APPROVED"});

    // --- TEST 1: ADMIN ---
    console.log("\n--- ADMIN ---");
    console.log("GET /admin/users:", (await req('GET', '/admin/users', adminToken)).status);
    console.log("GET /admin/stores:", (await req('GET', '/admin/stores', adminToken)).status);
    console.log("GET /admin/stores/pending:", (await req('GET', '/admin/stores/pending', adminToken)).status);
    console.log("GET /admin/delivery-partners/pending:", (await req('GET', '/admin/delivery-partners/pending', adminToken)).status);
    
    // --- TEST 2: CUSTOMER ---
    console.log("\n--- CUSTOMER ---");
    console.log("GET /customer/profile:", (await req('GET', '/customer/profile', customerToken)).status);
    console.log("GET /customer/stores/nearby?lat=17.385&lng=78.4867:", (await req('GET', '/customer/stores/nearby?lat=17.385&lng=78.4867', customerToken)).status);
    console.log("GET /customer/stores/" + store.id + "/inventory:", (await req('GET', `/customer/stores/${store.id}/inventory`, customerToken)).status);
    
    const newOrder = await req('POST', '/customer/orders', customerToken, {
      items: [ { productId: 1, qty: 2 } ],
      deliveryAddress: "45 Park Lane, Hyderabad",
      customerLat: 17.4062, customerLng: 78.4691
    });
    console.log("POST /customer/orders:", newOrder.status);
    console.log("GET /customer/orders:", (await req('GET', '/customer/orders', customerToken)).status);

    // --- TEST 3: STORE ---
    console.log("\n--- STORE ---");
    console.log("GET /store/profile:", (await req('GET', '/store/profile', storeToken)).status);
    console.log("GET /store/inventory:", (await req('GET', '/store/inventory', storeToken)).status);
    console.log("GET /store/orders/incoming:", (await req('GET', '/store/orders/incoming', storeToken)).status);
    
    const newProduct = await req('POST', '/store/products', storeToken, {
      product: { name: "Tomatoes", description: "Ripe tomatoes", category: "Vegetables", unitPrice: 40.00, typicalShelfLifeHours: 72 },
      quantity: 100, batchCode: "BATCH-TEST", expiryTime: "2026-07-20T18:00:00"
    });
    console.log("POST /store/products:", newProduct.status);

    // --- TEST 4: DELIVERY ---
    console.log("\n--- DELIVERY ---");
    console.log("GET /delivery/profile:", (await req('GET', '/delivery/profile', deliveryToken)).status);
    console.log("GET /delivery/tasks:", (await req('GET', '/delivery/tasks', deliveryToken)).status);

    // --- TEST 5: MEDIA ---
    console.log("\n--- MEDIA ---");
    console.log("POST /media/profile-photo/upload-url:", (await req('POST', '/media/profile-photo/upload-url', customerToken, { contentType: "image/jpeg" })).status);
    console.log("POST /media/store/" + store.id + "/logo/upload-url:", (await req('POST', `/media/store/${store.id}/logo/upload-url`, storeToken, { contentType: "image/jpeg" })).status);
    
    console.log("\n=== DONE ===");
}

run();

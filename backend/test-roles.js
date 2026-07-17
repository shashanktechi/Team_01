const BASE_URL = 'http://localhost:8080/api';
const fs = require('fs');

async function extractOtp(email) {
    return new Promise((resolve) => {
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (attempts > 30) {
                clearInterval(interval);
                resolve(null);
            }
            try {
                const logContent = fs.readFileSync('C:/Users/Dany/.gemini/antigravity-ide/brain/5fee1c50-ef13-4dee-b375-dcc8acd09802/.system_generated/tasks/task-284.log', 'utf8');
                const regex = new RegExp(`==== GENERATED OTP FOR ${email}: (\\d{6}) ====`, 'g');
                let match;
                let lastOtp = null;
                while ((match = regex.exec(logContent)) !== null) {
                    lastOtp = match[1];
                }
                if (lastOtp) {
                    clearInterval(interval);
                    resolve(lastOtp);
                }
            } catch (e) { }
        }, 1000);
    });
}

async function registerAndLogin(email, phone, role) {
    console.log(`\nRegistering ${role}...`);
    await fetch(BASE_URL + '/auth/otp/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const otp = await extractOtp(email);
    
    const regRes = await fetch(BASE_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password: 'Password123!', name: 'Test ' + role, role, email, otp })
    });
    
    const loginRes = await fetch(BASE_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' })
    });
    const data = await loginRes.json();
    return data.token;
}

async function testAll() {
    try {
        const storeToken = await registerAndLogin('store2@example.com', '9998881111', 'STORE_ADMIN');
        const deliveryToken = await registerAndLogin('delivery2@example.com', '9998882222', 'DELIVERY_PARTNER');

        console.log('\n--- STORE: GET /api/store/profile ---');
        const storeProfile = await fetch(BASE_URL + '/store/profile', { headers: { 'Authorization': 'Bearer ' + storeToken } });
        console.log(storeProfile.status, await storeProfile.text().catch(()=>''));
        
        console.log('\n--- DELIVERY: GET /api/delivery/profile ---');
        const deliveryProfile = await fetch(BASE_URL + '/delivery/profile', { headers: { 'Authorization': 'Bearer ' + deliveryToken } });
        console.log(deliveryProfile.status, await deliveryProfile.text().catch(()=>''));
        
    } catch(e) {
        console.error(e);
    }
}
testAll();

const BASE_URL = 'http://localhost:8080/api/auth';
const fs = require('fs');

async function extractOtpFromLogs() {
    return new Promise((resolve) => {
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (attempts > 30) {
                clearInterval(interval);
                resolve(null);
            }
            try {
                // Find latest log file. Actually we know it's task-284.log
                const logContent = fs.readFileSync('C:/Users/Dany/.gemini/antigravity-ide/brain/5fee1c50-ef13-4dee-b375-dcc8acd09802/.system_generated/tasks/task-284.log', 'utf8');
                const match = logContent.match(/==== GENERATED OTP FOR testuser@example.com: (\d{6}) ====/);
                if (match) {
                    clearInterval(interval);
                    resolve(match[1]);
                }
            } catch (e) {
                // ignore
            }
        }, 1000);
    });
}

async function testAuthFlow() {
  console.log('Testing Full Auth Flow...');
  
  try {
    console.log('\n--- 1. Send OTP ---');
    const sendOtpRes = await fetch(BASE_URL + '/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testuser@example.com' })
    });
    console.log('Send OTP Response:', sendOtpRes.status, await sendOtpRes.text());

    console.log('Waiting for OTP in logs...');
    const otp = await extractOtpFromLogs();
    if (!otp) {
        console.error('Failed to extract OTP from logs');
        return;
    }
    console.log('Found OTP:', otp);

    console.log('\n--- 2. Register User ---');
    const registerPayload = {
      phone: '9998887776',
      password: 'Password123!',
      name: 'Test Flow',
      role: 'CUSTOMER',
      email: 'testuser@example.com',
      otp: otp
    };
    const regRes = await fetch(BASE_URL + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload)
    });
    console.log('Register Response:', regRes.status, await regRes.text());

    console.log('\n--- 3. Login User ---');
    const loginPayload = {
      email: 'testuser@example.com',
      password: 'Password123!'
    };
    const loginRes = await fetch(BASE_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    });
    console.log('Login Response:', loginRes.status, await loginRes.text());

  } catch (err) {
    console.error('Error during flow:', err.message);
  }
}
testAuthFlow();

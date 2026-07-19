const BASE_URL = 'http://localhost:8080/api';

async function testApis() {
    console.log('--- LOGIN AS CUSTOMER ---');
    const loginRes = await fetch(BASE_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testuser@example.com', password: 'Password123!' })
    });
    
    if (!loginRes.ok) {
        console.error("Login failed:", await loginRes.text());
        return;
    }
    const data = await loginRes.json();
    const customerToken = data.token;
    
    console.log('\n--- CUSTOMER: GET /api/customer/stores/nearby ---');
    const storesRes = await fetch(BASE_URL + '/customer/stores/nearby?lat=12.91&lng=77.63', {
        headers: { 'Authorization': 'Bearer ' + customerToken }
    });
    console.log('Status:', storesRes.status);
    console.log('Body:', await storesRes.text().catch(()=>''));

    console.log('\n--- CUSTOMER: GET /api/customer/profile ---');
    const profileRes = await fetch(BASE_URL + '/customer/profile', {
        headers: { 'Authorization': 'Bearer ' + customerToken }
    });
    console.log('Status:', profileRes.status);
    console.log('Body:', await profileRes.text().catch(()=>''));
}
testApis();

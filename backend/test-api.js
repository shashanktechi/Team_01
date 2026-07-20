async function testApi() {
  try {
    const loginRes = await fetch('http://localhost:8082/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@quickcart.com', password: 'Admin@123' })
    });
    const token = (await loginRes.json()).token;

    const pendingStoresRes = await fetch('http://localhost:8082/api/admin/stores/pending', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const stores = await pendingStoresRes.json();
    console.log('Pending Stores:', stores.map(s => s.id));

    if (stores.length > 0) {
      const res = await fetch(`http://localhost:8082/api/admin/stores/${stores[0].id}/verify`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'APPROVED' })
      });
      
      if (res.ok) {
        console.log('Store verify Success:', await res.json());
      } else {
        console.log('Store verify Error Status:', res.status);
        console.log('Store verify Error Body:', await res.text());
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testApi();

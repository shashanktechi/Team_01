const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://admin123:Sunny2005@database-1.cu3ikoym0hs3.us-east-1.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
async function run() {
  try {
    await client.connect();
    const users = await client.query("SELECT id, full_name, role FROM users WHERE role = 'STORE_ADMIN'");
    console.log(`Found ${users.rowCount} STORE_ADMIN users.`);
    
    for (const user of users.rows) {
      const stores = await client.query("SELECT id, name, verification_status FROM stores WHERE owner_id = $1", [user.id]);
      if (stores.rows.length === 0) {
        console.log(`No store found for user ${user.full_name} (${user.id}), creating one...`);
        const storeName = user.full_name ? `${user.full_name} Store` : `Store ${user.id}`;
        const insertRes = await client.query("INSERT INTO stores (name, owner_id, verification_status, freshness_score, is_open) VALUES ($1, $2, 'APPROVED', 99.9, true) RETURNING id", [storeName, user.id]);
        console.log(`Created store ID ${insertRes.rows[0].id} for ${user.full_name}`);
      } else {
        await client.query("UPDATE stores SET verification_status = 'APPROVED' WHERE owner_id = $1", [user.id]);
        console.log(`Updated store for ${user.full_name} to APPROVED.`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();

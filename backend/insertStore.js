const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://admin123:Sunny2005@database-1.cu3ikoym0hs3.us-east-1.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
async function run() {
  try {
    await client.connect();
    const res = await client.query("INSERT INTO stores (name, address, location, verification_status, owner_id) VALUES ('My Store', 'My Address', ST_SetSRID(ST_MakePoint(78.3915, 17.4401), 4326), 'APPROVED', 21) RETURNING *");
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();

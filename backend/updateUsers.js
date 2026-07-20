const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://admin123:Sunny2005@database-1.cu3ikoym0hs3.us-east-1.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT id, username, full_name, role, verification_status FROM users WHERE verification_status != 'APPROVED'");
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();

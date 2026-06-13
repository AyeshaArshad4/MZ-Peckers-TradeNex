require('dotenv').config();
const bcrypt = require('bcrypt');
const { getPool, sql, closePool } = require('./src/config/db');

async function run() {
  console.log('Generating hashes...');
  const pool = await getPool();

  const adminHash    = await bcrypt.hash('Admin@1234',    12);
  const customerHash = await bcrypt.hash('Customer@1234', 12);

  await pool.request()
    .input('hash', sql.NVarChar(255), adminHash)
    .query("UPDATE Users SET PasswordHash = @hash WHERE Username = 'admin1'");

  await pool.request()
    .input('hash', sql.NVarChar(255), customerHash)
    .query("UPDATE Users SET PasswordHash = @hash WHERE Username IN ('ali_contractor','sara_tileshop','usman_installer','fatima_pending')");

  // Verify
  const check = await pool.request()
    .query('SELECT Username, LEFT(PasswordHash,20) AS HashPreview FROM Users');
  console.table(check.recordset);

  console.log('\n✅ Done!');
  console.log('   Admin:    admin@tradenex.com    → Admin@1234');
  console.log('   Customer: ali.contractor@gmail.com → Customer@1234');

  await closePool();
}

run().catch(console.error);
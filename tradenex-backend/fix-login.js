require('dotenv').config();
const bcrypt = require('bcrypt');
const sql    = require('mssql');

const config = {
  server:   process.env.DB_SERVER,
  port:     parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt:                process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: true,
  },
};

async function main() {
  const pool = await sql.connect(config);
  console.log('Connected!\n');

  const adminHash    = await bcrypt.hash('Admin@1234',    12);
  const customerHash = await bcrypt.hash('Customer@1234', 12);

  // Admin uses admin@mzpeckers.com
  const r1 = await pool.request()
    .input('hash', sql.NVarChar(255), adminHash)
    .query("UPDATE Users SET PasswordHash = @hash WHERE Role = 'Admin'");
  console.log('Admin updated:', r1.rowsAffected[0], 'row(s)');

  // Customers
  const r2 = await pool.request()
    .input('hash', sql.NVarChar(255), customerHash)
    .query("UPDATE Users SET PasswordHash = @hash WHERE Role = 'Customer'");
  console.log('Customers updated:', r2.rowsAffected[0], 'row(s)');

  // Verify
  const check = await bcrypt.compare('Admin@1234', adminHash);
  console.log('Hash verify:', check);

  const users = await pool.request()
    .query('SELECT Username, Email, Role, ApprovalStatus FROM Users');
  console.table(users.recordset);

  console.log('\n✅ Login credentials:');
  console.log('   Admin:    admin@mzpeckers.com        / Admin@1234');
  console.log('   Customer: ali.contractor@gmail.com   / Customer@1234');

  await pool.close();
}

main().catch(e => console.error(e.message));
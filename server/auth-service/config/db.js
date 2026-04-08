const { Pool } = require('pg');
require('dotenv').config();

// Kết nối Supabase: fastdeli-auth (bảng users)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('[auth-db] Kết nối Supabase thất bại:', err.message);
  } else {
    console.log('[auth-db] Kết nối Supabase thành công!');
  }
});

module.exports = pool;
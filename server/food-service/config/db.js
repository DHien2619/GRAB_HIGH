const { Pool } = require('pg');
require('dotenv').config();

// foodPool → Supabase: fastdeli-food (restaurants, foods, orders, ...)
const foodPool = new Pool({
  connectionString: process.env.FOOD_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// sharedPool → Supabase: fastdeli-auth (users, đăng nhập)
const sharedPool = new Pool({
  connectionString: process.env.AUTH_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

foodPool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('[food-db] Kết nối Supabase thất bại:', err.message);
  } else {
    console.log('[food-db] Kết nối Supabase thành công!');
  }
});

module.exports = { foodPool, sharedPool };
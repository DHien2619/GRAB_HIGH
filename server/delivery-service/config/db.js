const { Pool } = require('pg');
require('dotenv').config();

// foodPool → Supabase: fastdeli-food
const foodPool = new Pool({
  connectionString: process.env.FOOD_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// sharedPool → Supabase: fastdeli-auth
const sharedPool = new Pool({
  connectionString: process.env.AUTH_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

foodPool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('[delivery-db] Kết nối Supabase thất bại:', err.message);
  } else {
    console.log('[delivery-db] Kết nối Supabase thành công!');
  }
});

module.exports = {
  foodPool,
  sharedPool,
  query: (text, params) => foodPool.query(text, params),
  pool: foodPool,
};

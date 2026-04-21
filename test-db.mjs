import mysql from 'mysql2/promise';

(async () => {
  try {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await conn.query('SELECT COUNT(*) as count, brand FROM products GROUP BY brand');
    console.log('Products in DB:');
    rows.forEach(r => console.log(`  ${r.brand}: ${r.count}`));
    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();

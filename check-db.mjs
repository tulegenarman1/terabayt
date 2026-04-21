import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

try {
  const result = await db.execute(sql`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'products' AND TABLE_SCHEMA = DATABASE()
  `);
  
  const columns = result[0].map(r => r.COLUMN_NAME);
  console.log('Columns in products table:', columns);
  
  if (columns.includes('installmentMonths') && columns.includes('installmentPrice')) {
    console.log('✓ Migration columns exist!');
  } else {
    console.log('✗ Migration columns missing');
  }
} catch (error) {
  console.error('Error:', error.message);
}

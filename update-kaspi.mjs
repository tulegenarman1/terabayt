import mysql from 'mysql2/promise';

const kaspiLink = 'https://l.kaspi.kz/shop/AccCiphHcPb7gCx';

// Parse DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
const urlParts = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^/]+)\/(.+)/);
const [, user, password, host, database] = urlParts;

const connection = await mysql.createConnection({
  host,
  user,
  password,
  database,
  ssl: 'Amazon RDS',
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  connectTimeout: 10000,
});

try {
  const [result] = await connection.execute(
    'UPDATE products SET kaspiLink = ? WHERE 1=1',
    [kaspiLink]
  );
  console.log(`✅ Ссылка Kaspi добавлена ${result.affectedRows} товарам!`);
} catch (error) {
  console.error('❌ Ошибка:', error.message);
} finally {
  await connection.end();
}

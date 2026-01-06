import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [expeditions] = await conn.execute('SELECT * FROM expeditions WHERE id = 90001');
console.log('Expedition:', JSON.stringify(expeditions[0], null, 2));

if (expeditions[0]) {
  const [trails] = await conn.execute('SELECT * FROM trails WHERE id = ?', [expeditions[0].trailId]);
  console.log('Trail:', JSON.stringify(trails[0], null, 2));
}

await conn.end();

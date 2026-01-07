import mysql from 'mysql2/promise';
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [cols] = await connection.execute('DESCRIBE trails');
console.log('Trails columns:');
cols.forEach(c => console.log(`  ${c.Field}: ${c.Type}`));
await connection.end();

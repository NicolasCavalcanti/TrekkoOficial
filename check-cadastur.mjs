import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('SELECT registration_number FROM cadastur_registry LIMIT 1');
console.log('CADASTUR:', rows[0].registration_number);
await conn.end();

import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute('SELECT id, openId, name, email, userType, role, cadasturNumber FROM users ORDER BY id DESC LIMIT 10');
console.log(JSON.stringify(rows, null, 2));
await connection.end();

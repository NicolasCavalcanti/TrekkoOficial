import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
const conn = await mysql.createConnection(DATABASE_URL);

const [users] = await conn.execute('SELECT id, openId, name, email, userType, role FROM users WHERE userType = "guide" LIMIT 5');
console.log('Guide users:', JSON.stringify(users, null, 2));

await conn.end();

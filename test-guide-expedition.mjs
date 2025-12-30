import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Get the guide user
const [users] = await connection.execute(
  'SELECT id, openId, name, email, userType, role FROM users WHERE email = ?',
  ['guiateste123@teste.com']
);
console.log('Guide user:', users[0]);

// Get a trail
const [trails] = await connection.execute(
  'SELECT id, name FROM trails LIMIT 1'
);
console.log('Trail:', trails[0]);

await connection.end();

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [tables] = await conn.query("SHOW TABLES LIKE '%platform%'");
console.log("Platform tables:", tables);

const [settings] = await conn.query("SELECT * FROM platform_settings LIMIT 5").catch(() => [[]]);
console.log("Settings:", settings);

await conn.end();

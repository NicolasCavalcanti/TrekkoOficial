import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const trails = await db.select({ id: schema.trails.id, name: schema.trails.name }).from(schema.trails);
console.log('Trails in database:');
trails.forEach(t => console.log(`  ID: ${t.id}, Name: ${t.name}`));

await connection.end();

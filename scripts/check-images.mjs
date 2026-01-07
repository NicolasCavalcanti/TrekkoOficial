import { drizzle } from "drizzle-orm/mysql2";

const db = drizzle(process.env.DATABASE_URL);
const result = await db.execute("SELECT id, name, JSON_LENGTH(images) as count FROM trails WHERE status = 'published' ORDER BY id");
console.log(JSON.stringify(result[0], null, 2));
process.exit(0);

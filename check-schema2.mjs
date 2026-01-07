import mysql from 'mysql2/promise';
const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('=== CADASTUR Registry ===');
const [cadastur] = await connection.execute('DESCRIBE cadastur_registry');
cadastur.forEach(c => console.log(`  ${c.Field}: ${c.Type}`));

console.log('\n=== Blog Posts ===');
const [posts] = await connection.execute('DESCRIBE blog_posts');
posts.forEach(c => console.log(`  ${c.Field}: ${c.Type}`));

await connection.end();

import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [trails] = await connection.execute('SELECT COUNT(*) as count FROM trails');
const [guides] = await connection.execute('SELECT COUNT(*) as count FROM cadastur_registry');
const [posts] = await connection.execute('SELECT COUNT(*) as count FROM blog_posts');

console.log('Trails:', trails[0].count);
console.log('Guides:', guides[0].count);
console.log('Blog Posts:', posts[0].count);

await connection.end();

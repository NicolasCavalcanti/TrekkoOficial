import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(`
  SELECT e.id, e.title, e.trailId, e.guideId, e.status, t.name as trailName, u.name as guideName 
  FROM expeditions e 
  LEFT JOIN trails t ON e.trailId = t.id 
  LEFT JOIN users u ON e.guideId = u.id
`);
console.log(JSON.stringify(rows, null, 2));
await conn.end();

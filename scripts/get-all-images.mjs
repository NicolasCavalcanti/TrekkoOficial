import { drizzle } from "drizzle-orm/mysql2";

const db = drizzle(process.env.DATABASE_URL);
const result = await db.execute("SELECT id, name, images FROM trails WHERE status = 'published' ORDER BY id");

const trails = result[0];
for (const trail of trails) {
  console.log(`\n=== ${trail.name} (ID: ${trail.id}) ===`);
  let images;
  try {
    // Try parsing as JSON first
    images = JSON.parse(trail.images);
  } catch {
    // If not JSON, it might be a comma-separated string or already an array
    if (typeof trail.images === 'string') {
      if (trail.images.startsWith('[')) {
        images = JSON.parse(trail.images);
      } else {
        images = trail.images.split(',');
      }
    } else {
      images = trail.images;
    }
  }
  
  if (Array.isArray(images)) {
    images.forEach((img, idx) => {
      console.log(`  ${idx + 1}. ${img.trim()}`);
    });
  } else {
    console.log(`  Images: ${trail.images}`);
  }
}

process.exit(0);

import { storagePut } from '../server/storage';
import * as fs from 'fs';
import * as path from 'path';

const imageDir = '/home/ubuntu/agulhas-images';
const trailSlug = 'agulhas-negras';

async function uploadImages() {
  const files = fs.readdirSync(imageDir);
  const urls: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(imageDir, file);
    const data = fs.readFileSync(filePath);
    const ext = path.extname(file).toLowerCase();
    const contentType = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';
    
    const key = `trails/${trailSlug}/gallery-${i + 1}${ext}`;
    const result = await storagePut(key, data, contentType);
    console.log(`Uploaded ${file} -> ${result.url}`);
    urls.push(result.url);
  }
  
  console.log('\nAll URLs:');
  console.log(JSON.stringify(urls, null, 2));
}

uploadImages().catch(console.error);

import { storagePut } from '../server/storage';
import * as fs from 'fs';
import * as path from 'path';

const imagesDir = '/home/ubuntu/fumaca-images';
const trailSlug = 'cachoeira-da-fumaca';

async function uploadImages() {
  const files = fs.readdirSync(imagesDir).filter(f => 
    f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp') || f.endsWith('.jpeg')
  ).sort();
  
  const urls: string[] = [];
  
  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const data = fs.readFileSync(filePath);
    const ext = path.extname(file).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    
    const key = `trails/${trailSlug}/${file}`;
    const result = await storagePut(key, data, contentType);
    console.log(`Uploaded ${file} -> ${result.url}`);
    urls.push(result.url);
  }
  
  console.log('\nAll URLs:');
  console.log(JSON.stringify(urls, null, 2));
}

uploadImages().catch(console.error);

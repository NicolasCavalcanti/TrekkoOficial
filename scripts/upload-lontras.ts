import { storagePut } from '../server/storage';
import * as fs from 'fs';
import * as path from 'path';

const imagesDir = '/home/ubuntu/lontras-images';

async function uploadImages() {
  const files = fs.readdirSync(imagesDir).filter(f => 
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
  );
  
  console.log(`Found ${files.length} images to upload`);
  
  const urls: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(imagesDir, file);
    const data = fs.readFileSync(filePath);
    const ext = path.extname(file).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    
    const key = `trails/trilha-das-lontras/gallery-${i + 1}${ext}`;
    
    console.log(`Uploading ${file} as ${key}...`);
    const result = await storagePut(key, data, contentType);
    console.log(`Uploaded: ${result.url}`);
    urls.push(result.url);
  }
  
  console.log('\n=== All URLs ===');
  console.log(JSON.stringify(urls, null, 2));
  
  return urls;
}

uploadImages().catch(console.error);

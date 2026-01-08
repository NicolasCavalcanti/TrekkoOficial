import { storagePut } from '../server/storage';
import * as fs from 'fs';
import * as path from 'path';

const imagesDir = '/home/ubuntu/gaviao-images';

async function uploadImages() {
  const files = fs.readdirSync(imagesDir);
  const imageUrls: string[] = [];
  
  console.log(`Found ${files.length} images to upload`);
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(imagesDir, file);
    const data = fs.readFileSync(filePath);
    const ext = path.extname(file).toLowerCase();
    const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                        ext === '.png' ? 'image/png' : 
                        ext === '.webp' ? 'image/webp' : 'image/jpeg';
    
    const key = `trails/gaviao/gallery-${i + 1}${ext}`;
    console.log(`Uploading ${file} as ${key}...`);
    
    const result = await storagePut(key, data, contentType);
    console.log(`Uploaded: ${result.url}`);
    imageUrls.push(result.url);
  }
  
  console.log('\n=== Gallery URLs ===');
  console.log(JSON.stringify(imageUrls, null, 2));
  
  return imageUrls;
}

uploadImages().catch(console.error);

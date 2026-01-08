import { storagePut } from '../server/storage';
import * as fs from 'fs';
import * as path from 'path';

const imagesDir = '/home/ubuntu/vale-do-pati-images';

async function uploadImages() {
  const files = fs.readdirSync(imagesDir).sort();
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const data = fs.readFileSync(filePath);
    const ext = path.extname(file).toLowerCase();
    
    let contentType = 'image/jpeg';
    if (ext === '.webp') contentType = 'image/webp';
    if (ext === '.png') contentType = 'image/png';

    const key = `trails/vale-do-pati/${file}`;
    console.log(`Uploading ${file}...`);
    
    const result = await storagePut(key, data, contentType);
    console.log(`  -> ${result.url}`);
    uploadedUrls.push(result.url);
  }

  console.log('\n=== All URLs ===');
  console.log(JSON.stringify(uploadedUrls, null, 2));
  
  // Save to file for later use
  fs.writeFileSync('/home/ubuntu/vale-do-pati-urls.json', JSON.stringify(uploadedUrls, null, 2));
  console.log('\nURLs saved to /home/ubuntu/vale-do-pati-urls.json');
}

uploadImages().catch(console.error);

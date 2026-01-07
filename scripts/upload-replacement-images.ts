import { storagePut } from "../server/storage";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as fs from "fs";
import * as path from "path";

const pool = createPool(process.env.DATABASE_URL!);
const db = drizzle(pool);

interface ReplacementImage {
  trailId: number;
  trailSlug: string;
  galleryIndex: number;
  localPath: string;
}

const replacements: ReplacementImage[] = [
  // Pedra do Baú (ID: 30020)
  { trailId: 30020, trailSlug: "pedra-do-bau", galleryIndex: 6, localPath: "/home/ubuntu/replacement_images/pedra-do-bau/gallery-6.jpg" },
  { trailId: 30020, trailSlug: "pedra-do-bau", galleryIndex: 9, localPath: "/home/ubuntu/replacement_images/pedra-do-bau/gallery-9.jpg" },
  { trailId: 30020, trailSlug: "pedra-do-bau", galleryIndex: 10, localPath: "/home/ubuntu/replacement_images/pedra-do-bau/gallery-10.jpg" },
  
  // Pico da Bandeira (ID: 30021)
  { trailId: 30021, trailSlug: "pico-da-bandeira", galleryIndex: 3, localPath: "/home/ubuntu/replacement_images/pico-da-bandeira/gallery-3.jpg" },
  
  // Cânion Itaimbezinho (ID: 30022)
  { trailId: 30022, trailSlug: "canion-itaimbezinho", galleryIndex: 3, localPath: "/home/ubuntu/replacement_images/canion-itaimbezinho/gallery-3.jpg" },
  { trailId: 30022, trailSlug: "canion-itaimbezinho", galleryIndex: 8, localPath: "/home/ubuntu/replacement_images/canion-itaimbezinho/gallery-8.jpg" },
  
  // Trilha das Praias (ID: 30023)
  { trailId: 30023, trailSlug: "trilha-das-7-praias", galleryIndex: 1, localPath: "/home/ubuntu/replacement_images/trilha-das-praias/gallery-1.jpg" },
  { trailId: 30023, trailSlug: "trilha-das-7-praias", galleryIndex: 5, localPath: "/home/ubuntu/replacement_images/trilha-das-praias/gallery-5.jpg" },
  { trailId: 30023, trailSlug: "trilha-das-7-praias", galleryIndex: 6, localPath: "/home/ubuntu/replacement_images/trilha-das-praias/gallery-6.jpg" },
  { trailId: 30023, trailSlug: "trilha-das-7-praias", galleryIndex: 7, localPath: "/home/ubuntu/replacement_images/trilha-das-praias/gallery-7.jpg" },
  { trailId: 30023, trailSlug: "trilha-das-7-praias", galleryIndex: 9, localPath: "/home/ubuntu/replacement_images/trilha-das-praias/gallery-9.jpg" },
  { trailId: 30023, trailSlug: "trilha-das-7-praias", galleryIndex: 10, localPath: "/home/ubuntu/replacement_images/trilha-das-praias/gallery-10.jpg" },
  
  // Serra Fina (ID: 30024)
  { trailId: 30024, trailSlug: "travessia-serra-fina", galleryIndex: 7, localPath: "/home/ubuntu/replacement_images/serra-fina/gallery-7.jpg" },
  { trailId: 30024, trailSlug: "travessia-serra-fina", galleryIndex: 9, localPath: "/home/ubuntu/replacement_images/serra-fina/gallery-9.jpg" },
];

// Store uploaded URLs for each trail
const uploadedUrls: Map<number, Map<number, string>> = new Map();

async function uploadImages() {
  console.log("Starting image upload process...\n");
  
  for (const r of replacements) {
    if (!fs.existsSync(r.localPath)) {
      console.log(`File not found: ${r.localPath}`);
      continue;
    }
    
    const fileBuffer = fs.readFileSync(r.localPath);
    const ext = path.extname(r.localPath);
    const timestamp = Date.now();
    const fileKey = `trails/${r.trailSlug}/gallery-${r.galleryIndex}-v2-${timestamp}${ext}`;
    
    console.log(`Uploading ${r.trailSlug} gallery-${r.galleryIndex}...`);
    
    try {
      const { url } = await storagePut(fileKey, fileBuffer, "image/jpeg");
      console.log(`  Uploaded: ${url}`);
      
      if (!uploadedUrls.has(r.trailId)) {
        uploadedUrls.set(r.trailId, new Map());
      }
      uploadedUrls.get(r.trailId)!.set(r.galleryIndex, url);
    } catch (error) {
      console.log(`  Error uploading: ${error}`);
    }
  }
  
  console.log("\n\nAll images uploaded. URLs:");
  for (const [trailId, urls] of uploadedUrls) {
    console.log(`\nTrail ${trailId}:`);
    for (const [index, url] of urls) {
      console.log(`  gallery-${index}: ${url}`);
    }
  }
  
  // Output SQL commands to update the database
  console.log("\n\n=== SQL UPDATE COMMANDS ===\n");
  
  for (const [trailId, urls] of uploadedUrls) {
    const urlsArray = Array.from(urls.entries()).map(([idx, url]) => ({ idx, url }));
    console.log(`-- Trail ${trailId}:`);
    for (const { idx, url } of urlsArray) {
      console.log(`-- Replace gallery-${idx} with: ${url}`);
    }
    console.log("");
  }
  
  await pool.end();
  process.exit(0);
}

uploadImages().catch(console.error);

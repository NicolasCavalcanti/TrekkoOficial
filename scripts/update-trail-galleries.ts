import { db } from '../server/db';
import { trails } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Gallery URLs mapped to trail names
const trailGalleries: Record<string, string[]> = {
  "Monte Roraima": [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/monte-roraima/gallery-1.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/monte-roraima/gallery-2.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/monte-roraima/gallery-3.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/monte-roraima/gallery-4.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/monte-roraima/gallery-5.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/monte-roraima/gallery-6.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/monte-roraima/gallery-7.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/monte-roraima/gallery-8.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/monte-roraima/gallery-9.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/monte-roraima/gallery-10.jpg"
  ],
  "Travessia Petrópolis x Teresópolis": [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-petropolis-x-teresopolis/gallery-1.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-petropolis-x-teresopolis/gallery-2.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-petropolis-x-teresopolis/gallery-3.webp",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-petropolis-x-teresopolis/gallery-4.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-petropolis-x-teresopolis/gallery-5.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-petropolis-x-teresopolis/gallery-6.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-petropolis-x-teresopolis/gallery-7.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-petropolis-x-teresopolis/gallery-8.jpeg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-petropolis-x-teresopolis/gallery-9.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-petropolis-x-teresopolis/gallery-10.jpg"
  ],
  "Vale da Lua": [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/vale-da-lua/gallery-1.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/vale-da-lua/gallery-2.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/vale-da-lua/gallery-3.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/vale-da-lua/gallery-4.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/vale-da-lua/gallery-5.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/vale-da-lua/gallery-6.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/vale-da-lua/gallery-7.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/vale-da-lua/gallery-8.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/vale-da-lua/gallery-9.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/vale-da-lua/gallery-10.jpg"
  ],
  "Pedra do Baú": [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pedra-do-bau/gallery-1.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pedra-do-bau/gallery-2.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pedra-do-bau/gallery-3.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pedra-do-bau/gallery-4.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pedra-do-bau/gallery-5.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pedra-do-bau/gallery-6.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pedra-do-bau/gallery-7.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pedra-do-bau/gallery-8.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pedra-do-bau/gallery-9.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pedra-do-bau/gallery-10.jpg"
  ],
  "Pico da Bandeira": [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pico-da-bandeira/gallery-1.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pico-da-bandeira/gallery-2.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pico-da-bandeira/gallery-3.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pico-da-bandeira/gallery-4.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pico-da-bandeira/gallery-5.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pico-da-bandeira/gallery-6.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pico-da-bandeira/gallery-7.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pico-da-bandeira/gallery-8.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pico-da-bandeira/gallery-9.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/pico-da-bandeira/gallery-10.jpg"
  ],
  "Cânion Itaimbezinho": [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/canion-itaimbezinho/gallery-1.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/canion-itaimbezinho/gallery-2.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/canion-itaimbezinho/gallery-3.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/canion-itaimbezinho/gallery-4.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/canion-itaimbezinho/gallery-5.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/canion-itaimbezinho/gallery-6.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/canion-itaimbezinho/gallery-7.webp",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/canion-itaimbezinho/gallery-8.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/canion-itaimbezinho/gallery-9.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/canion-itaimbezinho/gallery-10.jpg"
  ],
  "Trilha das 7 Praias": [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/trilha-das-7-praias/gallery-1.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/trilha-das-7-praias/gallery-2.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/trilha-das-7-praias/gallery-3.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/trilha-das-7-praias/gallery-4.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/trilha-das-7-praias/gallery-5.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/trilha-das-7-praias/gallery-6.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/trilha-das-7-praias/gallery-7.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/trilha-das-7-praias/gallery-8.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/trilha-das-7-praias/gallery-9.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/trilha-das-7-praias/gallery-10.jpg"
  ],
  "Travessia Serra Fina": [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-serra-fina/gallery-1.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-serra-fina/gallery-2.jpeg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-serra-fina/gallery-3.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-serra-fina/gallery-4.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-serra-fina/gallery-5.webp",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-serra-fina/gallery-6.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-serra-fina/gallery-7.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-serra-fina/gallery-8.jpeg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-serra-fina/gallery-9.jpg",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029541217/cCoaev8yfaEJXZAkd8a56J/trails/travessia-serra-fina/gallery-10.jpg"
  ]
};

async function updateTrailGalleries() {
  console.log('Updating trail galleries in database...\n');
  
  for (const [trailName, images] of Object.entries(trailGalleries)) {
    try {
      const result = await db.update(trails)
        .set({ images })
        .where(eq(trails.name, trailName));
      
      console.log(`✓ Updated ${trailName} with ${images.length} gallery images`);
    } catch (error: any) {
      console.error(`✗ Error updating ${trailName}:`, error.message);
    }
  }
  
  console.log('\nDone!');
  process.exit(0);
}

updateTrailGalleries().catch(console.error);

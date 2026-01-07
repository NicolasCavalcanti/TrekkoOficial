/**
 * Restore all database data: trails, CADASTUR guides, and blog posts
 */

import mysql from 'mysql2/promise';
import xlsx from 'xlsx';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('Starting data restoration...\n');

// ============================================
// 1. RESTORE TRAILS (8 trails)
// ============================================
console.log('=== Restoring Trails ===');

const trails = [
  {
    name: 'Monte Roraima',
    shortDescription: 'Tepui milenar com paisagens surreais',
    description: 'O Monte Roraima é um dos tepuis mais famosos do mundo, uma formação geológica única com mais de 2 bilhões de anos. A travessia oferece paisagens surreais com formações rochosas, piscinas naturais e uma biodiversidade encontrada apenas neste ecossistema. Uma aventura épica que leva você ao topo de uma das montanhas mais antigas do planeta.',
    hookText: 'Explore uma das montanhas mais antigas do planeta',
    ctaText: 'Reserve sua expedição ao Roraima',
    uf: 'RR',
    city: 'Uiramutã',
    region: 'Norte',
    park: 'Parque Nacional do Monte Roraima',
    difficulty: 'hard',
    distanceKm: 48,
    elevationGain: 2810,
    maxAltitude: 2810,
    estimatedTime: '6-8 dias',
    trailType: 'traverse',
    guideRequired: 1,
    entranceFee: 'R$ 100,00',
    waterPoints: JSON.stringify(['Rio Kukenan', 'Nascentes no topo']),
    campingPoints: JSON.stringify(['Base Camp', 'Rio Kukenan', 'Hotel (topo)']),
    bestSeason: 'Outubro a Abril',
    imageUrl: 'https://images.unsplash.com/photo-1624463699791-0f2e4e5e5f5a?w=800',
    images: JSON.stringify(['https://images.unsplash.com/photo-1624463699791-0f2e4e5e5f5a?w=800']),
    highlights: JSON.stringify(['Formações rochosas únicas', 'Piscinas naturais', 'Biodiversidade endêmica']),
    mapCoordinates: JSON.stringify({ lat: 5.1436, lng: -60.7625 }),
    status: 'published'
  },
  {
    name: 'Travessia Petrópolis x Teresópolis',
    shortDescription: 'A travessia mais clássica do Brasil',
    description: 'A travessia mais clássica do Brasil, conectando duas cidades serranas através do Parque Nacional da Serra dos Órgãos. São 30km de trilha com paisagens deslumbrantes, passando por vales, rios e os picos mais icônicos do parque. Uma experiência obrigatória para quem ama trekking.',
    hookText: 'Atravesse a Serra dos Órgãos em uma aventura épica',
    ctaText: 'Planeje sua travessia',
    uf: 'RJ',
    city: 'Petrópolis',
    region: 'Sudeste',
    park: 'Parque Nacional da Serra dos Órgãos',
    difficulty: 'hard',
    distanceKm: 30,
    elevationGain: 1800,
    maxAltitude: 2263,
    estimatedTime: '3 dias',
    trailType: 'traverse',
    guideRequired: 0,
    entranceFee: 'R$ 44,00',
    waterPoints: JSON.stringify(['Rios ao longo do percurso', 'Abrigo 4']),
    campingPoints: JSON.stringify(['Abrigo 4', 'Castelos do Açu']),
    bestSeason: 'Abril a Outubro',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    images: JSON.stringify(['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800']),
    highlights: JSON.stringify(['Dedo de Deus', 'Pedra do Sino', 'Mata Atlântica preservada']),
    mapCoordinates: JSON.stringify({ lat: -22.4534, lng: -43.0729 }),
    status: 'published'
  },
  {
    name: 'Vale da Lua',
    shortDescription: 'Formações rochosas de outro planeta',
    description: 'Formações rochosas esculpidas pela água ao longo de milhões de anos criaram um cenário que parece de outro planeta. As piscinas naturais entre as rochas são perfeitas para um banho refrescante após a caminhada. Um dos cartões-postais mais impressionantes da Chapada dos Veadeiros.',
    hookText: 'Banhe-se em piscinas naturais esculpidas há milhões de anos',
    ctaText: 'Visite o Vale da Lua',
    uf: 'GO',
    city: 'Alto Paraíso de Goiás',
    region: 'Centro-Oeste',
    park: 'Chapada dos Veadeiros',
    difficulty: 'easy',
    distanceKm: 1.2,
    elevationGain: 50,
    maxAltitude: 1200,
    estimatedTime: '2 horas',
    trailType: 'linear',
    guideRequired: 0,
    entranceFee: 'R$ 20,00',
    waterPoints: JSON.stringify(['Rio São Miguel']),
    campingPoints: JSON.stringify([]),
    bestSeason: 'Maio a Setembro',
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800',
    images: JSON.stringify(['https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800']),
    highlights: JSON.stringify(['Formações rochosas', 'Piscinas naturais', 'Cerrado']),
    mapCoordinates: JSON.stringify({ lat: -14.1667, lng: -47.8333 }),
    status: 'published'
  },
  {
    name: 'Pedra do Baú',
    shortDescription: 'Escalada com vista 360° da Mantiqueira',
    description: 'Um dos picos mais desafiadores e recompensadores de São Paulo. A escalada até o topo oferece uma vista panorâmica de 360° da Serra da Mantiqueira. O trecho final com escadas e grampos de ferro adiciona adrenalina à aventura.',
    hookText: 'Conquiste o topo e tenha uma vista de 360°',
    ctaText: 'Escale a Pedra do Baú',
    uf: 'SP',
    city: 'São Bento do Sapucaí',
    region: 'Sudeste',
    park: null,
    difficulty: 'hard',
    distanceKm: 8,
    elevationGain: 600,
    maxAltitude: 1950,
    estimatedTime: '5 horas',
    trailType: 'linear',
    guideRequired: 0,
    entranceFee: 'R$ 30,00',
    waterPoints: JSON.stringify([]),
    campingPoints: JSON.stringify(['Camping na base']),
    bestSeason: 'Abril a Outubro',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    images: JSON.stringify(['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800']),
    highlights: JSON.stringify(['Vista 360°', 'Escalada com grampos', 'Serra da Mantiqueira']),
    mapCoordinates: JSON.stringify({ lat: -22.6833, lng: -45.7167 }),
    status: 'published'
  },
  {
    name: 'Pico da Bandeira',
    shortDescription: 'O terceiro ponto mais alto do Brasil',
    description: 'O terceiro ponto mais alto do Brasil com 2.892m de altitude. A trilha noturna para ver o nascer do sol do topo é uma experiência inesquecível. O Parque Nacional do Caparaó oferece infraestrutura completa para a aventura.',
    hookText: 'Veja o nascer do sol do terceiro pico mais alto do Brasil',
    ctaText: 'Conquiste o Pico da Bandeira',
    uf: 'MG',
    city: 'Alto Caparaó',
    region: 'Sudeste',
    park: 'Parque Nacional do Caparaó',
    difficulty: 'moderate',
    distanceKm: 12,
    elevationGain: 950,
    maxAltitude: 2892,
    estimatedTime: '6 horas',
    trailType: 'linear',
    guideRequired: 0,
    entranceFee: 'R$ 36,00',
    waterPoints: JSON.stringify(['Nascentes ao longo da trilha']),
    campingPoints: JSON.stringify(['Tronqueira', 'Terreirão']),
    bestSeason: 'Abril a Outubro',
    imageUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800',
    images: JSON.stringify(['https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800']),
    highlights: JSON.stringify(['Nascer do sol', 'Campos de altitude', 'Terceiro pico mais alto']),
    mapCoordinates: JSON.stringify({ lat: -20.4378, lng: -41.7928 }),
    status: 'published'
  },
  {
    name: 'Cânion Itaimbezinho',
    shortDescription: 'Paredões de 720m de altura',
    description: 'Um dos cânions mais impressionantes da América do Sul, com paredões de até 720m de altura. As trilhas do Vértice e do Cotovelo oferecem vistas espetaculares das cascatas e da imensidão verde. Prepare-se para paisagens de tirar o fôlego.',
    hookText: 'Contemple um dos maiores cânions da América do Sul',
    ctaText: 'Visite o Itaimbezinho',
    uf: 'RS',
    city: 'Cambará do Sul',
    region: 'Sul',
    park: 'Parque Nacional de Aparados da Serra',
    difficulty: 'easy',
    distanceKm: 7,
    elevationGain: 200,
    maxAltitude: 1000,
    estimatedTime: '3 horas',
    trailType: 'circular',
    guideRequired: 0,
    entranceFee: 'R$ 42,00',
    waterPoints: JSON.stringify(['Centro de visitantes']),
    campingPoints: JSON.stringify([]),
    bestSeason: 'Março a Novembro',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    images: JSON.stringify(['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']),
    highlights: JSON.stringify(['Paredões de 720m', 'Cascatas', 'Mata de Araucárias']),
    mapCoordinates: JSON.stringify({ lat: -29.0444, lng: -50.0833 }),
    status: 'published'
  },
  {
    name: 'Trilha das Praias',
    shortDescription: 'Praias paradisíacas conectadas pela mata',
    description: 'Uma das trilhas costeiras mais bonitas do Brasil, conectando praias paradisíacas através da mata atlântica. Cada praia tem sua personalidade única, desde as mais movimentadas até as mais desertas e selvagens.',
    hookText: 'Descubra praias secretas em Ubatuba',
    ctaText: 'Explore a Trilha das Praias',
    uf: 'SP',
    city: 'Ubatuba',
    region: 'Sudeste',
    park: null,
    difficulty: 'moderate',
    distanceKm: 12,
    elevationGain: 400,
    maxAltitude: 200,
    estimatedTime: '6 horas',
    trailType: 'traverse',
    guideRequired: 0,
    entranceFee: 'Gratuito',
    waterPoints: JSON.stringify(['Praias com quiosques']),
    campingPoints: JSON.stringify(['Algumas praias permitem camping']),
    bestSeason: 'Abril a Novembro',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    images: JSON.stringify(['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800']),
    highlights: JSON.stringify(['Praias desertas', 'Mata Atlântica', 'Mergulho']),
    mapCoordinates: JSON.stringify({ lat: -23.4333, lng: -45.0833 }),
    status: 'published'
  },
  {
    name: 'Serra Fina',
    shortDescription: 'A travessia mais técnica do Brasil',
    description: 'A travessia mais técnica e desafiadora do Brasil, passando pelos três picos mais altos da Serra da Mantiqueira. Paisagens alpinas, campos de altitude e a sensação de estar no topo do mundo. Apenas para montanhistas experientes.',
    hookText: 'Encare o desafio mais técnico do montanhismo brasileiro',
    ctaText: 'Planeje sua travessia da Serra Fina',
    uf: 'MG',
    city: 'Passa Quatro',
    region: 'Sudeste',
    park: null,
    difficulty: 'expert',
    distanceKm: 32,
    elevationGain: 2500,
    maxAltitude: 2798,
    estimatedTime: '3-4 dias',
    trailType: 'traverse',
    guideRequired: 1,
    entranceFee: 'Gratuito',
    waterPoints: JSON.stringify(['Nascentes em pontos específicos']),
    campingPoints: JSON.stringify(['Acampamentos selvagens']),
    bestSeason: 'Maio a Setembro',
    imageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800',
    images: JSON.stringify(['https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800']),
    highlights: JSON.stringify(['Pedra da Mina', 'Campos de altitude', 'Paisagens alpinas']),
    mapCoordinates: JSON.stringify({ lat: -22.4667, lng: -44.9500 }),
    status: 'published'
  }
];

// Delete existing trails
await connection.execute('DELETE FROM trails');
console.log('Cleared existing trails');

// Insert trails
for (const trail of trails) {
  await connection.execute(`
    INSERT INTO trails (name, shortDescription, description, hookText, ctaText, uf, city, region, park, difficulty, distanceKm, elevationGain, maxAltitude, estimatedTime, trailType, guideRequired, entranceFee, waterPoints, campingPoints, bestSeason, imageUrl, images, highlights, mapCoordinates, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    trail.name, trail.shortDescription, trail.description, trail.hookText, trail.ctaText,
    trail.uf, trail.city, trail.region, trail.park, trail.difficulty,
    trail.distanceKm, trail.elevationGain, trail.maxAltitude, trail.estimatedTime, trail.trailType,
    trail.guideRequired, trail.entranceFee, trail.waterPoints, trail.campingPoints, trail.bestSeason,
    trail.imageUrl, trail.images, trail.highlights, trail.mapCoordinates, trail.status
  ]);
  console.log(`Inserted trail: ${trail.name}`);
}

const [trailCount] = await connection.execute('SELECT COUNT(*) as count FROM trails');
console.log(`Total trails: ${trailCount[0].count}\n`);

// ============================================
// 2. RESTORE CADASTUR GUIDES
// ============================================
console.log('=== Restoring CADASTUR Guides ===');

// Clear existing data
await connection.execute('DELETE FROM cadastur_registry');
console.log('Cleared existing CADASTUR data');

// Read XLSX file
const workbook = xlsx.readFile('/home/ubuntu/trilhas-brasil/guia-de-turismo-pf.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

console.log(`Found ${data.length} rows in XLSX file`);

// Get column names from first row
if (data.length > 0) {
  console.log('Columns:', Object.keys(data[0]).join(', '));
}

// Process in batches
const batchSize = 1000;
let inserted = 0;
let skipped = 0;
const seen = new Set();

for (let i = 0; i < data.length; i += batchSize) {
  const batch = data.slice(i, i + batchSize);
  const values = [];
  
  for (const row of batch) {
    // Use correct column names from XLSX
    const certificateNumber = String(row['Número do Certificado'] || '').trim();
    const fullName = String(row['Nome Completo'] || '').trim();
    
    if (!certificateNumber || !fullName || seen.has(certificateNumber)) {
      skipped++;
      continue;
    }
    seen.add(certificateNumber);
    
    const uf = String(row['UF'] || '').trim().toUpperCase();
    const city = String(row['Município'] || '').trim();
    const phone = String(row['Telefone Comercial'] || '').trim();
    const email = String(row['E-mail Comercial'] || '').trim().toLowerCase();
    const website = String(row['Website'] || '').trim() || null;
    // Parse date - handle Excel serial date format
    let validUntil = null;
    const validUntilRaw = row['Validade do Certificado'];
    if (validUntilRaw) {
      if (typeof validUntilRaw === 'number') {
        // Excel serial date - convert to JS date
        const excelEpoch = new Date(1899, 11, 30);
        validUntil = new Date(excelEpoch.getTime() + validUntilRaw * 86400000);
      } else {
        validUntil = new Date(validUntilRaw);
      }
      // Validate the date is reasonable (after year 2000)
      if (validUntil.getFullYear() < 2000 || isNaN(validUntil.getTime())) {
        validUntil = null;
      }
    }
    const languages = row['Idiomas'] ? JSON.stringify(String(row['Idiomas']).split(',').map(l => l.trim())) : null;
    const operatingCities = row['Município de Atuação'] ? JSON.stringify(String(row['Município de Atuação']).split(',').map(c => c.trim())) : null;
    const categories = row['Categoria(s)'] ? JSON.stringify(String(row['Categoria(s)']).split(',').map(c => c.trim())) : null;
    const segments = row['Segmento(s)'] ? JSON.stringify(String(row['Segmento(s)']).split(',').map(s => s.trim())) : null;
    const isDriverGuide = String(row['Guia Motorista'] || '').toLowerCase() === 'sim' ? 1 : 0;
    
    values.push([
      certificateNumber, fullName, uf, city, phone || null, email || null, website,
      validUntil, languages, operatingCities, categories, segments, isDriverGuide
    ]);
  }
  
  if (values.length > 0) {
    const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const flatValues = values.flat();
    
    await connection.execute(`
      INSERT INTO cadastur_registry (certificateNumber, fullName, uf, city, phone, email, website, validUntil, languages, operatingCities, categories, segments, isDriverGuide)
      VALUES ${placeholders}
    `, flatValues);
    
    inserted += values.length;
  }
  
  if ((i + batchSize) % 10000 === 0 || i + batchSize >= data.length) {
    console.log(`Progress: ${Math.min(i + batchSize, data.length)}/${data.length} rows processed, ${inserted} inserted, ${skipped} skipped`);
  }
}

const [guideCount] = await connection.execute('SELECT COUNT(*) as count FROM cadastur_registry');
console.log(`Total CADASTUR guides: ${guideCount[0].count}\n`);

// ============================================
// 3. RESTORE BLOG POSTS
// ============================================
console.log('=== Restoring Blog Posts ===');

// Clear existing posts
await connection.execute('DELETE FROM blog_posts');

const blogPost = {
  title: 'Serra Fina: A Travessia Mais Desafiadora do Brasil',
  slug: 'serra-fina-travessia-mais-desafiadora-brasil',
  subtitle: 'Conheça a travessia mais técnica do montanhismo brasileiro',
  excerpt: 'Conheça a travessia da Serra Fina, uma aventura épica pelos três picos mais altos da Serra da Mantiqueira. Descubra o que esperar, como se preparar e por que esta é considerada a trilha mais técnica do país.',
  content: `# Serra Fina: A Travessia Mais Desafiadora do Brasil

A Serra Fina é um dos destinos mais cobiçados pelos montanhistas brasileiros. Localizada na divisa entre Minas Gerais e São Paulo, esta cordilheira abriga os três picos mais altos da Serra da Mantiqueira: Pedra da Mina (2.798m), Pico dos Marins (2.421m) e o Pico do Capim Amarelo (2.592m).

## O Desafio

A travessia completa da Serra Fina tem aproximadamente 32km e leva de 3 a 4 dias para ser concluída. O percurso exige:

- **Preparo físico excepcional**: São mais de 2.500m de ganho de elevação acumulado
- **Experiência em montanhismo**: Trechos técnicos com exposição e necessidade de navegação
- **Autonomia completa**: Não há infraestrutura ao longo do percurso
- **Equipamento adequado**: Temperaturas podem chegar a -10°C no inverno

## Quando Ir

A melhor época para a travessia é entre maio e setembro, durante a estação seca. Neste período:

- Menor chance de chuvas e tempestades
- Céu mais limpo para as vistas panorâmicas
- Trilhas menos lamacentas
- Noites mais frias, mas mais estáveis

## O Que Levar

### Equipamentos Essenciais
- Barraca para temperaturas negativas
- Saco de dormir para -5°C ou menos
- Isolante térmico
- Fogareiro e combustível
- GPS ou bússola e mapa
- Kit de primeiros socorros completo

### Roupas
- Sistema de camadas (base, térmica, impermeável)
- Luvas e gorro
- Óculos de sol
- Protetor solar

## Roteiro Sugerido

**Dia 1**: Início em Passa Quatro (MG) até o acampamento base
**Dia 2**: Subida até a Pedra da Mina e travessia até o Capim Amarelo
**Dia 3**: Travessia até os Marins
**Dia 4**: Descida até Piquete (SP)

## Dicas Importantes

1. **Contrate um guia certificado** se for sua primeira vez
2. **Informe seu roteiro** para alguém de confiança
3. **Respeite seus limites** - a montanha sempre estará lá
4. **Não deixe rastros** - pratique o mínimo impacto
5. **Monitore o clima** constantemente

## Conclusão

A Serra Fina não é apenas uma trilha, é uma jornada de autoconhecimento e superação. As paisagens alpinas, os campos de altitude e a sensação de estar no topo do mundo fazem cada gota de suor valer a pena.

Se você está preparado para o desafio, a Serra Fina será uma das experiências mais memoráveis da sua vida como montanhista.

---

*Quer fazer a travessia da Serra Fina? Encontre guias certificados no Trekko e planeje sua aventura com segurança.*`,
  category: 'trilhas-destinos',
  imageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200',
  images: JSON.stringify(['https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200']),
  authorId: 1,
  authorName: 'Equipe Trekko',
  readingTime: 8,
  relatedTrailIds: JSON.stringify([8]), // Serra Fina trail
  tags: JSON.stringify(['serra fina', 'travessia', 'montanhismo', 'mantiqueira', 'trekking']),
  metaTitle: 'Serra Fina: A Travessia Mais Desafiadora do Brasil | Trekko',
  metaDescription: 'Guia completo da travessia da Serra Fina. Saiba como se preparar para a trilha mais técnica do Brasil.',
  featured: 1,
  viewCount: 0,
  status: 'published'
};

await connection.execute(`
  INSERT INTO blog_posts (title, slug, subtitle, excerpt, content, category, imageUrl, images, authorId, authorName, readingTime, relatedTrailIds, tags, metaTitle, metaDescription, featured, viewCount, status, publishedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
`, [
  blogPost.title, blogPost.slug, blogPost.subtitle, blogPost.excerpt, blogPost.content,
  blogPost.category, blogPost.imageUrl, blogPost.images, blogPost.authorId, blogPost.authorName,
  blogPost.readingTime, blogPost.relatedTrailIds, blogPost.tags, blogPost.metaTitle,
  blogPost.metaDescription, blogPost.featured, blogPost.viewCount, blogPost.status
]);

console.log(`Inserted blog post: ${blogPost.title}`);

const [postCount] = await connection.execute('SELECT COUNT(*) as count FROM blog_posts');
console.log(`Total blog posts: ${postCount[0].count}\n`);

// ============================================
// FINAL SUMMARY
// ============================================
console.log('=== Restoration Complete ===');
const [finalTrails] = await connection.execute('SELECT COUNT(*) as count FROM trails');
const [finalGuides] = await connection.execute('SELECT COUNT(*) as count FROM cadastur_registry');
const [finalPosts] = await connection.execute('SELECT COUNT(*) as count FROM blog_posts');

console.log(`Trails: ${finalTrails[0].count}`);
console.log(`CADASTUR Guides: ${finalGuides[0].count}`);
console.log(`Blog Posts: ${finalPosts[0].count}`);

await connection.end();
console.log('\nDone!');

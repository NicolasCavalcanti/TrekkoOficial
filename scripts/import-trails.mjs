import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const trails = [
  {
    name: "Monte Roraima",
    uf: "RR",
    city: "Uiramutã",
    region: "Tríplice Fronteira Brasil-Venezuela-Guiana",
    park: "Parque Nacional Monte Roraima",
    distanceKm: 48,
    elevationGain: 1800,
    maxAltitude: 2810,
    difficulty: "expert",
    guideRequired: 1,
    entranceFee: "R$ 150,00",
    estimatedTime: "6-8 dias",
    trailType: "traverse",
    bestSeason: "Outubro a Abril",
    waterPoints: ["Rio Tek", "Rio Kukenán", "Nascentes no topo"],
    campingPoints: ["Base do Roraima", "Topo - Hotel", "Topo - Camping"],
    highlights: ["Tepui milenar", "Formações rochosas únicas", "Piscinas naturais", "Vista da tríplice fronteira"],
    shortDescription: "A montanha mais antiga do planeta, um tepui de 2 bilhões de anos que inspirou o filme 'UP' da Pixar.",
    hookText: "Imagine caminhar sobre uma das formações geológicas mais antigas da Terra, onde cristais de quartzo brilham sob seus pés e nuvens passam abaixo de você.",
    ctaText: "Conquiste o topo do mundo perdido. Reserve sua expedição ao Monte Roraima.",
    description: "O Monte Roraima é um dos tepuis mais impressionantes da América do Sul, uma formação geológica de aproximadamente 2 bilhões de anos que se ergue majestosamente na tríplice fronteira entre Brasil, Venezuela e Guiana. A trilha de 48 km atravessa savanas, florestas e culmina em uma escalada íngreme até o topo plano do tepui, onde paisagens surreais de formações rochosas, cristais de quartzo e piscinas naturais aguardam os aventureiros. A expedição completa leva de 6 a 8 dias e requer preparo físico avançado e acompanhamento de guia credenciado.",
    images: [
      "/trails/x3cCqIWOMgkN.jpg",
      "/trails/1XusOO38UGqz.jpg", 
      "/trails/sbxfZG871EAY.jpg",
      "/trails/0KxzzmouUxGL.jpg",
      "/trails/aNFQOlYgJ1es.webp",
      "/trails/KawzcgqRL1cP.jpg",
      "/trails/wSQXZXHQTIsn.jpg",
      "/trails/AdoeIj66HFMl.jpg"
    ],
    mapCoordinates: { lat: 5.1436, lng: -60.7625 }
  },
  {
    name: "Travessia Petrópolis x Teresópolis",
    uf: "RJ",
    city: "Petrópolis / Teresópolis",
    region: "Serra dos Órgãos",
    park: "Parque Nacional da Serra dos Órgãos",
    distanceKm: 30,
    elevationGain: 2100,
    maxAltitude: 2263,
    difficulty: "hard",
    guideRequired: 0,
    entranceFee: "R$ 44,00",
    estimatedTime: "3 dias",
    trailType: "traverse",
    bestSeason: "Abril a Outubro",
    waterPoints: ["Abrigo 1", "Abrigo 2", "Castelos do Açu"],
    campingPoints: ["Abrigo 1", "Abrigo 2", "Abrigo 4"],
    highlights: ["Dedo de Deus", "Pedra do Sino", "Mata Atlântica preservada", "Nascentes cristalinas"],
    shortDescription: "A travessia mais clássica do Brasil, conectando duas cidades imperiais através da majestosa Serra dos Órgãos.",
    hookText: "Atravesse a espinha dorsal da Mata Atlântica, onde picos rochosos rasgam as nuvens e a história do Brasil Imperial se mistura com a natureza selvagem.",
    ctaText: "Aceite o desafio da travessia mais icônica do Brasil. Planeje sua aventura agora.",
    description: "A Travessia Petrópolis x Teresópolis é considerada a trilha de longo curso mais famosa do Brasil. São 30 km através do Parque Nacional da Serra dos Órgãos, passando por alguns dos picos mais emblemáticos do país, incluindo a Pedra do Sino (2.263m) e o icônico Dedo de Deus. A trilha atravessa diferentes ecossistemas da Mata Atlântica, desde florestas densas até campos de altitude, oferecendo vistas panorâmicas deslumbrantes. A travessia completa leva 3 dias e requer bom preparo físico.",
    images: [
      "/trails/bCKTbP7YuBYO.jpg",
      "/trails/4BhROMsVsTLe.jpg",
      "/trails/NFpRje6MIcvw.jpg",
      "/trails/mgogOn14zyxM.jpg",
      "/trails/wjdxBjk7xKaf.jpg",
      "/trails/H7CdjoQVbucb.jpg",
      "/trails/VZeXcZ5NOF8H.jpg",
      "/trails/Dj8tzqrOF2lQ.jpg"
    ],
    mapCoordinates: { lat: -22.4500, lng: -43.0000 }
  },
  {
    name: "Vale da Lua e Cachoeiras",
    uf: "GO",
    city: "Alto Paraíso de Goiás",
    region: "Chapada dos Veadeiros",
    park: "Parque Nacional da Chapada dos Veadeiros",
    distanceKm: 12,
    elevationGain: 400,
    maxAltitude: 1200,
    difficulty: "moderate",
    guideRequired: 0,
    entranceFee: "R$ 36,00",
    estimatedTime: "1 dia",
    trailType: "circular",
    bestSeason: "Maio a Setembro",
    waterPoints: ["Rio São Miguel", "Cachoeira Santa Bárbara", "Vale da Lua"],
    campingPoints: [],
    highlights: ["Formações rochosas lunares", "Cachoeiras cristalinas", "Cerrado preservado", "Piscinas naturais"],
    shortDescription: "Paisagens de outro mundo no coração do Cerrado, onde a água esculpiu rochas por milhões de anos.",
    hookText: "Caminhe por paisagens que parecem ter sido esculpidas em outro planeta, onde águas cristalinas criaram formações rochosas que desafiam a imaginação.",
    ctaText: "Descubra o Vale da Lua e as cachoeiras mais bonitas do Cerrado. Comece sua jornada.",
    description: "A Chapada dos Veadeiros é um dos destinos de ecoturismo mais impressionantes do Brasil. O Vale da Lua, com suas formações rochosas esculpidas pela água ao longo de milhões de anos, parece uma paisagem lunar. As cachoeiras da região, como Santa Bárbara e Almécegas, estão entre as mais bonitas do país, com águas cristalinas em tons de azul e verde. A trilha de 12 km permite conhecer os principais atrativos em um dia, passando por cerrado preservado e mirantes espetaculares.",
    images: [
      "/trails/Y8KJdb96pKOX.jpg",
      "/trails/ZEwnEJhW02EO.jpg",
      "/trails/Hui5JnuhT0v7.jpg",
      "/trails/S3aTraKQj167.jpg",
      "/trails/7e8cJRJJPzJ4.jpg",
      "/trails/I3M6AHN8hN3h.jpg",
      "/trails/KUgYss0rYglR.jpg",
      "/trails/mivweh2MpYPi.jpg"
    ],
    mapCoordinates: { lat: -14.1667, lng: -47.5000 }
  },
  {
    name: "Pedra do Baú",
    uf: "SP",
    city: "São Bento do Sapucaí",
    region: "Serra da Mantiqueira",
    park: "Complexo do Baú",
    distanceKm: 8,
    elevationGain: 600,
    maxAltitude: 1950,
    difficulty: "hard",
    guideRequired: 0,
    entranceFee: "R$ 30,00",
    estimatedTime: "4-6 horas",
    trailType: "linear",
    bestSeason: "Abril a Outubro",
    waterPoints: [],
    campingPoints: ["Base da Pedra do Baú"],
    highlights: ["Escadaria de 600 degraus", "Vista 360°", "Formação rochosa única", "Pôr do sol espetacular"],
    shortDescription: "Um monólito de 1.950m com escadaria cravada na rocha e vista de tirar o fôlego da Serra da Mantiqueira.",
    hookText: "Suba 600 degraus cravados na rocha viva e seja recompensado com uma das vistas mais espetaculares do sudeste brasileiro.",
    ctaText: "Encare o desafio da Pedra do Baú. Cada degrau vale a vista do topo.",
    description: "A Pedra do Baú é um dos destinos de montanhismo mais procurados de São Paulo. O monólito de 1.950m de altitude oferece uma escalada desafiadora através de uma escadaria de 600 degraus cravada na rocha. Do topo, a vista 360° abrange toda a Serra da Mantiqueira, incluindo a Pedra do Bauzinho e a Ana Chata. A trilha de 8 km ida e volta exige bom preparo físico e não é recomendada para quem tem medo de altura.",
    images: [
      "/trails/xQQ123BhBF2H.jpg",
      "/trails/UJqYW1WVEywl.jpg",
      "/trails/E37KU48zrmTM.jpg",
      "/trails/inGR5T251zv1.jpg",
      "/trails/NIqNdEU3BQqS.jpg",
      "/trails/1tCwycSmzwgY.jpg",
      "/trails/BfD42sH5IYng.jpg",
      "/trails/uaoN9BsLrDcu.jpg"
    ],
    mapCoordinates: { lat: -22.6833, lng: -45.6333 }
  },
  {
    name: "Pico da Bandeira",
    uf: "MG",
    city: "Alto Caparaó",
    region: "Serra do Caparaó",
    park: "Parque Nacional do Caparaó",
    distanceKm: 12,
    elevationGain: 1000,
    maxAltitude: 2892,
    difficulty: "hard",
    guideRequired: 0,
    entranceFee: "R$ 36,00",
    estimatedTime: "1-2 dias",
    trailType: "linear",
    bestSeason: "Abril a Outubro",
    waterPoints: ["Tronqueira", "Terreirão"],
    campingPoints: ["Tronqueira", "Terreirão"],
    highlights: ["3º pico mais alto do Brasil", "Nascer do sol acima das nuvens", "Mar de nuvens", "Campos de altitude"],
    shortDescription: "O terceiro ponto mais alto do Brasil, onde o nascer do sol acima das nuvens é uma experiência transformadora.",
    hookText: "Assista ao nascer do sol do terceiro ponto mais alto do Brasil, quando o mar de nuvens se tinge de dourado aos seus pés.",
    ctaText: "Alcance o Pico da Bandeira e veja o Brasil de cima. Reserve sua subida.",
    description: "O Pico da Bandeira, com 2.892m de altitude, é o terceiro ponto mais alto do Brasil e o mais alto fora da Amazônia. A trilha de 12 km parte do Alto Caparaó e atravessa campos de altitude com vegetação única. O grande atrativo é o nascer do sol visto do cume, quando o mar de nuvens se estende até o horizonte. A subida pode ser feita em um dia (saída de madrugada) ou em dois dias, com pernoite nos campings de Tronqueira ou Terreirão.",
    images: [
      "/trails/byQMAGcrGTRY.jpg",
      "/trails/TCO9UFHYnYBl.jpg",
      "/trails/HIVdPoGFbdU7.jpg",
      "/trails/DnGdbquoZAZO.jpg",
      "/trails/Px1netlYFRlB.jpg",
      "/trails/RlNiLBHjGFbS.jpg",
      "/trails/S8MvVHxC3GSI.jpg",
      "/trails/uxCjxAvtFISc.jpg"
    ],
    mapCoordinates: { lat: -20.4400, lng: -41.7900 }
  },
  {
    name: "Cânion Itaimbezinho",
    uf: "RS",
    city: "Cambará do Sul",
    region: "Cânions do Sul",
    park: "Parque Nacional de Aparados da Serra",
    distanceKm: 14,
    elevationGain: 700,
    maxAltitude: 1000,
    difficulty: "moderate",
    guideRequired: 1,
    entranceFee: "R$ 42,00",
    estimatedTime: "6-8 horas",
    trailType: "linear",
    bestSeason: "Março a Novembro",
    waterPoints: ["Rio do Boi"],
    campingPoints: [],
    highlights: ["Paredões de 720m", "Cachoeiras", "Araucárias", "Trilha do Rio do Boi"],
    shortDescription: "O maior cânion da América Latina, com paredões de 720 metros e cachoeiras que despencam no abismo.",
    hookText: "Desça ao fundo do maior cânion da América Latina, onde paredões de 720 metros se erguem ao seu redor como catedrais de pedra.",
    ctaText: "Explore o Cânion Itaimbezinho. Uma experiência que vai mudar sua perspectiva.",
    description: "O Cânion Itaimbezinho é o maior cânion da América Latina, com paredões de até 720 metros de altura e 5,8 km de extensão. A Trilha do Rio do Boi, de 14 km, desce ao fundo do cânion e oferece uma perspectiva única das gigantescas paredes rochosas. O percurso atravessa o rio diversas vezes e exige guia obrigatório. Do topo, as trilhas do Vértice e do Cotovelo oferecem vistas panorâmicas impressionantes das cachoeiras que despencam no abismo.",
    images: [
      "/trails/rXFyiCGZLcfZ.jpg",
      "/trails/HdnpZnaKd1yR.webp",
      "/trails/P593n9nrOKST.jpg",
      "/trails/BFrxUf5h1xR1.jpg",
      "/trails/SmHDAcO40DOO.jpg",
      "/trails/4cc4qiw1IgsI.jpg",
      "/trails/LkASnrPN5tj1.jpg",
      "/trails/sEFYF7Td0q62.jpg"
    ],
    mapCoordinates: { lat: -29.1833, lng: -50.0833 }
  },
  {
    name: "Trilha das Praias - Rosa Norte a Sul",
    uf: "SC",
    city: "Imbituba",
    region: "Litoral Sul Catarinense",
    park: "APA da Baleia Franca",
    distanceKm: 6,
    elevationGain: 200,
    maxAltitude: 100,
    difficulty: "easy",
    guideRequired: 0,
    entranceFee: "Gratuito",
    estimatedTime: "2-3 horas",
    trailType: "linear",
    bestSeason: "Ano todo (Jul-Nov para baleias)",
    waterPoints: ["Praia do Rosa"],
    campingPoints: [],
    highlights: ["Avistamento de baleias", "Praias desertas", "Lagoa de Ibiraquera", "Pôr do sol"],
    shortDescription: "Trilha costeira com praias paradisíacas e, entre julho e novembro, o espetáculo das baleias-franca.",
    hookText: "Caminhe por praias desertas onde, entre julho e novembro, baleias-franca vêm dar à luz a poucos metros da costa.",
    ctaText: "Descubra a Praia do Rosa e suas trilhas costeiras. O paraíso está mais perto do que você imagina.",
    description: "A Praia do Rosa é considerada uma das praias mais bonitas do Brasil e um dos melhores pontos de avistamento de baleias-franca do mundo. A trilha de 6 km conecta a Rosa Norte à Rosa Sul, passando por costões rochosos, praias desertas e mirantes com vistas espetaculares. Entre julho e novembro, baleias-franca vêm à região para reprodução e podem ser avistadas da própria trilha. A região também é famosa pelo surf e pela Lagoa de Ibiraquera.",
    images: [
      "/trails/In5sfrVjooct.jpg",
      "/trails/E3ZUgnSh1Qxm.jpg",
      "/trails/LzCaSdQ447sU.webp",
      "/trails/wDSwLnqEV5in.jpg",
      "/trails/lq9MdlPPIpQE.jpg",
      "/trails/qtGBh9hFzalk.jpg",
      "/trails/yyZnkLc4jbvK.jpg",
      "/trails/eJvEMmYoRtPP.jpg"
    ],
    mapCoordinates: { lat: -28.1167, lng: -48.6333 }
  },
  {
    name: "Travessia Serra Fina",
    uf: "MG",
    city: "Passa Quatro / Itamonte",
    region: "Serra da Mantiqueira",
    park: "APA da Serra da Mantiqueira",
    distanceKm: 45,
    elevationGain: 3500,
    maxAltitude: 2798,
    difficulty: "expert",
    guideRequired: 1,
    entranceFee: "R$ 50,00",
    estimatedTime: "4-5 dias",
    trailType: "traverse",
    bestSeason: "Abril a Setembro",
    waterPoints: ["Nascentes ao longo da crista"],
    campingPoints: ["Pedra da Mina", "Pico dos Três Estados", "Marins"],
    highlights: ["5 picos acima de 2.700m", "Crista da Mantiqueira", "Campos de altitude", "Desafio extremo"],
    shortDescription: "A travessia mais desafiadora do Brasil, cruzando os cinco picos mais altos da Serra da Mantiqueira.",
    hookText: "Atravesse a espinha dorsal da Serra da Mantiqueira, conquistando cinco picos acima de 2.700 metros em uma das travessias mais desafiadoras do planeta.",
    ctaText: "A Serra Fina é para poucos. Você está pronto para o desafio supremo do montanhismo brasileiro?",
    description: "A Travessia da Serra Fina é considerada a trilha mais difícil do Brasil. São 45 km pela crista da Serra da Mantiqueira, passando por cinco picos acima de 2.700m, incluindo a Pedra da Mina (2.798m), o quarto ponto mais alto do país. A travessia exige excelente preparo físico, experiência em montanhismo e acompanhamento de guia especializado. O percurso atravessa campos de altitude, trechos técnicos de escalada e oferece vistas que compensam cada gota de suor.",
    images: [
      "/trails/pgQoZDaSrDV9.jpeg",
      "/trails/xypYsMeI7ujQ.jpg",
      "/trails/YtKTlmOSaQmD.jpg",
      "/trails/oSCSd2PYXk3O.jpg",
      "/trails/ojvHAmTPj8xD.jpg",
      "/trails/9SerbcIildOR.jpg",
      "/trails/6uRaeZHQCCyS.jpeg",
      "/trails/GebVk6pCXQpT.jpg"
    ],
    mapCoordinates: { lat: -22.4333, lng: -44.9000 }
  }
];

async function importTrails() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Starting trail import...');
  
  for (const trail of trails) {
    try {
      // Check if trail already exists
      const [existing] = await connection.execute(
        'SELECT id FROM trails WHERE name = ?',
        [trail.name]
      );
      
      if (existing.length > 0) {
        console.log(`Trail "${trail.name}" already exists, updating...`);
        await connection.execute(
          `UPDATE trails SET 
            uf = ?, city = ?, region = ?, park = ?, distanceKm = ?, elevationGain = ?,
            maxAltitude = ?, difficulty = ?, guideRequired = ?, entranceFee = ?,
            estimatedTime = ?, trailType = ?, bestSeason = ?, waterPoints = ?,
            campingPoints = ?, highlights = ?, shortDescription = ?, hookText = ?,
            ctaText = ?, description = ?, images = ?, imageUrl = ?, mapCoordinates = ?,
            status = ?, updatedAt = NOW()
          WHERE name = ?`,
          [
            trail.uf, trail.city, trail.region, trail.park, trail.distanceKm, trail.elevationGain,
            trail.maxAltitude, trail.difficulty, trail.guideRequired, trail.entranceFee,
            trail.estimatedTime, trail.trailType, trail.bestSeason, JSON.stringify(trail.waterPoints),
            JSON.stringify(trail.campingPoints), JSON.stringify(trail.highlights), trail.shortDescription,
            trail.hookText, trail.ctaText, trail.description, JSON.stringify(trail.images),
            trail.images[0], JSON.stringify(trail.mapCoordinates), 'published', trail.name
          ]
        );
      } else {
        console.log(`Inserting trail "${trail.name}"...`);
        await connection.execute(
          `INSERT INTO trails (
            name, uf, city, region, park, distanceKm, elevationGain, maxAltitude,
            difficulty, guideRequired, entranceFee, estimatedTime, trailType, bestSeason,
            waterPoints, campingPoints, highlights, shortDescription, hookText, ctaText,
            description, images, imageUrl, mapCoordinates, status, source
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            trail.name, trail.uf, trail.city, trail.region, trail.park, trail.distanceKm,
            trail.elevationGain, trail.maxAltitude, trail.difficulty, trail.guideRequired,
            trail.entranceFee, trail.estimatedTime, trail.trailType, trail.bestSeason,
            JSON.stringify(trail.waterPoints), JSON.stringify(trail.campingPoints),
            JSON.stringify(trail.highlights), trail.shortDescription, trail.hookText,
            trail.ctaText, trail.description, JSON.stringify(trail.images), trail.images[0],
            JSON.stringify(trail.mapCoordinates), 'published', 'Trekko Import'
          ]
        );
      }
      console.log(`✓ Trail "${trail.name}" processed successfully`);
    } catch (error) {
      console.error(`✗ Error processing trail "${trail.name}":`, error.message);
    }
  }
  
  // Get count of imported trails
  const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM trails WHERE status = "published"');
  console.log(`\nImport complete! Total published trails: ${countResult[0].count}`);
  
  await connection.end();
}

importTrails().catch(console.error);

import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in environment');
  process.exit(1);
}

// Parse connection string
const url = new URL(DATABASE_URL);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false }
});

console.log('Connected to database');

// Clear existing data
await connection.execute('DELETE FROM cadastur_registry');
console.log('Cleared existing CADASTUR data');

const csvPath = process.argv[2] || '/home/ubuntu/upload/CADASTUR.csv';
console.log(`Reading CSV from: ${csvPath}`);

const fileStream = createReadStream(csvPath, { encoding: 'utf-8' });
const rl = createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let lineNumber = 0;
let importedCount = 0;
let skippedCount = 0;
let errorCount = 0;

const insertQuery = `
  INSERT INTO cadastur_registry 
  (certificateNumber, fullName, uf, city, phone, email, website, validUntil, languages, operatingCities, categories, segments, isDriverGuide)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    fullName = VALUES(fullName),
    uf = VALUES(uf),
    city = VALUES(city),
    phone = VALUES(phone),
    email = VALUES(email),
    website = VALUES(website),
    validUntil = VALUES(validUntil),
    languages = VALUES(languages),
    operatingCities = VALUES(operatingCities),
    categories = VALUES(categories),
    segments = VALUES(segments),
    isDriverGuide = VALUES(isDriverGuide),
    updatedAt = NOW()
`;

for await (const line of rl) {
  lineNumber++;
  
  // Skip header
  if (lineNumber === 1) {
    console.log('Header:', line.substring(0, 100) + '...');
    continue;
  }
  
  try {
    // Parse CSV line (semicolon-separated)
    const fields = line.split(';');
    
    if (fields.length < 14) {
      skippedCount++;
      continue;
    }
    
    const [
      activityType,
      uf,
      city,
      fullName,
      phone,
      email,
      website,
      certificateNumber,
      validUntilStr,
      languagesStr,
      operatingCitiesStr,
      categoriesStr,
      segmentsStr,
      isDriverGuideStr
    ] = fields;
    
    // Skip entries without certificate number
    if (!certificateNumber || certificateNumber === '-' || certificateNumber.trim() === '') {
      skippedCount++;
      continue;
    }
    
    // Parse validity date (format: 2028-05-29 10:49:49,387)
    let validUntil = null;
    if (validUntilStr && validUntilStr !== '-') {
      const datePart = validUntilStr.split(' ')[0];
      if (datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        validUntil = datePart;
      }
    }
    
    // Parse arrays (pipe-separated)
    const languages = languagesStr && languagesStr !== '-' 
      ? JSON.stringify(languagesStr.split('|').map(s => s.trim()).filter(Boolean))
      : null;
    
    const operatingCities = operatingCitiesStr && operatingCitiesStr !== '-'
      ? JSON.stringify(operatingCitiesStr.split('|').map(s => s.trim()).filter(Boolean))
      : null;
    
    const categories = categoriesStr && categoriesStr !== '-'
      ? JSON.stringify(categoriesStr.split('|').map(s => s.trim()).filter(Boolean))
      : null;
    
    const segments = segmentsStr && segmentsStr !== '-'
      ? JSON.stringify(segmentsStr.split('|').map(s => s.trim()).filter(Boolean))
      : null;
    
    const isDriverGuide = isDriverGuideStr === '1' ? 1 : 0;
    
    // Clean website
    const cleanWebsite = website && website !== '-' ? website.trim() : null;
    
    // Clean email
    const cleanEmail = email && email !== '-' ? email.trim().toLowerCase() : null;
    
    // Clean phone
    const cleanPhone = phone && phone !== '-' ? phone.trim() : null;
    
    await connection.execute(insertQuery, [
      certificateNumber.trim(),
      fullName.trim(),
      uf.trim(),
      city.trim() || null,
      cleanPhone,
      cleanEmail,
      cleanWebsite,
      validUntil,
      languages,
      operatingCities,
      categories,
      segments,
      isDriverGuide
    ]);
    
    importedCount++;
    
    if (importedCount % 5000 === 0) {
      console.log(`Imported ${importedCount} guides...`);
    }
    
  } catch (error) {
    errorCount++;
    if (errorCount <= 10) {
      console.error(`Error on line ${lineNumber}:`, error.message);
    }
  }
}

console.log('\n=== Import Complete ===');
console.log(`Total lines processed: ${lineNumber}`);
console.log(`Successfully imported: ${importedCount}`);
console.log(`Skipped (no certificate): ${skippedCount}`);
console.log(`Errors: ${errorCount}`);

// Verify import
const [rows] = await connection.execute('SELECT COUNT(*) as count FROM cadastur_registry');
console.log(`\nTotal guides in database: ${rows[0].count}`);

// Show sample data
const [sample] = await connection.execute('SELECT certificateNumber, fullName, uf, city FROM cadastur_registry LIMIT 5');
console.log('\nSample data:');
sample.forEach(row => {
  console.log(`  ${row.certificateNumber} - ${row.fullName} (${row.city}, ${row.uf})`);
});

await connection.end();
console.log('\nDatabase connection closed');

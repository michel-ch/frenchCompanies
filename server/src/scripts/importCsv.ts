/**
 * Stream-import StockEtablissement CSV into PostgreSQL.
 * Only imports active establishments (etatAdministratifEtablissement = 'A').
 * Converts Lambert93 coordinates to WGS84 lat/lng using proj4.
 */
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import * as path from 'path';
import proj4 from 'proj4';
import { pool } from '../config/database';

// Lambert93 (EPSG:2154) projection definition
proj4.defs('EPSG:2154', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs');

const CSV_PATH = path.resolve(__dirname, '../../../StockEtablissement_utf8.csv');
const BATCH_SIZE = 500;
const REPORT_INTERVAL = 100000;

interface CsvRow {
  siren: string;
  nic: string;
  siret: string;
  dateCreationEtablissement: string;
  trancheEffectifsEtablissement: string;
  etablissementSiege: string;
  etatAdministratifEtablissement: string;
  numeroVoieEtablissement: string;
  typeVoieEtablissement: string;
  libelleVoieEtablissement: string;
  complementAdresseEtablissement: string;
  codePostalEtablissement: string;
  libelleCommuneEtablissement: string;
  codeCommuneEtablissement: string;
  activitePrincipaleEtablissement: string;
  denominationUsuelleEtablissement: string;
  enseigne1Etablissement: string;
  caractereEmployeurEtablissement: string;
  coordonneeLambertAbscisseEtablissement: string;
  coordonneeLambertOrdonneeEtablissement: string;
}

interface EstablishmentRow {
  siret: string;
  siren: string;
  nic: string;
  denomination: string | null;
  is_headquarter: boolean;
  is_active: boolean;
  is_employer: boolean;
  workforce_bracket: string | null;
  creation_date: string | null;
  street_number: string | null;
  street_type: string | null;
  street_name: string | null;
  address_complement: string | null;
  postal_code: string;
  city_name: string;
  commune_code: string | null;
  naf_code: string | null;
  latitude: number | null;
  longitude: number | null;
}

function convertLambert93ToWGS84(x: number, y: number): [number, number] | null {
  try {
    if (x < 100000 || x > 1300000 || y < 6000000 || y > 7200000) return null;
    const [lng, lat] = proj4('EPSG:2154', 'EPSG:4326', [x, y]);
    if (lat < 41 || lat > 52 || lng < -6 || lng > 10) return null;
    return [lat, lng];
  } catch {
    return null;
  }
}

function normalizeNafCode(code: string): string | null {
  if (!code || code.trim() === '') return null;
  return code.trim().replace(/\./g, '.'); // Keep dots as-is
}

function transformRow(row: CsvRow): EstablishmentRow | null {
  if (!row.siret || !row.codePostalEtablissement) return null;

  const denomination = row.denominationUsuelleEtablissement || row.enseigne1Etablissement || null;
  const nafCode = normalizeNafCode(row.activitePrincipaleEtablissement);

  let latitude: number | null = null;
  let longitude: number | null = null;

  const lambertX = parseFloat(row.coordonneeLambertAbscisseEtablissement);
  const lambertY = parseFloat(row.coordonneeLambertOrdonneeEtablissement);

  if (!isNaN(lambertX) && !isNaN(lambertY) && lambertX > 0 && lambertY > 0) {
    const coords = convertLambert93ToWGS84(lambertX, lambertY);
    if (coords) {
      [latitude, longitude] = coords;
    }
  }

  const creationDate = row.dateCreationEtablissement && row.dateCreationEtablissement.length >= 8
    ? row.dateCreationEtablissement
    : null;

  return {
    siret: row.siret,
    siren: row.siren,
    nic: row.nic || null,
    denomination,
    is_headquarter: row.etablissementSiege === 'true',
    is_active: row.etatAdministratifEtablissement === 'A',
    is_employer: row.caractereEmployeurEtablissement === 'O',
    workforce_bracket: row.trancheEffectifsEtablissement || null,
    creation_date: creationDate,
    street_number: row.numeroVoieEtablissement || null,
    street_type: row.typeVoieEtablissement || null,
    street_name: row.libelleVoieEtablissement || null,
    address_complement: row.complementAdresseEtablissement || null,
    postal_code: row.codePostalEtablissement,
    city_name: row.libelleCommuneEtablissement || 'INCONNU',
    commune_code: row.codeCommuneEtablissement || null,
    naf_code: nafCode,
    latitude,
    longitude,
  };
}

async function bulkInsert(batch: EstablishmentRow[]) {
  if (batch.length === 0) return;

  const values: any[] = [];
  const placeholders: string[] = [];
  let paramIdx = 1;

  for (const row of batch) {
    const rowPlaceholders: string[] = [];
    const fields = [
      row.siret, row.siren, row.nic, row.denomination,
      row.is_headquarter, row.is_active, row.is_employer,
      row.workforce_bracket, row.creation_date,
      row.street_number, row.street_type, row.street_name, row.address_complement,
      row.postal_code, row.city_name, row.commune_code,
      row.naf_code, row.latitude, row.longitude,
    ];

    for (const field of fields) {
      rowPlaceholders.push(`$${paramIdx++}`);
      values.push(field);
    }
    placeholders.push(`(${rowPlaceholders.join(', ')})`);
  }

  const sql = `
    INSERT INTO establishments (
      siret, siren, nic, denomination,
      is_headquarter, is_active, is_employer,
      workforce_bracket, creation_date,
      street_number, street_type, street_name, address_complement,
      postal_code, city_name, commune_code,
      naf_code, latitude, longitude
    ) VALUES ${placeholders.join(', ')}
    ON CONFLICT (siret) DO NOTHING
  `;

  await pool.query(sql, values);
}

async function importCsv() {
  console.log('Starting CSV import from', CSV_PATH);
  console.log('Only importing active establishments (status = A)');

  const startTime = Date.now();
  let totalRead = 0;
  let totalImported = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  let withCoords = 0;
  let batch: EstablishmentRow[] = [];

  const parser = createReadStream(CSV_PATH, { encoding: 'utf-8' })
    .pipe(parse({
      columns: true,
      delimiter: ',',
      quote: '"',
      escape: '"',
      relax_column_count: true,
      skip_empty_lines: true,
    }));

  for await (const row of parser) {
    totalRead++;

    // Only import active establishments
    if (row.etatAdministratifEtablissement !== 'A') {
      totalSkipped++;
      if (totalRead % REPORT_INTERVAL === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const rate = (totalRead / ((Date.now() - startTime) / 1000)).toFixed(0);
        console.log(`  Read: ${totalRead.toLocaleString()} | Imported: ${totalImported.toLocaleString()} | Skipped: ${totalSkipped.toLocaleString()} | With coords: ${withCoords.toLocaleString()} | ${rate} rows/s | ${elapsed}s`);
      }
      continue;
    }

    const transformed = transformRow(row as CsvRow);
    if (!transformed) {
      totalErrors++;
      continue;
    }

    if (transformed.latitude !== null) withCoords++;
    batch.push(transformed);

    if (batch.length >= BATCH_SIZE) {
      try {
        await bulkInsert(batch);
        totalImported += batch.length;
      } catch (err: any) {
        console.error(`Batch insert error at row ${totalRead}:`, err.message?.substring(0, 200));
        totalErrors += batch.length;
      }
      batch = [];
    }

    if (totalRead % REPORT_INTERVAL === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const rate = (totalRead / ((Date.now() - startTime) / 1000)).toFixed(0);
      console.log(`  Read: ${totalRead.toLocaleString()} | Imported: ${totalImported.toLocaleString()} | Skipped: ${totalSkipped.toLocaleString()} | With coords: ${withCoords.toLocaleString()} | ${rate} rows/s | ${elapsed}s`);
    }
  }

  // Insert remaining batch
  if (batch.length > 0) {
    try {
      await bulkInsert(batch);
      totalImported += batch.length;
    } catch (err: any) {
      console.error('Final batch insert error:', err.message?.substring(0, 200));
      totalErrors += batch.length;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n--- Import Complete ---');
  console.log(`  Total rows read: ${totalRead.toLocaleString()}`);
  console.log(`  Active imported: ${totalImported.toLocaleString()}`);
  console.log(`  Skipped (closed): ${totalSkipped.toLocaleString()}`);
  console.log(`  Errors: ${totalErrors.toLocaleString()}`);
  console.log(`  With coordinates: ${withCoords.toLocaleString()}`);
  console.log(`  Time: ${totalTime}s`);

  await pool.end();
}

importCsv().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});

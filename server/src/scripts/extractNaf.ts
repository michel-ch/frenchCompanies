/**
 * Build NAF nomenclature JSON files by combining:
 * 1. SQLite database (sections + hierarchy structure)
 * 2. SocialGouv data (complete 732 subclasses with labels)
 */
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const DB_PATH = path.resolve(__dirname, '../../../naf_cpf_nomenclature.db');
const SOCIALGOUV_PATH = path.resolve(__dirname, '../../../data/naf_socialgouv.json');
const OUTPUT_DIR = path.resolve(__dirname, '../../../data');

interface NafRow {
  code: string;
  label: string;
  level: string;
  parent_code: string | null;
}

interface SocialGouvEntry {
  id: string;
  label: string;
}

function main() {
  console.log('Loading data sources...');

  // Complete list of all 21 NAF Rev2 sections (SQLite is missing section N)
  const ALL_SECTIONS: Record<string, string> = {
    A: 'Agriculture, sylviculture et pêche',
    B: 'Industries extractives',
    C: 'Industrie manufacturière',
    D: "Production et distribution d'électricité, de gaz, de vapeur et d'air conditionné",
    E: "Production et distribution d'eau ; assainissement, gestion des déchets et dépollution",
    F: 'Construction',
    G: "Commerce ; réparation d'automobiles et de motocycles",
    H: 'Transports et entreposage',
    I: 'Hébergement et restauration',
    J: 'Information et communication',
    K: "Activités financières et d'assurance",
    L: 'Activités immobilières',
    M: 'Activités spécialisées, scientifiques et techniques',
    N: 'Activités de services administratifs et de soutien',
    O: 'Administration publique',
    P: 'Enseignement',
    Q: 'Santé humaine et action sociale',
    R: 'Arts, spectacles et activités récréatives',
    S: 'Autres activités de services',
    T: "Activités des ménages en tant qu'employeurs ; activités indifférenciées des ménages en tant que producteurs de biens et services pour usage propre",
    U: 'Activités extra-territoriales',
  };

  // Load SQLite for section info, then fill in any missing sections
  const db = new Database(DB_PATH, { readonly: true });
  const dbSectionsRaw = db.prepare(
    "SELECT code, label FROM nomenclature WHERE type='NAF' AND level='section' ORDER BY code"
  ).all() as NafRow[];

  // Build complete sections list (SQLite + fallbacks)
  const sectionCodes = new Set(dbSectionsRaw.map(s => s.code));
  const dbSections: NafRow[] = [...dbSectionsRaw];
  for (const [code, label] of Object.entries(ALL_SECTIONS)) {
    if (!sectionCodes.has(code)) {
      dbSections.push({ code, label, level: 'section', parent_code: null });
      console.log(`  Added missing section ${code}: ${label}`);
    }
  }
  dbSections.sort((a, b) => a.code.localeCompare(b.code));

  // Load division-to-section mapping from SQLite
  const dbDivisions = db.prepare(
    "SELECT code, parent_code FROM nomenclature WHERE type='NAF' AND level='division' ORDER BY code"
  ).all() as NafRow[];
  const divToSection = new Map<string, string>();
  for (const d of dbDivisions) {
    if (d.parent_code) divToSection.set(d.code, d.parent_code);
  }

  db.close();

  // Load SocialGouv complete list
  const sgData: SocialGouvEntry[] = JSON.parse(fs.readFileSync(SOCIALGOUV_PATH, 'utf-8'));

  // Categorize SocialGouv entries
  const divisions: SocialGouvEntry[] = [];
  const groups: SocialGouvEntry[] = [];
  const classes: SocialGouvEntry[] = [];
  const subclasses: SocialGouvEntry[] = [];

  for (const entry of sgData) {
    const id = entry.id;
    if (/^\d{2}$/.test(id)) divisions.push(entry);
    else if (/^\d{2}\.\d$/.test(id)) groups.push(entry);
    else if (/^\d{2}\.\d{2}$/.test(id)) classes.push(entry);
    else if (/^\d{2}\.\d{2}[A-Z]$/.test(id)) subclasses.push(entry);
  }

  console.log(`Loaded: ${dbSections.length} sections, ${divisions.length} divisions, ${groups.length} groups, ${classes.length} classes, ${subclasses.length} subclasses`);

  // Build section map (letter -> label)
  const sectionMap = new Map(dbSections.map(s => [s.code, s.label]));

  // Build division-to-section map from DB + hardcoded fallbacks
  // The SQLite db is missing 9 divisions; add them from official NAF Rev2 spec
  const DIVISION_SECTION_FALLBACK: Record<string, string> = {
    '01': 'A', '02': 'A', '03': 'A',
    '05': 'B', '06': 'B', '07': 'B', '08': 'B', '09': 'B',
    '10': 'C', '11': 'C', '12': 'C', '13': 'C', '14': 'C', '15': 'C', '16': 'C',
    '17': 'C', '18': 'C', '19': 'C', '20': 'C', '21': 'C', '22': 'C', '23': 'C',
    '24': 'C', '25': 'C', '26': 'C', '27': 'C', '28': 'C', '29': 'C', '30': 'C',
    '31': 'C', '32': 'C', '33': 'C',
    '35': 'D',
    '36': 'E', '37': 'E', '38': 'E', '39': 'E',
    '41': 'F', '42': 'F', '43': 'F',
    '45': 'G', '46': 'G', '47': 'G',
    '49': 'H', '50': 'H', '51': 'H', '52': 'H', '53': 'H',
    '55': 'I', '56': 'I',
    '58': 'J', '59': 'J', '60': 'J', '61': 'J', '62': 'J', '63': 'J',
    '64': 'K', '65': 'K', '66': 'K',
    '68': 'L',
    '69': 'M', '70': 'M', '71': 'M', '72': 'M', '73': 'M', '74': 'M', '75': 'M',
    '77': 'N', '78': 'N', '79': 'N', '80': 'N', '81': 'N', '82': 'N',
    '84': 'O',
    '85': 'P',
    '86': 'Q', '87': 'Q', '88': 'Q',
    '90': 'R', '91': 'R', '92': 'R', '93': 'R',
    '94': 'S', '95': 'S', '96': 'S',
    '97': 'T', '98': 'T',
    '99': 'U',
  };

  const divisionSectionMap = new Map<string, string>();
  for (const d of divisions) {
    const fromDb = divToSection.get(d.id);
    if (fromDb) {
      divisionSectionMap.set(d.id, fromDb);
    } else if (DIVISION_SECTION_FALLBACK[d.id]) {
      divisionSectionMap.set(d.id, DIVISION_SECTION_FALLBACK[d.id]);
      console.log(`  Mapped division ${d.id} -> section ${DIVISION_SECTION_FALLBACK[d.id]} (fallback)`);
    } else {
      console.warn(`  WARNING: No section mapping for division ${d.id}`);
    }
  }

  // Build hierarchical tree
  const tree = {
    sections: dbSections.map(section => ({
      code: section.code,
      label: section.label,
      divisions: divisions
        .filter(d => divisionSectionMap.get(d.id) === section.code)
        .map(division => ({
          code: division.id,
          label: division.label,
          groups: groups
            .filter(g => g.id.startsWith(division.id + '.') || g.id.substring(0, 2) === division.id)
            .filter(g => g.id.substring(0, 2) === division.id)
            .map(group => ({
              code: group.id,
              label: group.label,
              classes: classes
                .filter(c => c.id.startsWith(group.id))
                .map(cls => ({
                  code: cls.id,
                  label: cls.label,
                  subclasses: subclasses
                    .filter(sc => sc.id.startsWith(cls.id))
                    .map(sc => ({ code: sc.id, label: sc.label }))
                }))
            }))
        }))
    }))
  };

  // Build flat lookup
  const flat: Record<string, any> = {};

  for (const s of dbSections) {
    flat[s.code] = { label: s.label, level: 'section', section: s.code, sectionLabel: s.label };
  }

  for (const d of divisions) {
    const secCode = divisionSectionMap.get(d.id) || '';
    flat[d.id] = {
      label: d.label,
      level: 'division',
      division: d.id,
      divisionLabel: d.label,
      section: secCode,
      sectionLabel: sectionMap.get(secCode) || ''
    };
  }

  for (const g of groups) {
    const divCode = g.id.substring(0, 2);
    const secCode = divisionSectionMap.get(divCode) || '';
    const div = divisions.find(d => d.id === divCode);
    flat[g.id] = {
      label: g.label,
      level: 'group',
      group: g.id,
      groupLabel: g.label,
      division: divCode,
      divisionLabel: div?.label || '',
      section: secCode,
      sectionLabel: sectionMap.get(secCode) || ''
    };
  }

  for (const c of classes) {
    const divCode = c.id.substring(0, 2);
    const groupCode = c.id.substring(0, 4);
    const secCode = divisionSectionMap.get(divCode) || '';
    const div = divisions.find(d => d.id === divCode);
    const grp = groups.find(g => g.id === groupCode);
    flat[c.id] = {
      label: c.label,
      level: 'class',
      class: c.id,
      classLabel: c.label,
      group: groupCode,
      groupLabel: grp?.label || '',
      division: divCode,
      divisionLabel: div?.label || '',
      section: secCode,
      sectionLabel: sectionMap.get(secCode) || ''
    };
  }

  for (const sc of subclasses) {
    const classCode = sc.id.substring(0, 5);
    const groupCode = sc.id.substring(0, 4);
    const divCode = sc.id.substring(0, 2);
    const secCode = divisionSectionMap.get(divCode) || '';
    const cls = classes.find(c => c.id === classCode);
    const grp = groups.find(g => g.id === groupCode);
    const div = divisions.find(d => d.id === divCode);
    flat[sc.id] = {
      label: sc.label,
      level: 'subclass',
      class: classCode,
      classLabel: cls?.label || '',
      group: groupCode,
      groupLabel: grp?.label || '',
      division: divCode,
      divisionLabel: div?.label || '',
      section: secCode,
      sectionLabel: sectionMap.get(secCode) || ''
    };
  }

  // Write output files
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const treePath = path.join(OUTPUT_DIR, 'naf_nomenclature.json');
  const flatPath = path.join(OUTPUT_DIR, 'naf_flat.json');

  fs.writeFileSync(treePath, JSON.stringify(tree, null, 2), 'utf-8');
  fs.writeFileSync(flatPath, JSON.stringify(flat, null, 2), 'utf-8');

  console.log(`Wrote tree to ${treePath}`);
  console.log(`Wrote flat lookup (${Object.keys(flat).length} entries) to ${flatPath}`);
  console.log(`  Sections: ${dbSections.length}`);
  console.log(`  Divisions: ${divisions.length}`);
  console.log(`  Groups: ${groups.length}`);
  console.log(`  Classes: ${classes.length}`);
  console.log(`  Subclasses: ${subclasses.length}`);
  console.log('Done!');
}

main();

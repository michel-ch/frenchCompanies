/**
 * Import NAF nomenclature JSON into PostgreSQL.
 */
import * as fs from 'fs';
import * as path from 'path';
import { pool } from '../config/database';

const TREE_PATH = path.resolve(__dirname, '../../../data/naf_nomenclature.json');

interface Subclass { code: string; label: string; }
interface NafClass { code: string; label: string; subclasses: Subclass[]; }
interface Group { code: string; label: string; classes: NafClass[]; }
interface Division { code: string; label: string; groups: Group[]; }
interface Section { code: string; label: string; divisions: Division[]; }
interface NafTree { sections: Section[]; }

async function importNaf() {
  console.log('Loading NAF tree from', TREE_PATH);
  const tree: NafTree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf-8'));

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM naf_subclasses');
    await client.query('DELETE FROM naf_classes');
    await client.query('DELETE FROM naf_groups');
    await client.query('DELETE FROM naf_divisions');
    await client.query('DELETE FROM naf_sections');

    let sCount = 0, dCount = 0, gCount = 0, cCount = 0, scCount = 0;

    for (const section of tree.sections) {
      await client.query(
        'INSERT INTO naf_sections (code, label) VALUES ($1, $2) ON CONFLICT (code) DO UPDATE SET label = $2',
        [section.code, section.label]
      );
      sCount++;

      for (const division of section.divisions) {
        await client.query(
          'INSERT INTO naf_divisions (code, label, section_code) VALUES ($1, $2, $3) ON CONFLICT (code) DO UPDATE SET label = $2',
          [division.code, division.label, section.code]
        );
        dCount++;

        for (const group of division.groups) {
          await client.query(
            'INSERT INTO naf_groups (code, label, division_code) VALUES ($1, $2, $3) ON CONFLICT (code) DO UPDATE SET label = $2',
            [group.code, group.label, division.code]
          );
          gCount++;

          for (const cls of group.classes) {
            await client.query(
              'INSERT INTO naf_classes (code, label, group_code) VALUES ($1, $2, $3) ON CONFLICT (code) DO UPDATE SET label = $2',
              [cls.code, cls.label, group.code]
            );
            cCount++;

            for (const sc of cls.subclasses) {
              await client.query(
                'INSERT INTO naf_subclasses (code, label, class_code) VALUES ($1, $2, $3) ON CONFLICT (code) DO UPDATE SET label = $2',
                [sc.code, sc.label, cls.code]
              );
              scCount++;
            }
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log(`Imported: ${sCount} sections, ${dCount} divisions, ${gCount} groups, ${cCount} classes, ${scCount} subclasses`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

importNaf().catch(console.error);

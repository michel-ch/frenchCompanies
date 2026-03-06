import { query } from '../config/database';

export async function getSections() {
  const res = await query('SELECT code, label FROM naf_sections ORDER BY code');
  return res.rows;
}

export async function getDivisions(sectionCode?: string) {
  if (sectionCode) {
    const res = await query(
      'SELECT code, label, section_code FROM naf_divisions WHERE section_code = $1 ORDER BY code',
      [sectionCode]
    );
    return res.rows;
  }
  const res = await query('SELECT code, label, section_code FROM naf_divisions ORDER BY code');
  return res.rows;
}

export async function getGroups(divisionCode?: string) {
  if (divisionCode) {
    const res = await query(
      'SELECT code, label, division_code FROM naf_groups WHERE division_code = $1 ORDER BY code',
      [divisionCode]
    );
    return res.rows;
  }
  const res = await query('SELECT code, label, division_code FROM naf_groups ORDER BY code');
  return res.rows;
}

export async function getClasses(groupCode?: string) {
  if (groupCode) {
    const res = await query(
      'SELECT code, label, group_code FROM naf_classes WHERE group_code = $1 ORDER BY code',
      [groupCode]
    );
    return res.rows;
  }
  const res = await query('SELECT code, label, group_code FROM naf_classes ORDER BY code');
  return res.rows;
}

export async function getSubclasses(classCode?: string) {
  if (classCode) {
    const res = await query(
      'SELECT code, label, class_code FROM naf_subclasses WHERE class_code = $1 ORDER BY code',
      [classCode]
    );
    return res.rows;
  }
  const res = await query('SELECT code, label, class_code FROM naf_subclasses ORDER BY code');
  return res.rows;
}

export async function searchNaf(searchTerm: string) {
  const term = `%${searchTerm}%`;
  const res = await query(`
    SELECT sc.code, sc.label, c.code as class_code, c.label as class_label,
           g.code as group_code, g.label as group_label,
           d.code as division_code, d.label as division_label,
           s.code as section_code, s.label as section_label
    FROM naf_subclasses sc
    JOIN naf_classes c ON sc.class_code = c.code
    JOIN naf_groups g ON c.group_code = g.code
    JOIN naf_divisions d ON g.division_code = d.code
    JOIN naf_sections s ON d.section_code = s.code
    WHERE sc.label ILIKE $1 OR sc.code ILIKE $1
       OR c.label ILIKE $1 OR g.label ILIKE $1
       OR d.label ILIKE $1
    ORDER BY sc.code
    LIMIT 50
  `, [term]);
  return res.rows;
}

export async function getTree() {
  const sections = await query('SELECT code, label FROM naf_sections ORDER BY code');
  const divisions = await query('SELECT code, label, section_code FROM naf_divisions ORDER BY code');
  const groups = await query('SELECT code, label, division_code FROM naf_groups ORDER BY code');
  const classes = await query('SELECT code, label, group_code FROM naf_classes ORDER BY code');
  const subclasses = await query('SELECT code, label, class_code FROM naf_subclasses ORDER BY code');

  return {
    sections: sections.rows.map((s: any) => ({
      ...s,
      divisions: divisions.rows
        .filter((d: any) => d.section_code === s.code)
        .map((d: any) => ({
          code: d.code,
          label: d.label,
          groups: groups.rows
            .filter((g: any) => g.division_code === d.code)
            .map((g: any) => ({
              code: g.code,
              label: g.label,
              classes: classes.rows
                .filter((c: any) => c.group_code === g.code)
                .map((c: any) => ({
                  code: c.code,
                  label: c.label,
                  subclasses: subclasses.rows
                    .filter((sc: any) => sc.class_code === c.code)
                    .map((sc: any) => ({ code: sc.code, label: sc.label }))
                }))
            }))
        }))
    }))
  };
}

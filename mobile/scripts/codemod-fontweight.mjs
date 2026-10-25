/**
 * Codemod: reemplaza `fontWeight: X` por `fontFamily: families.Y` en toda la app móvil.
 *
 * Por qué: `@expo-google-fonts/hanken-grotesk` carga cada peso como archivo estático, y combinar
 * `fontFamily` + `fontWeight` hace que iOS/Android caigan a la fuente del sistema.
 *
 * Uso: node scripts/codemod-fontweight.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const DRY = process.argv.includes('--dry');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === 'dist' || name === '.expo') continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(relative(ROOT, full));
  }
  return out;
}

/** '700' | 700 | 'bold' → clave de `families`. */
function weightToFamily(raw) {
  const w = String(raw).replace(/['"]/g, '').toLowerCase();
  const map = {
    100: 'regular', 200: 'regular', 300: 'regular',
    400: 'regular', normal: 'regular',
    500: 'medium',
    600: 'semibold',
    700: 'bold', bold: 'bold',
    800: 'extrabold',
    900: 'black',
  };
  return map[w] ?? null;
}

const files = [
  ...walk(join(ROOT, 'app')),
  ...walk(join(ROOT, 'src')),
  ...walk(join(ROOT, 'constants')),
].filter((f) => f !== 'constants/design.ts');

let changedFiles = 0;
let changedProps = 0;

for (const rel of files) {
  const abs = join(ROOT, rel);
  let src = readFileSync(abs, 'utf8');
  const orig = src;

  // 1) Si el mismo objeto ya tiene `fontFamily`, elimínalo (el peso manda).
  //    Patrón: { fontFamily: X, ... fontWeight: Y } o { fontWeight: Y, ... fontFamily: X }
  //    Lo resolvemos con el reemplazo de fontWeight + limpieza de fontFamily duplicado en el mismo literal.

  // 2) Reemplaza fontWeight: <valor> por fontFamily: families.<clave>
  src = src.replace(
    /fontWeight:\s*(['"]?(?:100|200|300|400|500|600|700|800|900|normal|bold)['"]?)/g,
    (match, raw) => {
      const fam = weightToFamily(raw);
      if (!fam) return match;
      changedProps++;
      return `fontFamily: families.${fam}`;
    },
  );

  if (src === orig) continue;

  // 3) Si el mismo objeto de estilo ahora tiene dos `fontFamily`, deja solo el último.
  //    Ej: { fontFamily: families.regular, color: x, fontFamily: families.bold }
  //    Estrategia simple: dentro de `{ ... }` que contenga 2 fontFamily, quitar el primero.
  src = src.replace(/\{[^{}]*fontFamily:[^{}]*fontFamily:[^{}]*\}/g, (obj) => {
    const first = obj.indexOf('fontFamily');
    const second = obj.indexOf('fontFamily', first + 1);
    if (first < 0 || second < 0) return obj;
    // Recorta desde el inicio del primer `fontFamily` hasta justo antes del siguiente key o el segundo fontFamily
    const before = obj.slice(0, first);
    const mid = obj.slice(first, second);
    const after = obj.slice(second);
    // Quita el primer par `fontFamily: ...,` (con su coma y espacios)
    const midClean = mid.replace(/fontFamily:\s*[^,}]+,\s*/, '').replace(/fontFamily:\s*[^,}]+$/, '');
    return before + midClean + after;
  });

  // 4) Asegura el import de `families`
  if (!/\bfamilies\b/.test(src.split('\n').slice(0, 40).join('\n'))) {
    // ¿Ya importa algo de constants/design?
    const importRe = /import\s*\{([^}]*)\}\s*from\s*['"]@\/constants\/design['"]/;
    const m = src.match(importRe);
    if (m) {
      const names = m[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (!names.includes('families')) {
        names.push('families');
        names.sort();
        src = src.replace(importRe, `import { ${names.join(', ')} } from '@/constants/design'`);
      }
    } else {
      // Inserta el import después del último import
      const lines = src.split('\n');
      let lastImport = -1;
      for (let i = 0; i < lines.length; i++) {
        if (/^import\s/.test(lines[i])) lastImport = i;
      }
      const insertAt = lastImport >= 0 ? lastImport + 1 : 0;
      lines.splice(insertAt, 0, "import { families } from '@/constants/design';");
      src = lines.join('\n');
    }
  }

  if (src !== orig) {
    changedFiles++;
    if (!DRY) writeFileSync(abs, src, 'utf8');
    console.log(`${DRY ? '[dry] ' : ''}✔ ${rel}`);
  }
}

console.log(`\n${DRY ? '[dry] ' : ''}Archivos cambiados: ${changedFiles} · props cambiadas: ${changedProps}`);

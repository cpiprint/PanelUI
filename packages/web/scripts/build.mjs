/**
 * Builds `dist/`: one ES module per source file, with its types beside it.
 *
 * The compiler does the first half. It is not a bundler, and that is the
 * point: a `'use client'` at the top of a component has to still be at the top
 * of the file a bundler in somebody's app reads, and one file in, one file out
 * is the only arrangement where that needs no further thought.
 *
 * The second half is what the compiler will not do. The source imports
 * `../../lib/cn`, which is what an editor, the docs site and the copy-in
 * registry all want. A published ES module has to say `../../lib/cn.js`,
 * because Node and every bundler in strict mode resolve a relative specifier
 * exactly as written. So each relative specifier in the output is completed
 * here, against the files that were actually emitted.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const require = createRequire(import.meta.url);

fs.rmSync(DIST, { recursive: true, force: true });

const tsc = require.resolve('typescript/bin/tsc');
const compiled = spawnSync(process.execPath, [tsc, '-p', 'tsconfig.build.json'], {
  cwd: ROOT,
  stdio: 'inherit',
});
if (compiled.status !== 0) process.exit(compiled.status ?? 1);

/** `from './x'`, `from "../y"`, `import('./z')` and bare `import './w'`. */
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]*)\2/g;

/** What a relative specifier written in `file` has to become to be followed. */
function complete(file, specifier) {
  if (/\.(?:js|json|css)$/.test(specifier)) return specifier;
  const target = path.resolve(path.dirname(file), specifier);
  if (fs.existsSync(`${target}.js`)) return `${specifier}.js`;
  if (fs.existsSync(path.join(target, 'index.js'))) return `${specifier.replace(/\/$/, '')}/index.js`;
  throw new Error(`${path.relative(ROOT, file)}: cannot resolve '${specifier}'`);
}

let files = 0;
let rewritten = 0;

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(file);
      continue;
    }
    // Declarations too: a `.d.ts` that names a sibling is resolved by the same
    // rules as the module it describes.
    if (!/\.(?:js|d\.ts)$/.test(entry.name)) continue;
    files += 1;
    const source = fs.readFileSync(file, 'utf8');
    const next = source.replace(SPECIFIER, (match, lead, quote, specifier) => {
      const completed = complete(file, specifier);
      if (completed !== specifier) rewritten += 1;
      return `${lead}${quote}${completed}${quote}`;
    });
    if (next !== source) fs.writeFileSync(file, next);
  }
}

visit(DIST);
console.log(`panelui-web: built ${files} files, completed ${rewritten} relative imports`);

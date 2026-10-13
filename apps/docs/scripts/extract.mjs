import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/** Repo root, three levels up from apps/docs/scripts. */
const ROOT = path.resolve(HERE, '../../..');

/*
 * The library by default. The web collection is documented by the same parser,
 * and `gen-web.mjs` runs this file again with these two set, so a props table
 * is read off the source in the same way whichever package it describes.
 */
const root = process.env.PANELUI_EXTRACT_ROOT
  ? path.resolve(process.env.PANELUI_EXTRACT_ROOT)
  : path.join(ROOT, 'packages/panelui/src/components');
const elsewhere = process.env.PANELUI_EXTRACT_OUT
  ? path.resolve(process.env.PANELUI_EXTRACT_OUT)
  : null;
const out = {};

for (const dir of fs.readdirSync(root).sort()) {
  const file = path.join(root, dir, 'index.tsx');
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');

  // Exported prop interfaces, with each field's JSDoc.
  const interfaces = [];
  const re = /export interface (\w+Props)([^{]*)\{([\s\S]*?)\n\}/g;
  let m;
  while ((m = re.exec(src))) {
    const [, name, ext, body] = m;
    const fields = [];
    const lines = body.split('\n');
    let doc = [];
    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith('/**') || t.startsWith('*') || t.startsWith('/*')) {
        const c = t.replace(/^\/\*\*?|^\*\/?|\*\/$/g, '').trim();
        if (c.startsWith('@deprecated')) doc.push('**Deprecated.** ' + c.replace('@deprecated', '').trim());
        else if (c && !c.startsWith('@')) doc.push(c);
        continue;
      }
      const f = t.match(/^(\w+)(\?)?:\s*(.+?);?$/);
      if (f) {
        fields.push({ name: f[1], optional: !!f[2], type: f[3].replace(/;$/, ''), doc: doc.join(' ') });
        doc = [];
      } else if (t === '') { /* keep doc */ } else { doc = []; }
    }
    interfaces.push({ name, extends: ext.replace(/extends/, '').trim().replace(/\s+/g, ' '), fields });
  }

  // tv() variant keys and their options.
  const variants = {};
  const vBlock = src.match(/variants:\s*\{([\s\S]*?)\n  \},\n(?:  compoundVariants|  defaultVariants)/);
  if (vBlock) {
    const vre = /^    (\w+):\s*\{/gm;
    let vm;
    while ((vm = vre.exec(vBlock[1]))) {
      const start = vre.lastIndex;
      let depth = 1, i = start;
      while (depth > 0 && i < vBlock[1].length) {
        if (vBlock[1][i] === '{') depth++;
        else if (vBlock[1][i] === '}') depth--;
        i++;
      }
      const inner = vBlock[1].slice(start, i - 1);
      const opts = [...inner.matchAll(/^      '?([\w-]+)'?:/gm)].map((x) => x[1]);
      if (opts.length) variants[vm[1]] = opts;
    }
  }

  // Defaults, from two places: tv()'s defaultVariants for variant props, and
  // the component's own parameter destructuring for everything else. Without
  // the second the Default column is empty for most props, which is the least
  // useful column to get wrong.
  const dBlock = src.match(/defaultVariants:\s*\{([\s\S]*?)\}/);
  const defaults = {};
  if (dBlock) {
    for (const dm of dBlock[1].matchAll(/(\w+):\s*'?([\w-]+)'?/g)) defaults[dm[1]] = dm[2];
  }

  // `name = default` and `name: local = default` alike — a destructuring
  // renamed to keep a normalised value out of the way still documents the
  // prop's default, and the prop is the half the table is about.
  const DESTRUCTURED = /^\s{2,}(\w+)(?::\s*\w+)? = ([^,\n]+),$/gm;

  /*
   * A default written as a named constant is documented as the value, not as
   * the name: `DEFAULT_MARQUEE_SPEED` in the Default column tells a reader
   * nothing they can act on, and sends them to the source to find out what
   * the table was for. One that cannot be resolved to a literal is dropped
   * rather than printed, because a symbol is a worse answer than no answer.
   */
  const KEYWORD = /^(?:true|false|null|undefined|Infinity|NaN)$/;
  const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

  const literalFor = (value) => {
    if (KEYWORD.test(value) || !IDENTIFIER.test(value)) return value;
    const named = src.match(
      new RegExp(`^const ${value}\\s*(?::[^=]+)?=\\s*([^;\\n]+?)(?:\\s+as const)?;`, 'm')
    );
    if (!named) return undefined;
    const resolved = named[1].trim();
    if (KEYWORD.test(resolved)) return resolved;
    return IDENTIFIER.test(resolved) ? undefined : resolved;
  };

  const record = (into, name, value) => {
    // First one wins: a prop destructured in more than one sub-component has
    // the same default in each, and if it does not the root's is the one
    // people mean.
    if (name in into) return;
    const literal = literalFor(value.trim());
    if (literal !== undefined) into[name] = literal;
  };

  const destructured = {};
  for (const dm of src.matchAll(DESTRUCTURED)) record(destructured, dm[1], dm[2]);

  /*
   * The same defaults again, but attributed to the interface each destructuring
   * is annotated with. The file-wide pass above cannot tell two sub-components
   * apart, so in a file where one destructures `variant = 'dots'` and another
   * `variant = 'bezier'`, whichever comes first claims the name for the whole
   * page — and one of the two tables then documents a default that does not
   * exist. Matching `({ … }: SomeProps` keeps each set with its own interface.
   */
  const byInterface = {};
  for (const bm of src.matchAll(/\(\{([\s\S]*?)\n\}:\s*(\w+)/g)) {
    const own = {};
    for (const dm of bm[1].matchAll(DESTRUCTURED)) record(own, dm[1], dm[2]);
    byInterface[bm[2]] = { ...(byInterface[bm[2]] ?? {}), ...own };
  }

  // Compound parts.
  const parts = [];
  const oa = src.match(/Object\.assign\(\w+,\s*\{([\s\S]*?)\n\}\)/);
  if (oa) for (const pm of oa[1].matchAll(/^\s*(\w+):/gm)) parts.push(pm[1]);

  // Header doc comment.
  const header = src.match(/^\/\*\*([\s\S]*?)\*\//);
  const summary = header
    ? header[1].split('\n').map((l) => l.replace(/^\s*\*ction?/, '').replace(/^\s*\*ractice?/, '').replace(/^\s*\* ?/, '').trim())
        .filter(Boolean).join('\n')
    : '';

  // tv() defaults win — they are the documented variant surface, and the
  // destructured value is often just the same string.
  const allDefaults = { ...destructured, ...defaults };

  out[dir] = {
    interfaces,
    variants,
    defaults: allDefaults,
    byInterface,
    // tv()'s own defaults, kept apart so an interface that destructures its
    // props can still pick up a variant default without also picking up
    // another sub-component's parameter default.
    variantDefaults: defaults,
    parts,
    summary,
  };
}

if (elsewhere) fs.writeFileSync(elsewhere, JSON.stringify(out, null, 2));
else fs.writeFileSync(path.join(HERE, 'api.json'), JSON.stringify(out, null, 2));
console.log('components:', Object.keys(out).length);
for (const [k, v] of Object.entries(out)) {
  console.log(k.padEnd(15), 'ifaces=' + v.interfaces.length, 'variants=' + JSON.stringify(v.variants).slice(0, 90), 'parts=' + v.parts.join(','));
}

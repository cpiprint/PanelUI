/**
 * What the web collection's generators both need from its source: the props,
 * read off the TypeScript, and a demo's code as a reader should copy it.
 *
 * The docs pages and the agent skill are two renderings of the same facts.
 * Reading them in one place is what keeps a prop's description on a page and
 * in the skill from being two sentences that drift apart.
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { WEB_TARGET } from './build-web-registry.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');

export const WEB_SRC = path.join(ROOT, 'packages/web/src/components');
export const WEB_DEMOS = path.join(HERE, '../components/web-demos');

/**
 * The props of every web component, by slug.
 *
 * Run as a child so the extractor stays one script with one behaviour, pointed
 * somewhere else. Its output goes to a temporary file and is read straight
 * back: kept beside the library's `api.json` it would be one more gitignored
 * file a build step could come to depend on without anything writing it first.
 */
export function readWebApi() {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'panelui-web-api-'));
  const out = path.join(scratch, 'api.json');
  const extracted = spawnSync(process.execPath, [path.join(HERE, 'extract.mjs')], {
    env: { ...process.env, PANELUI_EXTRACT_ROOT: WEB_SRC, PANELUI_EXTRACT_OUT: out },
    encoding: 'utf8',
  });
  if (extracted.status !== 0) {
    throw new Error(`web source: extracting props failed\n${extracted.stderr}`);
  }
  const api = JSON.parse(fs.readFileSync(out, 'utf8'));
  fs.rmSync(scratch, { recursive: true, force: true });
  return api;
}

/**
 * A demo's source as a reader should copy it.
 *
 * The demo imports the package, because that is what resolves inside this
 * repository. A reader who ran the install command has the component in their
 * own tree instead, so the import is written the way their project spells it.
 */
export function demoSource(name) {
  const file = path.join(WEB_DEMOS, `${name}.tsx`);
  if (!fs.existsSync(file)) throw new Error(`web source: no demo at components/web-demos/${name}.tsx`);
  return fs
    .readFileSync(file, 'utf8')
    .replace(/(['"])panelui-web\/([a-z0-9-]+)\1/g, `$1@/components/${WEB_TARGET}/$2$1`)
    .trimEnd();
}

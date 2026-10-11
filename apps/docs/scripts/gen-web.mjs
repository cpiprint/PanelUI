/**
 * Writes the web collection's docs pages, at content/docs/web/components.
 *
 * A page is assembled from four things, and none of them is prose typed into
 * an MDX file:
 *
 * - the props tables, parsed from `packages/web/src` by the same extractor the
 *   library's pages use;
 * - the demos in `components/web-demos/<slug>/`, which are real components.
 *   Each is rendered live on the page, and its own source is the code shown
 *   beside it, so what a reader copies is what they just watched run;
 * - the registry item, for the packages a component needs and the files it is
 *   made of;
 * - `web-usage/<slug>.json`, for the parts no parser can infer: the intro, the
 *   order of the examples and what each one is for.
 *
 * It also writes the map the pages load demos through, because a page cannot
 * import a component it only knows the name of.
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildItem, WEB_TARGET } from './build-web-registry.mjs';
import { statusOf, yamlScalar } from './page-status.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const WEB_SRC = path.join(ROOT, 'packages/web/src/components');
const DEMOS = path.join(HERE, '../components/web-demos');
const USAGE = path.join(HERE, 'web-usage');
const CONTENT = path.join(HERE, '../content/docs/web/components');

const meta = JSON.parse(fs.readFileSync(path.join(HERE, 'web-meta.json'), 'utf8'));
const webVersion = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'packages/web/package.json'), 'utf8')
).version;

/*
 * The props, read off the source. Run as a child so the extractor stays one
 * script with one behaviour, pointed somewhere else.
 *
 * Its output goes to a temporary file and is read straight back. Kept beside
 * the library's `api.json` it would be one more gitignored file a build step
 * could come to depend on without anything writing it first.
 */
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'panelui-web-api-'));
const extractedTo = path.join(scratch, 'api.json');
const extracted = spawnSync(process.execPath, [path.join(HERE, 'extract.mjs')], {
  env: { ...process.env, PANELUI_EXTRACT_ROOT: WEB_SRC, PANELUI_EXTRACT_OUT: extractedTo },
  encoding: 'utf8',
});
if (extracted.status !== 0) {
  throw new Error(`gen-web: extracting props failed\n${extracted.stderr}`);
}
const api = JSON.parse(fs.readFileSync(extractedTo, 'utf8'));
fs.rmSync(scratch, { recursive: true, force: true });

/* -------------------------------------------------------------------------- */
/* Usage modules                                                              */
/* -------------------------------------------------------------------------- */

const slugs = Object.keys(meta);
const usage = {};
for (const file of fs.readdirSync(USAGE).sort()) {
  if (!file.endsWith('.json')) throw new Error(`gen-web: stray file in web-usage: ${file}`);
  const slug = file.replace(/\.json$/, '');
  const module = JSON.parse(fs.readFileSync(path.join(USAGE, file), 'utf8'));
  if (module.slug !== slug) throw new Error(`gen-web: web-usage/${file} names the slug ${module.slug}`);
  if (!meta[slug]) throw new Error(`gen-web: web-usage/${file} has no web-meta.json entry`);
  usage[slug] = module;
}
for (const slug of slugs) {
  if (!usage[slug]) throw new Error(`gen-web: ${slug} has no web-usage/${slug}.json`);
}

/* -------------------------------------------------------------------------- */
/* Demos                                                                      */
/* -------------------------------------------------------------------------- */

/** Every demo on disk, as `slug/name`. */
const demos = [];
for (const slug of fs.existsSync(DEMOS) ? fs.readdirSync(DEMOS).sort() : []) {
  const directory = path.join(DEMOS, slug);
  if (!fs.statSync(directory).isDirectory()) continue;
  if (!meta[slug]) throw new Error(`gen-web: web-demos/${slug} has no web-meta.json entry`);
  for (const file of fs.readdirSync(directory).sort()) {
    if (file.endsWith('.tsx')) demos.push(`${slug}/${file.replace(/\.tsx$/, '')}`);
  }
}

/**
 * A demo's source as a reader should copy it.
 *
 * The demo imports the package, because that is what resolves inside this
 * repository. A reader who ran the install command has the component in their
 * own tree instead, so the import is written the way their project spells it.
 */
function demoSource(name) {
  const file = path.join(DEMOS, `${name}.tsx`);
  if (!fs.existsSync(file)) throw new Error(`gen-web: no demo at components/web-demos/${name}.tsx`);
  return fs
    .readFileSync(file, 'utf8')
    .replace(/(['"])panelui-web\/([a-z0-9-]+)\1/g, `$1@/components/${WEB_TARGET}/$2$1`)
    .trimEnd();
}

/* -------------------------------------------------------------------------- */
/* Page pieces                                                                */
/* -------------------------------------------------------------------------- */

const esc = (text) => String(text).replace(/\|/g, '\\|');
const inlineCode = (text) => '`' + String(text).replace(/`/g, '') + '`';
const fence = (code, info = 'tsx') => '```' + info + '\n' + code + '\n```';

const optionsOf = (entry) => entry[3] ?? {};
/** What the page and the sidebar call it, which need not be what you import. */
const titleOf = (entry) => optionsOf(entry).title ?? entry[0];

/** A demo, live, with its source behind the Code tab. */
function preview(name, options = {}) {
  const attributes = [`name="${name}"`];
  if (options.height) attributes.push(`height={${options.height}}`);
  if (options.align) attributes.push(`align="${options.align}"`);
  return `<ComponentPreview ${attributes.join(' ')}>\n\n${fence(demoSource(name))}\n\n</ComponentPreview>`;
}

function propsTable(iface, c) {
  const own = c.byInterface?.[iface.name];
  const rows = iface.fields
    .filter((field) => field.name !== 'children')
    .map((field) => {
      const resolved = own ? (own[field.name] ?? c.variantDefaults?.[field.name]) : c.defaults?.[field.name];
      const fallback = resolved !== undefined ? inlineCode(resolved) : '—';
      return `| ${inlineCode(field.name)} | ${inlineCode(esc(field.type))} | ${fallback} | ${esc(field.doc || '')} |`;
    });
  if (rows.length === 0) return null;
  return ['| Prop | Type | Default | Description |', '| --- | --- | --- | --- |', ...rows].join('\n');
}

function installation(slug, item) {
  const address = `https://panelui.dev/r/web/${slug}.json`;
  const npm = item.dependencies.join(' ');
  const builtOn = item.registryDependencies
    .filter((dependency) => dependency.startsWith('https://panelui.dev/r/web/'))
    .map((dependency) => dependency.replace(/^.*\/([a-z0-9-]+)\.json$/, '$1'));

  const manual = ['<Steps>'];
  if (npm) {
    manual.push(`<Step>\n\nInstall the packages it uses:\n\n<InstallTabs kind="add" packages="${npm}" />\n\n</Step>`);
  }
  if (builtOn.length > 0) {
    const links = builtOn.map((other) => `[${titleOf(meta[other])}](/docs/web/components/${other})`);
    manual.push(`<Step>\n\nAdd the ${links.length > 1 ? 'components' : 'component'} it is built on: ${links.join(', ')}.\n\n</Step>`);
  }
  // The source is fetched when the tab is opened, from the item the CLI
  // installs. Written out here it was most of the page: see RegistrySource.
  const where =
    item.files.length === 1
      ? `\`${item.files[0].path}\``
      : `\`components/${WEB_TARGET}/${slug}/\`, one file for each below`;
  manual.push(`<Step>\n\nCopy the source into ${where}:\n\n<RegistrySource name="${slug}" />\n\n</Step>`);
  manual.push('</Steps>');

  return `## Installation

<Tabs items={['CLI', 'npm', 'Manual']}>

<Tab value="CLI">

<InstallTabs kind="dlx" packages="shadcn@latest add ${address}" />

The source is copied into \`components/${WEB_TARGET}/\`, where you can edit it.

</Tab>

<Tab value="npm">

<InstallTabs kind="add" packages="panelui-web" />

Import from \`panelui-web/${slug}\` instead of \`@/components/${WEB_TARGET}/${slug}\`. Tailwind needs one line to read the package's classes, which is on the [installation page](/docs/web/installation#from-npm).

</Tab>

<Tab value="Manual">

${manual.join('\n\n')}

</Tab>

</Tabs>`;
}

/* -------------------------------------------------------------------------- */
/* Pages                                                                      */
/* -------------------------------------------------------------------------- */

fs.rmSync(CONTENT, { recursive: true, force: true });
fs.mkdirSync(CONTENT, { recursive: true });

const used = new Set();

for (const slug of slugs) {
  const entry = meta[slug];
  const [name, summary] = entry;
  const u = usage[slug];
  const c = api[slug];
  if (!c) throw new Error(`gen-web: no source found for ${slug}`);
  const item = buildItem(slug);

  const status = statusOf(optionsOf(entry), webVersion);
  const frontmatter = [
    '---',
    `title: ${yamlScalar(titleOf(entry))}`,
    `description: ${yamlScalar(summary)}`,
    ...(status ? [`status: ${status}`] : []),
    '---',
  ].join('\n');

  const sections = [frontmatter];

  if (u.demo) {
    used.add(`${slug}/${u.demo}`);
    sections.push(preview(`${slug}/${u.demo}`, u.demoOptions));
  }
  if (u.intro) sections.push(u.intro);

  sections.push(installation(slug, item));

  const names = [name, ...(u.extraImports ?? [])].join(', ');
  const usageBlocks = [fence(`import { ${names} } from "@/components/${WEB_TARGET}/${slug}"`)];
  if (u.usage) usageBlocks.push(fence(u.usage));
  sections.push(`## Usage\n\n${usageBlocks.join('\n\n')}`);

  if (u.anatomy) {
    const parts = Object.entries(u.parts ?? {}).map(
      ([part, text]) => `- **\`${name}.${part}\`** — ${text}`
    );
    sections.push(`## Composition\n\n${fence(u.anatomy)}${parts.length ? `\n\n${parts.join('\n')}` : ''}`);
  }

  if (u.examples?.length) {
    const examples = u.examples.map((example) => {
      used.add(`${slug}/${example.demo}`);
      const body = [`### ${example.title}`];
      if (example.description) body.push(example.description);
      body.push(preview(`${slug}/${example.demo}`, example));
      return body.join('\n\n');
    });
    sections.push(`## Examples\n\n${examples.join('\n\n')}`);
  }

  const tables = c.interfaces
    .map((iface) => ({ iface, table: propsTable(iface, c) }))
    .filter(({ table }) => table);
  if (tables.length > 0) {
    const reference = tables.map(({ iface, table }) => {
      const label = iface.name.replace(/Props$/, '');
      const inferred = label === name ? name : `${name}.${label.replace(new RegExp(`^${name}`), '')}`;
      const heading = u.interfaceNames?.[iface.name] ?? inferred;
      return `### ${heading.replace(/\.$/, '')}\n\n${table}`;
    });
    sections.push(
      `## API Reference\n\n${reference.join('\n\n')}\n\nEvery part also takes the props of the element it renders, and a \`className\`.`
    );
  }

  /*
   * A compound component in a client module cannot be dotted into from a
   * Server Component. Every page that has parts says so, with its own names,
   * since this is an error nobody expects and the message for it does not
   * mention the fix.
   */
  const notes = [];
  if (u.notes) notes.push(u.notes);
  const entrySource = fs.readFileSync(path.join(WEB_SRC, slug, 'index.tsx'), 'utf8');
  if (c.parts.length > 0 && entrySource.startsWith("'use client'")) {
    const first = c.parts[0];
    notes.push(
      `### Server Components\n\n\`${name}\` is a client component. In a file that starts with \`"use client"\`, write its parts with a dot, as on this page. A Server Component cannot read \`${name}.${first}\` off the import, so each part is also exported by name: \`${name}${first}\` is \`${name}.${first}\`${c.parts.length > 1 ? ', and so on for the others' : ''}.\n\n${fence(`import { ${name}, ${c.parts.map((part) => `${name}${part}`).join(', ')} } from "@/components/${WEB_TARGET}/${slug}"`)}`
    );
  }
  if (notes.length > 0) sections.push(`## Notes\n\n${notes.join('\n\n')}`);

  fs.writeFileSync(path.join(CONTENT, `${slug}.mdx`), `${sections.join('\n\n')}\n`);
}

/* A demo nothing shows is a file that will rot without anyone noticing. */
const unused = demos.filter((name) => !used.has(name));
if (unused.length > 0) {
  throw new Error(`gen-web: demos no page uses: ${unused.join(', ')}`);
}

/* -------------------------------------------------------------------------- */
/* The index, and the sidebar order                                           */
/* -------------------------------------------------------------------------- */

const ordered = [...slugs].sort((a, b) => titleOf(meta[a]).localeCompare(titleOf(meta[b])));

fs.writeFileSync(
  path.join(CONTENT, 'meta.json'),
  `${JSON.stringify({ title: 'Components', pages: ['index', ...ordered] }, null, 2)}\n`
);

const cards = ordered
  .map((slug) => `  <Card title="${titleOf(meta[slug])}" href="/docs/web/components/${slug}">\n    ${meta[slug][1]}\n  </Card>`)
  .join('\n');

fs.writeFileSync(
  path.join(CONTENT, 'index.mdx'),
  `---
title: Components
description: ${yamlScalar(`The ${ordered.length} components in the web collection.`)}
---

Every page opens on the component running. Press **Code** on any preview for the source of what
you are looking at.

<Cards>
${cards}
</Cards>
`
);

/* -------------------------------------------------------------------------- */
/* The demo map                                                               */
/* -------------------------------------------------------------------------- */

const entries = [...used]
  .sort()
  .map((name) => `  '${name}': dynamic(() => import('./${name}')),`)
  .join('\n');

fs.writeFileSync(
  path.join(DEMOS, 'index.generated.tsx'),
  `'use client';

// Generated by scripts/gen-web.mjs from the demos in this folder. Do not edit.
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/** Every demo a docs page shows, each in a chunk of its own. */
export const WEB_DEMOS: Record<string, ComponentType> = {
${entries}
};
`
);

console.log(`web docs: ${slugs.length} pages, ${used.size} demos -> content/docs/web/components (v${webVersion})`);

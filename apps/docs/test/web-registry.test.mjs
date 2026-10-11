/**
 * The web collection's registry and docs, checked against the source they are
 * generated from.
 *
 * The generators guarantee most of this by construction. These are the parts
 * that only go wrong quietly: a copied file that still reaches back into the
 * package, a demo whose shown source would not compile in a reader's project,
 * a component with a page and no registry item.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const docs = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(docs, file), 'utf8');
const meta = JSON.parse(read('scripts/web-meta.json'));
const slugs = Object.keys(meta).sort();
const item = (slug) => JSON.parse(read(`public/r/web/${slug}.json`));

test('every component has an item, a page and a usage module', () => {
  for (const slug of slugs) {
    assert.ok(fs.existsSync(path.join(docs, `public/r/web/${slug}.json`)), `${slug}: registry item`);
    assert.ok(fs.existsSync(path.join(docs, `content/docs/web/components/${slug}.mdx`)), `${slug}: page`);
    assert.ok(fs.existsSync(path.join(docs, `scripts/web-usage/${slug}.json`)), `${slug}: usage`);
  }
});

test('a copied file reaches nothing outside the project it lands in', () => {
  for (const slug of slugs) {
    for (const file of item(slug).files) {
      assert.match(file.target, /^@components\/panelui\//, `${slug}: ${file.target}`);
      // Whatever was `../` in the package has to have become an alias.
      assert.doesNotMatch(file.content, /from\s*['"]\.\.\//, `${slug}: ${file.path} still imports ../`);
      assert.doesNotMatch(file.content, /panelui-web/, `${slug}: ${file.path} imports the package`);
    }
  }
});

test('items address their own registry by URL and the official one by name', () => {
  for (const slug of slugs) {
    for (const dependency of item(slug).registryDependencies) {
      assert.ok(
        dependency === 'utils' || /^https:\/\/panelui\.dev\/r\/web\/[a-z0-9-]+\.json$/.test(dependency),
        `${slug}: unexpected registry dependency ${dependency}`
      );
    }
  }
});

test('the index lists every item and carries no file contents', () => {
  const index = JSON.parse(read('public/r/web/registry.json'));
  assert.deepEqual(index.items.map((entry) => entry.name).sort(), slugs);
  for (const entry of index.items) {
    for (const file of entry.files) assert.equal(file.content, undefined, `${entry.name}: index has contents`);
  }
});

test('demos import the package, and pages show the path a project has', () => {
  for (const slug of slugs) {
    const directory = path.join(docs, 'components/web-demos', slug);
    const demos = fs.readdirSync(directory).filter((file) => file.endsWith('.tsx'));
    assert.ok(demos.length > 0, `${slug} has no demos`);
    for (const demo of demos) {
      const source = fs.readFileSync(path.join(directory, demo), 'utf8');
      assert.match(source, /^'use client';\n/, `${slug}/${demo} must be a client module`);
      assert.match(source, /export default function /, `${slug}/${demo} needs a default export`);
      assert.match(source, /from 'panelui-web\/[a-z0-9-]+'/, `${slug}/${demo} must import the package`);
    }
    const page = read(`content/docs/web/components/${slug}.mdx`);
    assert.doesNotMatch(page, /from ['"]panelui-web\//, `${slug}: page shows a package import in code`);
    assert.match(page, /@\/components\/panelui\//, `${slug}: page does not show the copied path`);
  }
});

test('every demo a page names is in the generated map', () => {
  const map = read('components/web-demos/index.generated.tsx');
  for (const slug of slugs) {
    const page = read(`content/docs/web/components/${slug}.mdx`);
    for (const [, name] of page.matchAll(/<ComponentPreview name="([^"]+)"/g)) {
      assert.ok(map.includes(`'${name}': dynamic(`), `${name} is shown but not in the map`);
    }
  }
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(
  new URL('../src/components/button/index.tsx', import.meta.url),
  'utf8'
);

test('labelled Button sizes are floors with scalable intrinsic line boxes', () => {
  assert.match(source, /label: 'min-w-0 shrink text-center font-medium'/);
  assert.match(
    source,
    /sm: \{ root: 'min-h-9 min-w-9 gap-1\.5 px-2\.5 py-2', label: 'text-\[14px\]' \}/
  );
  assert.match(
    source,
    /md: \{ root: 'min-h-11 min-w-11 px-4 py-2\.5', label: 'text-\[16px\]' \}/
  );
  assert.match(
    source,
    /lg: \{ root: 'min-h-12 px-6 py-2\.5', label: 'text-\[18px\]' \}/
  );
  assert.match(
    source,
    /xs: \{ root: 'min-h-7 min-w-7 gap-1 rounded-md px-2 py-1', label: 'text-\[12px\]' \}/
  );
  assert.doesNotMatch(source, /(?:xs|sm|md|lg|xl): \{ root: 'h-/);
});

test('icon Button geometry and 48dp interaction targets stay stable', () => {
  assert.match(source, /icon: \{ root: 'h-11 w-11 px-0' \}/);
  assert.match(source, /const BUTTON_HIT_SLOP = \{ xs: 10, sm: 6, md: 2, lg: 0, xl: 0, icon: 2 \}/);
  assert.match(source, /hitSlop=\{attached \? undefined : BUTTON_HIT_SLOP/);
});

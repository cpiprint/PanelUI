import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const component = (name) =>
  readFile(new URL(`../src/components/${name}/index.tsx`, import.meta.url), 'utf8');

test('compact core controls keep 48dp interaction boxes', async () => {
  const [button, checkbox, radio, toggle, carousel] = await Promise.all(
    ['button', 'checkbox', 'radio-group', 'switch', 'carousel'].map(component)
  );

  // Each figure is what its size is short of 48: 28, 36 and 44 tall.
  assert.match(button, /const BUTTON_HIT_SLOP = \{ xs: 10, sm: 6, md: 2, lg: 0, xl: 0, icon: 2 \}/);
  assert.match(button, /hitSlop=\{attached \? undefined : BUTTON_HIT_SLOP/);
  assert.match(button, /xs: \{ root: 'min-h-7 min-w-7 /);
  assert.match(button, /sm: \{ root: 'min-h-9 min-w-9 /);
  assert.match(button, /md: \{ root: 'min-h-11 min-w-11 /);
  assert.match(checkbox, /row: 'min-h-12 min-w-12 /);
  assert.match(radio, /row: 'min-h-12 min-w-12 /);

  // Slop rather than a sized box: a switch is 20 to 36 tall, and growing it to
  // 48 would reflow every row one has ever been placed in. From `md` up the
  // track is already 48 wide, so only the short axis needs help there.
  assert.match(toggle, /hitSlop=\{SWITCH_HIT_SLOP\[size\]\}/);
  assert.match(toggle, /xs: \{ top: 14, bottom: 14, left: 8, right: 8 \}/);
  assert.match(toggle, /sm: \{ top: 12, bottom: 12, left: 4, right: 4 \}/);
  assert.match(toggle, /md: \{ top: 10, bottom: 10, left: 0, right: 0 \}/);
  assert.match(toggle, /lg: \{ top: 8, bottom: 8, left: 0, right: 0 \}/);
  assert.match(toggle, /xl: \{ top: 6, bottom: 6, left: 0, right: 0 \}/);
  // The arrows are buttons and get the full 48. The dots cannot: at 48 each a
  // five-slide run is as wide as the screen, and the boxes would overlap.
  assert.match(carousel, /'h-12 w-12 items-center justify-center rounded-full'/);
  assert.match(carousel, /interactive && 'h-6 w-6'/);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addMapInsets,
  controlsOffsets,
  cornersOf,
  overlayOffsets,
  overlayReservation,
  reservedAt,
  resolveMapInsets,
  toMapInsets,
} from '../src/components/map/map-insets.ts';

const NONE = { top: 0, right: 0, bottom: 0, left: 0 };

test('one number is every side, and missing sides are zero', () => {
  assert.deepEqual(toMapInsets(16), { top: 16, right: 16, bottom: 16, left: 16 });
  assert.deepEqual(toMapInsets({ bottom: 80 }), { ...NONE, bottom: 80 });
  assert.deepEqual(toMapInsets(undefined), NONE);
});

test('an inset cannot push anything off the map', () => {
  assert.deepEqual(toMapInsets(-20), NONE);
  assert.deepEqual(toMapInsets({ top: Number.NaN, left: -4, right: 8 }), { ...NONE, right: 8 });
});

test('insets add side by side', () => {
  assert.deepEqual(
    addMapInsets({ top: 12, right: 12, bottom: 12, left: 12 }, { top: 47, right: 0, bottom: 34, left: 0 }),
    { top: 59, right: 12, bottom: 46, left: 12 }
  );
});

test('a band covers both corners of its edge, a corner only itself', () => {
  assert.deepEqual(cornersOf('top'), ['top-left', 'top-right']);
  assert.deepEqual(cornersOf('bottom'), ['bottom-left', 'bottom-right']);
  assert.deepEqual(cornersOf('bottom-left'), ['bottom-left']);
});

test('a corner is reserved by the overlay that reaches furthest into it', () => {
  const reservations = [
    { position: 'top', extent: 96 },
    { position: 'top-right', extent: 140 },
    { position: 'bottom', extent: 120 },
  ];
  assert.equal(reservedAt('top-left', reservations), 96);
  assert.equal(reservedAt('top-right', reservations), 140);
  assert.equal(reservedAt('bottom-right', reservations), 120);
});

test('nothing is reserved where no overlay sits', () => {
  assert.equal(reservedAt('bottom-right', []), 0);
  assert.equal(reservedAt('bottom-right', [{ position: 'top', extent: 96 }]), 0);
  assert.equal(reservedAt('bottom-right', [{ position: 'bottom-left', extent: 96 }]), 0);
});

test('a band is pinned on three sides, a corner on two', () => {
  const inset = { top: 12, right: 16, bottom: 20, left: 24 };
  assert.deepEqual(overlayOffsets('top', inset), { top: 12, left: 24, right: 16 });
  assert.deepEqual(overlayOffsets('bottom', inset), { bottom: 20, left: 24, right: 16 });
  assert.deepEqual(overlayOffsets('top-right', inset), { top: 12, right: 16 });
  assert.deepEqual(overlayOffsets('bottom-left', inset), { bottom: 20, left: 24 });
});

test('an overlay reserves its inset plus its height, from its own edge', () => {
  const inset = { top: 59, right: 12, bottom: 46, left: 12 };
  assert.deepEqual(overlayReservation('top', inset, 88), { position: 'top', extent: 147 });
  assert.deepEqual(overlayReservation('bottom-right', inset, 64), {
    position: 'bottom-right',
    extent: 110,
  });
});

test('an overlay with no height yet reserves nothing', () => {
  const inset = { top: 59, right: 12, bottom: 46, left: 12 };
  assert.equal(overlayReservation('bottom', inset, 0), null);
  assert.equal(overlayReservation('top', inset, Number.NaN), null);
});

test('a side an inset leaves out keeps the standard gap', () => {
  assert.deepEqual(resolveMapInsets(undefined, 12, NONE), {
    top: 12,
    right: 12,
    bottom: 12,
    left: 12,
  });
  assert.deepEqual(resolveMapInsets({ bottom: 80 }, 12, NONE), {
    top: 12,
    right: 12,
    bottom: 80,
    left: 12,
  });
  // A number is every side, so 0 runs a card edge to edge.
  assert.deepEqual(resolveMapInsets(0, 12, NONE), NONE);
});

test('the safe area is added to the inset, not swapped for it', () => {
  const safeArea = { top: 47, right: 0, bottom: 34, left: 0 };
  assert.deepEqual(resolveMapInsets(undefined, 12, safeArea), {
    top: 59,
    right: 12,
    bottom: 46,
    left: 12,
  });
  assert.deepEqual(resolveMapInsets(0, 12, safeArea), safeArea);
});

const GAP = { top: 12, right: 12, bottom: 12, left: 12 };

test('controls with nothing over the map keep the plain corner', () => {
  assert.deepEqual(controlsOffsets('bottom-right', { gap: 12, inset: GAP, reserved: 0 }), {
    bottom: 12,
    right: 12,
  });
  assert.deepEqual(controlsOffsets('top-left', { gap: 12, inset: GAP, reserved: 0 }), {
    top: 12,
    left: 12,
  });
});

test('controls sit one gap past an overlay on their corner', () => {
  assert.deepEqual(controlsOffsets('bottom-right', { gap: 12, inset: GAP, reserved: 120 }), {
    bottom: 132,
    right: 12,
  });
});

test('an inset moves controls on both axes', () => {
  const inset = { top: 59, right: 20, bottom: 46, left: 12 };
  assert.deepEqual(controlsOffsets('bottom-right', { gap: 12, inset, reserved: 0 }), {
    bottom: 46,
    right: 20,
  });
  assert.deepEqual(controlsOffsets('top-left', { gap: 12, inset, reserved: 0 }), {
    top: 59,
    left: 12,
  });
});

test('an overlay that already clears the inset is not cleared twice', () => {
  const inset = { ...GAP, bottom: 46 };
  // The overlay's 126 already contains the safe area beneath it.
  assert.deepEqual(controlsOffsets('bottom-left', { gap: 12, inset, reserved: 126 }), {
    bottom: 138,
    left: 12,
  });
  // And a short overlay never pulls controls back inside their own inset.
  assert.deepEqual(controlsOffsets('bottom-left', { gap: 12, inset, reserved: 20 }), {
    bottom: 46,
    left: 12,
  });
});

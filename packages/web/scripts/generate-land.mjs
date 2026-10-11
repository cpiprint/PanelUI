/**
 * Writes `src/components/planet/land.ts`: where the land is, one bit per
 * square degree.
 *
 * Planet draws the continents as dots, so all it needs from a map is an answer
 * to "is this point land?". That is a 360 by 180 grid of yes and no, which is
 * 8 KB before encoding. Shipping coastlines and a projection library to ask the
 * same question would be a few hundred times that.
 *
 * The source is Natural Earth's 1:110m land polygons, which are in the public
 * domain, read from the `world-atlas` package's TopoJSON. This is run by hand
 * when the grid needs regenerating, which is close to never:
 *
 *   node scripts/generate-land.mjs                 # fetches the polygons
 *   node scripts/generate-land.mjs land-110m.json  # or reads a local copy
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '../src/components/planet/land.ts');
const SOURCE = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json';

const COLUMNS = 360;
const ROWS = 180;

const local = process.argv[2];
const topology = local
  ? JSON.parse(fs.readFileSync(local, 'utf8'))
  : await (await fetch(SOURCE)).json();

/* TopoJSON stores each arc as deltas on an integer grid. Undo both. */
const { scale, translate } = topology.transform;
const arcs = topology.arcs.map((arc) => {
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
  });
});

/** A ring is a chain of arcs; a negative index is that arc walked backwards. */
function ringOf(indices) {
  const points = [];
  for (const index of indices) {
    const arc = index < 0 ? [...arcs[~index]].reverse() : arcs[index];
    points.push(...(points.length > 0 ? arc.slice(1) : arc));
  }
  return points;
}

/**
 * A ring made continuous across the antimeridian.
 *
 * A ring that crosses it jumps from +180 to -180 between two vertices, and
 * read as flat coordinates that jump is an edge running the whole width of the
 * world: every latitude it spans then tests as land all the way round. Fiji
 * does this, and so does the tip of Siberia. Walking the ring and carrying the
 * jump forward keeps it in one piece, running past 180 instead of wrapping.
 *
 * A jump along a parallel is left alone. That is Antarctica being closed along
 * the bottom edge of the map, which is a real edge of its outline here.
 */
function unwrap(ring) {
  let offset = 0;
  let wrapped = false;
  const points = [ring[0]];
  for (let i = 1; i < ring.length; i += 1) {
    const step = ring[i][0] - ring[i - 1][0];
    if (ring[i][1] !== ring[i - 1][1]) {
      if (step > 180) offset -= 360;
      else if (step < -180) offset += 360;
    }
    if (offset !== 0) wrapped = true;
    points.push([ring[i][0] + offset, ring[i][1]]);
  }
  return { points, wrapped };
}

const polygons = topology.objects.land.geometries.flatMap((geometry) => {
  const shapes = geometry.type === 'Polygon' ? [geometry.arcs] : geometry.arcs;
  return shapes.map((rings) => {
    const unwrapped = rings.map((indices) => unwrap(ringOf(indices)));
    const decoded = unwrapped.map((ring) => ring.points);
    const wraps = unwrapped.some((ring) => ring.wrapped);
    let west = Infinity;
    let east = -Infinity;
    let south = Infinity;
    let north = -Infinity;
    for (const [x, y] of decoded[0]) {
      west = Math.min(west, x);
      east = Math.max(east, x);
      south = Math.min(south, y);
      north = Math.max(north, y);
    }
    return { rings: decoded, west, east, south, north, wraps };
  });
});

/** Even-odd across a polygon's rings, so a hole is outside. */
function inside(polygon, longitude, y) {
  // An unwrapped ring runs outside -180..180, so the same point may lie in it
  // one turn of the world to either side.
  if (polygon.wraps) {
    return (
      insideFlat(polygon, longitude, y) ||
      insideFlat(polygon, longitude + 360, y) ||
      insideFlat(polygon, longitude - 360, y)
    );
  }
  return insideFlat(polygon, longitude, y);
}

function insideFlat(polygon, x, y) {
  if (x < polygon.west || x > polygon.east || y < polygon.south || y > polygon.north) return false;
  let crossings = 0;
  for (const ring of polygon.rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) crossings += 1;
    }
  }
  return crossings % 2 === 1;
}

/*
 * Row 0 is the northernmost band, column 0 the westernmost, each cell asked at
 * its centre.
 *
 * Very nearly at its centre. The polygons sit on an integer grid, so a vertex
 * can land exactly on a half degree, and a test line through a vertex counts
 * that crossing twice or not at all. Asking a hair off the half-degree means
 * no vertex is ever on the line.
 */
const NUDGE = 1e-6;
const bits = new Uint8Array((COLUMNS * ROWS) / 8);
let land = 0;
for (let row = 0; row < ROWS; row += 1) {
  const latitude = 90 - (row + 0.5) * (180 / ROWS) + NUDGE;
  let inRow = 0;
  for (let column = 0; column < COLUMNS; column += 1) {
    const longitude = -180 + (column + 0.5) * (360 / COLUMNS) + NUDGE;
    if (!polygons.some((polygon) => inside(polygon, longitude, latitude))) continue;
    const cell = row * COLUMNS + column;
    bits[cell >> 3] |= 1 << (cell & 7);
    inRow += 1;
  }
  // No latitude is land all the way round. Even inside Antarctica the Weddell
  // and Ross seas break it. A full row is a ring that crossed the antimeridian
  // and was not caught above.
  if (inRow > COLUMNS * 0.95) {
    throw new Error(`land: row ${row} (latitude ${latitude.toFixed(1)}) is ${inRow} of ${COLUMNS} land`);
  }
  land += inRow;
}

const encoded = Buffer.from(bits).toString('base64');
const lines = encoded.match(/.{1,96}/g).map((line) => `  '${line}'`);

fs.writeFileSync(
  OUT,
  `// Generated by scripts/generate-land.mjs from Natural Earth's 1:110m land polygons,
// which are in the public domain. Do not edit.

/** Cells per row and rows in the grid: one cell per degree. */
export const LAND_COLUMNS = ${COLUMNS};
export const LAND_ROWS = ${ROWS};

/**
 * Where the land is. One bit per cell, row 0 northernmost and column 0
 * westernmost, packed eight to a byte from the low bit and base64 encoded.
 */
export const LAND =
${lines.join(' +\n')};
`
);

console.log(`land: ${land} of ${COLUMNS * ROWS} cells (${((land / (COLUMNS * ROWS)) * 100).toFixed(1)}%), ${encoded.length} characters -> ${path.relative(process.cwd(), OUT)}`);

/* A picture, so a wrong orientation or a flipped byte order is seen at once. */
if (process.argv.includes('--show')) {
  for (let row = 0; row < ROWS; row += 4) {
    let line = '';
    for (let column = 0; column < COLUMNS; column += 3) {
      const cell = row * COLUMNS + column;
      line += bits[cell >> 3] & (1 << (cell & 7)) ? '#' : '.';
    }
    console.log(line);
  }
}

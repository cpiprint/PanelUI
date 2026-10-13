'use client';

import { DayGrid, type DayCell, type DayLevel } from 'panelui-web/day-grid';

const LEVELS: DayLevel[] = [
  0, 1, 3, 2, 0, 4, 2, 1, 0, 3, 2, 4, 4, 1, 0, 2, 3, 3, 1, 0, 1, 2, 0, 3, 4, 2, 2, 0, 1, 3, 0, 0, 2, 4,
  3, 1, 2, 0, 1, 2,
];
const CELLS: DayCell[] = LEVELS.map((level) => ({ level }));

export default function DayGridThumb() {
  return <DayGrid cells={CELLS} columns={10} color="success" className="w-56" />;
}

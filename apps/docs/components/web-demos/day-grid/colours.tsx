'use client';

import { DayGrid, type DayCell, type DayGridColor, type DayLevel } from 'panelui-web/day-grid';

/** The same fortnight in every colour, so the colour is the only difference. */
const LEVELS: DayLevel[] = [1, 3, 4, 2, 0, 0, 2, 4, 4, 3, 1, 0, 2, 3];
const CELLS: DayCell[] = LEVELS.map((level) => ({ level }));

const COLOURS: DayGridColor[] = ['primary', 'info', 'success', 'warning', 'destructive'];

export default function DayGridColours() {
  return (
    <div className="grid w-full max-w-md grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3">
      {COLOURS.map((color) => (
        <div key={color} className="contents">
          <code className="text-xs text-muted-foreground">{color}</code>
          <DayGrid cells={CELLS} columns={14} color={color} label={color} />
        </div>
      ))}
    </div>
  );
}

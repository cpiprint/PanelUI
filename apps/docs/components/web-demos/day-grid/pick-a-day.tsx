'use client';

import { useState } from 'react';
import { DayGrid, type DayCell, type DayLevel } from 'panelui-web/day-grid';

/** Pull requests merged on each day of a four-week sprint. */
const MERGED = [3, 5, 2, 7, 4, 0, 0, 6, 9, 4, 5, 8, 1, 0, 2, 4, 11, 6, 3, 0, 0, 7, 5, 8, 10, 6, 0, 1];

const levelOf = (count: number): DayLevel =>
  count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 9 ? 3 : 4;

const START = new Date(2026, 8, 7);

const dateOf = (index: number) => {
  const day = new Date(START);
  day.setDate(START.getDate() + index);
  return day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
};

const CELLS: DayCell[] = MERGED.map((count, index) => ({
  level: levelOf(count),
  label: `${dateOf(index)}, ${count} merged`,
}));

export default function DayGridPickADay() {
  const [day, setDay] = useState<number | null>(16);

  return (
    <div className="flex w-full max-w-64 flex-col gap-4">
      <DayGrid
        cells={CELLS}
        columns={7}
        color="info"
        value={day}
        onValueChange={setDay}
        label="Pull requests merged"
      />
      <div className="flex flex-col gap-0.5" aria-live="polite">
        <p className="text-sm font-medium">
          {day === null ? 'Pick a day' : `${MERGED[day]} merged`}
        </p>
        <p className="text-sm text-muted-foreground">{day === null ? '\u00a0' : dateOf(day)}</p>
      </div>
    </div>
  );
}

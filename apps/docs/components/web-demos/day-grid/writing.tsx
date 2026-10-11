'use client';

import { DayGrid, type DayCell, type DayLevel } from 'panelui-web/day-grid';

/** Words written on each of the last 42 days, oldest first. */
const WORDS = [
  0, 420, 1310, 880, 0, 0, 240, 1650, 1920, 760, 0, 310, 0, 0, 980, 1440, 2210, 1180, 640, 0, 0,
  1890, 2460, 1730, 920, 0, 150, 0, 2050, 1380, 0, 1120, 1960, 0, 0, 870, 2320, 1610, 1240, 2580,
  430, 0,
];

/** A day's count as one of the five strengths. */
const levelOf = (words: number): DayLevel =>
  words === 0 ? 0 : words < 600 ? 1 : words < 1300 ? 2 : words < 2000 ? 3 : 4;

const START = new Date(2026, 7, 31);

const CELLS: DayCell[] = WORDS.map((words, index) => {
  const day = new Date(START);
  day.setDate(START.getDate() + index);
  const date = day.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return {
    level: levelOf(words),
    label: words === 0 ? `${date}, nothing written` : `${date}, ${words.toLocaleString('en-GB')} words`,
  };
});

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DayGridWriting() {
  const total = WORDS.reduce((sum, words) => sum + words, 0);

  return (
    <div className="flex w-full max-w-72 flex-col gap-4 rounded-2xl border bg-card p-5 text-card-foreground">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">Words written</h3>
        <p className="text-sm text-muted-foreground">6 weeks</p>
      </div>
      <p className="text-2xl font-bold tracking-tight">{total.toLocaleString('en-GB')}</p>

      <div className="flex flex-col gap-1.5">
        <div aria-hidden="true" className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {WEEKDAYS.map((day, index) => (
            <span key={index}>{day}</span>
          ))}
        </div>
        <DayGrid cells={CELLS} columns={7} color="success" label="Words written" />
      </div>

      <DayGrid.Legend color="success" className="self-end" />
    </div>
  );
}

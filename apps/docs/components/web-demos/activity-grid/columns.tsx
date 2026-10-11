'use client';

import { ActivityGrid, type ActivityCell, type ActivityLevel } from 'panelui-web/activity-grid';

/** Four weeks, Monday first. */
const WEEKS = 'RRPRRNN RRRRPNR PRRNRNN RRRRRPN';
const LEVELS: Record<string, ActivityLevel> = { R: 'reached', P: 'partial', N: 'none' };
const CELLS: ActivityCell[] = [...WEEKS.replaceAll(' ', '')].map((letter) => ({
  level: LEVELS[letter],
}));

export default function ActivityGridColumns() {
  return (
    <div className="dark flex w-full max-w-xs flex-col gap-4 rounded-[28px] bg-card p-5 text-card-foreground">
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted-foreground sm:gap-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <span key={index}>{day}</span>
        ))}
      </div>
      <ActivityGrid cells={CELLS} columns={7} label="Workouts, last four weeks" />
      <ActivityGrid.Legend
        className="gap-x-4 text-xs"
        labels={{ reached: 'Done', partial: 'Short', none: 'Rest' }}
      />
    </div>
  );
}

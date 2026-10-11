'use client';

import { useState } from 'react';
import { ActivityGrid, type ActivityCell } from 'panelui-web/activity-grid';

/** Minutes of practice each day in June, against a goal of twenty. */
const MINUTES = [
  24, 12, 0, 0, 21, 0, 0, 0, 0, 30, 22, 26, 9, 20, 14, 25, 11, 23, 28, 20, 0, 31, 0, 0, 22, 27, 0,
  24, 8, 0,
];
const GOAL = 20;

const DAYS: ActivityCell[] = MINUTES.map((minutes, index) => ({
  level: minutes >= GOAL ? 'reached' : minutes > 0 ? 'partial' : 'none',
  label: `${index + 1} June, ${minutes} minutes`,
}));

export default function ActivityGridPickADay() {
  const [day, setDay] = useState<number | null>(13);
  const minutes = day === null ? null : MINUTES[day];

  return (
    <div className="dark flex w-full max-w-xl flex-col gap-5 rounded-[36px] bg-card p-6 text-card-foreground">
      <ActivityGrid cells={DAYS} columns={10} value={day} onValueChange={setDay} label="Practice in June" />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {day === null || minutes === null ? (
          'Pick a day'
        ) : (
          <>
            <span className="font-medium text-foreground">{day + 1} June</span>
            {minutes === 0
              ? ' · no practice'
              : ` · ${minutes} of ${GOAL} minutes${minutes >= GOAL ? ', goal reached' : ''}`}
          </>
        )}
      </p>
    </div>
  );
}

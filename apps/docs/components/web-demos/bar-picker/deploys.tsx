'use client';

import { useState } from 'react';
import { BarPicker, type BarPickerBar } from 'panelui-web/bar-picker';

/** Deploys to production on each day of one week. */
const WEEK: BarPickerBar[] = [
  { label: 'Mon', name: 'Monday', value: 9 },
  { label: 'Tue', name: 'Tuesday', value: 14 },
  { label: 'Wed', name: 'Wednesday', value: 11 },
  { label: 'Thu', name: 'Thursday', value: 17 },
  { label: 'Fri', name: 'Friday', value: 6 },
  { label: 'Sat', name: 'Saturday', value: 0 },
  { label: 'Sun', name: 'Sunday', value: 2 },
];

const TOTAL = WEEK.reduce((sum, day) => sum + day.value, 0);

export default function BarPickerDeploys() {
  const [day, setDay] = useState(3);
  const picked = WEEK[day];
  const share = Math.round((picked.value / TOTAL) * 100);

  return (
    // A frame: a band that names what is inside, round a panel that holds it.
    <div className="w-full max-w-sm rounded-3xl bg-muted p-1.5">
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
        <h3 className="text-sm font-medium">Deploys</h3>
        <p className="text-sm text-muted-foreground">This week · {TOTAL}</p>
      </div>

      <div className="flex flex-col gap-6 rounded-[1.125rem] border bg-card p-5 text-card-foreground shadow-xs">
        <div className="flex items-end justify-between gap-4" aria-live="polite">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{picked.name}</p>
            <p className="text-4xl font-bold leading-none tracking-tight">{picked.value}</p>
          </div>
          <p className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {share}% of the week
          </p>
        </div>

        <BarPicker
          data={WEEK}
          value={day}
          onValueChange={setDay}
          color="info"
          label="Deploys by day"
          formatValue={(value) => `${value} deploys`}
        />
      </div>
    </div>
  );
}

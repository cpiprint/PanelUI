'use client';

import { ChevronDownIcon, ShapesIcon } from 'lucide-react';
import { useState } from 'react';
import { ActivityGrid, type ActivityCell, type ActivityLevel } from 'panelui-web/activity-grid';

/** R reached, P partial, N none: thirty days, read left to right. */
const PERIODS: Record<string, string> = {
  'Last month': 'RPNNRNNNNR RRPRPRPRRR NRNNRRNRPN',
  'This month': 'RRRPRNRRRR PRRRNNRRPR RRNRRRPRRN',
  'Three months ago': 'NNPNNRNNNP NRNNPNNRNN PNNRNNNPNN',
};

const LEVELS: Record<string, ActivityLevel> = { R: 'reached', P: 'partial', N: 'none' };

function cellsOf(pattern: string): ActivityCell[] {
  return [...pattern.replaceAll(' ', '')].map((letter) => ({ level: LEVELS[letter] }));
}

export default function ActivityGridMindfulness() {
  const [period, setPeriod] = useState('Last month');

  return (
    // `dark` keeps the card dark on a light page, as the design has it.
    <div className="dark flex w-full max-w-xl flex-col gap-6 rounded-[36px] bg-card p-6 text-card-foreground">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground/10">
          <ShapesIcon className="size-5" aria-hidden="true" />
        </span>
        <h3 className="min-w-0 flex-1 truncate text-lg text-muted-foreground">
          Mindfulness Activity
        </h3>
        <label className="relative">
          <span className="sr-only">Period</span>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="h-11 cursor-pointer appearance-none rounded-full bg-foreground/[0.06] pe-10 ps-4 text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {Object.keys(PERIODS).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <ChevronDownIcon
            className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </label>
      </div>

      <ActivityGrid cells={cellsOf(PERIODS[period])} columns={10} label={`Mindfulness, ${period.toLowerCase()}`} />
      <ActivityGrid.Legend />
    </div>
  );
}

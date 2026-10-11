'use client';

import { useState } from 'react';
import { RangeMeter, type RangeMeterColor } from 'panelui-web/range-meter';

const FASTEST = 80;
const SLOWEST = 600;
/** What the team has agreed a page may take. */
const BUDGET = 300;

/** Fine under the budget, a warning up to half as much again, a problem past that. */
const colorOf = (time: number): RangeMeterColor =>
  time <= BUDGET ? 'success' : time <= BUDGET * 1.5 ? 'warning' : 'destructive';

const verdictOf = (time: number) =>
  time <= BUDGET ? `${BUDGET - time} ms inside the budget` : `${time - BUDGET} ms over the budget`;

export default function RangeMeterResponseTime() {
  const [time, setTime] = useState(240);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border bg-card p-5 text-card-foreground">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">Checkout page</h3>
        <p className="text-sm text-muted-foreground">Budget {BUDGET} ms</p>
      </div>

      <div className="flex flex-col gap-2">
        <RangeMeter
          min={FASTEST}
          max={SLOWEST}
          step={10}
          value={time}
          onValueChange={setTime}
          marker={BUDGET}
          color={colorOf(time)}
          label="Response time"
          valueText={`${time} milliseconds`}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{FASTEST} ms</span>
          <span>{SLOWEST} ms</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {verdictOf(time)}
      </p>
    </div>
  );
}

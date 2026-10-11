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
  time <= BUDGET ? `${BUDGET - time} ms inside budget` : `${time - BUDGET} ms over budget`;

export default function RangeMeterResponseTime() {
  const [time, setTime] = useState(240);

  return (
    // A frame: a band that names what is inside, round a panel that holds it.
    <div className="w-full max-w-sm rounded-3xl bg-muted p-1.5">
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
        <h3 className="text-sm font-medium">Checkout page</h3>
        <p className="text-sm text-muted-foreground">Budget {BUDGET} ms</p>
      </div>

      <div className="flex flex-col gap-4 rounded-[1.125rem] border bg-card p-5 text-card-foreground shadow-xs">
        <div className="flex items-end justify-between gap-4" aria-live="polite">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Response time</p>
            <p className="text-4xl font-bold leading-none tracking-tight">
              {time}
              <span className="ms-1.5 text-base font-medium text-muted-foreground">ms</span>
            </p>
          </div>
          <p className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {verdictOf(time)}
          </p>
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
      </div>
    </div>
  );
}

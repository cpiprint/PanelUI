'use client';

import { DropletIcon } from 'lucide-react';
import { RangeMeter } from 'panelui-web/range-meter';

/** No `onValueChange`, so it shows a value and cannot be moved. */
export default function RangeMeterReading() {
  return (
    <div className="dark flex w-full max-w-md flex-col gap-4 rounded-[28px] bg-card p-6 text-card-foreground">
      <div className="flex items-baseline justify-between">
        <p className="text-muted-foreground">Water today</p>
        <p className="text-sm text-muted-foreground">Goal 2.5 L</p>
      </div>
      <RangeMeter
        min={0}
        max={2.5}
        value={1.8}
        marker={2}
        label="Water today"
        valueText="1.8 of 2.5 litres"
        formatValue={(litres) => `${litres} L`}
        // Any colour works as the accent. It is one variable.
        className="[--panelui-accent:oklch(0.72_0.14_230)]"
      >
        <DropletIcon fill="currentColor" />
      </RangeMeter>
    </div>
  );
}

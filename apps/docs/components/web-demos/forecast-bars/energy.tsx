'use client';

import { ChevronRightIcon, ZapIcon } from 'lucide-react';
import { useState } from 'react';
import { ForecastBars } from 'panelui-web/forecast-bars';
import { RollingNumber } from 'panelui-web/rolling-number';

const WEEK = [
  { label: 'S', name: 'Sunday', value: 22 },
  { label: 'M', name: 'Monday', value: 41 },
  { label: 'T', name: 'Tuesday', value: 14 },
  { label: 'W', name: 'Wednesday', value: 48 },
  { label: 'T', name: 'Thursday', value: 78 },
  { label: 'F', name: 'Friday', value: 44 },
  { label: 'S', name: 'Saturday', value: 76 },
];

export default function ForecastBarsEnergy() {
  const [day, setDay] = useState(4);

  return (
    <div className="dark flex w-full max-w-xl flex-col gap-6 rounded-[36px] bg-card p-6 text-card-foreground">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground/10">
          <ZapIcon className="size-5" aria-hidden="true" />
        </span>
        <h3 className="min-w-0 flex-1 truncate text-lg text-muted-foreground">Energy Forecast</h3>
        <ChevronRightIcon className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>

      <div className="flex items-end justify-between gap-6">
        <p className="text-7xl font-light tracking-tight" aria-live="polite">
          <RollingNumber value={WEEK[day].value / 100} format={{ style: 'percent' }} />
          <span className="sr-only"> on {WEEK[day].name}</span>
        </p>
        <ForecastBars
          data={WEEK}
          max={100}
          value={day}
          onValueChange={setDay}
          label="Energy forecast by day"
          formatValue={(value) => `${value} percent`}
        />
      </div>
    </div>
  );
}

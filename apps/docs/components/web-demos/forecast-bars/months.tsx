'use client';

import { ForecastBars } from 'panelui-web/forecast-bars';

/** Rainfall in millimetres. With no `max`, the tallest bar fills its track. */
const RAIN = [
  { label: 'Jan', name: 'January', value: 55 },
  { label: 'Feb', name: 'February', value: 41 },
  { label: 'Mar', name: 'March', value: 42 },
  { label: 'Apr', name: 'April', value: 44 },
  { label: 'May', name: 'May', value: 49 },
  { label: 'Jun', name: 'June', value: 45 },
];

export default function ForecastBarsMonths() {
  return (
    <div className="dark rounded-[28px] bg-card p-6 text-card-foreground">
      <ForecastBars
        data={RAIN}
        defaultValue={0}
        label="Rainfall by month"
        formatValue={(value) => `${value} millimetres`}
        // A cooler accent, and a little more room for three-letter labels.
        className="gap-4 [--panelui-accent:oklch(0.7_0.13_235)]"
      />
    </div>
  );
}

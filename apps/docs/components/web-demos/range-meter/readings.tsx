'use client';

import { RangeMeter } from 'panelui-web/range-meter';

/** Three readings nobody can change: without `onValueChange` it is a meter. */
const READINGS = [
  { name: 'Build cache', used: 71, color: 'primary' },
  { name: 'Artifact storage', used: 88, color: 'warning' },
  { name: 'Log retention', used: 34, color: 'info' },
] as const;

export default function RangeMeterReadings() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      {READINGS.map((reading) => (
        <div key={reading.name} className="flex flex-col">
          <span className="text-sm font-medium">{reading.name}</span>
          <RangeMeter
            value={reading.used}
            color={reading.color}
            formatValue={(value) => `${value}%`}
            label={reading.name}
            valueText={`${reading.used} percent used`}
          />
        </div>
      ))}
    </div>
  );
}

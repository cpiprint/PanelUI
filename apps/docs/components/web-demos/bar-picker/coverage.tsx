'use client';

import { BarPicker, type BarPickerBar } from 'panelui-web/bar-picker';

/** Test coverage at the end of each sprint, as a percentage. */
const SPRINTS: BarPickerBar[] = [
  { label: 'S1', name: 'Sprint 1', value: 52 },
  { label: 'S2', name: 'Sprint 2', value: 58 },
  { label: 'S3', name: 'Sprint 3', value: 57 },
  { label: 'S4', name: 'Sprint 4', value: 66 },
  { label: 'S5', name: 'Sprint 5', value: 74 },
  { label: 'S6', name: 'Sprint 6', value: 81 },
];

export default function BarPickerCoverage() {
  return (
    <BarPicker
      data={SPRINTS}
      max={100}
      defaultValue={5}
      color="success"
      label="Coverage by sprint"
      formatValue={(value) => `${value} percent`}
      className="max-w-xs"
    />
  );
}

'use client';

import { BarPicker } from 'panelui-web/bar-picker';

const DATA = [
  { label: 'M', value: 5 },
  { label: 'T', value: 8 },
  { label: 'W', value: 6 },
  { label: 'T', value: 9 },
  { label: 'F', value: 3 },
  { label: 'S', value: 1 },
];

export default function BarPickerThumb() {
  return <BarPicker data={DATA} defaultValue={3} color="warning" className="w-52" />;
}

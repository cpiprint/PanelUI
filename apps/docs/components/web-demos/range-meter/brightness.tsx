'use client';

import { SunIcon } from 'lucide-react';
import { useState } from 'react';
import { RangeMeter } from 'panelui-web/range-meter';

export default function RangeMeterBrightness() {
  const [brightness, setBrightness] = useState(65);

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <RangeMeter
        step={5}
        ticks={21}
        value={brightness}
        onValueChange={setBrightness}
        color="warning"
        formatValue={(value) => `${value}%`}
        label="Brightness"
        valueText={`${brightness} percent`}
      >
        <SunIcon />
      </RangeMeter>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Dim</span>
        <span>Bright</span>
      </div>
    </div>
  );
}

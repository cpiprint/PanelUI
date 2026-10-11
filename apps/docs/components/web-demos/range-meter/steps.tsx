'use client';

import { FootprintsIcon } from 'lucide-react';
import { useState } from 'react';
import { RangeMeter } from 'panelui-web/range-meter';

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export default function RangeMeterSteps() {
  const [goal, setGoal] = useState(8000);

  return (
    <div className="dark flex w-full max-w-md flex-col gap-4 rounded-[28px] bg-card p-6 text-card-foreground">
      <div className="flex items-baseline justify-between">
        <p className="text-muted-foreground">Daily step goal</p>
        <p className="text-sm text-muted-foreground">About {Math.round(goal / 1300)} km</p>
      </div>
      <RangeMeter
        min={2000}
        max={14000}
        step={500}
        value={goal}
        onValueChange={setGoal}
        label="Daily step goal"
        valueText={`${goal.toLocaleString('en-US')} steps`}
        formatValue={(steps) => compact.format(steps)}
      >
        <FootprintsIcon />
      </RangeMeter>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>2k</span>
        <span>14k</span>
      </div>
    </div>
  );
}

'use client';

import { ArrowDownIcon, ArrowUpIcon, HeartIcon } from 'lucide-react';
import { useState } from 'react';
import { RangeMeter } from 'panelui-web/range-meter';

const LOWEST = 54;
const PEAK = 98;
const AVERAGE = 76;

export default function RangeMeterHeartRate() {
  const [reading, setReading] = useState(89);

  return (
    <div className="dark flex w-full max-w-xl flex-col gap-7 rounded-[36px] bg-card p-6 text-card-foreground">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground">Daily Average</p>
          <p className="text-3xl">
            {AVERAGE} <span className="text-[oklch(0.7_0.19_42)]">BPM</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-muted-foreground">Last reading</p>
          <p className="text-xl">2 min ago</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <RangeMeter
          min={LOWEST}
          max={PEAK}
          value={reading}
          onValueChange={setReading}
          marker={AVERAGE}
          label="Last reading"
          valueText={`${reading} beats per minute`}
        >
          <HeartIcon fill="currentColor" />
        </RangeMeter>
        <div className="flex justify-between text-muted-foreground">
          <p className="flex items-center gap-2">
            Lowest <span className="text-foreground">{LOWEST}</span>
            <ArrowDownIcon className="size-4" aria-hidden="true" />
          </p>
          <p className="flex items-center gap-2">
            Peak <span className="text-foreground">{PEAK}</span>
            <ArrowUpIcon className="size-4" aria-hidden="true" />
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { ActivityIcon, ArrowDownIcon, ArrowUpIcon, HeartIcon, TimerIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { ForecastBars } from 'panelui-web/forecast-bars';
import { PillStack } from 'panelui-web/pill-stack';
import { RangeMeter } from 'panelui-web/range-meter';
import { StatStrip } from 'panelui-web/stat-strip';

const ACCENT = 'text-[var(--panelui-accent,oklch(0.7_0.19_42))]';

/** Minutes spent in each heart rate zone today. */
const ZONES = [
  { label: 'Z1', name: 'Zone 1, easy', value: 64 },
  { label: 'Z2', name: 'Zone 2, steady', value: 48 },
  { label: 'Z3', name: 'Zone 3, moderate', value: 27 },
  { label: 'Z4', name: 'Zone 4, hard', value: 11 },
  { label: 'Z5', name: 'Zone 5, maximum', value: 3 },
];

/** A small ring: how far through something is, with nothing written on it. */
function Ring({ share }: { share: number }) {
  const length = 2 * Math.PI * 19;
  return (
    <svg viewBox="0 0 44 44" className={`size-14 shrink-0 -rotate-90 ${ACCENT}`} aria-hidden="true">
      <circle cx="22" cy="22" r="19" fill="none" strokeWidth="2.5" className="stroke-foreground/15" />
      <circle
        cx="22"
        cy="22"
        r="19"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${length * share} ${length}`}
      />
    </svg>
  );
}

/** What a folded item shows: a mark, a name, the figure and a ring. */
function Row({ icon, title, share }: { icon: ReactNode; title: string; share: number }) {
  return (
    <>
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-foreground/10">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-lg">{title}</span>
      <span className="shrink-0 text-xl">
        76 <span className={`text-sm ${ACCENT}`}>BPM</span>
      </span>
      <Ring share={share} />
    </>
  );
}

export default function PillStackVitals() {
  const [reading, setReading] = useState(89);
  const [zone, setZone] = useState(1);

  return (
    <div className="dark w-full max-w-xl">
      <PillStack defaultValue="average">
        <PillStack.Item value="zones">
          <PillStack.Pill>
            <Row
              icon={<ActivityIcon className={`size-6 ${ACCENT}`} aria-hidden="true" />}
              title="Heart rate zones"
              share={0.35}
            />
          </PillStack.Pill>
          <PillStack.Panel className="flex items-end justify-between gap-6">
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground">{ZONES[zone].name}</p>
              <p className="text-5xl font-light tracking-tight">
                {ZONES[zone].value} <span className="text-xl text-muted-foreground">min</span>
              </p>
            </div>
            <ForecastBars
              data={ZONES}
              value={zone}
              onValueChange={setZone}
              label="Minutes in each zone"
              formatValue={(minutes) => `${minutes} minutes`}
            />
          </PillStack.Panel>
        </PillStack.Item>

        <PillStack.Item value="last">
          <PillStack.Pill>
            <Row
              icon={<HeartIcon className={`size-6 ${ACCENT}`} fill="currentColor" aria-hidden="true" />}
              title="Last reading"
              share={0.7}
            />
          </PillStack.Pill>
          <PillStack.Panel>
            <StatStrip>
              <StatStrip.Item label="Last reading" accent>
                {reading} <StatStrip.Unit>BPM</StatStrip.Unit>
              </StatStrip.Item>
              <StatStrip.Item label="Measured">2 min ago</StatStrip.Item>
              <StatStrip.Item label="While">Walking</StatStrip.Item>
            </StatStrip>
          </PillStack.Panel>
        </PillStack.Item>

        <PillStack.Item value="average">
          <PillStack.Pill>
            <Row
              icon={<TimerIcon className={`size-6 ${ACCENT}`} aria-hidden="true" />}
              title="Daily average"
              share={0.55}
            />
          </PillStack.Pill>
          <PillStack.Panel className="flex flex-col gap-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-muted-foreground">Daily Average</p>
                <p className="text-3xl">
                  76 <span className={ACCENT}>BPM</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-muted-foreground">Last reading</p>
                <p className="text-xl">2 min ago</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <RangeMeter
                min={54}
                max={98}
                value={reading}
                onValueChange={setReading}
                marker={76}
                label="Last reading"
                valueText={`${reading} beats per minute`}
              >
                <HeartIcon fill="currentColor" />
              </RangeMeter>
              <div className="flex justify-between text-muted-foreground">
                <p className="flex items-center gap-2">
                  Lowest <span className="text-foreground">54</span>
                  <ArrowDownIcon className="size-4" aria-hidden="true" />
                </p>
                <p className="flex items-center gap-2">
                  Peak <span className="text-foreground">98</span>
                  <ArrowUpIcon className="size-4" aria-hidden="true" />
                </p>
              </div>
            </div>
          </PillStack.Panel>
        </PillStack.Item>
      </PillStack>
    </div>
  );
}

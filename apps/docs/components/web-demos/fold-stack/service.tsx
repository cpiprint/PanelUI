'use client';

import { GaugeIcon, LayersIcon, TriangleAlertIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { FoldStack, type FoldStackColor } from 'panelui-web/fold-stack';
import { RangeMeter } from 'panelui-web/range-meter';

interface Reading {
  id: string;
  name: string;
  icon: ReactNode;
  color: FoldStackColor;
  /** The figure now, and the scale it is read on. */
  now: number;
  low: number;
  high: number;
  /** The value the team has agreed to stay under. */
  limit: number;
  unit: string;
  note: string;
}

/** How one service is doing, over the last five minutes. */
const READINGS: Reading[] = [
  {
    id: 'latency',
    name: 'Latency',
    icon: <GaugeIcon />,
    color: 'info',
    now: 182,
    low: 80,
    high: 600,
    limit: 300,
    unit: 'ms',
    note: 'Slowest one request in twenty, across every region.',
  },
  {
    id: 'errors',
    name: 'Errors',
    icon: <TriangleAlertIcon />,
    color: 'destructive',
    now: 34,
    low: 0,
    high: 50,
    limit: 10,
    unit: 'per 10k',
    note: 'Most are timeouts from one region. Nothing is being lost.',
  },
  {
    id: 'queue',
    name: 'Queue',
    icon: <LayersIcon />,
    color: 'warning',
    now: 312,
    low: 0,
    high: 1000,
    limit: 500,
    unit: 'jobs',
    note: 'Drains in about four minutes at the present rate.',
  },
];

export default function FoldStackService() {
  return (
    <FoldStack defaultValue="queue" className="max-w-sm">
      {READINGS.map((reading) => (
        <FoldStack.Item key={reading.id} value={reading.id} color={reading.color}>
          <FoldStack.Summary
            icon={reading.icon}
            value={reading.now}
            level={(reading.now - reading.low) / (reading.high - reading.low)}
          >
            {reading.name}
          </FoldStack.Summary>
          <FoldStack.Panel className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">{reading.name}</p>
                <p className="text-4xl font-bold leading-none tracking-tight">
                  {reading.now}
                  <span className="ms-1.5 text-base font-medium text-muted-foreground">
                    {reading.unit}
                  </span>
                </p>
              </div>
              <p className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Limit {reading.limit}
              </p>
            </div>
            <RangeMeter
              min={reading.low}
              max={reading.high}
              value={reading.now}
              marker={reading.limit}
              color={reading.color}
              label={reading.name}
              valueText={`${reading.now} ${reading.unit}`}
            />
            <p className="text-sm text-muted-foreground">{reading.note}</p>
          </FoldStack.Panel>
        </FoldStack.Item>
      ))}
    </FoldStack>
  );
}

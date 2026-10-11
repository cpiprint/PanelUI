'use client';

import { useEffect, useState } from 'react';
import { RollingNumber } from 'panelui-web/rolling-number';

/** Jobs waiting in a queue, read every couple of seconds. */
const WAITING = [312, 298, 305, 341, 327, 289];

export default function RollingNumberQueue() {
  const [reading, setReading] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setReading((current) => (current + 1) % WAITING.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-muted-foreground">Jobs waiting</span>
      <RollingNumber value={WAITING[reading]} className="text-6xl font-bold tracking-tight" />
    </div>
  );
}

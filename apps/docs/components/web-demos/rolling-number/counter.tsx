'use client';

import { useEffect, useState } from 'react';
import { RollingNumber } from 'panelui-web/rolling-number';

/** What a live count does over a minute: it wanders. */
const READINGS = [124, 121, 133, 129, 140, 136];

export default function RollingNumberCounter() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((current) => (current + 1) % READINGS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">Events</span>
      <RollingNumber
        value={READINGS[step]}
        className="text-6xl font-semibold tracking-tight"
      />
    </div>
  );
}

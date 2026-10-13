'use client';

import { useEffect, useState } from 'react';
import { RollingNumber } from 'panelui-web/rolling-number';

const READINGS = [4820, 4865, 4791, 4903];

export default function RollingNumberThumb() {
  const [reading, setReading] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setReading((current) => (current + 1) % READINGS.length), 2000);
    return () => clearInterval(timer);
  }, []);
  return <RollingNumber value={READINGS[reading]} className="text-5xl font-bold tracking-tight" />;
}

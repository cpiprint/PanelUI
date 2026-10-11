'use client';

import { useEffect, useState } from 'react';
import { Planet, type PlanetMarkerColor } from 'panelui-web/planet';
import { RollingNumber } from 'panelui-web/rolling-number';

type Health = 'healthy' | 'slow' | 'down';

/** The data centres a service runs in, and how each is answering. */
const REGIONS: { code: string; city: string; lat: number; lng: number; health: Health }[] = [
  { code: 'dub', city: 'Dublin', lat: 53.35, lng: -6.26, health: 'healthy' },
  { code: 'waw', city: 'Warsaw', lat: 52.23, lng: 21.01, health: 'healthy' },
  { code: 'jnb', city: 'Johannesburg', lat: -26.2, lng: 28.05, health: 'slow' },
  { code: 'bom', city: 'Mumbai', lat: 19.08, lng: 72.88, health: 'healthy' },
  { code: 'sin', city: 'Singapore', lat: 1.35, lng: 103.82, health: 'healthy' },
  { code: 'syd', city: 'Sydney', lat: -33.87, lng: 151.21, health: 'down' },
  { code: 'icn', city: 'Seoul', lat: 37.57, lng: 126.98, health: 'healthy' },
  { code: 'gru', city: 'São Paulo', lat: -23.55, lng: -46.63, health: 'healthy' },
  { code: 'yul', city: 'Montreal', lat: 45.5, lng: -73.57, health: 'healthy' },
  { code: 'pdx', city: 'Portland', lat: 45.52, lng: -122.68, health: 'slow' },
];

const COLOUR: Record<Health, PlanetMarkerColor> = {
  healthy: 'success',
  slow: 'warning',
  down: 'destructive',
};

/** What the request rate does from one reading to the next: it wanders. */
const RATES = [8420, 8395, 8510, 8473, 8602, 8548];

export default function PlanetRegions() {
  const [reading, setReading] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setReading((current) => current + 1), 2800);
    return () => clearInterval(timer);
  }, []);

  const healthy = REGIONS.filter((region) => region.health === 'healthy').length;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border bg-card p-5 text-card-foreground">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium text-muted-foreground">Requests a second</h3>
          <RollingNumber
            value={RATES[reading % RATES.length]}
            className="text-2xl font-bold tracking-tight"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {healthy} of {REGIONS.length} regions healthy
        </p>
      </div>

      <Planet defaultRotation={[96, 8]}>
        <Planet.Globe label="Regions" color="info">
          {REGIONS.map((region) => (
            <Planet.Marker
              key={region.code}
              lat={region.lat}
              lng={region.lng}
              color={COLOUR[region.health]}
              pulse={region.health !== 'healthy'}
              label={region.health === 'healthy' ? undefined : region.city}
              count={region.health === 'healthy' ? undefined : region.health}
            />
          ))}
        </Planet.Globe>
        <Planet.Controls />
      </Planet>
    </div>
  );
}

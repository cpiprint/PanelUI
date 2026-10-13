'use client';

import { useRef, useState } from 'react';
import { Planet, type PlanetHandle, type PlanetMarkerColor } from 'panelui-web/planet';

type Health = 'healthy' | 'slow' | 'down';

/** The data centres a service runs in, and how each is answering. */
const REGIONS: { city: string; lat: number; lng: number; health: Health; ms: number | null }[] = [
  { city: 'Dublin', lat: 53.35, lng: -6.26, health: 'healthy', ms: 38 },
  { city: 'Warsaw', lat: 52.23, lng: 21.01, health: 'healthy', ms: 44 },
  { city: 'Johannesburg', lat: -26.2, lng: 28.05, health: 'slow', ms: 412 },
  { city: 'Mumbai', lat: 19.08, lng: 72.88, health: 'healthy', ms: 61 },
  { city: 'Singapore', lat: 1.35, lng: 103.82, health: 'healthy', ms: 52 },
  { city: 'Sydney', lat: -33.87, lng: 151.21, health: 'down', ms: null },
  { city: 'Seoul', lat: 37.57, lng: 126.98, health: 'healthy', ms: 47 },
  { city: 'São Paulo', lat: -23.55, lng: -46.63, health: 'healthy', ms: 73 },
  { city: 'Montreal', lat: 45.5, lng: -73.57, health: 'healthy', ms: 41 },
  { city: 'Portland', lat: 45.52, lng: -122.68, health: 'slow', ms: 286 },
];

const COLOUR: Record<Health, PlanetMarkerColor> = {
  healthy: 'success',
  slow: 'warning',
  down: 'destructive',
};

/** The same three colours for the dots in the list. */
const DOT: Record<Health, string> = {
  healthy: 'bg-(--success)',
  slow: 'bg-(--warning)',
  down: 'bg-destructive',
};

const SAYS: Record<Health, string> = {
  healthy: 'Answering normally',
  slow: 'Answering slowly',
  down: 'Not answering',
};

export default function PlanetRegions() {
  const planet = useRef<PlanetHandle>(null);
  const [picked, setPicked] = useState('Singapore');
  const region = REGIONS.find((entry) => entry.city === picked) ?? REGIONS[0];
  const healthy = REGIONS.filter((entry) => entry.health === 'healthy').length;

  const pick = (city: string) => {
    const next = REGIONS.find((entry) => entry.city === city);
    if (!next) return;
    setPicked(city);
    // Turned so the region faces you, a little short of its latitude so a
    // place far north or south is seen from the side.
    planet.current?.rotateTo([next.lng, next.lat * 0.5]);
  };

  return (
    // A frame: a band that names what is inside, round a panel that holds it.
    <div className="w-full max-w-2xl rounded-3xl bg-muted p-1.5">
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
        <h3 className="text-sm font-medium">Regions</h3>
        <p className="text-sm text-muted-foreground">
          {healthy} of {REGIONS.length} healthy
        </p>
      </div>

      {/* The globe beside the list on a wide screen, over it on a narrow one. */}
      <div className="grid gap-5 rounded-[1.125rem] border bg-card p-5 text-card-foreground shadow-xs sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] sm:items-center">
        <Planet ref={planet} defaultRotation={[103.82, 4]} className="mx-auto max-w-64 gap-3">
          <Planet.Globe label="Regions" color="info">
            {REGIONS.map((entry) => (
              <Planet.Marker
                key={entry.city}
                lat={entry.lat}
                lng={entry.lng}
                color={COLOUR[entry.health]}
                pulse={entry.health !== 'healthy'}
                selected={entry.city === picked}
                label={entry.city === picked ? entry.city : undefined}
                name={entry.city}
                onClick={() => pick(entry.city)}
              />
            ))}
          </Planet.Globe>
          <Planet.Controls />
        </Planet>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-end justify-between gap-4" aria-live="polite">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">{region.city}</p>
              <p className="text-sm font-medium">{SAYS[region.health]}</p>
            </div>
            <p className="text-3xl font-bold leading-none tracking-tight">
              {region.ms === null ? '\u2014' : region.ms}
              {region.ms === null ? null : (
                <span className="ms-1 text-sm font-medium text-muted-foreground">ms</span>
              )}
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-1 border-t pt-3">
            {REGIONS.map((entry) => (
              <li key={entry.city}>
                <button
                  type="button"
                  aria-pressed={entry.city === picked}
                  onClick={() => pick(entry.city)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-muted aria-pressed:text-foreground"
                >
                  <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${DOT[entry.health]}`} />
                  <span className="truncate">{entry.city}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

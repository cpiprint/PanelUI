'use client';

import { RotateCwIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Planet } from 'panelui-web/planet';
import { RollingNumber } from 'panelui-web/rolling-number';

/** One marker per country, at the city most of its visitors are in. */
const COUNTRIES = [
  { name: 'Netherlands', visitors: 1, lat: 52.37, lng: 4.9 },
  { name: 'Germany', visitors: 2, lat: 52.52, lng: 13.4 },
  { name: 'France', visitors: 1, lat: 48.86, lng: 2.35 },
  { name: 'Portugal', visitors: 1, lat: 38.72, lng: -9.14 },
  { name: 'Morocco', visitors: 1, lat: 33.57, lng: -7.59 },
  { name: 'Georgia', visitors: 1, lat: 41.72, lng: 44.79 },
  { name: 'Saudi Arabia', visitors: 2, lat: 24.71, lng: 46.68 },
  { name: 'Nepal', visitors: 1, lat: 27.72, lng: 85.32 },
  { name: 'India', visitors: 2, lat: 19.08, lng: 72.88 },
  { name: 'South Korea', visitors: 1, lat: 37.57, lng: 126.98 },
  { name: 'Japan', visitors: 4, lat: 35.68, lng: 139.69 },
  { name: 'Hong Kong', visitors: 1, lat: 22.32, lng: 114.17 },
  { name: 'Philippines', visitors: 1, lat: 14.6, lng: 120.98 },
  { name: 'Singapore', visitors: 1, lat: 1.35, lng: 103.82 },
  { name: 'Indonesia', visitors: 3, lat: -6.21, lng: 106.85 },
  { name: 'Australia', visitors: 1, lat: -33.87, lng: 151.21 },
  { name: 'Brazil', visitors: 2, lat: -23.55, lng: -46.63 },
  { name: 'Argentina', visitors: 1, lat: -34.6, lng: -58.38 },
  { name: 'Canada', visitors: 1, lat: 43.65, lng: -79.38 },
  { name: 'United States', visitors: 3, lat: 37.77, lng: -122.42 },
];

/** What the event count does over a few refreshes. */
const EVENTS = [124, 121, 127, 133, 130, 138];

const SHIRTS = ['#e5484d', '#7c66dc', '#3e8ee0', '#30a46c', '#f5a524'];
const BACKDROPS = ['#fde4e1', '#ebe4ff', '#dcebff', '#d9f3e4', '#ffecc7'];

/** A stand-in face. Use your own avatar here. */
function Face({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 24 24" className="size-full" aria-hidden="true">
      <rect width="24" height="24" fill={BACKDROPS[index % BACKDROPS.length]} />
      <circle cx="12" cy="9.5" r="4.2" fill="#8d5a44" />
      <path d="M3.5 24c0-5 3.8-8 8.5-8s8.5 3 8.5 8z" fill={SHIRTS[index % SHIRTS.length]} />
    </svg>
  );
}

export default function PlanetRealtime() {
  const [step, setStep] = useState(0);
  const [live, setLive] = useState(true);
  // Set after mounting: the server and the browser disagree about the time.
  const [updated, setUpdated] = useState<string | null>(null);

  useEffect(() => {
    setUpdated(new Date().toLocaleTimeString('en-US'));
    if (!live) return;
    const timer = setInterval(() => {
      setStep((current) => current + 1);
      setUpdated(new Date().toLocaleTimeString('en-US'));
    }, 3200);
    return () => clearInterval(timer);
  }, [live]);

  const refresh = () => {
    setStep((current) => current + 1);
    setUpdated(new Date().toLocaleTimeString('en-US'));
  };

  const visitors = COUNTRIES.reduce((total, country) => total + country.visitors, 0);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-lg font-semibold">Realtime</h3>
        <p className="text-xs text-muted-foreground">
          Last 5 minutes{updated ? ` · Updated ${updated}` : null}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setLive((current) => !current)}>
          {live ? 'Pause updates' : 'Resume updates'}
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Refresh" onClick={refresh}>
          <RotateCwIcon />
        </Button>
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 text-card-foreground">
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Active visitors
          </p>
          <RollingNumber value={visitors} className="text-5xl font-semibold tracking-tight" />
        </div>

        <Planet defaultRotation={[82, 16]} className="-mt-10">
          <Planet.Globe label="Visitors by country">
            {COUNTRIES.map((country, index) => (
              <Planet.Marker
                key={country.name}
                lat={country.lat}
                lng={country.lng}
                label={country.name}
                count={country.visitors > 1 ? country.visitors : undefined}
              >
                <Face index={index} />
              </Planet.Marker>
            ))}
          </Planet.Globe>
          <Planet.Controls />
        </Planet>

        <p className="text-center text-sm text-muted-foreground">
          Approximate country locations, not precise visitor positions.
        </p>

        <dl className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">Events</dt>
            <dd className="text-2xl font-semibold">
              <RollingNumber value={EVENTS[step % EVENTS.length]} />
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">Countries</dt>
            <dd className="text-2xl font-semibold">{COUNTRIES.length}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

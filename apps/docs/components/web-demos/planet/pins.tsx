'use client';

import { Planet } from 'panelui-web/planet';

const OFFICES = [
  { city: 'London', lat: 51.51, lng: -0.13 },
  { city: 'Lagos', lat: 6.52, lng: 3.38 },
  { city: 'Dubai', lat: 25.2, lng: 55.27 },
  { city: 'Bengaluru', lat: 12.97, lng: 77.59 },
  { city: 'Singapore', lat: 1.35, lng: 103.82 },
];

export default function PlanetPins() {
  return (
    <Planet defaultRotation={[45, 18]} className="max-w-sm">
      <Planet.Globe label="Offices">
        {OFFICES.map((office) => (
          <Planet.Marker key={office.city} lat={office.lat} lng={office.lng} label={office.city} />
        ))}
      </Planet.Globe>
    </Planet>
  );
}

'use client';

import { Planet } from 'panelui-web/planet';

/** Where a remote team is working from this week. */
const TEAM = [
  { initials: 'IF', city: 'Lisbon', lat: 38.72, lng: -9.14 },
  { initials: 'TN', city: 'Nairobi', lat: -1.29, lng: 36.82 },
  { initials: 'KS', city: 'Tbilisi', lat: 41.72, lng: 44.79 },
  { initials: 'RA', city: 'Colombo', lat: 6.93, lng: 79.85 },
  { initials: 'MV', city: 'Helsinki', lat: 60.17, lng: 24.94 },
];

export default function PlanetPeople() {
  return (
    <Planet defaultRotation={[38, 20]} className="max-w-sm">
      <Planet.Globe label="Where the team is">
        {TEAM.map((person) => (
          <Planet.Marker key={person.initials} lat={person.lat} lng={person.lng} label={person.city}>
            <span className="text-[0.6875rem] font-semibold">
              {person.initials}
            </span>
          </Planet.Marker>
        ))}
      </Planet.Globe>
    </Planet>
  );
}

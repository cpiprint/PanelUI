'use client';

import { Planet } from 'panelui-web/planet';

export default function PlanetThumb() {
  return (
    <Planet autoRotate={10} interactive={false} defaultRotation={[20, 14]} className="w-44">
      <Planet.Globe label="Globe" color="info">
        <Planet.Marker lat={48.86} lng={2.35} color="success" />
        <Planet.Marker lat={-1.29} lng={36.82} color="warning" pulse />
        <Planet.Marker lat={35.68} lng={139.69} color="success" />
        <Planet.Marker lat={-23.55} lng={-46.63} color="info" />
      </Planet.Globe>
    </Planet>
  );
}

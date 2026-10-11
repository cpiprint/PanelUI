'use client';

import { Planet } from 'panelui-web/planet';

export default function PlanetTurning() {
  return (
    <Planet autoRotate={10} defaultRotation={[-40, 12]} className="max-w-xs">
      <Planet.Globe label="A turning globe" />
    </Planet>
  );
}

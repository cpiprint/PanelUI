'use client';

import { TiltCard } from 'panelui-web/tilt-card';

export default function TiltCardThumb() {
  return (
    <TiltCard className="w-44" cardClassName="flex flex-col items-center gap-4 p-5 [transform:rotateX(8deg)_rotateY(-12deg)]">
      <div className="relative h-16 w-24">
        <div className="absolute inset-x-3 top-5 h-10 rounded-lg border bg-muted" />
        <div className="absolute inset-x-1.5 top-2.5 h-10 rounded-lg border bg-card" />
        <div className="absolute inset-x-0 top-0 flex h-10 items-center gap-2 rounded-lg border bg-card px-2.5 shadow-md">
          <span className="size-2 rounded-full bg-(--success)" />
          <span className="h-1.5 w-10 rounded-full bg-muted-foreground/40" />
        </div>
      </div>
      <p className="text-sm font-semibold">Versions</p>
    </TiltCard>
  );
}

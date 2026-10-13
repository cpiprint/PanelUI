'use client';

import { TiltCard } from 'panelui-web/tilt-card';

export default function TiltCardPlain() {
  return (
    <TiltCard tilt={12} glare={false} className="w-full max-w-xs" cardClassName="p-5">
      <p className="text-sm text-muted-foreground">Team plan</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">
        €12 <span className="text-sm font-medium text-muted-foreground">a seat, monthly</span>
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        Shared notebooks, version history for a year, and single sign-on.
      </p>
    </TiltCard>
  );
}

'use client';

import { DatabaseIcon, GlobeIcon, ServerIcon, ShieldCheckIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Flow } from 'panelui-web/flow';

function Service({ icon, name, detail }: { icon: ReactNode; name: string; detail: string }) {
  return (
    <div className="flex w-48 items-center gap-3 rounded-xl border bg-card px-3 py-2.5 [&_svg]:size-4 [&_svg]:text-muted-foreground">
      {icon}
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

export default function FlowGroups() {
  return (
    <Flow fitViewOnMount label="Where a request goes" className="h-96 max-w-3xl">
      <Flow.Background variant="dots" />
      <Flow.Group id="edge" label="Edge" position={{ x: 320, y: 0 }} className="flex flex-col gap-2">
        <Service icon={<GlobeIcon />} name="Cache" detail="96 locations" />
        <Service icon={<ShieldCheckIcon />} name="Firewall" detail="Blocking 0.3%" />
      </Flow.Group>
      <Flow.Group id="core" label="Core" position={{ x: 0, y: 220 }} className="flex flex-col gap-2">
        <Service icon={<ServerIcon />} name="Application" detail="Six instances" />
        <Service icon={<DatabaseIcon />} name="Database" detail="One primary, two copies" />
      </Flow.Group>
      <Flow.Edge from="edge" to="core" variant="smoothstep" dashed arrow fromSide="bottom" toSide="top" />
      <Flow.Controls position="top-left" lock={false} />
      <Flow.MiniMap position="bottom-right" />
    </Flow>
  );
}

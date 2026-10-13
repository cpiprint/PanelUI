'use client';

import {
  ArchiveIcon,
  DatabaseIcon,
  GlobeIcon,
  HardDriveIcon,
  ServerIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { useCallback, useState, type ReactNode } from 'react';
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

/**
 * Whether the canvas has room to lay the graph out across. It is the canvas
 * that is measured and not the window: in a page with a sidebar the two are
 * far apart.
 */
function useRoom(least: number) {
  const [wide, setWide] = useState(true);
  const watch = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      const observer = new ResizeObserver(([entry]) => setWide(entry.contentRect.width >= least));
      observer.observe(node);
      return () => observer.disconnect();
    },
    [least]
  );
  return [wide, watch] as const;
}

export default function FlowGroups() {
  const [wide, watch] = useRoom(720);
  // Side by side where there is room, and one under the other where there is not.
  const from = wide ? 'right' : 'bottom';
  const to = wide ? 'left' : 'top';

  return (
    // Taller where the groups are stacked, so they are not shrunk to fit.
    <div ref={watch} className={wide ? 'h-[28rem] w-full' : 'h-[36rem] w-full'}>
      <Flow
        // Fitted afresh when the layout changes.
        key={wide ? 'across' : 'down'}
        fitViewOnMount
        fitViewPadding={wide ? 48 : 24}
        label="Where a request goes"
        className="h-full rounded-none border-0"
      >
        <Flow.Background variant="dots" />
        <Flow.Group
          id="edge"
          label="Edge"
          position={{ x: 0, y: 0 }}
          className="flex flex-col gap-2"
        >
          <Service icon={<GlobeIcon />} name="Cache" detail="96 locations" />
          <Service icon={<ShieldCheckIcon />} name="Firewall" detail="Blocking 0.3%" />
        </Flow.Group>
        <Flow.Group
          id="core"
          label="Core"
          position={wide ? { x: 330, y: 130 } : { x: 70, y: 200 }}
          className="flex flex-col gap-2"
        >
          <Service icon={<ServerIcon />} name="Application" detail="Six instances" />
          <Service icon={<DatabaseIcon />} name="Database" detail="One primary, two copies" />
        </Flow.Group>
        <Flow.Group
          id="store"
          label="Storage"
          position={wide ? { x: 660, y: 0 } : { x: 0, y: 400 }}
          className="flex flex-col gap-2"
        >
          <Service icon={<HardDriveIcon />} name="Uploads" detail="2.1 TB" />
          <Service icon={<ArchiveIcon />} name="Backups" detail="Every six hours" />
        </Flow.Group>
        <Flow.Edge
          from="edge"
          to="core"
          variant="smoothstep"
          dashed
          arrow
          fromSide={from}
          toSide={to}
        />
        <Flow.Edge
          from="core"
          to="store"
          variant="smoothstep"
          dashed
          arrow
          fromSide={from}
          toSide={to}
        />
        <Flow.Controls position="top-left" lock={false} />
        {/* The map is for a graph too big to see at once, which on a narrow screen this is not. */}
        {wide ? <Flow.MiniMap position="bottom-right" /> : null}
      </Flow>
    </div>
  );
}

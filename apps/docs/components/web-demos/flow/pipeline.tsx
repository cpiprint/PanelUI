'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flow } from 'panelui-web/flow';

/** An article on its way to being published. */
const STAGES = [
  { id: 'draft', name: 'Draft', detail: '1,840 words' },
  { id: 'edit', name: 'Edit', detail: 'Two rounds' },
  { id: 'check', name: 'Fact check', detail: '14 claims' },
  { id: 'legal', name: 'Legal read', detail: 'One quote to clear' },
  { id: 'schedule', name: 'Schedule', detail: 'Thursday, 09:00' },
  { id: 'publish', name: 'Publish', detail: 'Site and newsletter' },
];

const TAG = {
  done: 'bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-(--success)',
  live: 'bg-[color-mix(in_oklab,var(--info)_14%,transparent)] text-(--info)',
  waiting: 'bg-muted text-muted-foreground',
};

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

export default function FlowPipeline() {
  // The stage being worked on. Everything before it is done.
  const [at, setAt] = useState(1);
  const [wide, watch] = useRoom(720);
  const columns = wide ? 3 : 2;

  // The stages run along a row and back along the next, like a snake.
  const place = (index: number) => {
    const row = Math.floor(index / columns);
    const along = index % columns;
    const column = row % 2 ? columns - 1 - along : along;
    return { x: column * (wide ? 340 : 216), y: row * (wide ? 230 : 160) };
  };

  return (
    <div ref={watch} className="relative h-[34rem] w-full">
      <Flow
        // Laid out afresh, and fitted afresh, when the room for it changes.
        key={columns}
        fitViewOnMount
        fitViewPadding={wide ? 48 : 20}
        label="Article pipeline"
        className="h-full rounded-none border-0"
      >
        <Flow.Background variant="lines" gap={28} />
        {STAGES.map((stage, index) => {
          const state = index < at ? 'done' : index === at ? 'live' : 'waiting';
          return (
            <Flow.Node
              key={stage.id}
              id={stage.id}
              position={place(index)}
              className={wide ? 'w-52' : 'w-44'}
            >
              <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Stage {index + 1}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TAG[state]}`}>
                  {state === 'done' ? 'Done' : state === 'live' ? 'Now' : 'Waiting'}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-medium">{stage.name}</p>
                <p className="truncate text-sm text-muted-foreground">{stage.detail}</p>
              </div>
            </Flow.Node>
          );
        })}
        {STAGES.slice(1).map((stage, index) => (
          <Flow.Edge
            key={stage.id}
            from={STAGES[index].id}
            to={stage.id}
            variant="smoothstep"
            gap={10}
            arrow
            // Only the edge into the stage being worked on is marching.
            animated={index + 1 === at}
            color={index + 1 === at ? 'info' : undefined}
          />
        ))}
        {/* Fewer buttons where the graph needs the room. */}
        <Flow.Controls fit={wide} lock={wide} />
      </Flow>

      <div className="absolute bottom-3 left-3 flex gap-2">
        <Button variant="outline" size="sm" disabled={at === 0} onClick={() => setAt(at - 1)}>
          Back a stage
        </Button>
        <Button size="sm" disabled={at === STAGES.length - 1} onClick={() => setAt(at + 1)}>
          Advance
        </Button>
      </div>
    </div>
  );
}

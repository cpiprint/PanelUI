'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flow } from 'panelui-web/flow';

/** An article on its way to being published, one stage under the other. */
const STAGES = [
  { id: 'draft', name: 'Draft', detail: '1,840 words', x: 40, y: 20 },
  { id: 'edit', name: 'Edit', detail: 'Two rounds', x: 40, y: 170 },
  { id: 'check', name: 'Fact check', detail: '14 claims', x: 170, y: 320 },
  { id: 'publish', name: 'Publish', detail: 'Thursday, 09:00', x: 40, y: 470 },
];

const TAG = {
  done: 'bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-(--success)',
  live: 'bg-[color-mix(in_oklab,var(--info)_14%,transparent)] text-(--info)',
  waiting: 'bg-muted text-muted-foreground',
};

export default function FlowPipeline() {
  // The stage being worked on. Everything before it is done.
  const [at, setAt] = useState(1);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <Flow fitViewOnMount label="Article pipeline" className="h-[30rem]">
        <Flow.Background variant="lines" gap={28} />
        {STAGES.map((stage, index) => {
          const state = index < at ? 'done' : index === at ? 'live' : 'waiting';
          return (
            <Flow.Node key={stage.id} id={stage.id} position={{ x: stage.x, y: stage.y }} className="w-56">
              <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Stage {index + 1}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TAG[state]}`}>
                  {state === 'done' ? 'Done' : state === 'live' ? 'Now' : 'Waiting'}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-medium">{stage.name}</p>
                <p className="text-sm text-muted-foreground">{stage.detail}</p>
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
            gap={14}
            arrow
            // Only the edge into the stage being worked on is marching.
            animated={index + 1 === at}
            color={index + 1 === at ? 'info' : undefined}
          />
        ))}
        <Flow.Controls />
      </Flow>

      <div className="flex gap-2">
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

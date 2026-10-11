'use client';

import { FoldStack, type FoldStackColor } from 'panelui-web/fold-stack';

interface Stage {
  id: string;
  name: string;
  state: string;
  color: FoldStackColor;
  /** Three short facts about the stage. */
  facts: [string, string][];
  detail: string;
}

const STAGES: Stage[] = [
  {
    id: 'build',
    name: 'Build',
    state: 'Passed',
    color: 'success',
    facts: [
      ['Time', '2 min 14 s'],
      ['Modules', '1,284'],
      ['Bundle', '\u22124 kB'],
    ],
    detail: 'Built with a warm cache. The bundle is smaller than the last one.',
  },
  {
    id: 'test',
    name: 'Test',
    state: '2 failing',
    color: 'destructive',
    facts: [
      ['Passed', '316'],
      ['Failed', '2'],
      ['Time', '4 min 02 s'],
    ],
    detail: 'Both failures are in the date picker, and both expect a week that starts on Sunday.',
  },
  {
    id: 'review',
    name: 'Review',
    state: 'Waiting',
    color: 'warning',
    facts: [
      ['Approved', '1 of 2'],
      ['Comments', '5'],
      ['Open for', '3 h'],
    ],
    detail: 'The design owner has approved. The platform owner has not answered yet.',
  },
  {
    id: 'ship',
    name: 'Ship',
    state: 'Queued',
    color: 'info',
    facts: [
      ['First', '5% of users'],
      ['Then', 'Everyone'],
      ['After', '1 h'],
    ],
    detail: 'Goes out in two steps, and the second waits for errors to stay flat.',
  },
];

export default function FoldStackPipeline() {
  return (
    <FoldStack defaultValue="test" label="Pipeline stages" className="max-w-sm">
      {STAGES.map((stage) => (
        <FoldStack.Item key={stage.id} value={stage.id} label={stage.name} color={stage.color}>
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-tight">{stage.name}</h3>
              <p className="text-sm text-muted-foreground">{stage.state}</p>
            </div>
            <dl className="grid grid-cols-3 gap-2">
              {stage.facts.map(([term, fact]) => (
                <div key={term} className="rounded-xl bg-muted px-3 py-2">
                  <dt className="text-xs text-muted-foreground">{term}</dt>
                  <dd className="text-sm font-semibold">{fact}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-muted-foreground">{stage.detail}</p>
          </div>
        </FoldStack.Item>
      ))}
    </FoldStack>
  );
}

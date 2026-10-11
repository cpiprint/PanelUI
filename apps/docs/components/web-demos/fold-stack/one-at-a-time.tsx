'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FoldStack } from 'panelui-web/fold-stack';

const STEPS = [
  {
    id: 'invite',
    tab: 'Invite',
    title: 'Invite your team',
    body: 'Anyone with an address at your domain can join without being asked twice.',
  },
  {
    id: 'connect',
    tab: 'Connect',
    title: 'Connect a repository',
    body: 'Read access is enough to start. Write access is only needed for automatic fixes.',
  },
  {
    id: 'notify',
    tab: 'Notify',
    title: 'Choose where alerts go',
    body: 'One channel for failures is usually plenty. You can split them up later.',
  },
];

export default function FoldStackOneAtATime() {
  const [step, setStep] = useState(STEPS[0].id);

  return (
    <FoldStack value={step} onValueChange={setStep} label="Setup steps" className="max-w-sm">
      {STEPS.map((entry, index) => (
        <FoldStack.Item key={entry.id} value={entry.id} label={entry.tab}>
          <div className="flex h-full flex-col items-start gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Step {index + 1} of {STEPS.length}
            </p>
            <h3 className="text-lg font-semibold tracking-tight">{entry.title}</h3>
            <p className="text-sm text-muted-foreground">{entry.body}</p>
            {index < STEPS.length - 1 ? (
              <Button size="sm" className="mt-2" onClick={() => setStep(STEPS[index + 1].id)}>
                Continue
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => setStep(STEPS[0].id)}
              >
                Start again
              </Button>
            )}
          </div>
        </FoldStack.Item>
      ))}
    </FoldStack>
  );
}

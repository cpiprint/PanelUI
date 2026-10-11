'use client';

import { BellIcon, GitBranchIcon, UsersIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FoldStack } from 'panelui-web/fold-stack';

const STEPS = [
  {
    id: 'invite',
    icon: <UsersIcon />,
    title: 'Invite your team',
    body: 'Anyone with an address at your domain can join without being asked twice.',
  },
  {
    id: 'connect',
    icon: <GitBranchIcon />,
    title: 'Connect a repository',
    body: 'Read access is enough to start. Write access is only needed for automatic fixes.',
  },
  {
    id: 'notify',
    icon: <BellIcon />,
    title: 'Choose where alerts go',
    body: 'One channel for failures is usually plenty. You can split them up later.',
  },
];

export default function FoldStackSteps() {
  const [step, setStep] = useState(STEPS[0].id);

  return (
    <FoldStack value={step} onValueChange={setStep} className="max-w-sm">
      {STEPS.map((entry, index) => (
        <FoldStack.Item key={entry.id} value={entry.id}>
          <FoldStack.Summary icon={entry.icon} value={`${index + 1}/${STEPS.length}`}>
            {entry.title}
          </FoldStack.Summary>
          <FoldStack.Panel className="flex flex-col items-start gap-2">
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
          </FoldStack.Panel>
        </FoldStack.Item>
      ))}
    </FoldStack>
  );
}

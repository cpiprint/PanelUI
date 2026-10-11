'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PillStack } from 'panelui-web/pill-stack';

const STEPS = [
  {
    id: 'account',
    title: 'Create your account',
    body: 'An email address and a password. You can add a team later.',
  },
  {
    id: 'project',
    title: 'Name your first project',
    body: 'A project holds the feedback for one app. Most teams start with one.',
  },
  {
    id: 'install',
    title: 'Install the SDK',
    body: 'One package and one key. The quickstart takes about five minutes.',
  },
];

export default function PillStackSteps() {
  // Held here, so the buttons inside each panel can move the stack on.
  const [step, setStep] = useState('account');

  return (
    <PillStack value={step} onValueChange={setStep} className="max-w-md">
      {STEPS.map((item, position) => (
        <PillStack.Item key={item.id} value={item.id} className="border">
          <PillStack.Pill className="px-6">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-sm font-medium tabular-nums">
              {position + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{item.title}</span>
          </PillStack.Pill>
          <PillStack.Panel className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-sm text-muted-foreground">
                Step {position + 1} of {STEPS.length}
              </p>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-muted-foreground">{item.body}</p>
            </div>
            <div className="flex gap-2">
              {position > 0 ? (
                <Button variant="outline" size="sm" onClick={() => setStep(STEPS[position - 1].id)}>
                  Back
                </Button>
              ) : null}
              {position < STEPS.length - 1 ? (
                <Button size="sm" onClick={() => setStep(STEPS[position + 1].id)}>
                  Continue
                </Button>
              ) : null}
            </div>
          </PillStack.Panel>
        </PillStack.Item>
      ))}
    </PillStack>
  );
}

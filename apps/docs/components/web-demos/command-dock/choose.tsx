'use client';

import { useState } from 'react';
import { CommandDock } from 'panelui-web/command-dock';

const ACTIONS = ['Invite someone', 'Start a new notebook', 'Export this page', 'Open settings'];

export default function CommandDockChoose() {
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const matches = ACTIONS.filter((action) => action.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex min-h-72 w-full flex-col items-center gap-3">
      <CommandDock open={open} onOpenChange={setOpen} value={query} onValueChange={setQuery}>
        <CommandDock.Trigger>Do something</CommandDock.Trigger>
        <CommandDock.Panel>
          <CommandDock.Input placeholder="Type to narrow the list" aria-label="Find an action" />
          <CommandDock.Results label="Actions">
            {matches.map((action) => (
              <CommandDock.Row
                key={action}
                onSelect={() => {
                  setChosen(action);
                  setOpen(false);
                }}
              >
                {action}
              </CommandDock.Row>
            ))}
          </CommandDock.Results>
        </CommandDock.Panel>
      </CommandDock>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {chosen ? `Chosen: ${chosen}` : 'Nothing chosen yet.'}
      </p>
    </div>
  );
}

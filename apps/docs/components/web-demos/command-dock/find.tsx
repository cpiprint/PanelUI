'use client';

import { FileTextIcon, SearchIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { CommandDock } from 'panelui-web/command-dock';

/** What a search of some meeting notes might turn up. */
const NOTES = [
  { title: 'Pricing review', where: 'Notes from 3 March' },
  { title: 'What we decided about trials', where: 'Notes from 19 February' },
  { title: 'Questions for finance', where: 'Notes from 11 February' },
  { title: 'Draft of the pricing page', where: 'Shared by Imani' },
];

export default function CommandDockFind() {
  const [found, setFound] = useState<typeof NOTES>([]);
  const [busy, setBusy] = useState(false);
  const timers = useRef<number[]>([]);

  // Stands in for a search that answers a row at a time.
  const find = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    setFound([]);
    setBusy(true);
    timers.current = NOTES.map((note, index) =>
      window.setTimeout(() => {
        setFound((current) => [...current, note]);
        if (index === NOTES.length - 1) setBusy(false);
      }, 500 + index * 450)
    );
  };

  return (
    <CommandDock onSubmit={find} busy={busy} closedWidth="10.5rem" className="min-h-72 items-start">
      <CommandDock.Trigger>
        <SearchIcon />
        Search the notes
      </CommandDock.Trigger>
      <CommandDock.Panel>
        <CommandDock.Input placeholder="Try: pricing" aria-label="Search the notes" />
        <CommandDock.Results label="Notes found">
          {found.map((note) => (
            <CommandDock.Row key={note.title}>
              <FileTextIcon />
              <span className="min-w-0 flex-1 truncate font-medium">{note.title}</span>
              <span className="shrink-0 text-muted-foreground">{note.where}</span>
            </CommandDock.Row>
          ))}
          {busy ? <CommandDock.Status>Reading the notes</CommandDock.Status> : null}
        </CommandDock.Results>
      </CommandDock.Panel>
    </CommandDock>
  );
}

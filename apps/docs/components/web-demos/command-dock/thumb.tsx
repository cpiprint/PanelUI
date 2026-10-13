'use client';

import { FileTextIcon } from 'lucide-react';
import { CommandDock } from 'panelui-web/command-dock';

export default function CommandDockThumb() {
  return (
    <div className="w-80 shrink-0 scale-[0.72]">
      <CommandDock defaultOpen value="pricing">
        <CommandDock.Panel>
          <CommandDock.Input aria-label="Search" />
          <CommandDock.Results>
            <CommandDock.Row>
              <FileTextIcon />
              Pricing review
            </CommandDock.Row>
            <CommandDock.Row>
              <FileTextIcon />
              Questions for finance
            </CommandDock.Row>
          </CommandDock.Results>
        </CommandDock.Panel>
      </CommandDock>
    </div>
  );
}

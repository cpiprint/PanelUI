'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flow, type FlowConnection } from 'panelui-web/flow';

const NODES = [
  { id: 'form', name: 'Sign-up form', x: 20, y: 40 },
  { id: 'verify', name: 'Verify email', x: 300, y: 10 },
  { id: 'welcome', name: 'Welcome message', x: 300, y: 150 },
  { id: 'crm', name: 'Add to CRM', x: 580, y: 80 },
];

const START: FlowConnection[] = [{ source: 'form', target: 'verify' }];

export default function FlowWiring() {
  const [wires, setWires] = useState(START);

  const joined = (a: FlowConnection, b: FlowConnection) =>
    a.source === b.source && a.target === b.target;

  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <Flow
        fitViewOnMount
        label="Sign-up automation"
        className="h-80"
        // Two nodes are joined once. A second wire between them is refused.
        isValidConnection={(connection) => !wires.some((wire) => joined(wire, connection))}
        onConnect={(connection) => setWires((current) => [...current, connection])}
      >
        <Flow.Background />
        {NODES.map((node) => (
          <Flow.Node key={node.id} id={node.id} position={{ x: node.x, y: node.y }} className="px-4 py-3">
            <p className="whitespace-nowrap text-sm font-medium">{node.name}</p>
            <Flow.Handle position="left" />
            <Flow.Handle position="right" />
          </Flow.Node>
        ))}
        {wires.map((wire) => (
          <Flow.Edge
            key={`${wire.source}-${wire.target}`}
            from={wire.source}
            to={wire.target}
            arrow
            fromSide="right"
            toSide="left"
          />
        ))}
        <Flow.Controls lock={false} />
      </Flow>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Drag from a dot on one step to another step to join them. {wires.length} joined.
        </p>
        <Button variant="outline" size="sm" onClick={() => setWires(START)}>
          Reset
        </Button>
      </div>
    </div>
  );
}

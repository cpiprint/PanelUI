'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { LaneBoard, type LaneBoardColor, type LaneBoardLane } from 'panelui-web/lane-board';

type Priority = 'Low' | 'Normal' | 'Urgent';

interface Ticket {
  id: string;
  title: string;
  priority: Priority;
  /** Whose it is, as initials. */
  owner: string;
  /** How many of its four checks have passed. */
  checks: number;
}

const TONE: Record<Priority, LaneBoardColor> = {
  Low: 'primary',
  Normal: 'info',
  Urgent: 'destructive',
};

/** One sprint of a support team. Each lane has a colour, and two have a limit. */
const START: LaneBoardLane<Ticket>[] = [
  {
    id: 'inbox',
    title: 'Inbox',
    color: 'primary',
    cards: [
      { id: 'SUP-481', title: 'Refund not showing', priority: 'Urgent', owner: 'NO', checks: 0 },
      { id: 'SUP-479', title: 'Change the invoice name', priority: 'Low', owner: 'HL', checks: 0 },
    ],
  },
  {
    id: 'working',
    title: 'Working on',
    color: 'info',
    limit: 2,
    cards: [
      { id: 'SUP-472', title: 'Login loop on tablets', priority: 'Urgent', owner: 'TA', checks: 2 },
      { id: 'SUP-476', title: 'Export stops at row 500', priority: 'Normal', owner: 'NO', checks: 1 },
    ],
  },
  {
    id: 'waiting',
    title: 'Waiting on customer',
    color: 'warning',
    limit: 3,
    cards: [{ id: 'SUP-468', title: 'Which plan were you on?', priority: 'Normal', owner: 'HL', checks: 3 }],
  },
  {
    id: 'solved',
    title: 'Solved',
    color: 'success',
    cards: [{ id: 'SUP-461', title: 'Password reset email', priority: 'Low', owner: 'TA', checks: 4 }],
  },
];

export default function LaneBoardSprint() {
  const [lanes, setLanes] = useState(START);
  const [made, setMade] = useState(0);

  const add = (laneId: string) => {
    const id = `SUP-${482 + made}`;
    setMade(made + 1);
    setLanes((current) =>
      current.map((lane) =>
        lane.id === laneId
          ? {
              ...lane,
              cards: [...lane.cards, { id, title: 'New ticket', priority: 'Normal', owner: 'NO', checks: 0 }],
            }
          : lane
      )
    );
  };

  return (
    <LaneBoard
      lanes={lanes}
      onLanesChange={setLanes}
      label="Support sprint"
      cardName={(ticket) => ticket.title}
      renderCard={(ticket) => (
        <>
          <div className="flex items-start justify-between gap-3">
            <LaneBoard.Title className="whitespace-normal text-sm leading-snug">
              {ticket.title}
            </LaneBoard.Title>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-semibold text-muted-foreground">
              {ticket.owner}
            </span>
          </div>
          <LaneBoard.Code className="text-xs">{ticket.id}</LaneBoard.Code>
          <LaneBoard.Row>
            <LaneBoard.Tag color={TONE[ticket.priority]}>{ticket.priority}</LaneBoard.Tag>
            <LaneBoard.Steps value={ticket.checks} max={4} color="success" label="Checks passed" />
          </LaneBoard.Row>
        </>
      )}
      renderLaneFooter={(lane) =>
        lane.id === 'inbox' ? (
          <button
            type="button"
            onClick={() => add(lane.id)}
            className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-2xl text-sm text-muted-foreground outline-none transition-colors hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PlusIcon className="size-4" />
            Add a ticket
          </button>
        ) : null
      }
    />
  );
}

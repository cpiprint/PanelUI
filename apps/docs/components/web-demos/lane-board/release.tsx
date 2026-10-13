'use client';

import { useState } from 'react';
import { LaneBoard, type LaneBoardLane } from 'panelui-web/lane-board';

interface Change {
  id: string;
  title: string;
  /** How many of the five checks have passed. */
  checks: number;
  /** How long it has been in its lane. */
  waiting: string;
}

/** The changes going into one release, by how far along each is. */
const START: LaneBoardLane<Change>[] = [
  {
    id: 'queued',
    title: 'Queued',
    cards: [
      { id: 'REL-231', title: 'Offline drafts', checks: 0, waiting: '2d' },
      { id: 'REL-238', title: 'Export to CSV', checks: 1, waiting: '5h' },
    ],
  },
  {
    id: 'building',
    title: 'Building',
    cards: [
      { id: 'REL-224', title: 'Faster search', checks: 2, waiting: '1d' },
      { id: 'REL-229', title: 'Invite by link', checks: 3, waiting: '3h' },
      { id: 'REL-233', title: 'Keyboard shortcuts', checks: 2, waiting: '40m' },
      { id: 'REL-236', title: 'Saved filters', checks: 1, waiting: '25m' },
      { id: 'REL-240', title: 'Bulk archive', checks: 0, waiting: '10m' },
    ],
  },
  {
    id: 'review',
    title: 'In review',
    cards: [{ id: 'REL-219', title: 'Audit log', checks: 4, waiting: '6h' }],
  },
  {
    id: 'shipped',
    title: 'Shipped',
    cards: [
      { id: 'REL-207', title: 'Two-step sign in', checks: 5, waiting: '' },
      { id: 'REL-212', title: 'Dark charts', checks: 5, waiting: '' },
    ],
  },
];

export default function LaneBoardRelease() {
  const [lanes, setLanes] = useState(START);

  return (
    <LaneBoard
      lanes={lanes}
      onLanesChange={setLanes}
      label="Release 4.2"
      height="30rem"
      cardName={(change) => change.title}
      renderCard={(change, { lane }) => (
        <>
          <LaneBoard.Title>{change.title}</LaneBoard.Title>
          <LaneBoard.Code>{change.id}</LaneBoard.Code>
          <LaneBoard.Row>
            <LaneBoard.Steps value={change.checks} color="info" label="Checks passed" />
            {lane.id === 'shipped' ? (
              <LaneBoard.Tag color="success">Live</LaneBoard.Tag>
            ) : (
              <LaneBoard.Meta>{change.waiting}</LaneBoard.Meta>
            )}
          </LaneBoard.Row>
        </>
      )}
    />
  );
}

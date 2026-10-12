'use client';

import { LaneBoard, type LaneBoardLane } from 'panelui-web/lane-board';

interface Item {
  id: string;
  title: string;
  steps: number;
}

const LANES: LaneBoardLane<Item>[] = [
  {
    id: 'a',
    title: 'Building',
    cards: [
      { id: 'A-1', title: 'Faster search', steps: 2 },
      { id: 'A-2', title: 'Invite by link', steps: 3 },
    ],
  },
  { id: 'b', title: 'Shipped', cards: [{ id: 'B-1', title: 'Audit log', steps: 5 }] },
];

export default function LaneBoardThumb() {
  return (
    <div className="w-[30rem] shrink-0 scale-[0.6]">
      <LaneBoard
        defaultLanes={LANES}
        renderCard={(item) => (
          <>
            <LaneBoard.Title>{item.title}</LaneBoard.Title>
            <LaneBoard.Code>{item.id}</LaneBoard.Code>
            <LaneBoard.Row>
              <LaneBoard.Steps value={item.steps} color="info" />
            </LaneBoard.Row>
          </>
        )}
      />
    </div>
  );
}

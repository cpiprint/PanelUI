'use client';

import { useState } from 'react';
import { LaneBoard, type LaneBoardLane } from 'panelui-web/lane-board';

interface Task {
  id: string;
  title: string;
  /** How many of its three steps are done. */
  done: number;
}

const START: LaneBoardLane<Task>[] = [
  {
    id: 'todo',
    title: 'To do',
    cards: [
      { id: 'T-14', title: 'Write the migration', done: 1 },
      { id: 'T-17', title: 'Update the runbook', done: 3 },
    ],
  },
  { id: 'doing', title: 'Doing', cards: [{ id: 'T-11', title: 'Rotate the keys', done: 2 }] },
  { id: 'done', title: 'Done', cards: [] },
];

export default function LaneBoardRules() {
  const [lanes, setLanes] = useState(START);
  const [refused, setRefused] = useState<string | null>(null);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <LaneBoard
        lanes={lanes}
        // The board proposes and this decides: a task with steps left is not
        // let into Done, by not applying the lanes it was offered.
        onLanesChange={(next) => {
          const unfinished = next
            .find((lane) => lane.id === 'done')
            ?.cards.find((task) => task.done < 3);
          if (unfinished) {
            setRefused(unfinished.title);
            return;
          }
          setRefused(null);
          setLanes(next);
        }}
        cardName={(task) => task.title}
        renderCard={(task) => (
          <>
            <LaneBoard.Title>{task.title}</LaneBoard.Title>
            <LaneBoard.Row>
              <LaneBoard.Steps value={task.done} max={3} color="success" label="Steps done" />
              <LaneBoard.Meta>{task.done}/3</LaneBoard.Meta>
            </LaneBoard.Row>
          </>
        )}
      />
      <p className="min-h-5 text-sm text-muted-foreground" aria-live="polite">
        {refused ? `${refused} still has steps left, so it stays where it was.` : 'Only a task with all three steps done can go to Done.'}
      </p>
    </div>
  );
}

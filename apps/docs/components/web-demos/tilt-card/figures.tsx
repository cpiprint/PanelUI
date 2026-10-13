'use client';

import type { ReactNode } from 'react';
import { TiltCard, type TiltCardColor } from 'panelui-web/tilt-card';

/** Three sheets, one over the other, each lifted further off the card. */
function Sheets() {
  return (
    <div className="relative h-24 w-28">
      <TiltCard.Layer depth={6} className="absolute inset-x-4 top-8 h-14 rounded-xl border bg-muted" />
      <TiltCard.Layer depth={18} className="absolute inset-x-2 top-4 h-14 rounded-xl border bg-card shadow-sm" />
      <TiltCard.Layer
        depth={32}
        className="absolute inset-x-0 top-0 flex h-14 items-center gap-2 rounded-xl border bg-card px-3 shadow-md"
      >
        <span className="size-2 rounded-full bg-(--success)" />
        <span className="h-1.5 w-12 rounded-full bg-muted-foreground/40" />
      </TiltCard.Layer>
    </div>
  );
}

/** Two rings and a body on the outer one. */
function Orbit() {
  return (
    <div className="relative size-24">
      <TiltCard.Layer depth={6} className="absolute inset-0 rounded-full border border-dashed border-muted-foreground/40" />
      <TiltCard.Layer depth={16} className="absolute inset-5 rounded-full border border-muted-foreground/50" />
      <TiltCard.Layer depth={28} className="absolute inset-9 rounded-full bg-foreground" />
      <TiltCard.Layer depth={36} className="absolute -top-1 left-1/2 size-3 -translate-x-1/2 rounded-full bg-(--info)" />
    </div>
  );
}

/** A field of marks, with one of them picked out and nearer. */
function Field() {
  return (
    <div className="relative grid size-24 grid-cols-4 gap-2.5">
      {Array.from({ length: 16 }, (_, index) =>
        index === 6 ? (
          <TiltCard.Layer key={index} depth={34} className="rounded-md bg-(--warning) shadow-md" />
        ) : (
          <TiltCard.Layer key={index} depth={index % 3 === 0 ? 14 : 6} className="rounded-md bg-muted-foreground/25" />
        )
      )}
    </div>
  );
}

const CARDS: { title: string; body: string; color: TiltCardColor; figure: ReactNode }[] = [
  { title: 'Versions', body: 'Every save is kept, and any of them can be brought back.', color: 'success', figure: <Sheets /> },
  { title: 'Sync', body: 'Changes reach your other devices within a few seconds.', color: 'info', figure: <Orbit /> },
  { title: 'Search', body: 'One box finds a word in any note, however old.', color: 'warning', figure: <Field /> },
];

export default function TiltCardFigures() {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
      {CARDS.map((card) => (
        <TiltCard key={card.title} color={card.color} cardClassName="flex h-full flex-col gap-6 p-5">
          <div className="flex h-32 items-center justify-center">{card.figure}</div>
          <TiltCard.Layer depth={10} className="flex flex-col gap-1">
            <h3 className="text-base font-semibold">{card.title}</h3>
            <p className="text-sm text-muted-foreground">{card.body}</p>
          </TiltCard.Layer>
        </TiltCard>
      ))}
    </div>
  );
}

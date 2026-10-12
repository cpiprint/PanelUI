'use client';

/**
 * LaneBoard — lanes side by side, each holding cards that can be dragged
 * within a lane and from one lane to another.
 *
 * ```tsx
 * <LaneBoard
 *   lanes={lanes}
 *   onLanesChange={setLanes}
 *   renderCard={(card) => (
 *     <>
 *       <LaneBoard.Title>{card.title}</LaneBoard.Title>
 *       <LaneBoard.Code>{card.code}</LaneBoard.Code>
 *     </>
 *   )}
 * />
 * ```
 *
 * ## The data is yours
 *
 * The board is given the lanes and their cards and says what they should
 * become. It keeps nothing you did not give it, so the order on screen is the
 * order in your state, and a move can be refused by not applying it.
 *
 * ## A card is carried, and the rest make room
 *
 * A dragged card is lifted off the board and follows the pointer. Where it
 * came from closes up, and a gap opens where it would land if it were let go
 * now, with the cards round it sliding to their new places. Nothing is
 * decided until the pointer is released, and Escape puts everything back.
 *
 * ## It works without a pointer
 *
 * Space or Enter on a card picks it up. The arrow keys then move it, up and
 * down within its lane and left and right between lanes. Space or Enter sets
 * it down, Escape puts it back, and each step is said to a screen reader.
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { tv } from 'tailwind-variants';

/** Which of the theme's roles a part is drawn in. */
export type LaneBoardColor = 'primary' | 'info' | 'success' | 'warning' | 'destructive';

/** A card is anything with an id that is its own across the whole board. */
export interface LaneBoardCard {
  id: string;
}

export interface LaneBoardLane<T extends LaneBoardCard = LaneBoardCard> {
  id: string;
  /** Written at the head of the lane. */
  title: ReactNode;
  cards: T[];
}

/** One card going from one place to another. */
export interface LaneBoardMove<T extends LaneBoardCard = LaneBoardCard> {
  card: T;
  from: { lane: string; index: number };
  to: { lane: string; index: number };
}

const laneBoardVariants = tv({
  slots: {
    // Lanes share the width when there is room and scroll sideways, one lane
    // at a time, when there is not.
    root: 'relative flex w-full snap-x gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]',
    lane: 'flex min-w-52 flex-1 shrink-0 snap-start flex-col gap-2 rounded-3xl bg-muted p-2 transition-colors duration-200',
    laneHeader: 'flex items-center justify-between gap-3 px-2.5 pt-1.5 text-sm',
    laneTitle: 'truncate font-medium text-muted-foreground',
    laneCount: 'tabular-nums text-muted-foreground',
    // Tall enough when empty to be somewhere a card can be dropped.
    list: 'flex min-h-20 flex-1 flex-col gap-2',
    card: 'flex cursor-grab touch-manipulation select-none flex-col gap-1 rounded-2xl border bg-card p-4 text-card-foreground shadow-xs outline-none transition-[box-shadow,opacity] duration-150 focus-visible:ring-2 focus-visible:ring-ring',
    overlay:
      'pointer-events-none fixed left-0 top-0 z-50 flex rotate-2 cursor-grabbing flex-col gap-1 rounded-2xl border bg-card p-4 text-card-foreground shadow-xl',
    title: 'truncate text-base font-semibold',
    code: 'truncate font-mono text-sm text-muted-foreground',
    row: 'mt-2 flex items-center justify-between gap-3',
    steps: 'flex items-center gap-1',
    step: 'h-1 w-4 rounded-full',
    tag: 'inline-flex items-center rounded-full border border-[color-mix(in_oklab,var(--pu-color)_35%,transparent)] bg-[color-mix(in_oklab,var(--pu-color)_14%,transparent)] px-2 py-0.5 text-xs font-medium text-[var(--pu-color)]',
    meta: 'font-mono text-sm tabular-nums text-foreground',
  },
  variants: {
    color: {
      primary: { steps: '[--pu-color:var(--primary)]', tag: '[--pu-color:var(--primary)]' },
      info: { steps: '[--pu-color:var(--info)]', tag: '[--pu-color:var(--info)]' },
      success: { steps: '[--pu-color:var(--success)]', tag: '[--pu-color:var(--success)]' },
      warning: { steps: '[--pu-color:var(--warning)]', tag: '[--pu-color:var(--warning)]' },
      destructive: {
        steps: '[--pu-color:var(--destructive)]',
        tag: '[--pu-color:var(--destructive)]',
      },
    },
    // The lane a carried card is over.
    over: { true: { lane: 'bg-accent ring-1 ring-ring/40' } },
    state: {
      rest: {},
      // Where a carried card would land: its room is kept, its drawing is not.
      placeholder: { card: 'opacity-0' },
      // Picked up with the keyboard: it stays where it is and is ringed.
      held: { card: 'cursor-grabbing shadow-lg ring-2 ring-ring' },
    },
    lit: {
      true: { step: 'bg-[var(--pu-color)]' },
      false: { step: 'bg-muted-foreground/20' },
    },
  },
  defaultVariants: { color: 'primary', state: 'rest' },
});

/** How far a mouse has to move before a press becomes a drag, in pixels. */
const SLOP = 4;
/** How long a finger has to rest on a card before it is picked up, in milliseconds. */
const HOLD = 220;
/** How near an edge of the board the pointer has to be for it to scroll, in pixels. */
const EDGE = 48;

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The lanes with one card taken out and put somewhere else. */
function moved<T extends LaneBoardCard>(
  lanes: LaneBoardLane<T>[],
  id: string,
  toLane: string,
  toIndex: number
): LaneBoardLane<T>[] {
  let card: T | undefined;
  const without = lanes.map((lane) => {
    const found = lane.cards.find((entry) => entry.id === id);
    if (!found) return lane;
    card = found;
    return { ...lane, cards: lane.cards.filter((entry) => entry.id !== id) };
  });
  if (!card) return lanes;
  const carried = card;
  return without.map((lane) => {
    if (lane.id !== toLane) return lane;
    const cards = [...lane.cards];
    cards.splice(Math.min(Math.max(0, toIndex), cards.length), 0, carried);
    return { ...lane, cards };
  });
}

function whereIs<T extends LaneBoardCard>(lanes: LaneBoardLane<T>[], id: string) {
  for (const lane of lanes) {
    const index = lane.cards.findIndex((card) => card.id === id);
    if (index >= 0) return { lane: lane.id, index, card: lane.cards[index] as T };
  }
  return null;
}

export interface LaneBoardProps<T extends LaneBoardCard>
  extends Omit<ComponentProps<'div'>, 'children' | 'onChange'> {
  /** The lanes and their cards, when the caller holds them. */
  lanes?: LaneBoardLane<T>[];
  /** The lanes to begin with, when the caller does not hold them. */
  defaultLanes?: LaneBoardLane<T>[];
  /** Called with the lanes as they should now be, when a card is set down somewhere new. */
  onLanesChange?: (lanes: LaneBoardLane<T>[]) => void;
  /** Called with the one card that moved, and where from and to. */
  onMove?: (move: LaneBoardMove<T>) => void;
  /** Draws the inside of a card. */
  renderCard: (card: T, state: { lane: LaneBoardLane<T>; carried: boolean }) => ReactNode;
  /** What a screen reader calls a card, where its id would not mean much. */
  cardName?: (card: T) => string;
  /** What a screen reader calls the board. */
  label?: string;
}

function LaneBoardRoot<T extends LaneBoardCard>({
  lanes: controlled,
  defaultLanes,
  onLanesChange,
  onMove,
  renderCard,
  cardName = (card) => card.id,
  label = 'Board',
  className,
  ...props
}: LaneBoardProps<T>) {
  const slots = laneBoardVariants();
  const [internal, setInternal] = useState<LaneBoardLane<T>[]>(defaultLanes ?? []);
  const settled = controlled ?? internal;

  /** The lanes as they would be if the carried card were set down now. */
  const [draft, setDraft] = useState<LaneBoardLane<T>[] | null>(null);
  /** The card being carried, and whether by the pointer or the keyboard. */
  const [carry, setCarry] = useState<{ id: string; by: 'pointer' | 'keys' } | null>(null);
  const [said, setSaid] = useState('');
  const shown = draft ?? settled;

  const root = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLElement>());
  const lists = useRef(new Map<string, HTMLElement>());
  const places = useRef(new Map<string, { x: number; y: number }>());
  /** Everything about a pointer drag that changes too often to be state. */
  const drag = useRef<{
    id: string;
    pointerId: number;
    startX: number;
    startY: number;
    grabX: number;
    grabY: number;
    x: number;
    y: number;
    width: number;
    started: boolean;
    timer: number;
    frame: number;
  } | null>(null);
  const latest = useRef({ settled, draft });
  latest.current = { settled, draft };

  const commit = useCallback(
    (next: LaneBoardLane<T>[], id: string) => {
      const from = whereIs(latest.current.settled, id);
      const to = whereIs(next, id);
      if (!from || !to) return;
      if (from.lane === to.lane && from.index === to.index) return;
      if (controlled === undefined) setInternal(next);
      onLanesChange?.(next);
      onMove?.({
        card: from.card,
        from: { lane: from.lane, index: from.index },
        to: { lane: to.lane, index: to.index },
      });
    },
    [controlled, onLanesChange, onMove]
  );

  /*
   * Cards slide to where they now belong. Each card's place is remembered from
   * one drawing to the next; a card found somewhere else is started from where
   * it was and let go. Places are kept relative to the board and its scroll,
   * so scrolling the page between two drawings moves nothing.
   */
  useLayoutEffect(() => {
    const board = root.current;
    if (!board) return;
    const origin = board.getBoundingClientRect();
    const still = reducedMotion();
    const next = new Map<string, { x: number; y: number }>();
    cards.current.forEach((node, id) => {
      const box = node.getBoundingClientRect();
      const place = { x: box.left - origin.left + board.scrollLeft, y: box.top - origin.top };
      next.set(id, place);
      const before = places.current.get(id);
      if (!before || still) return;
      const dx = before.x - place.x;
      const dy = before.y - place.y;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      node.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], {
        duration: 220,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
      });
    });
    places.current = next;
  });

  /* ------------------------------------------------------------------ */
  /* Carrying with the pointer                                           */
  /* ------------------------------------------------------------------ */

  /** Which lane, and where in it, the carried card is over. */
  const target = (x: number, y: number, id: string) => {
    let lane: string | null = null;
    let nearest = Infinity;
    lists.current.forEach((node, laneId) => {
      const box = node.parentElement?.getBoundingClientRect() ?? node.getBoundingClientRect();
      const distance = x < box.left ? box.left - x : x > box.right ? x - box.right : 0;
      if (distance < nearest) {
        nearest = distance;
        lane = laneId;
      }
    });
    if (lane === null) return null;
    const over = (latest.current.draft ?? latest.current.settled).find((entry) => entry.id === lane);
    let index = 0;
    for (const card of over?.cards ?? []) {
      if (card.id === id) continue;
      const box = cards.current.get(card.id)?.getBoundingClientRect();
      if (box && y > box.top + box.height / 2) index += 1;
    }
    return { lane: lane as string, index };
  };

  const place = () => {
    const state = drag.current;
    const node = overlay.current;
    if (!state || !node) return;
    node.style.translate = `${state.x - state.grabX}px ${state.y - state.grabY}px`;
  };

  const follow = () => {
    const state = drag.current;
    if (!state?.started) return;
    const over = target(state.x, state.y, state.id);
    if (over) {
      const now = whereIs(latest.current.draft ?? latest.current.settled, state.id);
      if (!now || now.lane !== over.lane || now.index !== over.index) {
        setDraft(moved(latest.current.settled, state.id, over.lane, over.index));
      }
    }
    // Near either end of the board, it scrolls towards that end.
    const board = root.current;
    if (board) {
      const box = board.getBoundingClientRect();
      if (state.x < box.left + EDGE) board.scrollLeft -= 10;
      else if (state.x > box.right - EDGE) board.scrollLeft += 10;
    }
    state.frame = requestAnimationFrame(follow);
  };

  const begin = () => {
    const state = drag.current;
    if (!state || state.started) return;
    state.started = true;
    setDraft(latest.current.settled);
    setCarry({ id: state.id, by: 'pointer' });
    state.frame = requestAnimationFrame(follow);
  };

  const end = (drop: boolean) => {
    const state = drag.current;
    if (!state) return;
    window.clearTimeout(state.timer);
    cancelAnimationFrame(state.frame);
    drag.current = null;
    if (!state.started) return;
    const next = latest.current.draft;
    if (drop && next) commit(next, state.id);
    setDraft(null);
    setCarry(null);
  };

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const state = drag.current;
      if (!state || event.pointerId !== state.pointerId) return;
      state.x = event.clientX;
      state.y = event.clientY;
      if (!state.started) {
        const travel = Math.hypot(state.x - state.startX, state.y - state.startY);
        // A finger that moves before the hold is up is scrolling, not lifting.
        if (event.pointerType === 'touch') {
          if (travel > SLOP * 2) end(false);
          return;
        }
        if (travel > SLOP) begin();
        return;
      }
      place();
    };
    const onUp = (event: PointerEvent) => {
      if (drag.current && event.pointerId === drag.current.pointerId) end(true);
    };
    const onCancel = () => end(false);
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && drag.current?.started) end(false);
    };
    // A carried card must not also scroll the page under the finger.
    const onTouch = (event: TouchEvent) => {
      if (drag.current?.started) event.preventDefault();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchmove', onTouch, { passive: false });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchmove', onTouch);
      end(false);
    };
    // The handlers read everything through refs, so they are set up once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The lifted card is put under the pointer as soon as it exists.
  useLayoutEffect(() => {
    if (carry?.by === 'pointer') place();
  });

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>, id: string) => {
    if (event.button !== 0 || carry) return;
    // A button or a link inside a card is pressed, not dragged by.
    if ((event.target as HTMLElement).closest('button, a, input, textarea, select, [data-no-drag]')) {
      return;
    }
    const box = event.currentTarget.getBoundingClientRect();
    drag.current = {
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      grabX: event.clientX - box.left,
      grabY: event.clientY - box.top,
      x: event.clientX,
      y: event.clientY,
      width: box.width,
      started: false,
      timer: event.pointerType === 'touch' ? window.setTimeout(begin, HOLD) : 0,
      frame: 0,
    };
  };

  /* ------------------------------------------------------------------ */
  /* Carrying with the keyboard                                          */
  /* ------------------------------------------------------------------ */

  const say = (card: T, lanes: LaneBoardLane<T>[], lead: string) => {
    const at = whereIs(lanes, card.id);
    const lane = lanes.find((entry) => entry.id === at?.lane);
    if (!at || !lane) return;
    const name = typeof lane.title === 'string' ? lane.title : lane.id;
    setSaid(`${lead} ${cardName(card)}: ${name}, place ${at.index + 1} of ${lane.cards.length}.`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>, card: T) => {
    if (event.target !== event.currentTarget) return;
    const held = carry?.by === 'keys' && carry.id === card.id;

    if (!held) {
      if (carry || (event.key !== ' ' && event.key !== 'Enter')) return;
      event.preventDefault();
      setDraft(settled);
      setCarry({ id: card.id, by: 'keys' });
      setSaid(
        `Picked up ${cardName(card)}. Arrow keys move it, Space sets it down, Escape puts it back.`
      );
      return;
    }

    const lanes = draft ?? settled;
    const at = whereIs(lanes, card.id);
    if (!at) return;
    const laneAt = lanes.findIndex((lane) => lane.id === at.lane);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      commit(lanes, card.id);
      say(card, lanes, 'Set down');
      setDraft(null);
      setCarry(null);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setDraft(null);
      setCarry(null);
      setSaid(`Put ${cardName(card)} back.`);
      return;
    }

    let next: LaneBoardLane<T>[] | null = null;
    if (event.key === 'ArrowUp') next = moved(lanes, card.id, at.lane, at.index - 1);
    else if (event.key === 'ArrowDown') next = moved(lanes, card.id, at.lane, at.index + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const step = (event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1);
      const other = lanes[laneAt + step];
      if (other) next = moved(lanes, card.id, other.id, at.index);
    }
    if (!next) return;
    event.preventDefault();
    setDraft(next);
    say(card, next, 'Moved');
  };

  // Moving to another lane redraws the card under a new parent, which would
  // drop the focus it is being steered by.
  useLayoutEffect(() => {
    if (carry?.by === 'keys') cards.current.get(carry.id)?.focus({ preventScroll: false });
  });

  const carried = carry ? whereIs(shown, carry.id) : null;
  const carriedLane = carried ? shown.find((lane) => lane.id === carried.lane) : undefined;

  return (
    <div ref={root} role="group" aria-label={label} className={slots.root({ className })} {...props}>
      {shown.map((lane) => (
        <section
          key={lane.id}
          aria-label={typeof lane.title === 'string' ? lane.title : undefined}
          className={laneBoardVariants({ over: carried?.lane === lane.id }).lane()}
        >
          <header className={slots.laneHeader()}>
            <h3 className={slots.laneTitle()}>{lane.title}</h3>
            <span className={slots.laneCount()}>{lane.cards.length}</span>
          </header>
          <ol
            ref={(node) => {
              if (node) lists.current.set(lane.id, node);
              else lists.current.delete(lane.id);
            }}
            className={slots.list()}
          >
            {lane.cards.map((card) => {
              const isCarried = carry?.id === card.id;
              const state = !isCarried ? 'rest' : carry.by === 'pointer' ? 'placeholder' : 'held';
              return (
                <li
                  key={card.id}
                  ref={(node) => {
                    if (node) cards.current.set(card.id, node);
                    else cards.current.delete(card.id);
                  }}
                  tabIndex={0}
                  aria-roledescription="Card that can be moved"
                  aria-label={cardName(card)}
                  data-card={card.id}
                  data-carried={isCarried ? carry.by : undefined}
                  className={laneBoardVariants({ state }).card()}
                  onPointerDown={(event) => onPointerDown(event, card.id)}
                  onKeyDown={(event) => onKeyDown(event, card)}
                  onBlur={() => {
                    // Focus leaving a card held with the keyboard puts it back:
                    // nothing is steering it any more.
                    if (carry?.by === 'keys' && carry.id === card.id && !cards.current.get(card.id)?.matches(':focus')) {
                      requestAnimationFrame(() => {
                        if (document.activeElement !== cards.current.get(card.id)) {
                          setDraft(null);
                          setCarry(null);
                        }
                      });
                    }
                  }}
                >
                  {renderCard(card, { lane, carried: isCarried })}
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      {carry?.by === 'pointer' && carried && carriedLane ? (
        <div
          ref={overlay}
          aria-hidden="true"
          className={slots.overlay()}
          style={{ width: drag.current?.width }}
        >
          {renderCard(carried.card, { lane: carriedLane, carried: true })}
        </div>
      ) : null}

      <span aria-live="assertive" className="sr-only">
        {said}
      </span>
    </div>
  );
}
LaneBoardRoot.displayName = 'LaneBoard';

/* -------------------------------------------------------------------------- */
/* What goes on a card                                                        */
/* -------------------------------------------------------------------------- */

export interface LaneBoardTitleProps extends ComponentProps<'div'> {}

/** A card's name. */
function LaneBoardTitle({ className, ...props }: LaneBoardTitleProps) {
  return <div className={laneBoardVariants().title({ className })} {...props} />;
}
LaneBoardTitle.displayName = 'LaneBoard.Title';

export interface LaneBoardCodeProps extends ComponentProps<'div'> {}

/** A card's reference, in a fixed-width face so a column of them lines up. */
function LaneBoardCode({ className, ...props }: LaneBoardCodeProps) {
  return <div className={laneBoardVariants().code({ className })} {...props} />;
}
LaneBoardCode.displayName = 'LaneBoard.Code';

export interface LaneBoardRowProps extends ComponentProps<'div'> {}

/** The last line of a card: something at each end. */
function LaneBoardRow({ className, ...props }: LaneBoardRowProps) {
  return <div className={laneBoardVariants().row({ className })} {...props} />;
}
LaneBoardRow.displayName = 'LaneBoard.Row';

export interface LaneBoardStepsProps extends Omit<ComponentProps<'div'>, 'children' | 'color'> {
  /** How many steps are done. */
  value: number;
  /** How many steps there are. */
  max?: number;
  /** Which of the theme's roles the done steps are drawn in. */
  color?: LaneBoardColor;
  /** What a screen reader calls it. */
  label?: string;
}

/** How far along a card is, as a row of dashes with the done ones lit. */
function LaneBoardSteps({
  value,
  max = 5,
  color = 'primary',
  label = 'Progress',
  className,
  ...props
}: LaneBoardStepsProps) {
  const slots = laneBoardVariants({ color });
  return (
    <div
      role="img"
      aria-label={`${label}: ${value} of ${max}`}
      className={slots.steps({ className })}
      {...props}
    >
      {Array.from({ length: max }, (_, index) => (
        <span key={index} className={laneBoardVariants({ lit: index < value }).step()} />
      ))}
    </div>
  );
}
LaneBoardSteps.displayName = 'LaneBoard.Steps';

export interface LaneBoardTagProps extends Omit<ComponentProps<'span'>, 'color'> {
  /** Which of the theme's roles the tag is drawn in. */
  color?: LaneBoardColor;
}

/** A word in a pill, for a card's state. */
function LaneBoardTag({ color = 'primary', className, ...props }: LaneBoardTagProps) {
  return <span className={laneBoardVariants({ color }).tag({ className })} {...props} />;
}
LaneBoardTag.displayName = 'LaneBoard.Tag';

export interface LaneBoardMetaProps extends ComponentProps<'span'> {}

/** A short figure at the end of a card's last line: a time, a count. */
function LaneBoardMeta({ className, ...props }: LaneBoardMetaProps) {
  return <span className={laneBoardVariants().meta({ className })} {...props} />;
}
LaneBoardMeta.displayName = 'LaneBoard.Meta';

export const LaneBoard = Object.assign(LaneBoardRoot, {
  Title: LaneBoardTitle,
  Code: LaneBoardCode,
  Row: LaneBoardRow,
  Steps: LaneBoardSteps,
  Tag: LaneBoardTag,
  Meta: LaneBoardMeta,
});

/* By name as well, for a Server Component, which cannot dot into a client
   module. */
export { LaneBoardTitle, LaneBoardCode, LaneBoardRow, LaneBoardSteps, LaneBoardTag, LaneBoardMeta };

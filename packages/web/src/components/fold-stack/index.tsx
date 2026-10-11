'use client';

/**
 * FoldStack — a deck of cards with one in front, the rest folded in behind
 * it, and a row of tabs to bring any of them forward.
 *
 * ```tsx
 * <FoldStack defaultValue="test">
 *   <FoldStack.Item value="build" label="Build" color="success">…</FoldStack.Item>
 *   <FoldStack.Item value="test" label="Test" color="destructive">…</FoldStack.Item>
 * </FoldStack>
 * ```
 *
 * ## A real pile, drawn from the front
 *
 * Every card is in the same place. The chosen one is in front at full size,
 * and the next two lie behind it, each a little smaller and a little lower,
 * so only their bottom edges show. Choosing another card moves it to the
 * front and sends the one that was there to the back, and each card in
 * between steps forward one place. The edges under the front card are how
 * many are waiting, which a row of tabs alone would not show.
 *
 * ## The deck does not change height
 *
 * All the cards share one cell of a grid, so the deck is as tall as its
 * tallest card whichever is in front. Nothing under it moves when the card
 * changes.
 *
 * ## It is a set of tabs to everything but the eye
 *
 * The row above the deck is a tab list and each card is its panel. Left and
 * right move between tabs. The cards behind stay mounted and are made inert,
 * so a field somebody filled in is still filled when its card comes back.
 */
import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { tv } from 'tailwind-variants';

/** Which of the theme's roles a card's light is drawn in. */
export type FoldStackColor = 'primary' | 'info' | 'success' | 'warning' | 'destructive';

const foldStackVariants = tv({
  slots: {
    root: 'flex w-full flex-col gap-3',
    list: 'flex flex-wrap gap-1.5',
    tab: 'inline-flex h-8 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    // A light in the card's colour, which is how a tab and its card are
    // matched at a glance.
    beacon: 'size-2 shrink-0 rounded-full bg-[var(--pu-color)] transition-shadow duration-300',
    // One cell for every card. The room under it is for the edges of the two
    // cards behind, so they are inside the deck's own box.
    deck: 'grid pb-[var(--pu-under)]',
    /*
     * Scaled from the middle of its bottom edge, so a card behind keeps its
     * bottom corners under the front card's and shows as an edge beneath it.
     * The shade is the page's colour laid over a card, thicker the further
     * back it is, which is what makes it recede.
     */
    card: 'relative col-start-1 row-start-1 origin-bottom rounded-3xl border bg-card text-card-foreground [scale:var(--pu-scale)] [translate:0_var(--pu-drop)] transition-[scale,translate,opacity,box-shadow] duration-500 ease-[cubic-bezier(0.3,1.2,0.5,1)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-background after:opacity-[var(--pu-shade)] after:transition-opacity after:duration-500 motion-reduce:transition-none',
    content: 'h-full p-5 transition-opacity duration-300 motion-reduce:transition-none',
  },
  compoundVariants: [
    // The neutral light on the filled tab would be the tab's own colour and
    // vanish, so there it is drawn in the page's colour.
    { color: 'primary', selected: true, class: { tab: '[--pu-color:var(--background)]' } },
  ],
  variants: {
    color: {
      primary: { tab: '[--pu-color:var(--primary)]' },
      info: { tab: '[--pu-color:var(--info)]' },
      success: { tab: '[--pu-color:var(--success)]' },
      warning: { tab: '[--pu-color:var(--warning)]' },
      destructive: { tab: '[--pu-color:var(--destructive)]' },
    },
    selected: {
      true: {
        tab: 'bg-foreground text-background',
        beacon: 'shadow-[0_0_0_3px_color-mix(in_oklab,var(--pu-color)_30%,transparent)]',
      },
      false: { tab: 'bg-muted text-muted-foreground hover:text-foreground' },
    },
    /** Where a card lies in the pile. */
    place: {
      front: { card: 'z-30 shadow-lg', content: 'opacity-100 delay-150' },
      // Its edge is a way to the next card, so it can be pressed.
      behind: { card: 'cursor-pointer shadow-sm', content: 'opacity-0' },
      // Too far back to be seen. Kept in the cell so the deck keeps its height.
      buried: { card: 'pointer-events-none opacity-0', content: 'opacity-0' },
    },
  },
});

/** How many cards show behind the front one. */
const BEHIND = 2;
/** How much smaller each card behind is than the one in front of it. */
const SHRINK = 0.06;
/** How far below the card in front each one's edge shows, in pixels. */
const DROP = 12;

interface FoldStackContextValue {
  value: string | null;
  setValue(value: string): void;
  /** The items' values in the order they are written. */
  order: string[];
  id: string;
}

const FoldStackContext = createContext<FoldStackContextValue | null>(null);

/** What the stack reads off each of its items to draw the row of tabs. */
interface ItemShape {
  value: string;
  label?: ReactNode;
  color?: FoldStackColor;
}

export interface FoldStackProps extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  /** The `value` of the card in front, when the caller holds it. */
  value?: string;
  /** The card in front to begin with, when the caller does not hold it. Defaults to the first. */
  defaultValue?: string;
  /** Called with a card's `value` when it is brought to the front. */
  onValueChange?: (value: string) => void;
  /** What a screen reader calls the row of tabs. */
  label?: string;
  /** The cards. They have to be direct children, so the stack can count them. */
  children?: ReactNode;
}

function FoldStackRoot({
  value,
  defaultValue,
  onValueChange,
  label = 'Cards',
  className,
  children,
  ...props
}: FoldStackProps) {
  const slots = foldStackVariants();
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const items = useMemo(() => {
    const found: ItemShape[] = [];
    Children.forEach(children, (child) => {
      if (isValidElement<ItemShape>(child) && typeof child.props.value === 'string') {
        found.push(child.props);
      }
    });
    return found;
  }, [children]);
  const order = useMemo(() => items.map((item) => item.value), [items]);

  const [internal, setInternal] = useState<string | null>(defaultValue ?? null);
  const wanted = value ?? internal;
  // A value that names no card would leave the deck with nothing in front, so
  // it falls back to the first.
  const resolved = wanted !== null && order.includes(wanted) ? wanted : (order[0] ?? null);

  const setValue = useCallback(
    (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [value, onValueChange]
  );

  const context = useMemo(
    () => ({ value: resolved, setValue, order, id }),
    [resolved, setValue, order, id]
  );

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = rtl ? -1 : 1;
    const moves: Record<string, number> = {
      ArrowLeft: index - forward,
      ArrowRight: index + forward,
      Home: 0,
      End: items.length - 1,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = (target + items.length) % items.length;
    const item = items[next];
    if (!item) return;
    tabs.current[next]?.focus();
    setValue(item.value);
  };

  // Enough room under the deck for as many edges as there are cards to show.
  const under = Math.min(BEHIND, Math.max(0, items.length - 1)) * DROP;

  return (
    <FoldStackContext.Provider value={context}>
      <div className={slots.root({ className })} {...props}>
        <div role="tablist" aria-label={label} className={slots.list()}>
          {items.map((item, index) => {
            const selected = item.value === resolved;
            const part = foldStackVariants({ color: item.color ?? 'primary', selected });
            return (
              <button
                key={item.value}
                ref={(node) => {
                  tabs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${item.value}`}
                aria-selected={selected}
                aria-controls={`${id}-card-${item.value}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setValue(item.value)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={part.tab()}
              >
                <span aria-hidden="true" className={part.beacon()} />
                {item.label ?? item.value}
              </button>
            );
          })}
        </div>
        <div className={slots.deck()} style={{ ['--pu-under' as string]: `${under}px` }}>
          {children}
        </div>
      </div>
    </FoldStackContext.Provider>
  );
}
FoldStackRoot.displayName = 'FoldStack';

export interface FoldStackItemProps extends Omit<ComponentProps<'div'>, 'color'> {
  /** What identifies this card to `value` and `onValueChange`. */
  value: string;
  /** What its tab says. Defaults to the `value`. */
  label?: ReactNode;
  /** One of the theme's roles for the light on its tab. */
  color?: FoldStackColor;
}

/** One card, and through its `label` and `color`, the tab that brings it forward. */
function FoldStackItem({
  value,
  // Read by the stack to draw the tab. Taken out here so they are not
  // written on to the card's element.
  label: _label,
  color: _color,
  className,
  style,
  children,
  onClick,
  ...props
}: FoldStackItemProps) {
  const stack = useContext(FoldStackContext);
  if (!stack) throw new Error('FoldStack.Item must be used inside a <FoldStack>.');
  const card = useRef<HTMLDivElement>(null);

  const count = stack.order.length;
  const at = stack.order.indexOf(value);
  const frontAt = stack.order.indexOf(stack.value ?? value);
  // How many places back from the front, going round: the card after the
  // front one is the first behind it, and the one before it is the last.
  const depth = (at - frontAt + count) % count;
  const place = depth === 0 ? 'front' : depth <= BEHIND ? 'behind' : 'buried';
  const shown = Math.min(depth, BEHIND);
  const slots = foldStackVariants({ place });

  useEffect(() => {
    // Set on the element, not passed as a prop: how a boolean `inert` prop is
    // written to the page differs between React versions.
    card.current?.firstElementChild?.toggleAttribute('inert', depth !== 0);
  }, [depth]);

  return (
    <div
      ref={card}
      role="tabpanel"
      id={`${stack.id}-card-${value}`}
      aria-labelledby={`${stack.id}-tab-${value}`}
      aria-hidden={depth !== 0 || undefined}
      data-place={place}
      className={slots.card({ className })}
      style={{
        ['--pu-scale' as string]: 1 - shown * SHRINK,
        ['--pu-drop' as string]: `${shown * DROP}px`,
        ['--pu-shade' as string]: shown * 0.3,
        // Nearer the front is drawn over further back.
        zIndex: place === 'front' ? undefined : BEHIND + 1 - shown,
        ...style,
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && place === 'behind') stack.setValue(value);
      }}
      {...props}
    >
      <div className={slots.content()}>{children}</div>
    </div>
  );
}
FoldStackItem.displayName = 'FoldStack.Item';

export const FoldStack = Object.assign(FoldStackRoot, {
  Item: FoldStackItem,
});

/* By name as well, for a Server Component, which cannot dot into a client
   module. */
export { FoldStackItem };

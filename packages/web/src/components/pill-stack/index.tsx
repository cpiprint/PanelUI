'use client';

/**
 * PillStack — a stack of cards with one open, and the rest folded down to
 * pills that narrow as they get further from it.
 *
 * ```tsx
 * <PillStack defaultValue="average">
 *   <PillStack.Item value="zones">
 *     <PillStack.Pill>Heart rate zones</PillStack.Pill>
 *     <PillStack.Panel>…</PillStack.Panel>
 *   </PillStack.Item>
 *   <PillStack.Item value="average">
 *     <PillStack.Pill>Daily average</PillStack.Pill>
 *     <PillStack.Panel>…</PillStack.Panel>
 *   </PillStack.Item>
 * </PillStack>
 * ```
 *
 * ## One surface that changes shape
 *
 * An item is one rounded surface. Folded, it is as tall as its pill and reads
 * as a pill; open, it is as tall as its panel and reads as a card. Nothing is
 * swapped: the pill row collapses to no height as the panel row opens, in the
 * same transition, so the surface is seen growing into the card and not being
 * replaced by it.
 *
 * ## The taper says which way the stack runs
 *
 * A folded item is narrower the further it is from the open one. That is what
 * makes them read as cards lying behind it, receding, and not as a list of
 * buttons that happen to sit above a card.
 *
 * ## It is an accordion to everything but the eye
 *
 * Each pill is a button that says whether its panel is expanded, and each
 * panel is a region named by its pill. Exactly one is open. A folded panel is
 * made inert, so its contents cannot be tabbed into while they cannot be seen.
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
  type ReactNode,
} from 'react';
import { tv } from 'tailwind-variants';

const pillStackVariants = tv({
  slots: {
    root: 'flex w-full flex-col items-center gap-3',
    // 2.5rem is half the pill's height, so a folded item is a true pill and
    // an open one is a card with the same corner.
    item: 'grid overflow-hidden rounded-[2.5rem] bg-card text-card-foreground transition-[grid-template-rows,width] duration-500 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none',
    pill: 'flex min-h-0 w-full cursor-pointer items-center gap-3 overflow-hidden px-2.5 text-start outline-none transition-opacity duration-300 focus-visible:bg-foreground/[0.06] motion-reduce:transition-none',
    pillInner: 'flex h-20 w-full min-w-0 items-center gap-3',
    panel: 'min-h-0 overflow-hidden transition-opacity duration-300 motion-reduce:transition-none',
    panelInner: 'p-6 sm:p-7',
  },
  variants: {
    open: {
      true: { pill: 'pointer-events-none opacity-0', panel: 'opacity-100' },
      false: { pill: 'opacity-100', panel: 'opacity-0' },
    },
  },
});

/** How wide an item is, as a share of the stack, by how far it is from the open one. */
const TAPER = [100, 77, 61, 52];

interface PillStackContextValue {
  value: string | null;
  setValue(value: string): void;
  /** The items' values in the order they are written, to measure distance by. */
  order: string[];
}

const PillStackContext = createContext<PillStackContextValue | null>(null);

interface ItemContextValue {
  value: string;
  open: boolean;
  pillId: string;
  panelId: string;
}

const ItemContext = createContext<ItemContextValue | null>(null);

function useItem(part: string): ItemContextValue {
  const item = useContext(ItemContext);
  if (!item) throw new Error(`${part} must be used inside a <PillStack.Item>.`);
  return item;
}

export interface PillStackProps extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  /** The `value` of the open item, when the caller holds it. */
  value?: string;
  /** The item open to begin with, when the caller does not hold it. */
  defaultValue?: string;
  /** Called with an item's `value` when its pill is pressed. */
  onValueChange?: (value: string) => void;
  /** The items. They have to be direct children, so the stack can count them. */
  children?: ReactNode;
}

function PillStackRoot({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: PillStackProps) {
  const slots = pillStackVariants();

  const order = useMemo(() => {
    const values: string[] = [];
    Children.forEach(children, (child) => {
      if (isValidElement<{ value?: unknown }>(child) && typeof child.props.value === 'string') {
        values.push(child.props.value);
      }
    });
    return values;
  }, [children]);

  // With nothing chosen, the last item is the open one: the card at the foot
  // of the stack, with the pills above it.
  const [internal, setInternal] = useState<string | null>(defaultValue ?? null);
  const resolved = value ?? internal ?? order[order.length - 1] ?? null;

  const setValue = useCallback(
    (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [value, onValueChange]
  );

  const context = useMemo(() => ({ value: resolved, setValue, order }), [resolved, setValue, order]);

  return (
    <PillStackContext.Provider value={context}>
      <div className={slots.root({ className })} {...props}>
        {children}
      </div>
    </PillStackContext.Provider>
  );
}
PillStackRoot.displayName = 'PillStack';

export interface PillStackItemProps extends ComponentProps<'div'> {
  /** What identifies this item to `value` and `onValueChange`. */
  value: string;
}

function PillStackItem({ value, className, style, children, ...props }: PillStackItemProps) {
  const stack = useContext(PillStackContext);
  if (!stack) throw new Error('PillStack.Item must be used inside a <PillStack>.');
  const id = useId();
  const open = stack.value === value;
  const slots = pillStackVariants({ open });

  const distance = Math.abs(stack.order.indexOf(value) - stack.order.indexOf(stack.value ?? value));
  const width = TAPER[Math.min(distance, TAPER.length - 1)] ?? 100;

  const item = useMemo(
    () => ({ value, open, pillId: `${id}-pill`, panelId: `${id}-panel` }),
    [value, open, id]
  );

  return (
    <ItemContext.Provider value={item}>
      <div
        data-open={open ? '' : undefined}
        className={slots.item({ className })}
        style={{
          width: `${width}%`,
          // The pill's row and the panel's, trading places.
          gridTemplateRows: open ? '0fr 1fr' : '1fr 0fr',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
}
PillStackItem.displayName = 'PillStack.Item';

/** Keeps an element out of the tab order and the accessibility tree while it is folded away. */
function useInert<T extends HTMLElement>(inert: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    // Set on the element, not passed as a prop: how a boolean `inert` prop is
    // written to the page differs between React versions.
    ref.current?.toggleAttribute('inert', inert);
  }, [inert]);
  return ref;
}

export interface PillStackPillProps extends ComponentProps<'button'> {}

/** The folded form: one row, and the button that opens the item. */
function PillStackPill({ className, children, onClick, ...props }: PillStackPillProps) {
  const stack = useContext(PillStackContext);
  const item = useItem('PillStack.Pill');
  const slots = pillStackVariants({ open: item.open });
  const ref = useInert<HTMLButtonElement>(item.open);

  return (
    <button
      ref={ref}
      type="button"
      id={item.pillId}
      aria-expanded={item.open}
      aria-controls={item.panelId}
      className={slots.pill({ className })}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) stack?.setValue(item.value);
      }}
      {...props}
    >
      <span className={slots.pillInner()}>{children}</span>
    </button>
  );
}
PillStackPill.displayName = 'PillStack.Pill';

export interface PillStackPanelProps extends ComponentProps<'div'> {}

/** The open form: the card's contents. */
function PillStackPanel({ className, children, ...props }: PillStackPanelProps) {
  const item = useItem('PillStack.Panel');
  const slots = pillStackVariants({ open: item.open });
  const ref = useInert<HTMLDivElement>(!item.open);

  return (
    <div
      ref={ref}
      role="region"
      id={item.panelId}
      aria-labelledby={item.pillId}
      className={slots.panel()}
      {...props}
    >
      <div className={slots.panelInner({ className })}>{children}</div>
    </div>
  );
}
PillStackPanel.displayName = 'PillStack.Panel';

export const PillStack = Object.assign(PillStackRoot, {
  Item: PillStackItem,
  Pill: PillStackPill,
  Panel: PillStackPanel,
});

/* By name as well, for a Server Component, which cannot dot into a client
   module. */
export { PillStackItem, PillStackPill, PillStackPanel };

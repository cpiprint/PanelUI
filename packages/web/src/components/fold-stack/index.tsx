'use client';

/**
 * FoldStack — a stack of summaries, one of them opened out into its card.
 *
 * ```tsx
 * <FoldStack defaultValue="latency">
 *   <FoldStack.Item value="latency" color="info">
 *     <FoldStack.Summary icon={<ActivityIcon />} value="182 ms" level={0.4}>
 *       Latency
 *     </FoldStack.Summary>
 *     <FoldStack.Panel>…</FoldStack.Panel>
 *   </FoldStack.Item>
 * </FoldStack>
 * ```
 *
 * ## One surface that changes shape
 *
 * An item is a single card. Folded, it is one row: a tile with its icon, its
 * name, a figure and a few lights that show how high the figure is. Open, it
 * is as tall as its panel. Nothing is swapped: the summary's row closes as the
 * panel's row opens, in one movement, so the row is seen growing into the card
 * and not being replaced by it.
 *
 * ## The stack narrows away from the open card
 *
 * A folded item is narrower the further it is from the open one. The open
 * card is then the widest thing in the stack and the eye goes to it, and the
 * folded ones read as stacked on it and not as a list beside it.
 *
 * ## Exactly one is open
 *
 * Pressing a folded item opens it and folds the one that was open. The folded
 * side of an item is a button, and whichever side cannot be seen is made
 * inert, so it cannot be tabbed into or read.
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

/** Which of the theme's roles an item's tile and lights are drawn in. */
export type FoldStackColor = 'primary' | 'info' | 'success' | 'warning' | 'destructive';

const foldStackVariants = tv({
  slots: {
    root: 'flex w-full flex-col items-center gap-2',
    item: 'grid overflow-hidden rounded-[1.75rem] border bg-card text-card-foreground transition-[grid-template-rows,width,box-shadow] duration-500 ease-[cubic-bezier(0.3,1.15,0.5,1)] motion-reduce:transition-none',
    summary:
      'group/summary flex min-h-0 w-full cursor-pointer items-center overflow-hidden text-start outline-none transition-[opacity,background-color] duration-300 hover:bg-accent focus-visible:bg-accent motion-reduce:transition-none',
    summaryInner: 'flex h-16 w-full min-w-0 items-center gap-3 pe-5 ps-3',
    // The item's colour as a soft square behind its icon.
    tile: 'flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--pu-color)_16%,transparent)] text-[var(--pu-color)] transition-transform duration-300 group-hover/summary:scale-105 motion-reduce:transition-none [&_svg]:size-5',
    title: 'min-w-0 flex-1 truncate text-base font-medium',
    value: 'shrink-0 text-base font-semibold tabular-nums',
    // Four lights of rising height. How many are lit says how high the
    // figure is, without the reader having to know its scale.
    lights: 'flex shrink-0 items-end gap-[3px]',
    light: 'w-1 rounded-full',
    panel: 'min-h-0 overflow-hidden transition-opacity duration-300 motion-reduce:transition-none',
    panelInner: 'p-5',
  },
  variants: {
    color: {
      primary: { item: '[--pu-color:var(--primary)]' },
      info: { item: '[--pu-color:var(--info)]' },
      success: { item: '[--pu-color:var(--success)]' },
      warning: { item: '[--pu-color:var(--warning)]' },
      destructive: { item: '[--pu-color:var(--destructive)]' },
    },
    open: {
      true: {
        item: 'shadow-lg',
        summary: 'pointer-events-none opacity-0',
        panel: 'opacity-100 delay-150',
      },
      false: { summary: 'opacity-100', panel: 'opacity-0' },
    },
    lit: {
      true: { light: 'bg-[var(--pu-color)]' },
      false: { light: 'bg-muted-foreground/25' },
    },
  },
  defaultVariants: { color: 'primary' },
});

/** How much narrower an item is for each step it is from the open one, in percent. */
const NARROWING = 8;
/** The narrowest an item is drawn, in percent. */
const NARROWEST = 76;
/** The heights of the four lights, in pixels. */
const LIGHTS = [7, 10, 13, 16];

interface FoldStackContextValue {
  value: string | null;
  setValue(value: string): void;
  /** The items' values in the order they are written, to measure distance by. */
  order: string[];
}

const FoldStackContext = createContext<FoldStackContextValue | null>(null);

interface ItemContextValue {
  value: string;
  open: boolean;
  summaryId: string;
  panelId: string;
}

const ItemContext = createContext<ItemContextValue | null>(null);

function useItem(part: string): ItemContextValue {
  const item = useContext(ItemContext);
  if (!item) throw new Error(`${part} must be used inside a <FoldStack.Item>.`);
  return item;
}

/** Keeps an element out of the tab order and the accessibility tree while it cannot be seen. */
function useInert<T extends HTMLElement>(inert: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    // Set on the element, not passed as a prop: how a boolean `inert` prop is
    // written to the page differs between React versions.
    ref.current?.toggleAttribute('inert', inert);
  }, [inert]);
  return ref;
}

export interface FoldStackProps extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  /** The `value` of the open item, when the caller holds it. */
  value?: string;
  /** The item open to begin with, when the caller does not hold it. Defaults to the first. */
  defaultValue?: string;
  /** Called with an item's `value` when it is opened. */
  onValueChange?: (value: string) => void;
  /** The items. They have to be direct children, so the stack can count them. */
  children?: ReactNode;
}

function FoldStackRoot({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: FoldStackProps) {
  const slots = foldStackVariants();

  const order = useMemo(() => {
    const values: string[] = [];
    Children.forEach(children, (child) => {
      if (isValidElement<{ value?: unknown }>(child) && typeof child.props.value === 'string') {
        values.push(child.props.value);
      }
    });
    return values;
  }, [children]);

  const [internal, setInternal] = useState<string | null>(defaultValue ?? null);
  const wanted = value ?? internal;
  // A value that names no item would leave every one folded, so it falls back
  // to the first.
  const resolved = wanted !== null && order.includes(wanted) ? wanted : (order[0] ?? null);

  const setValue = useCallback(
    (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [value, onValueChange]
  );

  const context = useMemo(() => ({ value: resolved, setValue, order }), [resolved, setValue, order]);

  return (
    <FoldStackContext.Provider value={context}>
      <div className={slots.root({ className })} {...props}>
        {children}
      </div>
    </FoldStackContext.Provider>
  );
}
FoldStackRoot.displayName = 'FoldStack';

export interface FoldStackItemProps extends Omit<ComponentProps<'div'>, 'color'> {
  /** What identifies this item to `value` and `onValueChange`. */
  value: string;
  /** One of the theme's roles for the item's tile and lights. */
  color?: FoldStackColor;
}

function FoldStackItem({ value, color, className, style, children, ...props }: FoldStackItemProps) {
  const stack = useContext(FoldStackContext);
  if (!stack) throw new Error('FoldStack.Item must be used inside a <FoldStack>.');
  const id = useId();
  const open = stack.value === value;
  const slots = foldStackVariants({ color, open });

  const distance = Math.abs(stack.order.indexOf(value) - stack.order.indexOf(stack.value ?? value));
  const width = Math.max(NARROWEST, 100 - distance * NARROWING);

  const item = useMemo(
    () => ({ value, open, summaryId: `${id}-summary`, panelId: `${id}-panel` }),
    [value, open, id]
  );

  return (
    <ItemContext.Provider value={item}>
      <div
        data-open={open ? '' : undefined}
        className={slots.item({ className })}
        style={{
          width: `${width}%`,
          // The summary's row and the panel's, trading places.
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
FoldStackItem.displayName = 'FoldStack.Item';

export interface FoldStackSummaryProps extends Omit<ComponentProps<'button'>, 'value'> {
  /** Drawn in the tile at the start of the row. */
  icon?: ReactNode;
  /** The figure at the end of the row. */
  value?: ReactNode;
  /**
   * How high the figure is on its own scale, from 0 to 1. Drawn as four
   * lights after the figure. Leave it out for a row without them.
   */
  level?: number;
  /** The item's name. */
  children?: ReactNode;
}

/** The folded form: one row, and the button that opens the item. */
function FoldStackSummary({
  icon,
  value,
  level,
  className,
  children,
  onClick,
  ...props
}: FoldStackSummaryProps) {
  const stack = useContext(FoldStackContext);
  const item = useItem('FoldStack.Summary');
  const slots = foldStackVariants({ open: item.open });
  const ref = useInert<HTMLButtonElement>(item.open);
  const lit = level === undefined ? 0 : Math.round(Math.min(1, Math.max(0, level)) * LIGHTS.length);

  return (
    <button
      ref={ref}
      type="button"
      id={item.summaryId}
      aria-expanded={item.open}
      aria-controls={item.panelId}
      className={slots.summary()}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) stack?.setValue(item.value);
      }}
      {...props}
    >
      <span className={slots.summaryInner({ className })}>
        {icon !== undefined && icon !== null ? (
          <span aria-hidden="true" className={slots.tile()}>
            {icon}
          </span>
        ) : null}
        <span className={slots.title()}>{children}</span>
        {value !== undefined && value !== null ? (
          <span className={slots.value()}>{value}</span>
        ) : null}
        {level !== undefined ? (
          <span aria-hidden="true" className={slots.lights()}>
            {LIGHTS.map((height, index) => (
              <span
                key={height}
                className={foldStackVariants({ lit: index < lit }).light()}
                style={{ height }}
              />
            ))}
          </span>
        ) : null}
      </span>
    </button>
  );
}
FoldStackSummary.displayName = 'FoldStack.Summary';

export interface FoldStackPanelProps extends ComponentProps<'div'> {}

/** The open form: the card's contents. */
function FoldStackPanel({ className, children, ...props }: FoldStackPanelProps) {
  const item = useItem('FoldStack.Panel');
  const slots = foldStackVariants({ open: item.open });
  const ref = useInert<HTMLDivElement>(!item.open);

  return (
    <div
      ref={ref}
      role="region"
      id={item.panelId}
      aria-labelledby={item.summaryId}
      className={slots.panel()}
      {...props}
    >
      <div className={slots.panelInner({ className })}>{children}</div>
    </div>
  );
}
FoldStackPanel.displayName = 'FoldStack.Panel';

export const FoldStack = Object.assign(FoldStackRoot, {
  Item: FoldStackItem,
  Summary: FoldStackSummary,
  Panel: FoldStackPanel,
});

/* By name as well, for a Server Component, which cannot dot into a client
   module. */
export { FoldStackItem, FoldStackSummary, FoldStackPanel };

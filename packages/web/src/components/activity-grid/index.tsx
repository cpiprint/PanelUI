'use client';

/**
 * ActivityGrid — a period as a grid of pills, each one a day that was met,
 * partly met or missed.
 *
 * ```tsx
 * <ActivityGrid cells={days} columns={10} />
 * <ActivityGrid.Legend />
 * ```
 *
 * ## Three states, three kinds of mark
 *
 * A day is filled, outlined with a dashed line, or left as a faint shape. The
 * states differ in how they are drawn and not only in how bright they are, so
 * the grid still reads for someone who cannot tell the tints apart and in a
 * print or a screenshot that has lost its contrast.
 *
 * ## Days you can ask about
 *
 * Pass `onValueChange` and each pill becomes a button. The grid then behaves
 * as one control to the keyboard: a single Tab stop, with the arrow keys
 * moving between days, so thirty pills are not thirty presses of Tab.
 */
import {
  useMemo,
  useRef,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { tv } from 'tailwind-variants';

/** How much of the goal a day met. */
export type ActivityLevel = 'reached' | 'partial' | 'none';

export interface ActivityCell {
  level: ActivityLevel;
  /** What the day is, for a tooltip and a screen reader: "14 May, goal reached". */
  label?: string;
}

const activityGridVariants = tv({
  slots: {
    // The accent is one variable, so a project can set `--panelui-accent`
    // once and every widget in the collection follows it. The legend defines
    // it too: it is a sibling of the grid, not inside it, and a swatch whose
    // colour names a variable nobody set is not drawn at all.
    root: 'grid w-full gap-1.5 [--pu-accent:var(--panelui-accent,oklch(0.7_0.19_42))] sm:gap-2',
    cell: 'block aspect-[5/3] w-full rounded-full border outline-none transition-[scale,background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none',
    legend:
      'flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground [--pu-accent:var(--panelui-accent,oklch(0.7_0.19_42))]',
    legendItem: 'flex items-center gap-2.5',
    swatch: 'block h-4 w-7 rounded-full border',
  },
  variants: {
    level: {
      // A warm white: the foreground with a little of the accent in it.
      reached: {
        cell: 'border-transparent bg-[color-mix(in_oklab,var(--foreground),var(--pu-accent)_14%)]',
        swatch: 'border-transparent bg-[color-mix(in_oklab,var(--foreground),var(--pu-accent)_14%)]',
      },
      partial: {
        cell: 'border-dashed border-foreground/35 bg-foreground/[0.07]',
        swatch: 'border-dashed border-foreground/35 bg-foreground/[0.07]',
      },
      none: {
        cell: 'border-transparent bg-foreground/[0.06]',
        swatch: 'border-transparent bg-foreground/[0.06]',
      },
    },
    interactive: {
      true: {
        cell: 'cursor-pointer hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      },
    },
    selected: {
      true: { cell: 'scale-105 shadow-[0_0_0_2px_var(--pu-accent)]' },
    },
  },
});

const LEVEL_NAMES: Record<ActivityLevel, string> = {
  reached: 'Goal reached',
  partial: 'Partial',
  none: 'No activity',
};

export interface ActivityGridProps extends Omit<ComponentProps<'div'>, 'children' | 'onChange'> {
  /** The days, in order. They fill the grid row by row. */
  cells: ActivityCell[];
  /** Pills per row. */
  columns?: number;
  /** The index of the selected day, when the caller holds it. */
  value?: number | null;
  /**
   * Called with the index of a day when it is pressed. Passing this makes the
   * pills buttons; without it the grid is a picture.
   */
  onValueChange?: (index: number) => void;
  /** What a screen reader calls the grid. */
  label?: string;
}

function ActivityGridRoot({
  cells,
  columns = 10,
  value = null,
  onValueChange,
  label = 'Activity',
  className,
  style,
  ...props
}: ActivityGridProps) {
  const slots = activityGridVariants();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const interactive = onValueChange !== undefined;

  const summary = useMemo(() => {
    const reached = cells.filter((cell) => cell.level === 'reached').length;
    const partial = cells.filter((cell) => cell.level === 'partial').length;
    return `${label}: ${reached} of ${cells.length} days reached the goal, ${partial} partly.`;
  }, [cells, label]);

  if (!interactive) {
    return (
      <div
        role="img"
        aria-label={summary}
        className={slots.root({ className })}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...style }}
        {...props}
      >
        {cells.map((cell, index) => (
          <span
            key={index}
            title={cell.label}
            className={activityGridVariants({ level: cell.level }).cell()}
          />
        ))}
      </div>
    );
  }

  // One Tab stop for the grid: the selected day, or the first.
  const focusable = value !== null && value >= 0 && value < cells.length ? value : 0;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -columns,
      ArrowDown: columns,
    };
    let next: number | undefined;
    if (event.key in moves) next = index + (moves[event.key] ?? 0);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = cells.length - 1;
    if (next === undefined || next < 0 || next >= cells.length) return;
    event.preventDefault();
    refs.current[next]?.focus();
    onValueChange(next);
  };

  return (
    <div
      role="group"
      aria-label={summary}
      className={slots.root({ className })}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...style }}
      {...props}
    >
      {cells.map((cell, index) => (
        <button
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="button"
          title={cell.label}
          aria-label={cell.label ?? `Day ${index + 1}, ${LEVEL_NAMES[cell.level].toLowerCase()}`}
          aria-pressed={value === index}
          tabIndex={index === focusable ? 0 : -1}
          onClick={() => onValueChange(index)}
          onKeyDown={(event) => onKeyDown(event, index)}
          className={activityGridVariants({
            level: cell.level,
            interactive: true,
            selected: value === index,
          }).cell()}
        />
      ))}
    </div>
  );
}
ActivityGridRoot.displayName = 'ActivityGrid';

export interface ActivityGridLegendProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Your own words for the three states. Any left out keep the default. */
  labels?: Partial<Record<ActivityLevel, ReactNode>>;
}

/** What the three kinds of pill mean. */
function ActivityGridLegend({ labels, className, ...props }: ActivityGridLegendProps) {
  const slots = activityGridVariants();
  return (
    <div className={slots.legend({ className })} {...props}>
      {(['reached', 'partial', 'none'] as const).map((level) => (
        <span key={level} className={slots.legendItem()}>
          {labels?.[level] ?? LEVEL_NAMES[level]}
          <span aria-hidden="true" className={activityGridVariants({ level }).swatch()} />
        </span>
      ))}
    </div>
  );
}
ActivityGridLegend.displayName = 'ActivityGrid.Legend';

export const ActivityGrid = Object.assign(ActivityGridRoot, {
  Legend: ActivityGridLegend,
});

/* By name as well, for a Server Component, which cannot dot into a client
   module. */
export { ActivityGridLegend };

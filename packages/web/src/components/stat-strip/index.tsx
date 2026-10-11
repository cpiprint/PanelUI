/**
 * StatStrip — a few figures as one panel, split by hairlines.
 *
 * ```tsx
 * <StatStrip>
 *   <StatStrip.Item label="Issues">
 *     12
 *     <StatStrip.Trend value={-3} goodDirection="down" />
 *   </StatStrip.Item>
 *   <StatStrip.Item label="Review">
 *     3 <StatStrip.Unit>h</StatStrip.Unit>
 *   </StatStrip.Item>
 * </StatStrip>
 * ```
 *
 * ## The shape is the KPI panel's
 *
 * Each figure is a quiet label, the value under it in bold, and the change
 * under that. A rule runs between one figure and the next, the full height of
 * the strip, so a row of them reads as one panel with divisions and not as
 * separate cards.
 *
 * ## The trend is given a number
 *
 * `StatStrip.Trend` takes the change as a number and decides the sign and the
 * colour itself, so a minus sign and a red cannot fall out of step at the call
 * site. Where a rise is the bad news, such as latency, cost or open issues,
 * say so with `goodDirection="down"` and the colour follows the meaning.
 *
 * ## Not a client module
 *
 * It holds no state and handles no events, so there is no `'use client'` at
 * the top. A Server Component can render it, dotted parts and all, and it
 * adds nothing to the JavaScript a page sends.
 */
import type { ComponentProps, ReactNode } from 'react';
import { tv } from 'tailwind-variants';

const statStripVariants = tv({
  slots: {
    // A container, so the figures can be set a size smaller when the strip
    // itself is narrow, wherever on the page that happens to be.
    root: '@container flex w-full divide-border',
    /*
     * The room on either side of a rule is the item's padding, so the rule
     * runs the full height or width of the strip. Which sides are padded
     * depends on the strip's direction, and an item learns that from two
     * variables the strip sets. No context is needed, which is what lets the
     * whole component stay a server module.
     */
    item: 'flex min-w-0 flex-1 flex-col gap-1 px-[var(--pu-gap-x)] py-[var(--pu-gap-y)] first:ps-0 first:pt-0 last:pe-0 last:pb-0',
    label: 'text-sm font-medium text-muted-foreground',
    value: 'text-xl font-bold tracking-tight text-foreground @sm:text-2xl',
    unit: 'text-[0.6em] font-medium text-muted-foreground',
    trend: 'mt-1 flex flex-wrap items-baseline gap-x-1.5 text-sm font-medium tracking-normal',
    caption: 'font-normal text-muted-foreground',
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'flex-row items-stretch divide-x [--pu-gap-x:0.75rem] [--pu-gap-y:0px] @sm:[--pu-gap-x:1rem]',
      },
      vertical: { root: 'flex-col divide-y [--pu-gap-x:0px] [--pu-gap-y:1rem]' },
    },
    /** Which way the figure moved, after the metric's own polarity. */
    tone: {
      good: { trend: 'text-[var(--success)]' },
      bad: { trend: 'text-destructive' },
      flat: { trend: 'text-muted-foreground' },
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});

export interface StatStripProps extends ComponentProps<'dl'> {
  /** Side by side with upright rules, or stacked with level ones. */
  orientation?: 'horizontal' | 'vertical';
}

function StatStripRoot({ orientation = 'horizontal', className, ...props }: StatStripProps) {
  const slots = statStripVariants({ orientation });
  return <dl className={slots.root({ className })} {...props} />;
}
StatStripRoot.displayName = 'StatStrip';

export interface StatStripItemProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** What the figure is. Drawn over it. */
  label: ReactNode;
  /** Extra classes for the figure. */
  valueClassName?: string;
  /** Extra classes for the label. */
  labelClassName?: string;
  /** The figure, and a `StatStrip.Trend` after it if there is one. */
  children?: ReactNode;
}

function StatStripItem({
  label,
  className,
  valueClassName,
  labelClassName,
  children,
  ...props
}: StatStripItemProps) {
  const slots = statStripVariants();
  return (
    <div className={slots.item({ className })} {...props}>
      <dt className={slots.label({ className: labelClassName })}>{label}</dt>
      <dd className={slots.value({ className: valueClassName })}>{children}</dd>
    </div>
  );
}
StatStripItem.displayName = 'StatStrip.Item';

export interface StatStripUnitProps extends ComponentProps<'span'> {}

/** The unit after a figure, smaller and quieter than the number: "h", "km". */
function StatStripUnit({ className, ...props }: StatStripUnitProps) {
  const slots = statStripVariants();
  return <span className={slots.unit({ className })} {...props} />;
}
StatStripUnit.displayName = 'StatStrip.Unit';

export interface StatStripTrendProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** The change. Its sign decides the direction; zero is drawn as no change. */
  value: number;
  /**
   * Writes the change. Defaults to a signed percentage: "+7.8%". The number it
   * is given is already positive, and the sign is added for you.
   */
  format?: (magnitude: number) => string;
  /** Which direction is the good news. `down` for latency, cost, open issues. */
  goodDirection?: 'up' | 'down';
  /** Quiet words after the change: "this week". */
  children?: ReactNode;
}

/** How the figure moved, coloured by whether that is good. */
function StatStripTrend({
  value,
  format = (magnitude) => `${magnitude}%`,
  goodDirection = 'up',
  className,
  children,
  ...props
}: StatStripTrendProps) {
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const tone = direction === 'flat' ? 'flat' : direction === goodDirection ? 'good' : 'bad';
  const slots = statStripVariants({ tone });
  // A true minus, which is the width of the plus it sits in a column with.
  const sign = direction === 'up' ? '+' : direction === 'down' ? '−' : '';
  return (
    <span className={slots.trend({ className })} {...props}>
      <span>
        {sign}
        {format(Math.abs(value))}
      </span>
      {children ? <span className={slots.caption()}>{children}</span> : null}
    </span>
  );
}
StatStripTrend.displayName = 'StatStrip.Trend';

export const StatStrip = Object.assign(StatStripRoot, {
  Item: StatStripItem,
  Unit: StatStripUnit,
  Trend: StatStripTrend,
});

export { StatStripItem, StatStripUnit, StatStripTrend };

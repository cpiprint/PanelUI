/**
 * StatStrip — a row of figures, each over the words that say what it is.
 *
 * ```tsx
 * <StatStrip>
 *   <StatStrip.Item label="Average session">9 minutes</StatStrip.Item>
 *   <StatStrip.Item label="Current mood">Calm</StatStrip.Item>
 *   <StatStrip.Item label="Meditation time" accent>
 *     8:30 <StatStrip.Unit>PM</StatStrip.Unit>
 *   </StatStrip.Item>
 * </StatStrip>
 * ```
 *
 * ## The figure comes first
 *
 * The value is on top and large, the label under it and quiet, because the
 * number is what somebody came for and the label is how they check they are
 * reading the right one. In the markup it is the other way round: a
 * description list, term then value, so a screen reader hears "Average
 * session, 9 minutes" in the order that makes sense spoken.
 *
 * ## The ends line up with the edges
 *
 * The first figure is set against the left edge and the last against the
 * right, with any between them centred. A strip under a card then shares the
 * card's two margins, where three centred columns would float inside them.
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
    root: 'grid w-full auto-cols-fr grid-flow-col gap-4 [--pu-accent:var(--panelui-accent,oklch(0.7_0.19_42))]',
    // Reversed, so the value is drawn above the term it follows in the markup.
    item: 'flex min-w-0 flex-col-reverse items-center gap-1 text-center first:items-start first:text-start last:items-end last:text-end only:items-start only:text-start',
    label: 'text-muted-foreground',
    value: 'text-2xl font-medium tracking-tight',
    unit: 'text-[0.75em] font-normal text-muted-foreground',
  },
  variants: {
    accent: {
      true: { value: 'text-[var(--pu-accent)]' },
    },
  },
});

export interface StatStripProps extends ComponentProps<'dl'> {}

function StatStripRoot({ className, ...props }: StatStripProps) {
  const slots = statStripVariants();
  return <dl className={slots.root({ className })} {...props} />;
}
StatStripRoot.displayName = 'StatStrip';

export interface StatStripItemProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** What the figure is. Drawn under it. */
  label: ReactNode;
  /** Draw the figure in the accent colour. For the one that matters now. */
  accent?: boolean;
  /** Extra classes for the figure. */
  valueClassName?: string;
  /** Extra classes for the label. */
  labelClassName?: string;
  /** The figure. */
  children?: ReactNode;
}

function StatStripItem({
  label,
  accent = false,
  className,
  valueClassName,
  labelClassName,
  children,
  ...props
}: StatStripItemProps) {
  const slots = statStripVariants({ accent });
  return (
    <div className={slots.item({ className })} {...props}>
      <dt className={slots.label({ className: labelClassName })}>{label}</dt>
      <dd className={slots.value({ className: valueClassName })}>{children}</dd>
    </div>
  );
}
StatStripItem.displayName = 'StatStrip.Item';

export interface StatStripUnitProps extends ComponentProps<'span'> {}

/** The unit after a figure, smaller and quieter than the number: "PM", "km". */
function StatStripUnit({ className, ...props }: StatStripUnitProps) {
  const slots = statStripVariants();
  return <span className={slots.unit({ className })} {...props} />;
}
StatStripUnit.displayName = 'StatStrip.Unit';

export const StatStrip = Object.assign(StatStripRoot, {
  Item: StatStripItem,
  Unit: StatStripUnit,
});

export { StatStripItem, StatStripUnit };

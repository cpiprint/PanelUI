'use client';

/**
 * RangeMeter — where a reading sits between its lowest and its highest, on a
 * track you can drag along.
 *
 * ```tsx
 * <RangeMeter min={54} max={98} value={bpm} onValueChange={setBpm} marker={76}>
 *   <HeartIcon />
 * </RangeMeter>
 * ```
 *
 * ## The thumb carries the number
 *
 * A slider usually asks you to look at the thumb and then somewhere else for
 * what it is set to. Here the value is written on the thumb, so the place on
 * the track and the figure are one thing to read. That is also why the thumb
 * is a pill and not a dot: it has to hold two or three digits.
 *
 * ## A reading or a control
 *
 * With `onValueChange` it is a slider: drag it, or use the arrow keys. Without
 * it, the same drawing is a meter that shows a value and cannot be moved.
 * Either way a screen reader is given the value and the range it is in.
 *
 * ## The track warms towards the reading
 *
 * The track is the accent at both ends and deepens towards the thumb, with a
 * glow under it. The gradient is centred on the value, so it moves with the
 * thumb and the brightest part of the track is always where the reading is.
 */
import {
  useCallback,
  useRef,
  type ComponentProps,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { tv } from 'tailwind-variants';

const rangeMeterVariants = tv({
  slots: {
    // 44px tall whatever the track's thickness, so there is always that much
    // to press and the thumb has room to sit across the track.
    root: 'relative flex h-11 w-full touch-none select-none items-center outline-none [--pu-accent:var(--panelui-accent,oklch(0.7_0.19_42))] [--pu-accent-deep:color-mix(in_oklab,var(--pu-accent),oklch(0.58_0.24_27)_70%)]',
    track: 'relative h-2.5 w-full rounded-full',
    cap: 'absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full border-2 border-[color-mix(in_oklab,var(--pu-accent),white_25%)] bg-background',
    marker:
      'absolute top-1/2 h-11 w-px -translate-x-1/2 -translate-y-1/2 border-s border-dashed border-foreground/35',
    thumb:
      'absolute top-1/2 flex h-11 min-w-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1.5 rounded-full bg-[var(--pu-accent-deep)] px-4 text-base font-semibold tabular-nums text-white shadow-[0_0_24px_-2px_var(--pu-accent-deep)] transition-[scale,box-shadow] duration-150 motion-reduce:transition-none [&_svg]:size-5 [&_svg]:shrink-0',
  },
  variants: {
    interactive: {
      true: {
        root: 'cursor-grab focus-visible:[&_[data-thumb]]:ring-2 focus-visible:[&_[data-thumb]]:ring-ring focus-visible:[&_[data-thumb]]:ring-offset-2 focus-visible:[&_[data-thumb]]:ring-offset-background active:cursor-grabbing active:[&_[data-thumb]]:scale-105',
      },
    },
  },
});

export interface RangeMeterProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /** The low end of the track. */
  min?: number;
  /** The high end of the track. */
  max?: number;
  /** The reading: where the thumb sits and the number written on it. */
  value: number;
  /**
   * Called with the new value as the thumb is dragged or moved with the
   * keyboard. Passing this makes it a slider; without it, it is a meter.
   */
  onValueChange?: (value: number) => void;
  /** How much one arrow key press moves the value, and what a drag snaps to. */
  step?: number;
  /** A value to mark on the track with a dashed line, such as an average. */
  marker?: number;
  /** Writes the number on the thumb. Defaults to the value as it is. */
  formatValue?: (value: number) => ReactNode;
  /** What a screen reader calls it. */
  label?: string;
  /** What a screen reader says for the value: "89 beats per minute". */
  valueText?: string;
  /** Drawn on the thumb before the number: an icon. */
  children?: ReactNode;
}

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export function RangeMeter({
  min = 0,
  max = 100,
  value,
  onValueChange,
  step = 1,
  marker,
  formatValue,
  label = 'Reading',
  valueText,
  className,
  children,
  ...props
}: RangeMeterProps) {
  const interactive = onValueChange !== undefined;
  const slots = rangeMeterVariants({ interactive });
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const span = max - min || 1;
  const share = clamp((value - min) / span, 0, 1);
  const at = `${share * 100}%`;

  const fromPointer = useCallback(
    (clientX: number) => {
      const box = track.current?.getBoundingClientRect();
      if (!box || box.width === 0) return;
      const raw = min + clamp((clientX - box.left) / box.width, 0, 1) * span;
      onValueChange?.(clamp(Math.round(raw / step) * step, min, max));
    },
    [min, max, span, step, onValueChange]
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    fromPointer(event.clientX);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) fromPointer(event.clientX);
  };

  const endDrag = () => {
    dragging.current = false;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const page = Math.max(step, Math.round(span / 10 / step) * step);
    const moves: Record<string, number> = {
      ArrowLeft: value - step,
      ArrowDown: value - step,
      ArrowRight: value + step,
      ArrowUp: value + step,
      PageDown: value - page,
      PageUp: value + page,
      Home: min,
      End: max,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onValueChange(clamp(next, min, max));
  };

  return (
    <div
      role={interactive ? 'slider' : 'meter'}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      tabIndex={interactive ? 0 : undefined}
      className={slots.root({ className })}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      {...props}
    >
      <div
        ref={track}
        className={slots.track()}
        // Deepest under the thumb, the plain accent at both ends.
        style={{
          background: `linear-gradient(to right, color-mix(in oklab, var(--pu-accent), white 25%), var(--pu-accent-deep) ${at}, color-mix(in oklab, var(--pu-accent), white 25%))`,
        }}
      >
        <span className={slots.cap({ className: 'start-0' })} />
        <span className={slots.cap({ className: 'end-0' })} />
      </div>
      {marker !== undefined ? (
        <span
          aria-hidden="true"
          className={slots.marker()}
          style={{ insetInlineStart: `${clamp((marker - min) / span, 0, 1) * 100}%` }}
        />
      ) : null}
      <span
        data-thumb=""
        className={slots.thumb()}
        // Held half its own least width in from each end. At the lowest and
        // highest values a thumb centred on the reading would hang off the
        // track, and off whatever card the meter is in.
        style={{ insetInlineStart: `clamp(2.25rem, ${at}, calc(100% - 2.25rem))` }}
      >
        {children}
        {formatValue ? formatValue(value) : value}
      </span>
    </div>
  );
}
RangeMeter.displayName = 'RangeMeter';

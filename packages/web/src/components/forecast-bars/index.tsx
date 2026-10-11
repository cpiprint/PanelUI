'use client';

/**
 * ForecastBars — a short run of values as capsules, one of them picked.
 *
 * ```tsx
 * <ForecastBars data={week} value={day} onValueChange={setDay} />
 * ```
 *
 * ## A choice, not a chart
 *
 * It looks like a bar chart and behaves like a row of radio buttons. Exactly
 * one bar is picked, picking another moves the pick, and the arrow keys walk
 * along the row. The figure for the picked bar is yours to show beside it,
 * large, which is the point: seven bars this size cannot be read to the
 * percent, but one number can.
 *
 * ## Every bar has a track
 *
 * Each value is drawn inside a capsule the full height of the row. An empty
 * day is then still a shape you can aim at and press, and how full a bar is
 * can be judged against its own track without an axis.
 *
 * ## The baseline is zero
 *
 * A bar's height is its value over `max`, from the bottom. There is no option
 * to start the scale anywhere else, because a bar cropped at the bottom is a
 * length that lies about the number.
 */
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { tv } from 'tailwind-variants';

export interface ForecastBar {
  /** Written under the bar: "M", "Tue". Keep it to a few characters. */
  label: ReactNode;
  value: number;
  /** The long form, for a screen reader: "Monday". Defaults to the label. */
  name?: string;
}

const forecastBarsVariants = tv({
  slots: {
    root: 'flex items-end gap-3 [--pu-accent:var(--panelui-accent,oklch(0.7_0.19_42))] [--pu-accent-deep:color-mix(in_oklab,var(--pu-accent),oklch(0.58_0.24_27)_70%)]',
    bar: 'group flex cursor-pointer flex-col items-center gap-2 rounded-lg outline-none',
    track:
      'relative flex h-21 w-[18px] items-end overflow-hidden rounded-full bg-foreground/[0.07] transition-[background-color,scale] duration-200 group-hover:bg-foreground/[0.11] group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background motion-reduce:transition-none',
    fill: 'w-full rounded-full transition-[height,opacity] duration-500 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none',
    label: 'text-sm text-muted-foreground transition-colors',
  },
  variants: {
    selected: {
      true: {
        // Deep at the top, fading to a pale warm tint at the foot.
        fill: 'bg-linear-to-b from-[var(--pu-accent-deep)] to-[color-mix(in_oklab,var(--pu-accent),white_55%)]',
        label: 'text-foreground',
      },
      false: {
        fill: 'bg-linear-to-b from-[var(--pu-accent-deep)] to-[color-mix(in_oklab,var(--pu-accent),white_55%)] opacity-45',
      },
    },
  },
});

export interface ForecastBarsProps extends Omit<ComponentProps<'div'>, 'children' | 'onChange' | 'defaultValue'> {
  /** The bars, left to right. */
  data: ForecastBar[];
  /** The value a full bar stands for. Defaults to the largest in `data`. */
  max?: number;
  /** The index of the picked bar, when the caller holds it. */
  value?: number;
  /** The index picked to begin with, when the caller does not hold it. */
  defaultValue?: number;
  /** Called with the index of a bar when it is picked. */
  onValueChange?: (index: number) => void;
  /** Writes a value for a screen reader: "78 percent". */
  formatValue?: (value: number) => string;
  /** What a screen reader calls the row. */
  label?: string;
}

export function ForecastBars({
  data,
  max,
  value,
  defaultValue = 0,
  onValueChange,
  formatValue = (bar) => String(bar),
  label = 'Forecast',
  className,
  ...props
}: ForecastBarsProps) {
  const slots = forecastBarsVariants();
  const [internal, setInternal] = useState(defaultValue);
  const picked = value ?? internal;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  // The bars start empty and grow once mounted, so they are seen arriving.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const ceiling = max ?? Math.max(1, ...data.map((bar) => bar.value));

  const pick = (index: number) => {
    if (value === undefined) setInternal(index);
    onValueChange?.(index);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const moves: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowDown: index - 1,
      ArrowRight: index + 1,
      ArrowUp: index + 1,
      Home: 0,
      End: data.length - 1,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    // Round the ends, as a radio group does.
    const next = (target + data.length) % data.length;
    refs.current[next]?.focus();
    pick(next);
  };

  return (
    <div role="radiogroup" aria-label={label} className={slots.root({ className })} {...props}>
      {data.map((bar, index) => {
        const selected = index === picked;
        const part = forecastBarsVariants({ selected });
        const height = grown ? Math.min(1, Math.max(0, bar.value / ceiling)) * 100 : 0;
        return (
          <button
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${bar.name ?? (typeof bar.label === 'string' ? bar.label : `Bar ${index + 1}`)}: ${formatValue(bar.value)}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => pick(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={slots.bar()}
          >
            <span className={slots.track()}>
              {/* Never shorter than it is wide, so a small value is still a
                  rounded mark and not a sliver. Zero is drawn as nothing. */}
              <span
                className={part.fill()}
                style={{ height: `${height}%`, minHeight: bar.value > 0 && grown ? 18 : 0 }}
              />
            </span>
            <span aria-hidden="true" className={part.label()}>
              {bar.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
ForecastBars.displayName = 'ForecastBars';

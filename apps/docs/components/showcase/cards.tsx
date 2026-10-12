'use client';

import {
  BellIcon,
  BoldIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  ImageIcon,
  ItalicIcon,
  MailIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  SendHorizontalIcon,
  StarIcon,
  UnderlineIcon,
  Volume2Icon,
  XIcon,
} from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { radioIndexForKey } from '../composite-keyboard';

/**
 * The previews on the home page: the library's components, drawn in the
 * browser, and working.
 *
 * These are markup, not the real components — the real ones are React Native
 * and putting them on this page would mean shipping react-native-web to every
 * visitor. What makes them worth having anyway is that every class name here
 * is copied from the component it stands for, so a preview and the thing it
 * previews are the same colours, the same radii and the same spacing rather
 * than a designer's impression of them. When a component's variants change,
 * these are wrong, and the fix is to copy the new strings across.
 *
 * They are also why the token work in `panel-themes.css` matters: nothing here
 * names a colour, so every one of these surfaces rethemes together.
 *
 * Each one does what the component it stands for does: a switch switches, the
 * slider drags, the calendar turns its month. A picture of a control tells a
 * visitor what it looks like; pressing it tells them what it is like to use,
 * which is the half that decides whether they want it.
 */

/** The ring every control here shows when it is reached with the keyboard. */
const FOCUS =
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card';

/** How something pressable gives under the pointer. */
const PRESS = 'cursor-pointer transition-[scale,opacity,background-color,border-color] duration-150 active:scale-[0.97]';

/* ------------------------------------------------------------------ *
 * The shells every preview is built in — Card and Frame.
 * ------------------------------------------------------------------ */

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col rounded-2xl border border-border bg-card shadow-sm', className)}>
      {children}
    </div>
  );
}

function CardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-1.5 p-5">
      <span className="text-lg font-semibold leading-none text-card-foreground">{title}</span>
      {description ? <span className="text-sm text-muted-foreground">{description}</span> : null}
    </div>
  );
}

function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-col p-5 pt-0', className)}>{children}</div>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{children}</span>
  );
}

/* ------------------------------------------------------------------ *
 * The controls themselves.
 * ------------------------------------------------------------------ */

/** Button — `variant` × `size`. */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled,
  'aria-label': ariaLabel,
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
}) {
  const root = {
    primary: 'border-primary bg-primary shadow-sm hover:opacity-90',
    secondary: 'bg-secondary hover:opacity-80',
    outline: 'border-input bg-popover shadow-sm hover:bg-accent',
    ghost: 'bg-transparent hover:bg-accent',
    destructive: 'border-destructive bg-destructive shadow-sm hover:opacity-90',
  }[variant];

  const label = {
    primary: 'text-primary-foreground',
    secondary: 'text-secondary-foreground',
    outline: 'text-foreground',
    ghost: 'text-foreground',
    destructive: 'text-destructive-solid-foreground',
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex flex-row items-center justify-center gap-2 rounded-lg border border-transparent disabled:pointer-events-none disabled:opacity-[0.64]',
        size === 'sm' ? 'h-9 gap-1.5 px-2.5' : 'h-11 px-4',
        PRESS,
        FOCUS,
        root,
        className
      )}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-medium',
          size === 'sm' ? 'text-sm' : 'text-base',
          label
        )}
      >
        {children}
      </span>
    </button>
  );
}

/** Badge — the pill, in the variants that carry a status colour. */
function Badge({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'info';
}) {
  const root = {
    default: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'border-border bg-transparent',
    success: 'bg-success-subtle',
    warning: 'bg-warning-subtle',
    info: 'bg-info-subtle',
  }[variant];

  const label = {
    default: 'text-primary-foreground',
    secondary: 'text-secondary-foreground',
    outline: 'text-foreground',
    success: 'text-success-foreground',
    warning: 'text-warning-foreground',
    info: 'text-info-foreground',
  }[variant];

  return (
    <span
      className={cn(
        'inline-flex flex-row items-center justify-center gap-1 self-start rounded-sm border border-transparent px-2 py-0.5',
        root
      )}
    >
      <span className={cn('text-xs font-medium', label)}>{children}</span>
    </span>
  );
}

/** Input — the outline field, with optional content at the start. */
function Input({
  label,
  placeholder,
  value,
  onChange,
  onEnter,
  start,
  size = 'md',
  invalid = false,
  className,
}: {
  /** Said to a screen reader. The visible label, where there is one, is beside it. */
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  start?: ReactNode;
  size?: 'sm' | 'md';
  invalid?: boolean;
  className?: string;
}) {
  const pad = size === 'sm' ? 'px-3' : 'px-3.5';
  return (
    <span className={cn('relative flex w-full', className)}>
      <input
        aria-label={label}
        aria-invalid={invalid || undefined}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onEnter?.();
        }}
        className={cn(
          // 16px on a phone, where anything smaller makes the browser zoom
          // the page in to the field when it is focused.
          'w-full min-w-0 rounded-lg border bg-background font-normal text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40',
          invalid ? 'border-destructive' : 'border-input',
          size === 'sm' ? 'h-10 text-[16px] sm:text-[14px]' : 'h-12 text-[16px]',
          pad,
          start && (size === 'sm' ? 'ps-9' : 'ps-10')
        )}
      />
      {start ? (
        <span
          className={cn(
            'pointer-events-none absolute bottom-0 start-0 top-0 z-10 flex flex-row items-center justify-center gap-2 text-muted-foreground',
            pad
          )}
        >
          {start}
        </span>
      ) : null}
    </span>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="text-sm font-medium text-foreground">{children}</span>;
}

/** Switch — the thumb travels along the track as it is turned on. */
function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        'relative flex h-7 w-12 shrink-0 cursor-pointer flex-row items-center rounded-full border border-transparent p-[3px] transition-colors duration-200',
        FOCUS,
        on ? 'bg-primary' : 'bg-input'
      )}
    >
      <span
        className={cn(
          'h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out',
          on ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors duration-150',
        FOCUS,
        checked ? 'border-primary bg-primary' : 'border-input bg-background'
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn('size-3.5 transition-[scale,opacity] duration-150', checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0')}
        aria-hidden="true"
      >
        <path
          d="M20 6 9 17l-5-5"
          fill="none"
          stroke="var(--primary-foreground)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** Chip — the rounded filter tag, which is on or off. */
function Chip({
  children,
  on,
  onChange,
}: {
  children: ReactNode;
  on: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className={cn(
        'inline-flex h-7 flex-row items-center gap-1.5 self-start rounded-full border px-2.5',
        PRESS,
        FOCUS,
        on ? 'border-transparent bg-success-subtle' : 'border-border bg-transparent'
      )}
    >
      {on ? <CheckIcon className="size-3.5 text-success-foreground" aria-hidden="true" /> : null}
      <span className={cn('text-sm font-medium', on ? 'text-success-foreground' : 'text-foreground')}>
        {children}
      </span>
    </button>
  );
}

function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted',
        className
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">{initials}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * The cards.
 * ------------------------------------------------------------------ */

/** Buttons, fields and the small controls, in one panel. */
export function ControlsCard() {
  const [presses, setPresses] = useState(0);
  const [query, setQuery] = useState('');
  const [note, setNote] = useState('');
  const [checks, setChecks] = useState([true, false]);
  const [switches, setSwitches] = useState([false, true]);
  const [chips, setChips] = useState([true, false, false]);
  const CHIPS = ['Expo Go', 'Reanimated', 'Uniwind'];

  return (
    <Card className="gap-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setPresses(presses + 1)}>
          {presses === 0 ? 'Button' : `Pressed ${presses}`}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setPresses(0)}>
          Secondary
        </Button>
        <Button size="sm" variant="outline">
          Outline
        </Button>
      </div>

      <Input
        label="Search components"
        placeholder="Search components"
        value={query}
        onChange={setQuery}
        start={<SearchIcon className="size-4" />}
        size="sm"
      />

      <textarea
        aria-label="Message"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Leave a message…"
        className="h-20 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-[16px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 sm:text-[14px]"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge>Badge</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="success">Shipped</Badge>
      </div>

      <div className="flex flex-row items-center gap-3">
        {checks.map((checked, index) => (
          <Checkbox
            key={index}
            label={`Option ${index + 1}`}
            checked={checked}
            onChange={(next) => setChecks(checks.map((was, at) => (at === index ? next : was)))}
          />
        ))}
        <span className="ms-auto flex flex-row items-center gap-3">
          {switches.map((on, index) => (
            <Switch
              key={index}
              label={`Setting ${index + 1}`}
              on={on}
              onChange={(next) => setSwitches(switches.map((was, at) => (at === index ? next : was)))}
            />
          ))}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {CHIPS.map((chip, index) => (
          <Chip
            key={chip}
            on={chips[index]}
            onChange={(next) => setChips(chips.map((was, at) => (at === index ? next : was)))}
          >
            {chip}
          </Chip>
        ))}
      </div>
    </Card>
  );
}

type FileState = 'uploading' | 'done' | 'error';

interface Upload {
  id: string;
  icon: typeof ImageIcon;
  name: string;
  size: string;
  state: FileState;
  progress: number;
}

const UPLOADS: Upload[] = [
  { id: 'hero', icon: ImageIcon, name: 'launch-hero@2x.png', size: 'PNG · 1.8 MB', state: 'uploading', progress: 62 },
  { id: 'deck', icon: FileTextIcon, name: 'sales-dashboard.pdf', size: 'PDF · 2.4 MB', state: 'done', progress: 100 },
  { id: 'sheet', icon: FileTextIcon, name: 'q3-forecast.xlsx', size: 'XLSX · 640 KB', state: 'error', progress: 0 },
];

/**
 * Attachment — file rows in the three states they pass through: uploading with
 * a hairline of progress along the bottom edge, done, and failed with the
 * border carrying the failure so it reads at a glance down a list. The upload
 * runs, a failed one can be tried again, and any of them can be taken off.
 */
export function AttachmentCard() {
  const [files, setFiles] = useState(UPLOADS);
  const busy = files.some((file) => file.state === 'uploading');

  useEffect(() => {
    if (!busy) return;
    const timer = window.setInterval(() => {
      setFiles((current) =>
        current.map((file) => {
          if (file.state !== 'uploading') return file;
          const progress = Math.min(100, file.progress + 2);
          return progress === 100 ? { ...file, progress, state: 'done' } : { ...file, progress };
        })
      );
    }, 120);
    return () => window.clearInterval(timer);
  }, [busy]);

  return (
    <Card className="gap-3 p-4">
      <Eyebrow>Attachments</Eyebrow>
      {files.map(({ id, icon: Icon, name, size, state, progress }) => (
        <div
          key={id}
          className={cn(
            'relative w-full overflow-hidden rounded-xl border p-4 transition-colors duration-200',
            state === 'error' ? 'border-destructive' : 'border-border'
          )}
        >
          <div className="flex w-full flex-row items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                className={cn(
                  'truncate text-base font-medium',
                  state === 'error' ? 'text-destructive' : 'text-foreground'
                )}
              >
                {name}
              </span>
              {state === 'error' ? (
                <button
                  type="button"
                  onClick={() =>
                    setFiles(files.map((file) => (file.id === id ? { ...file, state: 'uploading', progress: 0 } : file)))
                  }
                  className={cn('self-start rounded-sm text-sm text-destructive underline underline-offset-2', PRESS, FOCUS)}
                >
                  Upload failed. Try again
                </button>
              ) : (
                <span className="truncate text-sm tabular-nums text-muted-foreground">
                  {state === 'uploading' ? `Uploading · ${progress}%` : size}
                </span>
              )}
            </span>
            <button
              type="button"
              aria-label={`Remove ${name}`}
              onClick={() => setFiles(files.filter((file) => file.id !== id))}
              className={cn('flex size-7 shrink-0 items-center justify-center rounded-full hover:bg-accent', PRESS, FOCUS)}
            >
              <XIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            </button>
          </div>
          {state === 'uploading' ? (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted">
              <span
                className="block h-full bg-primary transition-[width] duration-150 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </span>
          ) : null}
        </div>
      ))}
      {files.length < UPLOADS.length ? (
        <Button size="sm" variant="outline" onClick={() => setFiles(UPLOADS)}>
          <PlusIcon className="size-4" aria-hidden="true" />
          Attach them again
        </Button>
      ) : null}
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Frame — the widget shell every chart demo is shown in: a titled tray
 * with the card flush inside it.
 * ------------------------------------------------------------------ */

function Frame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-3xl border border-border bg-surface', className)}>
      {children}
    </div>
  );
}

function FrameHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-row items-center justify-between gap-3 px-4 pb-3 pt-2.5">
      <span className="min-w-0 shrink truncate text-sm text-muted-foreground">{title}</span>
      {action ? (
        <span className="flex shrink-0 flex-row items-center gap-2 text-sm text-muted-foreground">
          {action}
        </span>
      ) : null}
    </div>
  );
}

function FramePanel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-t-2xl border-t border-border bg-card', className)}>
      {children}
    </div>
  );
}

/** The value, caption and series key a chart puts above its plot. */
function ChartHeader({
  value,
  caption,
  series,
}: {
  value: string;
  caption: string;
  series: { label: string; color: string }[];
}) {
  return (
    <div className="flex flex-row items-start justify-between gap-3 px-4 pb-3 pt-3.5">
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-xl font-bold tabular-nums text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{caption}</span>
      </div>
      <div className="shrink pt-1">
        <div className="flex flex-row flex-wrap items-center justify-end gap-x-3 gap-y-1">
          {series.map(({ label, color }) => (
            <span key={label} className="flex flex-row items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * A curve through every point, as cubic segments with horizontal handles —
 * the shape the chart utilities produce for a monotone series: it reaches each
 * point and never overshoots between two of them.
 */
function segments(points: [number, number][]): string {
  return points
    .slice(1)
    .map(([x, y], index) => {
      const [px, py] = points[index];
      const dx = (x - px) / 3;
      return `C${px + dx},${py} ${x - dx},${y} ${x},${y}`;
    })
    .join(' ');
}

function curve(points: [number, number][]): string {
  return `M${points[0][0]},${points[0][1]} ${segments(points)}`;
}

/** A filled band: down the top edge, across, and back along the bottom one. */
function band(top: [number, number][], bottom: [number, number][]): string {
  return `${curve(top)} L${bottom[0][0]},${bottom[0][1]} ${segments(bottom)} Z`;
}

const AREA_DATA = [
  { hour: '00', direct: 18, search: 26, social: 10 },
  { hour: '02', direct: 22, search: 24, social: 12 },
  { hour: '04', direct: 16, search: 30, social: 9 },
  { hour: '06', direct: 28, search: 34, social: 14 },
  { hour: '08', direct: 42, search: 46, social: 18 },
  { hour: '10', direct: 55, search: 52, social: 24 },
  { hour: '12', direct: 61, search: 58, social: 27 },
  { hour: '14', direct: 54, search: 63, social: 22 },
  { hour: '16', direct: 66, search: 57, social: 29 },
  { hour: '18', direct: 72, search: 64, social: 33 },
  { hour: '20', direct: 58, search: 55, social: 26 },
  { hour: '22', direct: 44, search: 48, social: 20 },
];

/**
 * AreaChart, stacked, in the Frame the demo puts it in: the tray names the
 * widget, the panel holds the chart, and the chart's own header carries the
 * total and the series key. Pointing at the plot reads off one hour of it.
 */
export function AreaChartCard() {
  const W = 300;
  const H = 96;
  const MAX = 180;
  const step = W / (AREA_DATA.length - 1);
  const y = (value: number) => H - (value / MAX) * H;
  const at = (index: number) => index * step;
  const id = useId();
  /** The hour under the pointer, by its place in the data. */
  const [hover, setHover] = useState<number | null>(null);

  /* Stacked: each band sits on the sum of the ones declared before it. */
  const totals = AREA_DATA.map((d) => [d.direct, d.direct + d.search, d.direct + d.search + d.social]);

  const bands = [
    { key: 'direct', label: 'Direct', color: 'var(--chart-1)', level: 0 },
    { key: 'search', label: 'Search', color: 'var(--chart-2)', level: 1 },
    { key: 'social', label: 'Social', color: 'var(--chart-3)', level: 2 },
  ];

  const point = (event: ReactPointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const share = (event.clientX - box.left) / box.width;
    setHover(Math.min(AREA_DATA.length - 1, Math.max(0, Math.round(share * (AREA_DATA.length - 1)))));
  };

  return (
    <Frame>
      <FrameHeader title="Sessions by channel" action="Today" />
      <FramePanel>
        <ChartHeader
          value={hover === null ? '4,812' : String(totals[hover][2] * 8)}
          caption={hover === null ? 'Across the day' : `At ${AREA_DATA[hover].hour}:00`}
          /* Reversed, because a stacked key reads top band first. */
          series={[...bands].reverse().map(({ label, color }) => ({ label, color }))}
        />
        <div className="relative px-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-32 w-full cursor-crosshair touch-none"
            preserveAspectRatio="none"
            role="img"
            aria-label="Sessions by channel across the day"
            onPointerMove={point}
            onPointerDown={point}
            onPointerLeave={() => setHover(null)}
          >
            <defs>
              {bands.map(({ key, color }) => (
                <linearGradient key={key} id={`${id}-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={color} stopOpacity="0.85" />
                  <stop offset="1" stopColor={color} stopOpacity="0.35" />
                </linearGradient>
              ))}
            </defs>

            {/* Dashed and quiet: the gridlines are a reference, not content. */}
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="0"
                y1={(H / 3) * i}
                x2={W}
                y2={(H / 3) * i}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {bands.map(({ key, color, level }) => {
              const top: [number, number][] = totals.map((t, i) => [at(i), y(t[level])]);
              /* The lowest band sits on the axis; the others sit on the one
                 below, walked backwards so the shape closes. */
              const floor: [number, number][] =
                level === 0
                  ? [
                      [W, H],
                      [0, H],
                    ]
                  : totals.map((t, i) => [at(i), y(t[level - 1])] as [number, number]).reverse();

              return (
                <g key={key}>
                  <path d={band(top, floor)} fill={`url(#${id}-${key})`} />
                  <path
                    d={curve(top)}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}

            {hover !== null ? (
              <line
                x1={at(hover)}
                y1="0"
                x2={at(hover)}
                y2={H}
                stroke="var(--foreground)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>

          <div className="flex flex-row pb-3 pt-2">
            {['00:00', '06:00', '12:00', '17:00', '23:00'].map((hour) => (
              <span key={hour} className="flex-1 text-center text-xs text-muted-foreground">
                {hour}
              </span>
            ))}
          </div>
        </div>
      </FramePanel>
    </Frame>
  );
}

const MONTHS = [
  { month: 'Dec', full: 'December', value: 562 },
  { month: 'Jan', full: 'January', value: 1044 },
  { month: 'Feb', full: 'February', value: 736 },
  { month: 'Mar', full: 'March', value: 1284 },
  { month: 'Apr', full: 'April', value: 816 },
  { month: 'May', full: 'May', value: 455 },
];

/** BarChart in its own Frame — categories compared by length. A bar can be picked. */
export function BarChartCard() {
  const [picked, setPicked] = useState(3);
  const peak = Math.max(...MONTHS.map(({ value }) => value));
  const current = MONTHS[picked];

  return (
    <Frame>
      <FrameHeader title="Contributions" action="6 months" />
      <FramePanel className="px-4 pb-3 pt-3.5">
        <div className="flex flex-col gap-0.5 pb-3">
          <span className="text-xl font-bold tabular-nums text-foreground">
            {current.value.toLocaleString('en-US')}
          </span>
          <span className="text-xs text-muted-foreground">
            {current.value === peak ? `Peak in ${current.full}` : `In ${current.full}`}
          </span>
        </div>
        {/*
         * `items-stretch`, not `items-end`: the bars are percentage heights,
         * and a percentage needs a parent with a height to be a percentage of.
         * Under `items-end` each column shrinks to its content — which is
         * nothing — and the chart draws as an empty box.
         */}
        <div className="flex h-24 flex-row items-stretch gap-2" role="radiogroup" aria-label="Month">
          {MONTHS.map(({ month, full, value }, index) => (
            <button
              key={month}
              type="button"
              role="radio"
              aria-checked={picked === index}
              aria-label={`${full}: ${value}`}
              onClick={() => setPicked(index)}
              className={cn('group flex flex-1 cursor-pointer flex-col justify-end rounded-md', FOCUS)}
            >
              <span
                className={cn(
                  'w-full rounded-t-md bg-chart-1 transition-opacity duration-200',
                  picked === index ? 'opacity-100' : 'opacity-[0.28] group-hover:opacity-60'
                )}
                style={{ height: `${Math.round((value / peak) * 96)}%` }}
              />
            </button>
          ))}
        </div>
        <div className="flex flex-row gap-2 pt-2">
          {MONTHS.map(({ month }, index) => (
            <span
              key={month}
              className={cn(
                'flex-1 text-center text-xs transition-colors',
                picked === index ? 'font-medium text-foreground' : 'text-muted-foreground'
              )}
            >
              {month}
            </span>
          ))}
        </div>
      </FramePanel>
    </Frame>
  );
}

type Spark = [number, number][];

const RISING: Spark = [
  [0, 30],
  [16, 26],
  [32, 27],
  [48, 18],
  [64, 16],
  [80, 10],
  [96, 4],
];
const FALLING: Spark = [
  [0, 6],
  [16, 9],
  [32, 12],
  [48, 14],
  [64, 20],
  [80, 22],
  [96, 30],
];
const BUMPY: Spark = [
  [0, 24],
  [16, 14],
  [32, 22],
  [48, 9],
  [64, 18],
  [80, 8],
  [96, 12],
];

/** One set of figures for each period the panel can be asked about. */
const PERIODS = [
  {
    label: 'Last 7 days',
    rows: [
      { value: '$74,180', delta: '+2.1%', spark: BUMPY },
      { value: '39.2%', delta: '−1.6%', spark: BUMPY },
      { value: '612', delta: '+0.9%', spark: RISING },
    ],
  },
  {
    label: 'Last 30 days',
    rows: [
      { value: '$317,904', delta: '+7.8%', spark: RISING },
      { value: '37.6%', delta: '−8.4%', spark: FALLING },
      { value: '2,867', delta: '+4.2%', spark: RISING },
    ],
  },
  {
    label: 'Last 90 days',
    rows: [
      { value: '$902,455', delta: '+18.3%', spark: RISING },
      { value: '41.0%', delta: '−3.1%', spark: FALLING },
      { value: '8,140', delta: '+11.6%', spark: BUMPY },
    ],
  },
];

const KPI_ROWS = [
  { label: 'Total Revenue', color: 'var(--chart-1)' },
  { label: 'Bounce Rate', color: 'var(--chart-3)' },
  { label: 'New Customers', color: 'var(--chart-2)' },
];

/**
 * KPI — several metrics gathered into one panel: the number, what it did, and
 * the shape it made getting there, one row each under a shared tray header.
 * The header's action steps through the periods.
 */
export function KpiCard() {
  const [period, setPeriod] = useState(1);
  const { label, rows } = PERIODS[period];

  return (
    <Frame>
      <FrameHeader
        title="Overview"
        action={
          <button
            type="button"
            onClick={() => setPeriod((period + 1) % PERIODS.length)}
            aria-label={`${label}. Show the next period`}
            className={cn('-me-1.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-accent hover:text-foreground', PRESS, FOCUS)}
          >
            {label}
            <ChevronDownIcon className="size-3.5" aria-hidden="true" />
          </button>
        }
      />
      <FramePanel>
        {KPI_ROWS.map(({ label: name, color }, index) => (
          <div
            key={name}
            className={cn(
              'flex flex-row items-center gap-4 px-4 py-4',
              /* Frame.Panel rules its children apart; the first has the
                 panel's own top edge above it already. */
              index > 0 && 'border-t border-border'
            )}
          >
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">{name}</span>
              <span className="text-2xl font-bold tabular-nums text-foreground">{rows[index].value}</span>
              <span className="text-sm">
                <span className="font-medium tabular-nums text-success">{rows[index].delta}</span>{' '}
                <span className="text-muted-foreground">vs the one before</span>
              </span>
            </div>
            <svg viewBox="0 0 96 36" className="h-10 w-28 shrink-0" aria-hidden="true">
              <path
                d={curve(rows[index].spark)}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-[d] duration-500 ease-out"
              />
            </svg>
          </div>
        ))}
      </FramePanel>
    </Frame>
  );
}

/** A form: labelled fields, then the two buttons that close it. */
export function FormCard() {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('$15,000');
  const [date, setDate] = useState('Dec 2026');
  const [state, setState] = useState<'idle' | 'missing' | 'made'>('idle');

  const create = () => {
    if (!name.trim()) return setState('missing');
    setState('made');
  };
  const clear = () => {
    setName('');
    setTarget('$15,000');
    setDate('Dec 2026');
    setState('idle');
  };

  return (
    <Card>
      <CardHeader title="Set a new milestone" description="Name it, then say when it lands." />
      <CardBody className="gap-4">
        <div className="flex w-full flex-col gap-1.5">
          <Label>Goal name</Label>
          <Input
            label="Goal name"
            placeholder="New device fund"
            value={name}
            onChange={(next) => {
              setName(next);
              if (state !== 'idle') setState('idle');
            }}
            onEnter={create}
            invalid={state === 'missing'}
            size="sm"
          />
          {state === 'missing' ? (
            <span className="text-sm text-destructive" role="alert">
              Give the goal a name first.
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex w-full flex-col gap-1.5">
            <Label>Target</Label>
            <Input label="Target" value={target} onChange={setTarget} onEnter={create} size="sm" />
          </div>
          <div className="flex w-full flex-col gap-1.5">
            <Label>Date</Label>
            <Input label="Date" value={date} onChange={setDate} onEnter={create} size="sm" />
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <Button className="w-full" onClick={state === 'made' ? clear : create}>
            {state === 'made' ? (
              <>
                <CheckIcon className="size-4" aria-hidden="true" />
                Goal created. Make another
              </>
            ) : (
              'Create goal'
            )}
          </Button>
          <Button variant="ghost" className="w-full" onClick={clear}>
            Cancel
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

/** Slider and Progress — the two bars, with their captions. The slider drags. */
export function SlidersCard() {
  const MAX = 5000;
  const STEP = 100;
  const [payout, setPayout] = useState(2500);
  const share = (payout / MAX) * 100;

  const drag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const along = (event.clientX - box.left) / box.width;
    const at = Math.min(1, Math.max(0, rtl ? 1 - along : along));
    setPayout(Math.round((at * MAX) / STEP) * STEP);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const move: Record<string, number> = {
      ArrowRight: STEP,
      ArrowUp: STEP,
      ArrowLeft: -STEP,
      ArrowDown: -STEP,
      PageUp: STEP * 5,
      PageDown: -STEP * 5,
    };
    if (event.key === 'Home') setPayout(0);
    else if (event.key === 'End') setPayout(MAX);
    else if (move[event.key]) setPayout(Math.min(MAX, Math.max(0, payout + move[event.key])));
    else return;
    event.preventDefault();
  };

  return (
    <Card className="gap-5 p-5">
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-row items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">Minimum payout</span>
          <span className="text-sm tabular-nums text-muted-foreground">
            ${payout.toLocaleString('en-US')}
          </span>
        </div>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Minimum payout"
          aria-valuemin={0}
          aria-valuemax={MAX}
          aria-valuenow={payout}
          aria-valuetext={`$${payout.toLocaleString('en-US')}`}
          onKeyDown={onKeyDown}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            drag(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) drag(event);
          }}
          className={cn(
            'relative flex h-5 w-full cursor-grab touch-none flex-row items-center rounded-full bg-muted active:cursor-grabbing',
            FOCUS
          )}
        >
          {/* The fill reaches to the thumb's far edge, so the thumb is the
              end of the fill and never floats past it. */}
          <span
            className="absolute bottom-0 start-0 top-0 min-w-7 rounded-full bg-primary"
            style={{ width: `calc(${share}% + ${(1 - share / 100) * 28}px)` }}
          >
            <span className="absolute bottom-0.5 end-0.5 top-0.5 w-6 rounded-full bg-background shadow-sm" />
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-row items-center justify-between">
          <span className="text-sm font-medium text-foreground">Upload</span>
          <span className="text-sm text-muted-foreground">72%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-primary/16">
          <div className="h-full w-[72%] rounded-full bg-primary" />
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-row items-center justify-between">
          <span className="text-sm font-medium text-foreground">Storage</span>
          <span className="text-sm text-muted-foreground">18%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-success/16">
          <div className="h-full w-[18%] rounded-full bg-success" />
        </div>
      </div>
    </Card>
  );
}

/** Alert — the soft status fill, over the badges that use the subtle one. */
export function AlertCard() {
  const [updated, setUpdated] = useState(false);

  return (
    <Card className="gap-3 p-4">
      <div
        className={cn(
          'flex w-full flex-row items-start gap-3 rounded-xl p-4 transition-colors duration-300',
          updated ? 'bg-success-soft' : 'bg-info-soft'
        )}
        role="status"
      >
        {updated ? (
          <CheckIcon className="mt-0.5 size-4 shrink-0 text-success-foreground" aria-hidden="true" />
        ) : (
          <BellIcon className="mt-0.5 size-4 shrink-0 text-info-foreground" aria-hidden="true" />
        )}
        <div className="flex flex-1 flex-col gap-1">
          <span
            className={cn(
              'text-sm font-semibold',
              updated ? 'text-success-foreground' : 'text-info-foreground'
            )}
          >
            {updated ? 'You are up to date' : 'Update available'}
          </span>
          <span className="text-sm text-muted-foreground">
            {updated ? 'Installed a moment ago.' : 'A newer version is ready to install.'}
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={() => setUpdated(!updated)}>
          {updated ? 'Undo' : 'Update'}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">Info</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    </Card>
  );
}

interface Line {
  id: number;
  from: 'them' | 'me';
  text: string;
}

const REPLIES = [
  'It follows the system setting until you choose.',
  'Yes. Every component reads the same tokens.',
  'No native code, so it runs in Expo Go.',
];

/** A chat transcript, and the composer under it. A message can be sent. */
export function ChatCard() {
  const [lines, setLines] = useState<Line[]>([
    { id: 1, from: 'them', text: 'How do I switch the theme at runtime?' },
    { id: 2, from: 'me', text: 'Call setTheme from useThemeMode.' },
  ]);
  const [draft, setDraft] = useState('');
  const sent = useRef(0);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const reply = REPLIES[sent.current % REPLIES.length];
    sent.current += 1;
    // Only the last few are kept, so the card stays the height it is.
    setLines((current) => [...current, { id: Date.now(), from: 'me' as const, text }].slice(-4));
    setDraft('');
    timer.current = window.setTimeout(() => {
      setLines((current) => [...current, { id: Date.now(), from: 'them' as const, text: reply }].slice(-4));
    }, 700);
  };

  return (
    <Card>
      <div className="flex flex-row items-center gap-3 border-b border-border p-4">
        <Avatar initials="PA" />
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-medium text-foreground">Assistant</span>
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4" aria-live="polite">
        {lines.map(({ id, from, text }, index) => (
          <div
            key={id}
            className={cn(
              'flex w-full items-end justify-start gap-2',
              from === 'me' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div className={cn('flex max-w-[85%] flex-col gap-1', from === 'me' ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'rounded-2xl px-3.5 py-2.5',
                  from === 'me' ? 'rounded-ee-md bg-primary' : 'rounded-es-md bg-muted'
                )}
              >
                <span className={cn('text-base', from === 'me' ? 'text-primary-foreground' : 'text-foreground')}>
                  {text}
                </span>
              </div>
              {from === 'me' && index === lines.length - 1 ? (
                <span className="text-xs text-muted-foreground">Just now</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-row items-center gap-2 border-t border-border p-3">
        <input
          aria-label="Message the assistant"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') send();
          }}
          placeholder="Ask anything…"
          className="h-10 min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-[16px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 sm:text-[14px]"
        />
        <button
          type="button"
          aria-label="Send"
          onClick={send}
          disabled={!draft.trim()}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary disabled:opacity-[0.64]',
            PRESS,
            FOCUS
          )}
        >
          <SendHorizontalIcon className="size-4 text-primary-foreground" aria-hidden="true" />
        </button>
      </div>
    </Card>
  );
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Calendar — a month of days, with one picked and the neighbours dimmed. */
export function CalendarCard() {
  /* Fixed, not today: the server and the browser have to draw the same month. */
  const [shown, setShown] = useState({ year: 2026, month: 6 });
  const [picked, setPicked] = useState({ year: 2026, month: 6, day: 29 });

  const first = new Date(shown.year, shown.month, 1).getDay();
  const length = new Date(shown.year, shown.month + 1, 0).getDate();
  const before = new Date(shown.year, shown.month, 0).getDate();
  /* Six rows always, so the card does not change height from month to month. */
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - first + 1;
    if (day < 1) return { day: before + day, offset: -1 };
    if (day > length) return { day: day - length, offset: 1 };
    return { day, offset: 0 };
  });

  const turn = (by: number) => {
    const next = new Date(shown.year, shown.month + by, 1);
    setShown({ year: next.getFullYear(), month: next.getMonth() });
  };

  const pick = (day: number, offset: number) => {
    const at = new Date(shown.year, shown.month + offset, day);
    setPicked({ year: at.getFullYear(), month: at.getMonth(), day: at.getDate() });
    if (offset !== 0) setShown({ year: at.getFullYear(), month: at.getMonth() });
  };

  const pickedDate = new Date(picked.year, picked.month, picked.day);
  const pickedHere = picked.year === shown.year && picked.month === shown.month;

  /** The arrow keys walk the grid: a day either way, or a week up or down. */
  const walk = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (!step) return;
    const days = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button')];
    const from = days.indexOf(document.activeElement as HTMLButtonElement);
    const to = days[from + step];
    if (from < 0 || !to) return;
    event.preventDefault();
    to.focus();
  };

  return (
    <Card className="gap-3 p-4">
      <div className="flex flex-row items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => turn(-1)}
          className={cn('flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-accent', PRESS, FOCUS)}
        >
          <ChevronLeftIcon className="size-4 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
        </button>
        <span className="text-base font-semibold text-foreground" aria-live="polite">
          {MONTH_NAMES[shown.month]} {shown.year}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => turn(1)}
          className={cn('flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-accent', PRESS, FOCUS)}
        >
          <ChevronRightIcon className="size-4 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7" onKeyDown={walk}>
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="py-1 text-center text-xs text-muted-foreground">
            {weekday}
          </span>
        ))}
        {cells.map(({ day, offset }, index) => {
          const isPicked =
            offset === 0 && picked.year === shown.year && picked.month === shown.month && picked.day === day;
          return (
            <span key={index} className="flex items-center justify-center py-1">
              <button
                type="button"
                aria-label={`${day} ${MONTH_NAMES[(shown.month + offset + 12) % 12]}`}
                aria-pressed={isPicked}
                // One Tab stop for the grid, not forty-two. The arrow keys
                // move between the days from there.
                tabIndex={isPicked || (!pickedHere && offset === 0 && day === 1) ? 0 : -1}
                onClick={() => pick(day, offset)}
                className={cn(
                  'flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-sm transition-colors duration-150',
                  FOCUS,
                  isPicked
                    ? 'bg-primary font-medium text-primary-foreground'
                    : offset !== 0
                      ? 'text-muted-foreground/56 hover:bg-accent'
                      : 'text-foreground hover:bg-accent'
                )}
              >
                {day}
              </button>
            </span>
          );
        })}
      </div>

      <span className="text-center text-sm text-muted-foreground">
        {WEEKDAYS[pickedDate.getDay()]} {MONTH_NAMES[picked.month].slice(0, 3)} {picked.day} {picked.year}
      </span>
    </Card>
  );
}

const TABS = ['Overview', 'Activity', 'Files'] as const;

/** Tabs — the segmented variant: a raised chip travelling in a recessed track. */
export function TabsCard() {
  const [tab, setTab] = useState(0);
  const [published, setPublished] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <Card className="gap-4 p-4">
      <div className="relative flex flex-row rounded-lg bg-muted p-1" role="tablist" aria-label="Project">
        {/* The chip is one element that slides, not three that take turns. */}
        <span
          aria-hidden="true"
          className="absolute bottom-1 start-1 top-1 w-[calc((100%-0.5rem)/3)] rounded-md bg-popover shadow-sm transition-transform duration-200 ease-out"
          style={{ transform: `translateX(${tab * 100}%)` }}
        />
        {TABS.map((name, index) => (
          <button
            key={name}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            aria-selected={tab === index}
            tabIndex={tab === index ? 0 : -1}
            onClick={() => setTab(index)}
            onKeyDown={(event) => {
              const next = radioIndexForKey(event.key, index, TABS.length);
              if (next === undefined) return;
              event.preventDefault();
              setTab(next);
              refs.current[next]?.focus();
            }}
            className={cn(
              'relative flex flex-1 cursor-pointer items-center justify-center rounded-md py-1.5 text-sm transition-colors duration-200',
              FOCUS,
              tab === index ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex min-h-8 flex-row items-center gap-3" role="tabpanel">
        {tab === 0 ? (
          <>
            <div className="flex flex-row">
              {['KA', 'ML', 'JR'].map((initials, index) => (
                <Avatar key={initials} initials={initials} className={index > 0 ? '-ms-2' : undefined} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">and 12 others</span>
          </>
        ) : tab === 1 ? (
          <>
            <Avatar initials="ML" />
            <span className="text-sm text-muted-foreground">Mina left 3 comments today</span>
          </>
        ) : (
          <>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
              <FileTextIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            </span>
            <span className="text-sm text-muted-foreground">14 files, 38 MB in all</span>
          </>
        )}
      </div>

      <div className="flex flex-row gap-2">
        <Button size="sm" variant="outline" className="flex-1">
          Share
        </Button>
        <Button size="sm" className="flex-1" onClick={() => setPublished(!published)}>
          {published ? (
            <>
              <CheckIcon className="size-4" aria-hidden="true" />
              Published
            </>
          ) : (
            'Publish'
          )}
        </Button>
      </div>
    </Card>
  );
}

/** Timeline — the rail of discs, with a connector running between them. */
export function TimelineCard() {
  const [merged, setMerged] = useState(false);
  const events = [
    { title: 'Opened the pull request', meta: '2h ago', done: true },
    { title: 'Review requested', meta: '1h ago', done: true },
    { title: 'Checks passed', meta: '24m ago', done: true },
    { title: merged ? 'Merged' : 'Merge', meta: merged ? 'Just now' : 'Waiting', done: merged },
  ];

  return (
    <Card className="gap-0 p-5">
      <span className="pb-4 text-sm font-medium text-muted-foreground">Pull request #218</span>
      {events.map(({ title, meta, done }, index) => (
        <div key={index} className="flex w-full flex-row gap-3">
          <div className="flex items-center">
            <div className="flex flex-col items-center self-stretch">
              <span
                className={cn(
                  'h-4 w-4 rounded-full transition-colors duration-300',
                  done ? 'bg-primary' : 'bg-muted'
                )}
              />
              {index < events.length - 1 ? (
                <span className="w-0.5 flex-1 rounded-full bg-border" />
              ) : null}
            </div>
          </div>
          <div className={cn('flex flex-1 flex-col', index < events.length - 1 && 'pb-5')}>
            <span className="text-sm font-medium text-foreground">{title}</span>
            <span className="text-xs text-muted-foreground">{meta}</span>
          </div>
          {index === events.length - 1 ? (
            <Button size="sm" variant={merged ? 'outline' : 'primary'} onClick={() => setMerged(!merged)}>
              {merged ? 'Revert' : 'Merge'}
            </Button>
          ) : null}
        </div>
      ))}
    </Card>
  );
}

const TABLE_ROWS = [
  { name: 'Button', state: 'Stable', adds: 12400 },
  { name: 'BottomSheet', state: 'Stable', adds: 9100 },
  { name: 'ColorPicker', state: 'Stable', adds: 4800 },
  { name: 'Flow', state: 'Alpha', adds: 1200 },
];

/** Table — the header row, four body rows and a numeric column that sorts. */
export function TableCard() {
  const [descending, setDescending] = useState(true);
  const [picked, setPicked] = useState<string | null>(null);
  const rows = [...TABLE_ROWS].sort((a, b) => (descending ? b.adds - a.adds : a.adds - b.adds));

  return (
    <Card className="overflow-hidden">
      <CardHeader title="Most used" />
      <div className="flex flex-col" role="table" aria-label="Most used components">
        <div className="flex flex-row items-center gap-3 border-b border-border px-5 py-2" role="row">
          <span className="flex-1 text-xs font-medium text-muted-foreground" role="columnheader">
            Component
          </span>
          <span className="w-16 text-xs font-medium text-muted-foreground" role="columnheader">
            State
          </span>
          <span
            className="flex w-14 justify-end"
            role="columnheader"
            aria-sort={descending ? 'descending' : 'ascending'}
          >
            <button
              type="button"
              onClick={() => setDescending(!descending)}
              className={cn('-me-1 flex items-center gap-0.5 rounded-sm px-1 text-xs font-medium text-muted-foreground hover:text-foreground', PRESS, FOCUS)}
            >
              Adds
              <ChevronDownIcon
                className={cn('size-3 transition-transform duration-200', !descending && 'rotate-180')}
                aria-hidden="true"
              />
            </button>
          </span>
        </div>
        {rows.map(({ name, state, adds }) => (
          <div
            key={name}
            role="row"
            aria-selected={picked === name}
            tabIndex={0}
            onClick={() => setPicked(picked === name ? null : name)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              setPicked(picked === name ? null : name);
            }}
            className={cn(
              'flex cursor-pointer flex-row items-center gap-3 border-b border-border px-5 py-2.5 outline-none transition-colors duration-150 last:border-b-0 hover:bg-accent focus-visible:bg-accent',
              picked === name && 'bg-accent'
            )}
          >
            <span className="flex-1 truncate text-sm text-foreground" role="cell">
              {name}
            </span>
            <span className="w-16" role="cell">
              <Badge variant={state === 'Alpha' ? 'warning' : 'success'}>{state}</Badge>
            </span>
            <span className="w-14 text-end text-sm tabular-nums text-muted-foreground" role="cell">
              {(adds / 1000).toFixed(1)}k
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * OTP input — one cell a digit, with a caret in the cell that is next. The
 * cells are a drawing over one real field, so a code can be typed or pasted
 * in one go and the keyboard on a phone is the numeric one.
 */
export function OtpCard() {
  const LENGTH = 6;
  const [code, setCode] = useState('482');
  const [focused, setFocused] = useState(false);
  const done = code.length === LENGTH;

  return (
    <Card>
      <CardHeader title="Check your email" description="Enter the six digits we sent you." />
      <CardBody className="gap-4">
        <div className="relative self-start">
          <div className="flex flex-row items-center gap-1.5">
            {Array.from({ length: LENGTH }, (_, index) => (
              <span key={index} className="flex flex-row items-center gap-1.5">
                {index === LENGTH / 2 ? <span className="h-0.5 w-2.5 rounded-full bg-border" /> : null}
                <span
                  className={cn(
                    'flex h-12 w-10 items-center justify-center rounded-lg border bg-background transition-[border-color,box-shadow] duration-150',
                    done
                      ? 'border-success'
                      : focused && index === code.length
                        ? 'border-ring ring-2 ring-ring/40'
                        : 'border-input'
                  )}
                >
                  {code[index] ? (
                    <span className="text-lg font-normal tabular-nums text-foreground">{code[index]}</span>
                  ) : focused && index === code.length ? (
                    <span className="h-6 w-0.5 animate-caret-blink rounded-full bg-foreground" />
                  ) : null}
                </span>
              </span>
            ))}
          </div>
          <input
            aria-label="Verification code"
            inputMode="numeric"
            autoComplete="off"
            maxLength={LENGTH}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, LENGTH))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            // Over the cells and see-through: it takes the taps and the typing.
            className="absolute inset-0 cursor-text opacity-0"
          />
        </div>
        <div className="flex min-h-9 flex-row items-center justify-between gap-3">
          <span
            className={cn('text-sm', done ? 'font-medium text-success-foreground' : 'text-muted-foreground')}
            aria-live="polite"
          >
            {done ? 'Verified' : `${LENGTH - code.length} to go`}
          </span>
          <Button size="sm" variant="ghost" onClick={() => setCode('')}>
            {done ? 'Start over' : 'Clear'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

const PLANS = [
  { id: 'hobby', name: 'Hobby', price: 'Free', detail: 'One project, community support' },
  { id: 'pro', name: 'Pro', price: '$12', detail: 'Unlimited projects, private themes' },
  { id: 'team', name: 'Team', price: '$29', detail: 'Shared libraries and review' },
];

/** Radio group, in its card variant — one of a few, each with room to explain itself. */
export function PlanCard() {
  const [plan, setPlan] = useState(1);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <Card className="gap-3 p-4">
      <Eyebrow>Choose a plan</Eyebrow>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Plan">
        {PLANS.map(({ id, name, price, detail }, index) => (
          <button
            key={id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={plan === index}
            tabIndex={plan === index ? 0 : -1}
            onClick={() => setPlan(index)}
            onKeyDown={(event) => {
              const next = radioIndexForKey(event.key, index, PLANS.length);
              if (next === undefined) return;
              event.preventDefault();
              setPlan(next);
              refs.current[next]?.focus();
            }}
            className={cn(
              'flex w-full cursor-pointer flex-row items-start justify-between gap-3 rounded-xl border p-4 text-start transition-colors duration-150',
              FOCUS,
              plan === index ? 'border-primary bg-accent' : 'border-border bg-card hover:bg-accent'
            )}
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex flex-row items-baseline gap-2">
                <span className="text-sm font-medium text-foreground">{name}</span>
                <span className="text-sm tabular-nums text-muted-foreground">{price}</span>
              </span>
              <span className="text-xs text-muted-foreground">{detail}</span>
            </span>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-input bg-background">
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full bg-primary transition-[scale,opacity] duration-150',
                  plan === index ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                )}
              />
            </span>
          </button>
        ))}
      </div>
      <Button className="w-full">Continue with {PLANS[plan].name}</Button>
    </Card>
  );
}

const QUESTIONS = [
  {
    question: 'Does it run in Expo Go?',
    answer: 'Yes. There is no native code in it, so there is nothing to build first.',
  },
  {
    question: 'Can I change the theme?',
    answer: 'It is one setting. Every component reads the same tokens, light and dark.',
  },
  {
    question: 'Is it accessible?',
    answer: 'Roles, states and labels are wired into every component.',
  },
];

/** Accordion — one answer open at a time, and the rest a line each. */
export function AccordionCard() {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      {QUESTIONS.map(({ question, answer }, index) => (
        <div key={question} className="flex flex-col">
          {index > 0 ? <span className="h-px bg-border" /> : null}
          <button
            type="button"
            aria-expanded={open === index}
            aria-controls={`${id}-${index}`}
            onClick={() => setOpen(open === index ? null : index)}
            className={cn(
              'flex w-full cursor-pointer flex-row items-center gap-3 px-4 py-3.5 text-start outline-none transition-colors hover:bg-accent focus-visible:bg-accent'
            )}
          >
            <span className="flex-1 text-base font-medium text-foreground">{question}</span>
            <ChevronDownIcon
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                open === index && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </button>
          {/* A grid row that goes from nothing to its content's height, which
              is how a height can be animated without knowing it. */}
          <div
            id={`${id}-${index}`}
            className={cn(
              'grid transition-[grid-template-rows] duration-200 ease-out',
              open === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            )}
          >
            <div className="overflow-hidden" inert={open !== index}>
              <p className="px-4 pb-4 text-sm text-muted-foreground">{answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const SETTINGS = [
  { id: 'push', icon: BellIcon, title: 'Push notifications', detail: 'Mentions and replies' },
  { id: 'digest', icon: MailIcon, title: 'Weekly digest', detail: 'Every Monday morning' },
  { id: 'sounds', icon: Volume2Icon, title: 'Sounds', detail: 'When a message arrives' },
];

/** Item — a row with a medium, a title, a description and an action at the end. */
export function SettingsCard() {
  const [on, setOn] = useState<Record<string, boolean>>({ push: true, digest: false, sounds: true });

  return (
    <Card className="gap-1 p-2">
      <span className="px-3 pb-1 pt-2">
        <Eyebrow>Notifications</Eyebrow>
      </span>
      {SETTINGS.map(({ id, icon: Icon, title, detail }) => (
        <div key={id} className="flex w-full flex-row items-center gap-3 rounded-xl p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
            <Icon
              className={cn(
                'size-4 transition-colors duration-200',
                on[id] ? 'text-foreground' : 'text-muted-foreground'
              )}
              aria-hidden="true"
            />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-foreground">{title}</span>
            <span className="truncate text-xs text-muted-foreground">{detail}</span>
          </span>
          <Switch label={title} on={on[id]} onChange={(next) => setOn({ ...on, [id]: next })} />
        </div>
      ))}
    </Card>
  );
}

const FORMATS = [
  { id: 'bold', icon: BoldIcon, label: 'Bold' },
  { id: 'italic', icon: ItalicIcon, label: 'Italic' },
  { id: 'underline', icon: UnderlineIcon, label: 'Underline' },
];

/** Rating, number input and toggle buttons: three small controls that hold a value. */
export function ReviewCard() {
  const [stars, setStars] = useState(4);
  const [preview, setPreview] = useState<number | null>(null);
  const [seats, setSeats] = useState(3);
  const [formats, setFormats] = useState<Record<string, boolean>>({ bold: true });
  const lit = preview ?? stars;

  return (
    <Card className="gap-5 p-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">Rate this release</span>
          <span className="text-sm tabular-nums text-muted-foreground">{stars} of 5</span>
        </div>
        <div
          className="flex flex-row items-center gap-1 self-start"
          role="radiogroup"
          aria-label="Rating"
          onPointerLeave={() => setPreview(null)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={stars === star}
              aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
              tabIndex={stars === star ? 0 : -1}
              onClick={() => setStars(star)}
              onPointerEnter={() => setPreview(star)}
              onKeyDown={(event) => {
                const next = radioIndexForKey(event.key, stars - 1, 5);
                if (next === undefined) return;
                event.preventDefault();
                setStars(next + 1);
                (event.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
              }}
              className={cn('rounded-md', PRESS, FOCUS)}
            >
              <StarIcon
                className={cn(
                  'size-7 transition-colors duration-150',
                  star <= lit ? 'fill-warning text-warning' : 'fill-transparent text-muted-foreground/56'
                )}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Seats</Label>
        <div className="flex h-10 w-full flex-row items-center overflow-hidden rounded-lg border border-input bg-background">
          <button
            type="button"
            aria-label="One seat fewer"
            disabled={seats <= 1}
            onClick={() => setSeats(seats - 1)}
            className={cn('flex h-full w-10 items-center justify-center hover:bg-accent disabled:pointer-events-none disabled:opacity-[0.4]', PRESS, 'outline-none focus-visible:bg-accent')}
          >
            <MinusIcon className="size-4 text-foreground" aria-hidden="true" />
          </button>
          <span className="flex-1 text-center font-medium tabular-nums text-foreground" aria-live="polite">
            {seats}
          </span>
          <button
            type="button"
            aria-label="One seat more"
            disabled={seats >= 20}
            onClick={() => setSeats(seats + 1)}
            className={cn('flex h-full w-10 items-center justify-center hover:bg-accent disabled:pointer-events-none disabled:opacity-[0.4]', PRESS, 'outline-none focus-visible:bg-accent')}
          >
            <PlusIcon className="size-4 text-foreground" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-row items-center gap-2">
        {FORMATS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={!!formats[id]}
            onClick={() => setFormats({ ...formats, [id]: !formats[id] })}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border',
              PRESS,
              FOCUS,
              formats[id] ? 'border-primary/24 bg-accent' : 'border-transparent bg-secondary'
            )}
          >
            <Icon
              className={cn('size-4', formats[id] ? 'text-accent-foreground' : 'text-muted-foreground')}
              aria-hidden="true"
            />
          </button>
        ))}
        <span
          className={cn(
            'ms-auto text-sm text-foreground',
            formats.bold && 'font-bold',
            formats.italic && 'italic',
            formats.underline && 'underline underline-offset-4'
          )}
        >
          Sample text
        </span>
      </div>
    </Card>
  );
}

const STEPS = ['Cart', 'Shipping', 'Payment', 'Done'];
const STEP_NOTES = [
  'Three items, $148.00',
  'Standard, arrives Thursday',
  'Card ending in 4242',
  'Order placed. Thank you.',
];

/** Steps — where somebody is in a short run of stages, and what is left. */
export function StepsCard() {
  const [at, setAt] = useState(1);

  return (
    <Card className="gap-4 p-5">
      <div className="flex w-full flex-row items-center">
        {STEPS.map((name, index) => (
          <div key={name} className={cn('flex flex-row items-center', index < STEPS.length - 1 && 'flex-1')}>
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-200',
                index <= at ? 'bg-primary' : 'bg-muted'
              )}
              aria-current={index === at ? 'step' : undefined}
              aria-label={`${name}${index < at ? ', done' : index === at ? ', current' : ''}`}
            >
              {index < at ? (
                <CheckIcon className="size-3.5 text-primary-foreground" aria-hidden="true" />
              ) : (
                <span
                  className={cn(
                    'text-xs font-medium',
                    index <= at ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                >
                  {index + 1}
                </span>
              )}
            </span>
            {index < STEPS.length - 1 ? (
              <span
                className={cn(
                  'mx-2 h-0.5 flex-1 rounded-full transition-colors duration-200',
                  index < at ? 'bg-primary' : 'bg-muted'
                )}
              />
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-0.5" aria-live="polite">
        <span className="text-sm font-medium text-foreground">{STEPS[at]}</span>
        <span className="text-sm text-muted-foreground">{STEP_NOTES[at]}</span>
      </div>
      <div className="flex flex-row gap-2">
        <Button size="sm" variant="outline" className="flex-1" disabled={at === 0} onClick={() => setAt(at - 1)}>
          Back
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => setAt(at === STEPS.length - 1 ? 0 : at + 1)}
        >
          {at === STEPS.length - 1 ? 'Start again' : 'Next'}
        </Button>
      </div>
    </Card>
  );
}

const USAGE = [
  { id: 'photos', label: 'Photos', track: 'bg-info/16', fill: 'bg-info', full: 48, lean: 21 },
  { id: 'files', label: 'Documents', track: 'bg-warning/16', fill: 'bg-warning', full: 22, lean: 18 },
  { id: 'apps', label: 'Apps', track: 'bg-success/16', fill: 'bg-success', full: 9, lean: 9 },
];

/** Meter — how much of something is used, one bar to a kind, in its own colour. */
export function UsageCard() {
  const [cleaned, setCleaned] = useState(false);
  const used = USAGE.reduce((sum, row) => sum + (cleaned ? row.lean : row.full), 0);

  return (
    <Card className="gap-4 p-5">
      <div className="flex flex-row items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-muted-foreground">Storage</span>
          <span className="text-2xl font-bold tabular-nums text-foreground">{used}%</span>
        </div>
        <Button size="sm" variant={cleaned ? 'outline' : 'primary'} onClick={() => setCleaned(!cleaned)}>
          {cleaned ? 'Undo' : 'Clean up'}
        </Button>
      </div>
      {USAGE.map(({ id, label, track, fill, full, lean }) => {
        const value = cleaned ? lean : full;
        return (
          <div key={id} className="flex w-full flex-col gap-2">
            <div className="flex flex-row items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{label}</span>
              <span className="text-sm tabular-nums text-muted-foreground">{value}%</span>
            </div>
            <div
              className={cn('h-2 w-full overflow-hidden rounded-full', track)}
              role="meter"
              aria-label={label}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={value}
            >
              <div
                className={cn('h-full rounded-full transition-[width] duration-500 ease-out', fill)}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </Card>
  );
}

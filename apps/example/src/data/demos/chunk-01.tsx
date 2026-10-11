import { useEffect, useState, type ReactNode } from "react";
import { View } from "react-native";
import { Accordion, Alert, AnimatedBadge, Attachment, Avatar, AreaChart, Badge, SparklesIcon, BarChart, BubbleChart, Button, CandlestickChart, Card, ClockIcon, ListChecksIcon, PackageIcon, PencilIcon, PyramidChart, FileIcon, Frame, ImageIcon, Item, Text, Textarea, XIcon, Tooltip } from "panelui-native";
import type { ComponentEntry } from '../component-types';

/** Stable remote portraits for the Avatar demos. */
const AVATARS = [
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=32',
  'https://i.pravatar.cc/150?img=47',
];

function AttachmentStatesDemo() {
  const states = [
    { state: 'uploading' as const, desc: 'Uploading…' },
    { state: 'processing' as const, desc: 'Processing…' },
    { state: 'error' as const, desc: 'Upload failed — tap to retry' },
    { state: 'done' as const, desc: 'PDF · 2.4 MB' },
  ];

  return (
    <View className="w-full gap-3">
      {states.map(({ state, desc }) => (
        <Attachment key={state} state={state}>
          <Attachment.Media>
            <FileIcon size={18} />
          </Attachment.Media>
          <Attachment.Content>
            <Attachment.Title>report.pdf</Attachment.Title>
            <Attachment.Description>{desc}</Attachment.Description>
          </Attachment.Content>
          <Attachment.Actions>
            <Attachment.Action accessibilityLabel={`Remove report.pdf (${state})`}>
              <XIcon size={16} />
            </Attachment.Action>
          </Attachment.Actions>
        </Attachment>
      ))}
    </View>
  );
}

function AttachmentUploadDemo() {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  const start = () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((current) => {
        const next = current + 0.08;
        if (next >= 1) {
          clearInterval(timer);
          setRunning(false);
          return 1;
        }
        return next;
      });
    }, 160);
  };

  const state = running ? 'uploading' : progress >= 1 ? 'done' : 'idle';

  return (
    <View className="w-full gap-3">
      <Attachment state={state} progress={progress}>
        <Attachment.Media>
          <ImageIcon size={18} />
        </Attachment.Media>
        <Attachment.Content>
          <Attachment.Title>screenshot.png</Attachment.Title>
          <Attachment.Description>
            {running
              ? `Uploading — ${Math.round(progress * 100)}%`
              : progress >= 1
                ? 'PNG · 1.1 MB'
                : 'Ready to upload'}
          </Attachment.Description>
        </Attachment.Content>
      </Attachment>

      <Button variant="outline" onPress={start} loading={running}>
        {progress >= 1 ? 'Upload again' : 'Start upload'}
      </Button>
    </View>
  );
}

const FAQ_DATA = [
  {
    value: 'shipping',
    question: 'How long does shipping take?',
    answer: 'Standard delivery arrives in three to five working days.',
  },
  {
    value: 'returns',
    question: 'What is your returns policy?',
    answer: 'Send anything back within 30 days for a full refund.',
  },
  {
    value: 'support',
    question: 'How do I contact support?',
    answer: 'Reply to your order email and a person will answer.',
  },
];

/** Renders the shared FAQ data in whichever accordion variant is asked for. */
function AccordionDemo({
  variant,
  selectionMode = 'single',
}: {
  variant: 'default' | 'surface' | 'separated' | 'bordered' | 'ghost';
  selectionMode?: 'single' | 'multiple';
}) {
  return (
    <Accordion
      variant={variant}
      selectionMode={selectionMode}
      defaultValue={selectionMode === 'multiple' ? ['shipping', 'returns'] : 'shipping'}
      className="w-full"
    >
      {FAQ_DATA.map((entry) => (
        <Accordion.Item key={entry.value} value={entry.value}>
          <Accordion.Trigger>
            <Accordion.Title>{entry.question}</Accordion.Title>
            <Accordion.Indicator />
          </Accordion.Trigger>
          <Accordion.Content>{entry.answer}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

/**
 * The demo `keepMounted` exists for: a body with something in it worth losing.
 * Type into the field, collapse the section, open it again — the text is still
 * there, because the body was hidden rather than unmounted.
 */
function AccordionKeepMountedDemo() {
  return (
    <View className="w-full gap-3">
      <Accordion variant="surface" keepMounted defaultValue="note" className="w-full">
        <Accordion.Item value="note">
          <Accordion.Trigger>
            <Accordion.Title>Delivery note</Accordion.Title>
            <Accordion.Indicator />
          </Accordion.Trigger>
          <Accordion.Content>
            <Textarea placeholder="Leave it with a neighbour…" />
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="gift">
          <Accordion.Trigger>
            <Accordion.Title>Gift message</Accordion.Title>
            <Accordion.Indicator />
          </Accordion.Trigger>
          <Accordion.Content>
            <Textarea placeholder="Happy birthday…" />
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>

      <Text size="xs" muted>
        Type into a field, collapse the section, then open it again.
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Bar, area and ring charts                                                  */
/* -------------------------------------------------------------------------- */

const BAR_REVENUE = [
  { month: 'Jan', revenue: 12000, costs: 7400 },
  { month: 'Feb', revenue: 15500, costs: 8100 },
  { month: 'Mar', revenue: 14200, costs: 8800 },
  { month: 'Apr', revenue: 18900, costs: 9200 },
  { month: 'May', revenue: 21400, costs: 10100 },
  { month: 'Jun', revenue: 19800, costs: 11300 },
  { month: 'Jul', revenue: 24600, costs: 11900 },
  { month: 'Aug', revenue: 26100, costs: 12400 },
];

const AREA_TRAFFIC = Array.from({ length: 24 }, (_unused, hour) => {
  const shape = Math.sin(((hour - 4) / 24) * Math.PI * 2) * 0.5 + 0.5;
  return {
    hour: `${String(hour).padStart(2, '0')}:00`,
    direct: Math.round(120 + shape * 380),
    search: Math.round(80 + shape * 520),
    social: Math.round(40 + shape * 190),
  };
});

const CHANNELS = [
  { name: 'Email', sent: 4820 },
  { name: 'Push', sent: 3140 },
  { name: 'SMS', sent: 1960 },
  { name: 'In-app', sent: 1420 },
  { name: 'Web', sent: 880 },
];

/** Two series side by side, which is what a bar chart is for. */
/** Padding the header needs to line up inside a `Frame.Panel`, which has none. */
const CHART_HEADER = 'px-4 pt-3.5';

const BAR_TOTALS = BAR_REVENUE.reduce(
  (running, month) => ({
    revenue: running.revenue + month.revenue,
    costs: running.costs + month.costs,
  }),
  { revenue: 0, costs: 0 }
);

const money = (value: number) => `£${value.toLocaleString()}`;

/**
 * Thirty sessions of a share price, walked from an opening number.
 *
 * Generated rather than typed out so the shape is a plausible one — a real
 * series wanders, and a handwritten one either trends too cleanly or jitters
 * in a way no instrument does.
 */
const CANDLE_SESSIONS = (() => {
  const rows: {
    day: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[] = [];
  let previous = 182.4;

  for (let index = 0; index < 30; index += 1) {
    // A fixed wobble per index rather than Math.random, so the chart is the
    // same every time the screen is opened and a screenshot stays comparable.
    const drift = Math.sin(index * 0.7) * 2.4 + Math.cos(index * 1.9) * 1.3;
    const open = previous;
    const close = Math.max(1, open + drift);
    const spread = 0.8 + Math.abs(Math.sin(index * 2.3)) * 2.2;
    rows.push({
      day: `${((index % 28) + 1).toString()} Sep`,
      open: Number(open.toFixed(2)),
      close: Number(close.toFixed(2)),
      high: Number((Math.max(open, close) + spread).toFixed(2)),
      low: Number((Math.min(open, close) - spread).toFixed(2)),
    });
    previous = close;
  }

  return rows;
})();

const CANDLE_LAST = CANDLE_SESSIONS[CANDLE_SESSIONS.length - 1]!;

const CANDLE_FIRST = CANDLE_SESSIONS[0]!;

const price = (value: number) => `$${value.toFixed(2)}`;

/** How a session, or the whole run, moved — the line under the readout. */
function candleChange(from: number, to: number) {
  const delta = to - from;
  const percent = from === 0 ? 0 : (delta / from) * 100;
  return `${delta >= 0 ? '+' : ''}${delta.toFixed(2)} (${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%)`;
}

/** The whole run, with a readout that follows the finger. */
function CandlestickChartSessionsVersion() {
  const [active, setActive] = useState<(typeof CANDLE_SESSIONS)[number] | null>(null);
  const shown = active ?? CANDLE_LAST;

  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Northwind Materials</Frame.Title>
          <Frame.Action>Drag to inspect</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <CandlestickChart
            data={CANDLE_SESSIONS}
            xDataKey="day"
            aspectRatio={1.5}
            onActiveIndexChange={(_index, datum) =>
              setActive(datum as (typeof CANDLE_SESSIONS)[number] | null)
            }
          >
            {/* The value is passed in rather than derived, so the header can
                show the last close when nothing is pressed and a session's
                close when something is. */}
            <CandlestickChart.Header
              className={CHART_HEADER}
              title="NWM · Daily"
              value={price(shown.close)}
              caption={
                active
                  ? `${active.day} · ${candleChange(active.open, active.close)}`
                  : `30 sessions · ${candleChange(CANDLE_FIRST.open, CANDLE_LAST.close)}`
              }
              legend
            />
            <CandlestickChart.Grid />
            <CandlestickChart.Candles />
            <CandlestickChart.YAxis />
            <CandlestickChart.XAxis />
            <CandlestickChart.Tooltip formatValue={price} />
          </CandlestickChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/** The same data with the axes off, which is what a card-sized chart wants. */
function CandlestickChartBareVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Last ten sessions</Frame.Title>
          <Frame.Action>No axes</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <CandlestickChart
            data={CANDLE_SESSIONS.slice(-10)}
            xDataKey="day"
            aspectRatio={1.9}
            candleGap={0.42}
          >
            <CandlestickChart.Header
              className={CHART_HEADER}
              value={price(CANDLE_LAST.close)}
              caption={candleChange(
                CANDLE_SESSIONS[CANDLE_SESSIONS.length - 10]!.open,
                CANDLE_LAST.close
              )}
            />
            <CandlestickChart.Candles cornerRadius={2} />
            <CandlestickChart.XAxis />
          </CandlestickChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/** Waiting for the series, and the same component throughout. */
function CandlestickChartLoadingVersion() {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = setTimeout(() => setStatus('ready'), 1400);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <View className="flex-1 justify-center gap-3 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Fetching sessions</Frame.Title>
          <Frame.Action>{status === 'loading' ? 'Loading' : 'Ready'}</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <CandlestickChart
            data={CANDLE_SESSIONS.slice(-16)}
            xDataKey="day"
            aspectRatio={1.6}
            status={status}
          >
            <CandlestickChart.Header
              className={CHART_HEADER}
              title="NWM · Daily"
              value={status === 'loading' ? '—' : price(CANDLE_LAST.close)}
            />
            <CandlestickChart.Grid />
            <CandlestickChart.Candles />
            <CandlestickChart.XAxis />
            <CandlestickChart.Tooltip formatValue={price} />
          </CandlestickChart>
        </Frame.Panel>
      </Frame>
      <Button variant="outline" onPress={() => setStatus('loading')}>
        Load again
      </Button>
    </View>
  );
}

/*
 * One chart per version, not two in a scroller.
 *
 * These are pages now, and a page is a fixed height — a demo that brought its
 * own vertical ScrollView both fought the pager for the drag and stacked its
 * two charts into the space meant for one.
 */
function BarChartGroupedVersion() {
  const [active, setActive] = useState<(typeof BAR_REVENUE)[number] | null>(null);

  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Revenue and costs</Frame.Title>
          <Frame.Action>Drag to inspect</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BarChart
            data={BAR_REVENUE}
            xDataKey="month"
            aspectRatio={2}
            onActiveIndexChange={(_index, datum) =>
              setActive(datum as (typeof BAR_REVENUE)[number] | null)
            }
          >
            {/* The value follows the finger and falls back to the total, which
                is why it is passed in rather than derived by the header. */}
            <BarChart.Header
              className={CHART_HEADER}
              value={money(active ? active.revenue : BAR_TOTALS.revenue)}
              caption={
                active
                  ? `${active.month} · ${money(active.costs)} out`
                  : `8 months · ${money(BAR_TOTALS.costs)} out`
              }
              labels={{ revenue: 'Revenue', costs: 'Costs' }}
              legend
            />
            <BarChart.Grid />
            <BarChart.Bar dataKey="revenue" />
            <BarChart.Bar dataKey="costs" colorIndex={2} />
            <BarChart.XAxis />
            <BarChart.Tooltip formatValue={money} />
          </BarChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/** The same two series read as a total instead of as a comparison. */
function BarChartStackedVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Stacked</Frame.Title>
          <Frame.Action>Same two series</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BarChart data={BAR_REVENUE} xDataKey="month" stacked stackGap={2} aspectRatio={2}>
            <BarChart.Header
              className={CHART_HEADER}
              value={money(BAR_TOTALS.revenue + BAR_TOTALS.costs)}
              caption="A total, not a comparison"
              labels={{ revenue: 'Revenue', costs: 'Costs' }}
              legend
            />
            <BarChart.Grid />
            <BarChart.Bar dataKey="costs" colorIndex={2} />
            <BarChart.Bar dataKey="revenue" />
            <BarChart.XAxis />
          </BarChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/** Sideways, which is what long category names need. */
function BarChartHorizontalVersion() {
  const sent = CHANNELS.reduce((total, channel) => total + channel.sent, 0);

  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Messages sent</Frame.Title>
          <Frame.Action>Last 30 days</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BarChart
            data={CHANNELS}
            xDataKey="name"
            orientation="horizontal"
            aspectRatio={1.7}
            barGap={0.35}
          >
            <BarChart.Header
              className={CHART_HEADER}
              value={sent.toLocaleString()}
              caption="Sideways · names have room"
            />
            <BarChart.Grid />
            <BarChart.Bar dataKey="sent" colorIndex={3} />
            <BarChart.YAxis />
            <BarChart.Tooltip />
          </BarChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/** Stacked areas, where the top edge is the whole and each band is a share. */
function AreaChartStackedVersion() {
  const [active, setActive] = useState<(typeof AREA_TRAFFIC)[number] | null>(null);
  const day = AREA_TRAFFIC.reduce(
    (total, hour) => total + hour.direct + hour.search + hour.social,
    0
  );
  const total = active ? active.direct + active.search + active.social : day;

  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Sessions by channel</Frame.Title>
          <Frame.Action>Drag to inspect</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <AreaChart
            data={AREA_TRAFFIC}
            xDataKey="hour"
            stacked
            aspectRatio={1.9}
            onActiveIndexChange={(_index, datum) =>
              setActive(datum as (typeof AREA_TRAFFIC)[number] | null)
            }
          >
            <AreaChart.Header
              className={CHART_HEADER}
              value={total.toLocaleString()}
              caption={
                active
                  ? `${active.hour} · this hour`
                  : 'Across the day'
              }
              labels={{ direct: 'Direct', search: 'Search', social: 'Social' }}
              legend
            />
            <AreaChart.Grid />
            <AreaChart.Area dataKey="direct" />
            <AreaChart.Area dataKey="search" colorIndex={2} />
            <AreaChart.Area dataKey="social" colorIndex={3} />
            <AreaChart.XAxis ticks={5} />
            <AreaChart.Tooltip />
          </AreaChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/** Overlaid instead, for series that are alternatives rather than parts. */
function AreaChartOverlaidVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Two plans compared</Frame.Title>
          <Frame.Action>Peak hour</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <AreaChart data={AREA_TRAFFIC} xDataKey="hour" aspectRatio={1.9}>
            <AreaChart.Header
              className={CHART_HEADER}
              value="600"
              caption="Unstacked · bands overlay"
              labels={{ direct: 'Direct', search: 'Search' }}
              legend
            />
            <AreaChart.Grid />
            <AreaChart.Area dataKey="search" colorIndex={2} />
            <AreaChart.Area dataKey="direct" />
            <AreaChart.XAxis ticks={5} />
            <AreaChart.YAxis />
            <AreaChart.Tooltip />
          </AreaChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* PyramidChart                                                               */
/* -------------------------------------------------------------------------- */

const PENGUINS = [
  { species: 'Adelie', male: 73, female: 73 },
  { species: 'Chinstrap', male: 34, female: 34 },
  { species: 'Gentoo', male: 61, female: 58 },
];

/*
 * Four bands, not six. The chart's height is its width over `aspectRatio` and
 * has nothing to do with how many rows there are, so a taller stack does not
 * make it longer — but a shorter one does let the frame come up without the
 * bars going thin, and at six the panel ran past the bottom of the screen.
 */
const POPULATION = [
  { band: '0–14', men: 9.2, women: 8.8 },
  { band: '15–29', men: 10.4, women: 10.1 },
  { band: '30–44', men: 11.8, women: 11.6 },
  { band: '45–59', men: 10.9, women: 11.2 },
];

/** The shape the chart is named for: two wings on one scale. */
function PyramidBasicVersion() {
  const [active, setActive] = useState<(typeof PENGUINS)[number] | null>(null);
  const total = PENGUINS.reduce((sum, row) => sum + row.male + row.female, 0);

  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Penguins observed</Frame.Title>
          <Frame.Action>Drag to inspect</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <PyramidChart
            data={PENGUINS}
            xDataKey="species"
            aspectRatio={1.4}
            onActiveIndexChange={(_index, datum) =>
              setActive(datum as (typeof PENGUINS)[number] | null)
            }
          >
            <PyramidChart.Header
              className={CHART_HEADER}
              value={String(active ? active.male + active.female : total)}
              caption={active ? `${active.species} · both wings` : 'Three species'}
              labels={{ male: 'Male', female: 'Female' }}
              legend
            />
            <PyramidChart.Grid />
            <PyramidChart.Bar dataKey="male" side="start" />
            <PyramidChart.Bar dataKey="female" side="end" colorIndex={5} />
            <PyramidChart.XAxis />
            <PyramidChart.YAxis />
            <PyramidChart.Tooltip />
          </PyramidChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/** A shorter frame, with the names over each pair rather than between them. */
function PyramidCentredVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Population by age</Frame.Title>
          <Frame.Action>Millions</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <PyramidChart data={POPULATION} xDataKey="band" aspectRatio={1.5} barGap={0.3}>
            <PyramidChart.Header
              className={CHART_HEADER}
              value="42.0m"
              caption="Four bands, read outward from the centre"
              labels={{ men: 'Men', women: 'Women' }}
              legend
            />
            <PyramidChart.Grid columns={2} />
            <PyramidChart.Bar dataKey="men" side="start" />
            <PyramidChart.Bar dataKey="women" side="end" colorIndex={5} />
            <PyramidChart.XAxis />
            <PyramidChart.YAxis />
            <PyramidChart.Tooltip />
          </PyramidChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/** Equal stubs either side of the centre, giving way to the real wings. */
function PyramidLoadingVersion() {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = setTimeout(() => setStatus('ready'), 1600);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <View className="flex-1 justify-center gap-4 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Loading</Frame.Title>
          <Frame.Action>{status === 'loading' ? 'Fetching…' : 'Ready'}</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <PyramidChart data={PENGUINS} xDataKey="species" status={status} aspectRatio={1.4}>
            <PyramidChart.Grid />
            <PyramidChart.Skeleton />
            <PyramidChart.Bar dataKey="male" side="start" />
            <PyramidChart.Bar dataKey="female" side="end" colorIndex={5} />
            <PyramidChart.XAxis />
            <PyramidChart.YAxis />
          </PyramidChart>
        </Frame.Panel>
      </Frame>
      <Button variant="outline" onPress={() => setStatus('loading')}>
        Load again
      </Button>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* BubbleChart                                                                */
/* -------------------------------------------------------------------------- */

const TEAMS = [
  { team: 'A', efficiency: 12, performance: 19, people: 6 },
  { team: 'B', efficiency: 24, performance: 34, people: 14 },
  { team: 'C', efficiency: 40, performance: 16, people: 22 },
  { team: 'D', efficiency: 32, performance: 46, people: 12 },
  { team: 'E', efficiency: 60, performance: 27, people: 10 },
  { team: 'F', efficiency: 46, performance: 43, people: 11 },
  { team: 'G', efficiency: 16, performance: 33, people: 16 },
  { team: 'H', efficiency: 68, performance: 50, people: 8 },
];

/** Two axes and an area — three quantities, one of them the size of the circle. */
function BubbleBasicVersion() {
  const [active, setActive] = useState<{ label: string; size: number | null } | null>(null);

  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Performance vs efficiency</Frame.Title>
          <Frame.Action>Drag to inspect</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BubbleChart
            data={TEAMS}
            xDataKey="efficiency"
            yDataKey="performance"
            sizeKey="people"
            labelKey="team"
            sizeRange={[14, 30]}
            aspectRatio={1.4}
            onActivePointChange={(point) =>
              setActive(point ? { label: point.label, size: point.size } : null)
            }
          >
            <BubbleChart.Header
              className={CHART_HEADER}
              value={active ? `Team ${active.label}` : '8 teams'}
              caption={
                active && active.size !== null
                  ? `${active.size} people`
                  : 'Circle area is team size'
              }
            />
            <BubbleChart.Grid />
            <BubbleChart.Bubbles />
            <BubbleChart.Labels />
            <BubbleChart.XAxis />
            <BubbleChart.YAxis />
            <BubbleChart.Tooltip />
          </BubbleChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/** One colour and a legend, for circles too small to carry their own names. */
function BubbleLegendVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Smaller circles</Frame.Title>
          <Frame.Action>Named beside, not inside</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BubbleChart
            data={TEAMS.slice(0, 5)}
            xDataKey="efficiency"
            yDataKey="performance"
            sizeKey="people"
            labelKey="team"
            sizeRange={[8, 22]}
            aspectRatio={1.4}
          >
            <BubbleChart.Header
              className={CHART_HEADER}
              value="5 teams"
              caption="Too small to hold their own names"
            />
            <BubbleChart.Grid />
            <BubbleChart.Bubbles opacity={0.7} />
            <BubbleChart.Legend />
            <BubbleChart.XAxis />
            <BubbleChart.YAxis />
            <BubbleChart.Tooltip />
          </BubbleChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/** A still field of muted circles that dissolves as the real ones land. */
function BubbleLoadingVersion() {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = setTimeout(() => setStatus('ready'), 1600);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <View className="flex-1 justify-center gap-4 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Loading</Frame.Title>
          <Frame.Action>{status === 'loading' ? 'Fetching…' : 'Ready'}</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BubbleChart
            data={TEAMS}
            xDataKey="efficiency"
            yDataKey="performance"
            sizeKey="people"
            labelKey="team"
            sizeRange={[14, 30]}
            status={status}
            aspectRatio={1.4}
          >
            <BubbleChart.Grid />
            <BubbleChart.Skeleton />
            <BubbleChart.Bubbles />
            <BubbleChart.Labels />
            <BubbleChart.XAxis />
            <BubbleChart.YAxis />
          </BubbleChart>
        </Frame.Panel>
      </Frame>
      <Button variant="outline" onPress={() => setStatus('loading')}>
        Load again
      </Button>
    </View>
  );
}

/** The four-way reading a field of bubbles is usually put to. */
function BubbleQuadrantsVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Where each team sits</Frame.Title>
          <Frame.Action>Split at the average</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BubbleChart
            data={TEAMS}
            xDataKey="efficiency"
            yDataKey="performance"
            sizeKey="people"
            labelKey="team"
            sizeRange={[14, 30]}
            aspectRatio={1.2}
          >
            <BubbleChart.Header
              className={CHART_HEADER}
              value="8 teams"
              caption="Both averages, drawn as one line each"
            />
            <BubbleChart.Grid />
            <BubbleChart.Quadrants
              labels={{
                topLeft: 'Effective, costly',
                topRight: 'Doing both',
                bottomLeft: 'Neither yet',
                bottomRight: 'Lean, quiet',
              }}
            />
            <BubbleChart.Bubbles />
            <BubbleChart.Labels />
            <BubbleChart.XAxis label="Efficiency" />
            <BubbleChart.YAxis label="Performance" />
            <BubbleChart.Tooltip />
          </BubbleChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/** The one quantity the chart cannot otherwise state: what the area is worth. */
function BubbleSizeKeyVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Team size, to scale</Frame.Title>
          <Frame.Action>Area is people</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BubbleChart
            data={TEAMS}
            xDataKey="efficiency"
            yDataKey="performance"
            sizeKey="people"
            labelKey="team"
            sizeRange={[10, 34]}
            aspectRatio={1.2}
          >
            <BubbleChart.Header
              className={CHART_HEADER}
              value="6 to 22"
              caption="People per team, read off the key"
            />
            <BubbleChart.Grid />
            <BubbleChart.Bubbles opacity={0.75} />
            <BubbleChart.Labels />
            <BubbleChart.SizeKey placement="top-left" label="People" />
            <BubbleChart.XAxis label="Efficiency" />
            <BubbleChart.YAxis label="Performance" />
            <BubbleChart.Tooltip />
          </BubbleChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/** A line through the cloud, and how tightly the cloud sits on it. */
function BubbleTrendVersion() {
  const [fit, setFit] = useState<{ slope: number; r: number } | null>(null);

  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Does one buy the other?</Frame.Title>
          <Frame.Action>Least squares</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <BubbleChart
            data={TEAMS}
            xDataKey="efficiency"
            yDataKey="performance"
            sizeKey="people"
            labelKey="team"
            sizeRange={[14, 30]}
            aspectRatio={1.2}
          >
            <BubbleChart.Header
              className={CHART_HEADER}
              value={fit ? `r ${fit.r.toFixed(2)}` : '—'}
              caption={
                fit && fit.r < 0.3
                  ? 'Barely a relationship'
                  : 'How tightly the teams sit on the line'
              }
            />
            <BubbleChart.Grid />
            <BubbleChart.Trend onFit={(next) => setFit(next)} />
            <BubbleChart.Bubbles opacity={0.8} />
            <BubbleChart.Labels />
            <BubbleChart.XAxis label="Efficiency" />
            <BubbleChart.YAxis label="Performance" />
            <BubbleChart.Tooltip />
          </BubbleChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* AnimatedBadge                                                              */
/* -------------------------------------------------------------------------- */

const DEPLOY_STEPS = [
  { status: 'neutral', label: 'Queued' },
  { status: 'loading', label: 'Building' },
  { status: 'loading', label: 'Deploying' },
  { status: 'success', label: 'Live' },
] as const;

/** The badge's whole job: a status that changes while somebody is watching. */
function AnimatedBadgeRunDemo() {
  const [step, setStep] = useState(0);
  const current = DEPLOY_STEPS[step]!;

  return (
    /*
     * `w-full`, and the badge centred by a row of its own.
     *
     * The badge sets `self-start`, which wins over a parent's `items-center` —
     * so it hugs the leading edge of whatever column it is in. That column used
     * to be as wide as its widest child, which is the button row, and the row
     * grows when Next becomes Start again. The badge did not move; the edge it
     * was pinned to did, on the one step people were watching it for.
     *
     * `justify-center` on a row is the way to centre it: `alignSelf` is the
     * cross axis there, so the badge's own start alignment no longer has a say.
     */
    <View className="w-full items-center gap-4">
      <View className="w-full flex-row justify-center">
        <AnimatedBadge status={current.status}>{current.label}</AnimatedBadge>
      </View>
      <View className="flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={step === 0}
          onPress={() => setStep((current) => Math.max(0, current - 1))}
        >
          Back
        </Button>
        <Button
          size="sm"
          onPress={() =>
            setStep((current) => (current + 1) % DEPLOY_STEPS.length)
          }
        >
          {step === DEPLOY_STEPS.length - 1 ? 'Start again' : 'Next'}
        </Button>
      </View>
    </View>
  );
}

/**
 * Every status, each badge walking its own run of them.
 *
 * Side by side and standing still, six badges show what the six tints look
 * like and nothing else — which is the one thing a screenshot already does.
 * Rolling them makes the point the component exists for: the glyph and the
 * word turn over inside a pill that grows to the new word.
 *
 * One timer, one badge per tick. Six pills springing to new widths on the same
 * frame is a row that reflows under itself — the ones on the second line cross
 * the ones on the first on their way to a new place. Turning them over in
 * sequence keeps every change to one pill and its neighbours, which is what a
 * badge in a real row does.
 *
 * Each run starts on a different status, so the first frame is still one badge
 * per tint and the demo has not stopped being the chart of them it was.
 */
const STATUS_RUNS = [
  [
    { status: 'neutral', label: 'Idle' },
    { status: 'loading', label: 'Queued' },
    { status: 'success', label: 'Done' },
  ],
  [
    { status: 'info', label: 'Reviewing' },
    { status: 'success', label: 'Approved' },
    { status: 'neutral', label: 'Merged' },
  ],
  [
    { status: 'success', label: 'Passed' },
    { status: 'warning', label: 'Flaky' },
    { status: 'loading', label: 'Rerunning' },
  ],
  [
    { status: 'warning', label: 'Slow' },
    { status: 'danger', label: 'Timed out' },
    { status: 'success', label: 'Recovered' },
  ],
  [
    { status: 'danger', label: 'Failed' },
    { status: 'loading', label: 'Retrying' },
    { status: 'success', label: 'Fixed' },
  ],
  [
    { status: 'loading', label: 'Running' },
    { status: 'info', label: 'Reporting' },
    { status: 'neutral', label: 'Archived' },
  ],
] as const;

/** How long before the next badge turns over, in milliseconds. */
const STATUS_HOLD = 900;

function AnimatedBadgeStatusesDemo() {
  const [steps, setSteps] = useState(() => STATUS_RUNS.map(() => 0));

  useEffect(() => {
    let cursor = 0;
    const id = setInterval(() => {
      setSteps((current) =>
        current.map((step, index) => (index === cursor ? step + 1 : step))
      );
      cursor = (cursor + 1) % STATUS_RUNS.length;
    }, STATUS_HOLD);
    return () => clearInterval(id);
  }, []);

  return (
    <View className="flex-row flex-wrap items-center justify-center gap-2">
      {STATUS_RUNS.map((run, index) => {
        const step = run[steps[index]! % run.length]!;
        return (
          <AnimatedBadge key={index} status={step.status}>
            {step.label}
          </AnimatedBadge>
        );
      })}
    </View>
  );
}

/* -------------------------------------------------------------------------- *
 * AnimatedBadge — badges inside a sentence
 * -------------------------------------------------------------------------- */

/**
 * A paragraph that badges are part of, rather than a paragraph with badges
 * underneath it.
 *
 * The sentence is built out of words rather than out of strings. A `<View>`
 * nested inside a `<Text>` is laid out inconsistently between the two
 * platforms — on Android it does not take part in the line at all — so the
 * paragraph is turned inside out: every word is its own `<Text>`, the badges
 * are its siblings, and a wrapping row breaks the line between them. That is
 * what lets a badge sit mid-sentence and the text carry on around it.
 *
 * The gap is the space between words, so nothing adds one of its own.
 */
function Sentence({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row flex-wrap items-center gap-x-1.5 gap-y-2">
      {children}
    </View>
  );
}

/**
 * A badge and the punctuation that follows it, in a row of their own.
 *
 * The sentence is a gapped row, so a comma or a full stop left as a sibling is
 * spaced like a word and drifts away from the figure it belongs to.
 */
function BadgeThen({
  mark,
  size = 'xl',
  children,
}: {
  mark: string;
  size?: 'base' | 'lg' | 'xl' | '2xl';
  children: ReactNode;
}) {
  return (
    <View className="flex-row items-center">
      {children}
      <Text size={size} muted>
        {mark}
      </Text>
    </View>
  );
}

/** One `<Text>` per word, so the row above has something to break between. */
function Words({
  children,
  size = 'xl',
  muted = false,
  weight,
}: {
  children: string;
  size?: 'base' | 'lg' | 'xl' | '2xl';
  muted?: boolean;
  weight?: 'normal' | 'medium' | 'semibold';
}) {
  return (
    <>
      {children.split(' ').map((word, index) => (
        <Text key={index} size={size} muted={muted} weight={weight}>
          {word}
        </Text>
      ))}
    </>
  );
}

/** The author's own mark, so the greeting is addressed to somebody real. */
const GITHUB_AVATAR = 'https://github.com/Khalidabdi1.png?size=200';

/** Three days of a queue, so the counts have somewhere to roll to. */
const DAYS = [
  { reviews: 3, issues: 2, releases: 1, due: 'before Thursday' },
  { reviews: 5, issues: 7, releases: 2, due: 'before Monday' },
  { reviews: 1, issues: 4, releases: 3, due: 'until the next sprint' },
] as const;

/** A plural that reads, rather than a count with an s bolted to it. */
const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

function AnimatedBadgeSentenceVersion() {
  const [index, setIndex] = useState(0);
  const day = DAYS[index]!;

  return (
    <View className="flex-1 justify-center gap-8 px-6">
      <Sentence>
        <Words muted>Morning,</Words>
        <Avatar
          size="sm"
          className="h-6 w-6"
          source={{ uri: GITHUB_AVATAR }}
          fallback="KA"
        />
        <Words weight="semibold">Khalid.</Words>
        <Words muted>Waiting on you:</Words>
        <BadgeThen mark=",">
          <AnimatedBadge
            size="sm"
            status="info"
            animateLayout={false}
            icon={<PencilIcon size={12} />}
          >
            {plural(day.reviews, 'review')}
          </AnimatedBadge>
        </BadgeThen>
        <AnimatedBadge
          size="sm"
          status="warning"
          animateLayout={false}
          icon={<ListChecksIcon size={12} />}
        >
          {plural(day.issues, 'issue')}
        </AnimatedBadge>
        <Words muted>and</Words>
        <BadgeThen mark=".">
          <AnimatedBadge
            size="sm"
            status="success"
            animateLayout={false}
            icon={<PackageIcon size={12} />}
          >
            {plural(day.releases, 'release')}
          </AnimatedBadge>
        </BadgeThen>
        <Words muted>Nothing else is due</Words>
        <Words weight="semibold">{`${day.due}.`}</Words>
      </Sentence>

      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onPress={() => setIndex((current) => (current + 1) % DAYS.length)}
      >
        Another day
      </Button>
    </View>
  );
}

/** Two weeks of builds, so every figure in the paragraph has a second value. */
const BUILD_WEEKS = [
  {
    average: '4m 12s',
    passed: '27 passed',
    flaky: '2 flaky',
    failed: '1 failed',
    slowest: '1m 48s',
  },
  {
    average: '3m 05s',
    passed: '29 passed',
    flaky: '1 flaky',
    failed: '0 failed',
    slowest: '1m 12s',
  },
] as const;

/**
 * The same shape as a written report, with the figures carried by badges.
 *
 * Every number in the paragraph is a badge, so the sentence can be re-read
 * against a new week and each figure turns over where it stands. Nothing else
 * moves, which is the point: a report that redraws itself is one nobody can
 * tell has changed.
 */
function AnimatedBadgeSummaryVersion() {
  const [index, setIndex] = useState(0);
  const week = BUILD_WEEKS[index]!;

  return (
    <View className="flex-1 justify-center gap-6 px-6">
      <Card>
        <Card.Content className="gap-5 p-5">
          <AnimatedBadge
            size="sm"
            status="neutral"
            animateLayout={false}
            icon={<SparklesIcon size={12} />}
          >
            Summary
          </AnimatedBadge>

          <Sentence>
            <Words size="lg" muted>
              The last thirty builds averaged
            </Words>
            <BadgeThen mark="." size="lg">
              <AnimatedBadge
                size="sm"
                status="info"
                animateLayout={false}
                icon={<ClockIcon size={12} />}
              >
                {week.average}
              </AnimatedBadge>
            </BadgeThen>
            <BadgeThen mark="," size="lg">
              <AnimatedBadge size="sm" status="success" animateLayout={false}>
                {week.passed}
              </AnimatedBadge>
            </BadgeThen>
            <AnimatedBadge size="sm" status="warning" animateLayout={false}>
              {week.flaky}
            </AnimatedBadge>
            <Words size="lg" muted>
              and
            </Words>
            <BadgeThen mark="." size="lg">
              <AnimatedBadge size="sm" status="danger" animateLayout={false}>
                {week.failed}
              </AnimatedBadge>
            </BadgeThen>
            <Words size="lg" muted>
              Bundling is still the slowest step, at
            </Words>
            <BadgeThen mark="." size="lg">
              <AnimatedBadge
                size="sm"
                status="neutral"
                animateLayout={false}
                icon={<PackageIcon size={12} />}
              >
                {week.slowest}
              </AnimatedBadge>
            </BadgeThen>
          </Sentence>
        </Card.Content>
      </Card>

      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onPress={() => setIndex((current) => (current + 1) % BUILD_WEEKS.length)}
      >
        Last week
      </Button>
    </View>
  );
}

export const ENTRIES: ComponentEntry[] = [
{
    slug: 'accordion',
    name: 'Accordion',
    summary: 'Collapsible sections, single or multiple',
    demos: [
      { label: 'Default', render: () => <AccordionDemo variant="default" /> },
      { label: 'Surface', render: () => <AccordionDemo variant="surface" /> },
      { label: 'Separated', render: () => <AccordionDemo variant="separated" /> },
      { label: 'Bordered', render: () => <AccordionDemo variant="bordered" /> },
      { label: 'Ghost', render: () => <AccordionDemo variant="ghost" /> },
      {
        label: 'Multiple open',
        render: () => <AccordionDemo variant="surface" selectionMode="multiple" />,
      },
      { label: 'Keeps its state', render: () => <AccordionKeepMountedDemo /> },
    ],
  },
{
    slug: 'alert',
    name: 'Alert',
    summary: 'Status message with an icon',
    demos: [
      {
        label: 'Variants',
        render: () => (
          <View className="w-full gap-3">
            {(['info', 'success', 'warning', 'destructive'] as const).map((variant) => (
              <Alert key={variant} variant={variant}>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>
                    {variant === 'info'
                      ? 'Heads up'
                      : variant === 'success'
                        ? 'Payment received'
                        : variant === 'warning'
                          ? 'Storage almost full'
                          : 'Something went wrong'}
                  </Alert.Title>
                  <Alert.Description>
                    {variant === 'info'
                      ? 'A new version of PanelUI is available.'
                      : variant === 'success'
                        ? 'Your invoice has been paid.'
                        : variant === 'warning'
                          ? "You've used 92% of your quota."
                          : 'Your session has expired.'}
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            ))}
          </View>
        ),
      },
      {
        label: 'Title only',
        render: () => (
          <Alert variant="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Changes saved</Alert.Title>
            </Alert.Content>
          </Alert>
        ),
      },
      {
        label: 'No icon',
        render: () => (
          <Alert>
            <Alert.Content>
              <Alert.Title>Plain alert</Alert.Title>
              <Alert.Description>
                Omit Alert.Indicator for a text-only alert.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        ),
      },
    ],
  },
{
    slug: 'area-chart',
    name: 'AreaChart',
    summary: 'Filled bands over time, stacked or overlaid',
    layout: 'pager',
    demos: [
      {
        label: 'Stacked',
        id: 'stacked',
        fullPage: true,
        description: 'The top edge is the total; each band is its share of it.',
        render: () => <AreaChartStackedVersion />,
      },
      {
        label: 'Overlaid',
        id: 'overlaid',
        fullPage: true,
        description: 'Alternatives rather than parts, so the fills go translucent.',
        render: () => <AreaChartOverlaidVersion />,
      },
    ],
  },
{
    slug: 'avatar',
    name: 'Avatar',
    summary: 'User image with initials fallback',
    demos: [
      {
        label: 'Sizes',
        render: () => (
          <View className="flex-row items-end gap-3">
            <Avatar size="sm" fallback="KA" />
            <Avatar fallback="KA" />
            <Avatar size="lg" fallback="PU" />
            <Avatar size="xl" fallback="P" />
          </View>
        ),
      },
      {
        label: 'With image',
        render: () => (
          <View className="flex-row items-end gap-3">
            <Avatar size="sm" source={{ uri: AVATARS[0] }} fallback="AB" />
            <Avatar source={{ uri: AVATARS[1] }} fallback="CD" />
            <Avatar size="lg" source={{ uri: AVATARS[2] }} fallback="EF" />
          </View>
        ),
      },
      {
        label: 'With notification badge',
        render: () => (
          <View className="flex-row items-center gap-6">
            <Avatar size="lg" source={{ uri: AVATARS[0] }} fallback="AB">
              <Avatar.Badge>
                <Badge variant="destructive" count={5} />
              </Avatar.Badge>
            </Avatar>
            <Avatar size="lg" source={{ uri: AVATARS[1] }} fallback="CD">
              <Avatar.Badge>
                <Badge variant="destructive" count={128} />
              </Avatar.Badge>
            </Avatar>
            <Avatar size="lg" fallback="EF">
              <Avatar.Badge>
                <Badge variant="success" shape="dot" />
              </Avatar.Badge>
            </Avatar>
          </View>
        ),
      },
      {
        label: 'Stacked group',
        render: () => (
          <Avatar.Group>
            {AVATARS.map((uri, index) => (
              <Avatar key={uri} source={{ uri }} fallback={String.fromCharCode(65 + index)} />
            ))}
          </Avatar.Group>
        ),
      },
      {
        label: 'A capped group',
        render: () => (
          <View className="w-full gap-5">
            {/* Three of the three, and thirty-seven more behind them. */}
            <Avatar.Group size="sm" max={3} total={40}>
              {AVATARS.map((uri, index) => (
                <Avatar key={uri} source={{ uri }} fallback={String.fromCharCode(65 + index)} />
              ))}
            </Avatar.Group>
            {/* The cap counts faces: two shown, one counted. */}
            <Avatar.Group max={2}>
              {AVATARS.map((uri, index) => (
                <Avatar key={uri} source={{ uri }} fallback={String.fromCharCode(65 + index)} />
              ))}
            </Avatar.Group>
            {/* `overlap={0}` closes the stack up into a plain row. */}
            <Avatar.Group size="lg" overlap={0} className="gap-2">
              {AVATARS.map((uri, index) => (
                <Avatar key={uri} source={{ uri }} fallback={String.fromCharCode(65 + index)} />
              ))}
            </Avatar.Group>
          </View>
        ),
      },
    ],
  },
{
    slug: 'attachment',
    name: 'Attachment',
    summary: 'File row with upload states, built on Item',
    demos: [
      {
        label: 'Done',
        render: () => (
          <Attachment className="w-full">
            <Attachment.Media>
              <FileIcon size={18} />
            </Attachment.Media>
            <Attachment.Content>
              <Attachment.Title>sales-dashboard.pdf</Attachment.Title>
              <Attachment.Description>PDF · 2.4 MB</Attachment.Description>
            </Attachment.Content>
            <Attachment.Actions>
              <Attachment.Action accessibilityLabel="Remove sales-dashboard.pdf">
                <XIcon size={16} />
              </Attachment.Action>
            </Attachment.Actions>
          </Attachment>
        ),
      },
      { label: 'Upload states', render: () => <AttachmentStatesDemo /> },
      { label: 'A live upload', render: () => <AttachmentUploadDemo /> },
      {
        label: 'A group of thumbnails',
        render: () => (
          <Attachment.Group orientation="horizontal" className="w-full">
            {['cover.png', 'hero.jpg', 'logo.svg'].map((name) => (
              <Attachment key={name} orientation="vertical" className="w-32">
                <Attachment.Media variant="icon">
                  <ImageIcon size={18} />
                </Attachment.Media>
                <Attachment.Content>
                  <Attachment.Title className="text-sm">{name}</Attachment.Title>
                  <Attachment.Description>Image</Attachment.Description>
                </Attachment.Content>
              </Attachment>
            ))}
          </Attachment.Group>
        ),
      },
    ],
  },
{
    slug: 'animated-badge',
    name: 'AnimatedBadge',
    summary: 'Status pill whose icon and label roll over when the status changes',
    demos: [
      {
        label: 'A sentence with badges in it',
        id: 'in-a-sentence',
        fullPage: true,
        description:
          'Badges set in a line of prose, carrying the figures the sentence is about.',
        render: () => <AnimatedBadgeSentenceVersion />,
      },
      {
        label: 'A summary that rewrites itself',
        id: 'in-a-summary',
        fullPage: true,
        description:
          'Every number in the paragraph is a badge, so a new report turns each one over where it stands.',
        render: () => <AnimatedBadgeSummaryVersion />,
      },
      { label: 'A run of statuses', render: () => <AnimatedBadgeRunDemo /> },
      { label: 'Every status', render: () => <AnimatedBadgeStatusesDemo /> },
      {
        label: 'Sizes',
        render: () => (
          <View className="items-center gap-3">
            <AnimatedBadge size="sm" status="success">
              Passed
            </AnimatedBadge>
            <AnimatedBadge size="md" status="success">
              Passed
            </AnimatedBadge>
          </View>
        ),
      },
      {
        label: 'Your own glyph',
        render: () => (
          <View className="items-center gap-3">
            <AnimatedBadge status="info" icon={<SparklesIcon size={14} />}>
              Suggested
            </AnimatedBadge>
            <AnimatedBadge status="warning" showIcon={false}>
              Draft
            </AnimatedBadge>
          </View>
        ),
      },
    ],
  },
{
    slug: 'badge',
    name: 'Badge',
    summary: 'Compact status label',
    demos: [
      {
        label: 'Variants',
        render: () => (
          <View className="flex-row flex-wrap items-center justify-center gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="info">Info</Badge>
          </View>
        ),
      },
      {
        label: 'Sizes',
        render: () => (
          <View className="items-center gap-4">
            <View className="flex-row flex-wrap items-center justify-center gap-2">
              <Badge size="xs">Extra small</Badge>
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
              <Badge size="xl">Extra large</Badge>
            </View>
            <View className="flex-row items-center gap-3">
              <Badge size="xs" count={3} />
              <Badge size="sm" count={3} />
              <Badge size="md" count={3} />
              <Badge size="lg" count={3} />
              <Badge size="xl" count={3} />
            </View>
            <View className="flex-row items-center gap-3">
              <Badge size="xs" shape="dot" variant="success" />
              <Badge size="sm" shape="dot" variant="success" />
              <Badge size="md" shape="dot" variant="success" />
              <Badge size="lg" shape="dot" variant="success" />
              <Badge size="xl" shape="dot" variant="success" />
            </View>
          </View>
        ),
      },
      {
        label: 'With status dot',
        render: () => (
          <View className="gap-2">
            {([
              ['success', '#10b981', 'Operational'],
              ['warning', '#f59e0b', 'Degraded'],
              ['destructive', '#ef4444', 'Outage'],
            ] as const).map(([variant, dot, text]) => (
              <Badge key={variant} variant={variant}>
                <View
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: dot }}
                />
                <Text size="xs" weight="medium">
                  {text}
                </Text>
              </Badge>
            ))}
          </View>
        ),
      },
    ],
  },
{
    slug: 'bar-chart',
    name: 'BarChart',
    summary: 'Categories compared by length, grouped or stacked',
    layout: 'pager',
    demos: [
      {
        label: 'Grouped',
        id: 'grouped',
        fullPage: true,
        description: 'Two series side by side, compared by length.',
        render: () => <BarChartGroupedVersion />,
      },
      {
        label: 'Stacked',
        id: 'stacked',
        fullPage: true,
        description: 'The same two series read as a total instead of as a comparison.',
        render: () => <BarChartStackedVersion />,
      },
      {
        label: 'Sideways',
        id: 'horizontal',
        fullPage: true,
        description: 'Horizontal bars, for category names that need the room.',
        render: () => <BarChartHorizontalVersion />,
      },
    ],
  },
{
    slug: 'bubble-chart',
    name: 'BubbleChart',
    summary: 'Named circles on two axes, with a third quantity on their area',
    layout: 'pager',
    demos: [
      {
        label: 'Basic',
        id: 'basic',
        fullPage: true,
        description: 'Two axes and an area, with each circle carrying its own name.',
        render: () => <BubbleBasicVersion />,
      },
      {
        label: 'Named beside',
        id: 'legend',
        fullPage: true,
        description: 'A legend instead of labels, for circles too small to hold them.',
        render: () => <BubbleLegendVersion />,
      },
      {
        label: 'Four quadrants',
        id: 'quadrants',
        fullPage: true,
        description:
          'A crosshair at the average of each axis, and a name for the corner it makes.',
        render: () => <BubbleQuadrantsVersion />,
      },
      {
        label: 'What the area means',
        id: 'size-key',
        fullPage: true,
        description:
          'Three nested circles saying what a bubble is worth. Area is the one quantity the chart has no axis for.',
        render: () => <BubbleSizeKeyVersion />,
      },
      {
        label: 'The line through it',
        id: 'trend',
        fullPage: true,
        description:
          'The straight line that fits the cloud best, with how tightly the cloud sits on it.',
        render: () => <BubbleTrendVersion />,
      },
      {
        label: 'Loading',
        id: 'loading',
        fullPage: true,
        description: 'A still field of muted circles that dissolves as the real ones land.',
        render: () => <BubbleLoadingVersion />,
      },
    ],
  },
{
    slug: 'pyramid-chart',
    name: 'PyramidChart',
    summary: 'Two series mirrored about a centre, on one shared scale',
    layout: 'pager',
    demos: [
      {
        label: 'Two wings',
        id: 'basic',
        fullPage: true,
        description: 'Both sides measured on one scale, so their lengths compare.',
        render: () => <PyramidBasicVersion />,
      },
      {
        label: 'Population',
        id: 'centred',
        fullPage: true,
        description:
          'The shape a population is usually drawn in, with the names over each pair.',
        render: () => <PyramidCentredVersion />,
      },
      {
        label: 'Loading',
        id: 'loading',
        fullPage: true,
        description: 'Equal stubs either side of the centre, giving way to the real wings.',
        render: () => <PyramidLoadingVersion />,
      },
    ],
  },
{
    slug: 'candlestick-chart',
    name: 'CandlestickChart',
    summary: 'Open, high, low and close for a period, drawn as one mark',
    layout: 'pager',
    demos: [
      {
        label: 'Sessions',
        id: 'sessions',
        fullPage: true,
        description: 'Thirty sessions, with a readout that follows the finger.',
        render: () => <CandlestickChartSessionsVersion />,
      },
      {
        label: 'No axes',
        id: 'bare',
        fullPage: true,
        description: 'The last ten, sized for a card rather than for a screen.',
        render: () => <CandlestickChartBareVersion />,
      },
      {
        label: 'Loading',
        id: 'loading',
        fullPage: true,
        description: 'Placeholder candles growing into the real ones.',
        render: () => <CandlestickChartLoadingVersion />,
      },
    ],
  }
];
export const ENTRIES_BY_SLUG = Object.fromEntries(ENTRIES.map((entry) => [entry.slug, entry]));

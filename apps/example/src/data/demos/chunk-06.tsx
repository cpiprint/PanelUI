import { useEffect, useRef, useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react-native";
import Dollar01Icon from "@hugeicons/core-free-icons/Dollar01Icon";
import { Pressable, ScrollView, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Avatar, Badge, BookmarkIcon, Button, Card, CheckIcon, Chip, CrosshairIcon, DownloadIcon, EllipsisIcon, Frame, InfoIcon, Input, Item, Kpi, Label, LineChart, Loader, LockIcon, MarkdownEditor, Marker, Marquee, Menu, Message, MessageCircleIcon, PackageIcon, PencilIcon, PlusSquareIcon, Post, Progress, RadarChart, RadioGroup, SearchIcon, Separator, ShareNodesIcon, ShieldCheckIcon, Surface, Switch, Tabs, Text, Tooltip, TrashIcon, type LineChartHandle, type LoaderVariant, type RadarChartDatum, useToast } from "panelui-native";
import { useCSSVariable } from "uniwind";
import { ChoroplethBlock, DeliveryTrackerBlock, HeatmapBlock, LogisticsNetworkBlock, PlacesBlock, RunSummaryBlock, StoreLocatorBlock, UptimeMonitorBlock } from "../../components/map-blocks";
import type { ComponentEntry } from '../component-types';

/* -------------------------------------------------------------------------- */
/* LineChart                                                                  */
/* -------------------------------------------------------------------------- */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Monthly revenue, a rising series with some wobble. */
const REVENUE = MONTHS.map((month, index) => ({
  month,
  revenue: [4200, 5800, 4900, 7100, 6100, 8300, 7800, 9500, 8900, 10400, 9900, 11600][index]!,
  target: [4400, 5100, 5800, 6500, 7200, 7900, 8300, 8800, 9200, 9700, 10100, 10600][index]!,
}));

/** Four traffic sources, orders of magnitude apart, sharing one axis. */
const TRAFFIC = MONTHS.map((month, index) => ({
  month,
  organic: [2100, 3400, 5200, 6100, 7300, 9800, 8900, 12400, 11800, 14200, 15600, 15100][index]!,
  paid: [1200, 2400, 3100, 4200, 4800, 5600, 6100, 7200, 7800, 8900, 9600, 9500][index]!,
  referral: [800, 1400, 1900, 2600, 3100, 3400, 3900, 4200, 4600, 4900, 5100, 5100][index]!,
  social: [600, 1100, 1500, 2100, 2400, 2600, 2900, 3200, 3400, 3700, 3900, 3800][index]!,
}));

/** Two sources for the basic linear example. */
const SESSIONS = MONTHS.map((month, index) => ({
  month,
  organic: [2000, 15000, 8000, 14000, 8000, 18000, 18000, 20000, 17000, 21000, 18000, 15000][index]!,
  paid: [1000, 10000, 8000, 15000, 8000, 12000, 11500, 5000, 15000, 10000, 18000, 9000][index]!,
}));

const RANGES: Record<string, { balance: number; delta: number; data: { t: string; v: number }[] }> = {
  '1D': { balance: 24801, delta: 1.2, data: spark([120, 118, 124, 121, 128, 126, 132, 130, 138]) },
  '1W': { balance: 24801, delta: 3.4, data: spark([90, 95, 92, 101, 108, 104, 118, 124, 132]) },
  '1M': { balance: 24801, delta: 5.32, data: spark([60, 66, 62, 78, 84, 80, 96, 104, 138]) },
  '1Y': { balance: 24801, delta: 42.8, data: spark([20, 34, 41, 55, 61, 78, 92, 110, 138]) },
};

function spark(values: number[]): { t: string; v: number }[] {
  return values.map((v, index) => ({ t: String(index), v }));
}

/** Centers a version's chart card in the screen, matching the reference shots. */
function ChartScreen({ children }: { children: ReactNode }) {
  return <View className="flex-1 justify-center px-4">{children}</View>;
}

/* --- Versions ------------------------------------------------------------- */

function ChartBasicVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Traffic Source</Frame.Title>
          <Frame.Action>Last 12 months</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <ChartStat value="292,000" caption="Sessions">
            <LegendDot colorIndex={1} label="Organic" />
            <LegendDot colorIndex={2} label="Paid Ads" />
          </ChartStat>
          <LineChart data={SESSIONS} xDataKey="month" curve="linear" aspectRatio={1.7}>
            <LineChart.Grid />
            <LineChart.Line dataKey="organic" colorIndex={1} />
            <LineChart.Line dataKey="paid" colorIndex={2} />
            <LineChart.XAxis ticks={5} />
            <LineChart.Tooltip
              formatValue={(v) => v.toLocaleString()}
              formatX={(d) => String(d.month)}
            />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

function ChartBothAxesVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Monthly Revenue</Frame.Title>
          <Frame.Action>Both axes</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <LineChart data={REVENUE} xDataKey="month" aspectRatio={1.7}>
            {/* The grid's rows and the axis' ticks match, so every number
                names a line that is actually drawn. */}
            <LineChart.Grid rows={4} />
            <LineChart.Area dataKey="revenue" />
            <LineChart.Line dataKey="revenue" />
            <LineChart.XAxis ticks={5} />
            <LineChart.YAxis ticks={4} format={(v) => `$${Math.round(v / 1000)}k`} />
            <LineChart.Tooltip formatValue={(v) => `$${(v / 1000).toFixed(1)}k`} />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

function ChartDotsVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Monthly Revenue</Frame.Title>
        </Frame.Header>
        <Frame.Panel>
          <LineChart data={REVENUE} xDataKey="month" aspectRatio={1.7}>
            <LineChart.Grid />
            <LineChart.Line dataKey="revenue" showMarkers />
            <LineChart.XAxis ticks={5} />
            <LineChart.Tooltip formatValue={(v) => `$${(v / 1000).toFixed(1)}k`} />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

function ChartCrosshairVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Monthly Revenue</Frame.Title>
          <Frame.Action>Drag to inspect</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <ChartStat value="$317,904" caption="Last 12 months" />
          <LineChart data={REVENUE} xDataKey="month" aspectRatio={1.7}>
            <LineChart.Grid />
            <LineChart.Area dataKey="revenue" />
            <LineChart.Line dataKey="revenue" />
            <LineChart.XAxis ticks={5} />
            <LineChart.Tooltip formatValue={(v) => `$${v.toLocaleString()}`} />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

function ChartAnimatedVersion() {
  const chart = useRef<LineChartHandle>(null);

  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Monthly Revenue</Frame.Title>
          <Frame.Action>
            <Button variant="ghost" size="sm" onPress={() => chart.current?.replay()}>
              Replay
            </Button>
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <LineChart ref={chart} data={REVENUE} xDataKey="month" aspectRatio={1.7}>
            <LineChart.Grid />
            <LineChart.Area dataKey="revenue" />
            <LineChart.Line dataKey="revenue" />
            <LineChart.XAxis ticks={5} />
            <LineChart.Tooltip formatValue={(v) => `$${v.toLocaleString()}`} />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

function ChartFinanceVersion() {
  const [range, setRange] = useState('1M');
  const current = RANGES[range]!;
  const up = current.delta >= 0;

  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Total balance</Frame.Title>
          <Frame.Action>{range}</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          {/* The delta rides beside the number rather than under it — three
              stacked lines is what made this header a wall of text. */}
          <ChartStat value={`$${current.balance.toLocaleString()}.32`}>
            <Text size="sm" className={up ? 'text-success' : 'text-destructive'}>
              {up ? '+' : ''}
              {current.delta}% this {range === '1D' ? 'day' : range === '1W' ? 'week' : 'period'}
            </Text>
          </ChartStat>
          <View className="gap-3 px-3 pb-3">
            <LineChart data={current.data} xDataKey="t" aspectRatio={1.9}>
              <LineChart.Grid rows={3} dashArray="" opacity={0.4} />
              <LineChart.Area dataKey="v" />
              <LineChart.Line dataKey="v" />
            </LineChart>
            <Tabs value={range} defaultValue={range} onValueChange={setRange}>
              <Tabs.List>
                {Object.keys(RANGES).map((key) => (
                  <Tabs.Trigger key={key} value={key}>
                    {key}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </Tabs>
          </View>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

function ChartDashedVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Actual vs Target</Frame.Title>
          <Frame.Action>2026</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <ChartLegendRow>
            <LegendDot colorIndex={1} label="Actual" />
            <View className="flex-row items-center gap-1.5">
              <View className="h-0.5 w-4 rounded-full bg-muted-foreground" />
              <Text size="xs" muted>
                Target
              </Text>
            </View>
          </ChartLegendRow>
          <LineChart data={REVENUE} xDataKey="month" aspectRatio={1.7}>
            <LineChart.Grid />
            <LineChart.Line dataKey="revenue" colorIndex={1} />
            <LineChart.Line dataKey="target" colorIndex={2} dashArray="6,5" />
            <LineChart.XAxis ticks={5} />
            <LineChart.Tooltip formatValue={(v) => `$${(v / 1000).toFixed(1)}k`} />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

function ChartMultiVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Traffic Sources</Frame.Title>
          <Frame.Action>Last 12 months</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          {/* Four keys wrap onto two rows on a narrow phone. In the header
              strip that pushed the chart down the card; in the panel it is
              simply part of the content. */}
          <ChartLegendRow>
            <LegendDot colorIndex={1} label="Organic" />
            <LegendDot colorIndex={2} label="Paid Ads" />
            <LegendDot colorIndex={3} label="Referral" />
            <LegendDot colorIndex={4} label="Social" />
          </ChartLegendRow>
          <LineChart data={TRAFFIC} xDataKey="month" aspectRatio={1.7}>
            <LineChart.Grid />
            <LineChart.Line dataKey="organic" colorIndex={1} />
            <LineChart.Line dataKey="paid" colorIndex={2} />
            <LineChart.Line dataKey="referral" colorIndex={3} />
            <LineChart.Line dataKey="social" colorIndex={4} />
            <LineChart.XAxis ticks={5} />
            <LineChart.Tooltip formatValue={(v) => `${(v / 1000).toFixed(1)}k`} />
          </LineChart>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

/** Padding a KPI row takes inside a Frame.Panel, matching Frame.Row. */
const KPI_ROW = 'px-4 py-3.5';

const RADAR_PROFILE = [
  { axis: 'Speed', you: 82, team: 64 },
  { axis: 'Accuracy', you: 71, team: 78 },
  { axis: 'Coverage', you: 55, team: 83 },
  { axis: 'Uptime', you: 94, team: 91 },
  { axis: 'Cost', you: 48, team: 62 },
  { axis: 'Support', you: 77, team: 58 },
];

const RADAR_SKILLS = [
  { axis: 'Design', score: 88 },
  { axis: 'Frontend', score: 94 },
  { axis: 'Backend', score: 62 },
  { axis: 'Infra', score: 45 },
  { axis: 'Testing', score: 71 },
];

/** One profile per quarter, on the same axes and the same scale. */
const RADAR_QUARTERS = {
  q1: [
    { axis: 'Speed', score: 54 },
    { axis: 'Accuracy', score: 61 },
    { axis: 'Coverage', score: 38 },
    { axis: 'Uptime', score: 72 },
    { axis: 'Cost', score: 44 },
    { axis: 'Support', score: 50 },
  ],
  q2: [
    { axis: 'Speed', score: 68 },
    { axis: 'Accuracy', score: 66 },
    { axis: 'Coverage', score: 57 },
    { axis: 'Uptime', score: 85 },
    { axis: 'Cost', score: 51 },
    { axis: 'Support', score: 63 },
  ],
  q3: [
    { axis: 'Speed', score: 82 },
    { axis: 'Accuracy', score: 71 },
    { axis: 'Coverage', score: 88 },
    { axis: 'Uptime', score: 94 },
    { axis: 'Cost', score: 48 },
    { axis: 'Support', score: 77 },
  ],
} satisfies Record<string, RadarChartDatum[]>;

const RADAR_PERIODS = [
  { value: 'q1', label: 'Q1' },
  { value: 'q2', label: 'Q2' },
  { value: 'q3', label: 'Q3' },
] as const;

function RadarSwitchVersion() {
  const [period, setPeriod] = useState<string>('q3');
  const data = RADAR_QUARTERS[period as keyof typeof RADAR_QUARTERS] ?? RADAR_QUARTERS.q3;
  const best = [...data].sort((a, b) => b.score - a.score)[0];

  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Service profile</Frame.Title>
          <Frame.Action>{best.axis} leads</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <View className="items-center px-4 pb-2 pt-2">
            {/* Changing the tab changes the data, and the outline travels to
                the new one a vertex at a time. That movement is the point: it
                is what says which axes moved and by how much, which a shape
                that simply appeared would not. The scale is fixed so the two
                profiles stay comparable. */}
            <RadarChart data={data} domain={[0, 100]}>
              <RadarChart.Grid />
              <RadarChart.Axis />
              <RadarChart.Series dataKey="score" colorIndex={1} showDots />
            </RadarChart>
          </View>
          <Frame.Section className="px-4 py-3">
            <Tabs value={period} onValueChange={setPeriod} defaultValue="q3">
              <Tabs.List>
                {RADAR_PERIODS.map((entry) => (
                  <Tabs.Trigger key={entry.value} value={entry.value}>
                    {entry.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </Tabs>
          </Frame.Section>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

function RadarSingleVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Skills</Frame.Title>
          <Frame.Action>Self-assessed</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <View className="px-4 pb-4 pt-2">
            {/* One profile, filled. The scale is fixed at 0–100 rather than
                derived, because a shape only means anything against a known
                maximum. */}
            <RadarChart data={RADAR_SKILLS} domain={[0, 100]}>
              <RadarChart.Grid />
              <RadarChart.Axis />
              <RadarChart.Series dataKey="score" colorIndex={1} showDots />
            </RadarChart>
          </View>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

function RadarComparisonVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>You vs the team</Frame.Title>
          <Frame.Action>This quarter</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <View className="px-4 pb-4 pt-2">
            {/* Two profiles over each other. Only the first is filled — two
                translucent fills make a third colour that means nothing. */}
            <RadarChart data={RADAR_PROFILE} domain={[0, 100]}>
              <RadarChart.Grid />
              <RadarChart.Axis />
              <RadarChart.Series dataKey="you" colorIndex={1} />
              <RadarChart.Series dataKey="team" colorIndex={2} fillOpacity={0} />
              <RadarChart.Legend />
            </RadarChart>
          </View>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

function RadarOutlineVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Coverage</Frame.Title>
          <Frame.Action>Circular rings</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <View className="px-4 pb-4 pt-2">
            {/* Circular rings and no fill — for reading a value off a spoke
                rather than comparing two outlines. */}
            <RadarChart data={RADAR_PROFILE} domain={[0, 100]}>
              <RadarChart.Header title="Weakest axis" value="Cost" caption="48 of 100" />
              <RadarChart.Grid circular rings={5} />
              <RadarChart.Axis fontSize={10} />
              <RadarChart.Series
                dataKey="you"
                colorIndex={3}
                fillOpacity={0}
                strokeWidth={2.5}
                showDots
              />
            </RadarChart>
          </View>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

function KpiDefaultVersion() {
  return (
    <ChartScreen>
      {/* Label, number and change on the left; a fixed sparkline column on
          the right, so the shapes line up down the edge of the stack whatever
          length the labels are. In a frame, with the rows divided by
          hairlines — three readings of one thing, not three loose cards. */}
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Overview</Frame.Title>
          <Frame.Action>Last 30 days</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Frame.Section className={KPI_ROW}>
            <Kpi surface={false} colorIndex={1}>
              <Kpi.Content layout="inline">
                <Kpi.Stat>
                  <Kpi.Title>Total Revenue</Kpi.Title>
                  <Kpi.Value>$317,904</Kpi.Value>
                  <Kpi.Trend value={7.8} caption="last 30d" />
                </Kpi.Stat>
                <Kpi.Chart
                  data={spark([36, 39, 47, 44, 55, 63, 61, 76, 88])}
                  dataKey="v"
                  inline
                />
              </Kpi.Content>
            </Kpi>
          </Frame.Section>

          {/* A fall in bounce rate is the good news, so the change is green
              even though the number is negative. */}
          <Frame.Section className={KPI_ROW}>
            <Kpi surface={false} colorIndex={3} goodDirection="down">
              <Kpi.Content layout="inline">
                <Kpi.Stat>
                  <Kpi.Title>Bounce Rate</Kpi.Title>
                  <Kpi.Value>37.6%</Kpi.Value>
                  <Kpi.Trend value={-8.4} caption="vs last 7d" />
                </Kpi.Stat>
                <Kpi.Chart
                  data={spark([88, 85, 73, 76, 64, 59, 61, 48, 39])}
                  dataKey="v"
                  inline
                />
              </Kpi.Content>
            </Kpi>
          </Frame.Section>

          <Frame.Section className={KPI_ROW}>
            <Kpi surface={false} colorIndex={2}>
              <Kpi.Content layout="inline">
                <Kpi.Stat>
                  <Kpi.Title>New Customers</Kpi.Title>
                  <Kpi.Value>2,867</Kpi.Value>
                  <Kpi.Trend value={4.2} caption="this week" />
                </Kpi.Stat>
                <Kpi.Chart
                  data={spark([27, 35, 33, 46, 59, 55, 64, 79, 91])}
                  dataKey="v"
                  inline
                />
              </Kpi.Content>
            </Kpi>
          </Frame.Section>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

function KpiSparklineVersion() {
  return (
    <ChartScreen>
      <View className="w-full gap-3">
        <Kpi colorIndex={1}>
          <Kpi.Header>
            <Kpi.Title>Total revenue</Kpi.Title>
          </Kpi.Header>
          <Kpi.Content>
            <Kpi.Value>$317,904</Kpi.Value>
            <Kpi.Trend value={7.8} />
          </Kpi.Content>
          <Kpi.Chart data={spark([36, 39, 47, 44, 55, 63, 61, 76, 88])} dataKey="v" />
        </Kpi>

        {/* The chart beside the number instead of under it, for a denser row. */}
        <Kpi colorIndex={2}>
          <Kpi.Header>
            <Kpi.Title>New customers</Kpi.Title>
          </Kpi.Header>
          <Kpi.Content layout="inline">
            <View>
              <Kpi.Value>2,867</Kpi.Value>
              <Kpi.Trend value={4.2} className="mt-1 self-start" />
            </View>
            <Kpi.Chart
              data={spark([27, 35, 33, 46, 59, 55, 64, 79, 91])}
              dataKey="v"
              inline
            />
          </Kpi.Content>
        </Kpi>
      </View>
    </ChartScreen>
  );
}

function KpiProgressVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Targets</Frame.Title>
          <Frame.Action>Q3</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Frame.Section className={KPI_ROW}>
            <Kpi surface={false} colorIndex={4}>
              <Kpi.Header>
                <Kpi.Icon tone="good">
                  <CrosshairIcon size={16} color="#27a644" />
                </Kpi.Icon>
                <Kpi.Title>Quarterly revenue</Kpi.Title>
                <Kpi.Trend value={7.8} variant="badge" />
              </Kpi.Header>
              <Kpi.Value>$317k</Kpi.Value>
              <Kpi.Progress value={73} label="of $435k" showValueLabel />
              <Kpi.Footer>
                <Text size="xs" muted>
                  41 days left in the quarter
                </Text>
              </Kpi.Footer>
            </Kpi>
          </Frame.Section>
          <Frame.Section className={KPI_ROW}>
            <Kpi surface={false} colorIndex={2}>
              <Kpi.Header>
                <Kpi.Icon>
                  <HugeiconsIcon icon={Dollar01Icon} size={16} color="#8a8f98" />
                </Kpi.Icon>
                <Kpi.Title>New customers</Kpi.Title>
                <Kpi.Trend value={4.2} variant="badge" />
              </Kpi.Header>
              <Kpi.Value>2,867</Kpi.Value>
              <Kpi.Progress value={57} label="of 5,000" showValueLabel />
            </Kpi>
          </Frame.Section>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}

function KpiGroupVersion() {
  return (
    <ChartScreen>
      <View className="w-full gap-6">
        {/* Three metrics as one panel: a rule between them rather than space
            around them, so they read as one thing with three parts. */}
        <Surface variant="secondary" padding="lg">
          <Kpi.Group>
            <Kpi surface={false} colorIndex={1}>
              <Kpi.Title>Revenue</Kpi.Title>
              <Kpi.Value className="text-2xl">$317k</Kpi.Value>
              <Kpi.Trend value={7.8} className="self-start" />
            </Kpi>
            <Kpi surface={false} colorIndex={2}>
              <Kpi.Title>Orders</Kpi.Title>
              <Kpi.Value className="text-2xl">2,867</Kpi.Value>
              <Kpi.Trend value={4.2} className="self-start" />
            </Kpi>
            <Kpi surface={false} colorIndex={3} goodDirection="down">
              <Kpi.Title>Refunds</Kpi.Title>
              <Kpi.Value className="text-2xl">1.4%</Kpi.Value>
              <Kpi.Trend value={-0.3} className="self-start" />
            </Kpi>
          </Kpi.Group>
        </Surface>

        <Surface variant="secondary" padding="lg">
          <Kpi.Group orientation="vertical">
            <Kpi surface={false} colorIndex={1}>
              <Kpi.Content layout="inline">
                <View>
                  <Kpi.Title>Sessions</Kpi.Title>
                  <Kpi.Value className="text-2xl">48,201</Kpi.Value>
                </View>
                <Kpi.Trend value={12.4} />
              </Kpi.Content>
            </Kpi>
            <Kpi surface={false} colorIndex={3} goodDirection="down">
              <Kpi.Content layout="inline">
                <View>
                  <Kpi.Title>Latency p95</Kpi.Title>
                  <Kpi.Value className="text-2xl">312ms</Kpi.Value>
                </View>
                <Kpi.Trend value={-6.1} />
              </Kpi.Content>
            </Kpi>
          </Kpi.Group>
        </Surface>
      </View>
    </ChartScreen>
  );
}

/**
 * The band above a chart, inside the panel: the headline reading on the left,
 * the legend on the right.
 *
 * It sits in the card rather than in `Frame.Header` because the header is a
 * caption on the tray the card sits in — one muted line. A title, a legend, a
 * 2xl number and a subtitle all crammed into that strip is four levels of
 * hierarchy in a space that has room for one, and the number, which is the
 * thing the card is actually about, ends up the hardest part to find.
 */
function ChartStat({
  value,
  caption,
  children,
}: {
  value: string;
  caption?: string;
  children?: ReactNode;
}) {
  return (
    <View className="flex-row items-start justify-between gap-3 px-4 pb-2 pt-3.5">
      <View className="gap-0.5">
        <Text size="2xl" weight="bold">
          {value}
        </Text>
        {caption ? (
          <Text size="sm" muted>
            {caption}
          </Text>
        ) : null}
      </View>
      {children ? (
        <View className="flex-row flex-wrap items-center justify-end gap-x-3 gap-y-1 pt-1.5">
          {children}
        </View>
      ) : null}
    </View>
  );
}

/** The legend on its own, for a chart with no headline number above it. */
function ChartLegendRow({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-1 pt-3">
      {children}
    </View>
  );
}

/** A coloured dot and a label, reading its colour from the chart token ramp. */
function LegendDot({
  colorIndex,
  label,
}: {
  colorIndex: 1 | 2 | 3 | 4;
  label: string;
}) {
  const color = useCSSVariable(`--color-chart-${colorIndex}`);
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        style={{ backgroundColor: typeof color === 'string' ? color : undefined }}
        className="h-2.5 w-2.5 rounded-full"
      />
      <Text size="xs" muted>
        {label}
      </Text>
    </View>
  );
}

function MenuViewOptionsDemo() {
  const [density, setDensity] = useState('comfortable');
  const [showDone, setShowDone] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  return (
    <View className="w-full items-center py-4">
      <Menu haptics>
        <Menu.Trigger>
          <Button variant="outline">View options</Button>
        </Menu.Trigger>
        <Menu.Content align="start" width={248}>
          <Menu.Label>Density</Menu.Label>
          {/* One of these is always chosen, so the row states which — and a
              dot says so more quietly than a tick beside a list of nouns. */}
          <Menu.RadioGroup value={density} onValueChange={setDensity}>
            <Menu.RadioItem value="comfortable" indicator="dot">
              Comfortable
            </Menu.RadioItem>
            <Menu.RadioItem value="compact" indicator="dot">
              Compact
            </Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Separator />
          <Menu.Label>Show</Menu.Label>
          {/* Checkbox rows keep the menu open, because a set of filters is
              nearly always changed more than one at a time. */}
          <Menu.CheckboxItem checked={showDone} onCheckedChange={setShowDone}>
            Completed
          </Menu.CheckboxItem>
          <Menu.CheckboxItem checked={showArchived} onCheckedChange={setShowArchived}>
            Archived
          </Menu.CheckboxItem>
        </Menu.Content>
      </Menu>
    </View>
  );
}

function MenuSubmenuDemo() {
  const [moved, setMoved] = useState<string | null>(null);

  return (
    <View className="w-full items-center gap-3 py-4">
      <Menu>
        <Menu.Trigger>
          <Button variant="outline">File actions</Button>
        </Menu.Trigger>
        <Menu.Content align="start" width={244}>
          <Menu.Item icon={<PencilIcon size={16} />} shortcut="⌘R">
            Rename
          </Menu.Item>
          {/* The submenu opens downwards into the panel rather than flying out
              sideways — a finger has no path across to a second panel. */}
          <Menu.Sub>
            <Menu.SubTrigger icon={<PackageIcon size={16} />}>Move to</Menu.SubTrigger>
            <Menu.SubContent>
              {['Inbox', 'Projects', 'Archive'].map((folder) => (
                <Menu.Item key={folder} onSelect={() => setMoved(folder)}>
                  {folder}
                </Menu.Item>
              ))}
            </Menu.SubContent>
          </Menu.Sub>
          <Menu.Separator />
          <Menu.Item
            variant="destructive"
            icon={<TrashIcon size={16} />}
            description="This cannot be undone"
          >
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu>
      <Text size="sm" muted>
        {moved ? `Moved to ${moved}` : 'Nothing moved yet'}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* MarkdownEditor                                                             */
/* -------------------------------------------------------------------------- */

const RELEASE_NOTE = `## What changed

Swiping between tabs no longer re-draws the whole panel on every frame, which
is what made a long list feel heavy on Android.

- The fade while dragging is **iOS only** now
- A committed swipe carries on without waiting for the next panel to mount
- Changing tab no longer rebuilds the gesture

> Upgrading is a version bump. Nothing here changes an API.

Read \`useTabs\` if you drive the tabs yourself.`;

/** The whole component, with nothing composed by hand. */
function MarkdownEditorDemo() {
  const [draft, setDraft] = useState(RELEASE_NOTE);

  return (
    <MarkdownEditor
      value={draft}
      onValueChange={setDraft}
      rows={10}
      placeholder="Write something…"
      className="w-full"
    />
  );
}

/**
 * The parts written out, with something extra on the toolbar row.
 *
 * The toolbar takes children, which land beside the mode switch — a count, a
 * save state, anything that belongs to the draft rather than to the text.
 */
function MarkdownEditorComposedDemo() {
  const [draft, setDraft] = useState('A short note, with a **bold** word in it.');
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  return (
    <MarkdownEditor value={draft} onValueChange={setDraft} className="w-full">
      <MarkdownEditor.Toolbar actions={['bold', 'italic', 'link']}>
        <Text size="xs" muted>
          {words} {words === 1 ? 'word' : 'words'}
        </Text>
      </MarkdownEditor.Toolbar>
      <MarkdownEditor.Input rows={6} placeholder="Say something…" />
      <MarkdownEditor.Preview emptyText="Write a line and switch to Preview." />
    </MarkdownEditor>
  );
}

/** A composer with no preview at all — the toolbar keeps only its formatting. */
function MarkdownEditorComposerDemo() {
  const { toast } = useToast();
  const [draft, setDraft] = useState('');

  return (
    <View className="w-full gap-3">
      <MarkdownEditor value={draft} onValueChange={setDraft}>
        <MarkdownEditor.Toolbar showModeSwitch={false} />
        <MarkdownEditor.Input rows={4} placeholder="Leave a comment…" />
      </MarkdownEditor>
      <Button
        fullWidth
        disabled={!draft.trim()}
        onPress={() => {
          toast.show({ variant: 'success', label: 'Comment posted', duration: 2000 });
          setDraft('');
        }}
      >
        Post
      </Button>
    </View>
  );
}

/**
 * The floating capsule, which is the toolbar written the other way.
 *
 * Icon-only, grouped by hairlines, with the way out of the writing pane as a
 * round button beside it rather than a segment of it. Nothing else goes on the
 * row — a capsule with a word count in it is a bar with rounded ends.
 */
function MarkdownEditorPillDemo() {
  const [draft, setDraft] = useState('A note with a **bold** word, and a list:\n\n- one\n- two');

  return (
    <MarkdownEditor value={draft} onValueChange={setDraft} className="w-full">
      <MarkdownEditor.Toolbar variant="pill" />
      <MarkdownEditor.Input rows={8} placeholder="Write something…" />
      <MarkdownEditor.Preview emptyText="Write a line and press the eye." />
    </MarkdownEditor>
  );
}

/** Starting on the reading side, for a draft that already exists. */
function MarkdownEditorPreviewFirstDemo() {
  const [draft, setDraft] = useState(RELEASE_NOTE);

  return (
    <MarkdownEditor
      value={draft}
      onValueChange={setDraft}
      defaultMode="preview"
      rows={10}
      className="w-full"
    />
  );
}

const LOADER_VARIANTS: { variant: LoaderVariant; label: string }[] = [
  { variant: 'pulse-dots', label: 'Pulse dots' },
  { variant: 'bounce-dots', label: 'Bounce dots' },
  { variant: 'pulsating-dots', label: 'Pulsating dots' },
  { variant: 'liquid-dots', label: 'Liquid dots' },
  { variant: 'bar-cascade', label: 'Bar cascade' },
  { variant: 'bouncing-bars', label: 'Bouncing bars' },
  { variant: 'symmetric-wave', label: 'Symmetric wave' },
  { variant: 'morph-ring', label: 'Morph ring' },
  { variant: 'wave-physics', label: 'Wave physics' },
];

/** All nine at once, which is the only way to pick between them. */
function LoaderGalleryVersion() {
  return (
    <ScrollView contentContainerClassName="gap-3 p-4 pb-10">
      <View className="gap-1">
        <Text size="lg" weight="semibold">
          Nine loaders
        </Text>
        <Text size="sm" muted>
          Same props, same colour, same tempo — the variant is the only thing
          that changes.
        </Text>
      </View>

      {LOADER_VARIANTS.map(({ variant, label }) => (
        <Card key={variant}>
          <Card.Content className="flex-row items-center gap-4 py-5">
            <View className="w-32 items-center">
              <Loader variant={variant} />
            </View>
            <Text size="sm" muted className="flex-1">
              {label}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

/** A loader is nearly always standing in for content that has not arrived. */
function LoaderScreenVersion() {
  const [variant, setVariant] = useState<LoaderVariant>('wave-physics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 2600);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <View className="flex-1">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 p-4"
      >
        {LOADER_VARIANTS.map(({ variant: value, label }) => (
          <Chip
            key={value}
            selected={value === variant}
            onPress={() => {
              setVariant(value);
              setLoading(true);
            }}
          >
            {label}
          </Chip>
        ))}
      </ScrollView>

      <View className="flex-1 items-center justify-center gap-6 p-6">
        {loading ? (
          <>
            <Loader variant={variant} size="lg" label="Loading your reports" />
            <Text size="sm" muted className="text-center">
              Fetching reports…
            </Text>
          </>
        ) : (
          <>
            <Text size="lg" weight="semibold">
              12 reports
            </Text>
            <Text size="sm" muted className="text-center">
              Pick another loader above to run it again.
            </Text>
            <Button variant="outline" onPress={() => setLoading(true)}>
              Reload
            </Button>
          </>
        )}
      </View>
    </View>
  );
}

/**
 * Inside a button, where the loader has to be legible on a filled surface it
 * was never told about.
 */
function LoaderInlineVersion() {
  const [busy, setBusy] = useState<string | null>(null);

  const run = (id: string) => {
    setBusy(id);
    setTimeout(() => setBusy(null), 2200);
  };

  return (
    <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
      <View className="gap-1">
        <Text size="lg" weight="semibold">
          In place
        </Text>
        <Text size="sm" muted>
          With no colour of its own a loader draws in the foreground of the
          surface it is on, so it stays readable inside a filled button.
        </Text>
      </View>

      <Button onPress={() => run('primary')} disabled={busy === 'primary'}>
        {busy === 'primary' ? <Loader variant="pulse-dots" size="sm" /> : 'Save changes'}
      </Button>

      <Button
        variant="outline"
        onPress={() => run('outline')}
        disabled={busy === 'outline'}
      >
        {busy === 'outline' ? (
          <Loader variant="bounce-dots" size="sm" />
        ) : (
          'Sync library'
        )}
      </Button>

      <Card>
        <Card.Header>
          <Card.Title>Coloured by token</Card.Title>
          <Card.Description>
            `color` takes a token name, so the loader follows the theme.
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex-row items-center justify-around py-6">
          <Loader variant="bar-cascade" color="--color-info" />
          <Loader variant="symmetric-wave" color="--color-success" />
          <Loader variant="bouncing-bars" color="--color-destructive" />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Sizes</Card.Title>
        </Card.Header>
        <Card.Content className="flex-row items-center justify-around py-6">
          <Loader variant="pulsating-dots" size="sm" />
          <Loader variant="pulsating-dots" size="md" />
          <Loader variant="pulsating-dots" size="lg" />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}


const MARQUEE_STACK = [
  'Reanimated 4',
  'Expo SDK 57',
  'Uniwind',
  'Tailwind v4',
  'TypeScript',
  'New Architecture',
];

const MARQUEE_RELEASES = [
  'Marquee',
  'Planner',
  'Flow',
  'Plot',
  'Panelside',
  'SelectionMode',
];

/**
 * A logo wall, as a customer strip actually gets built.
 *
 * The marks are drawn as SVG paths rather than fetched as images, and that is
 * the part worth copying: a marquee measures its content once, and an image
 * with no width and height measures as nothing — so a strip of remote logos is
 * the arrangement most likely to never start. A path has its size the moment it
 * mounts. Fetch the logos instead and the fix is to give every `Image` explicit
 * dimensions.
 *
 * Each path is a 24×24 viewBox, so one `size` scales the whole wall.
 */
const MARQUEE_BRANDS: { name: string; path: string }[] = [
  {
    name: 'Stripe',
    path: 'M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z',
  },
  {
    name: 'Linear',
    path: 'M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z',
  },
  {
    name: 'Figma',
    path: 'M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148z',
  },
  {
    name: 'Supabase',
    path: 'M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z',
  },
  {
    name: 'GitHub',
    path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  },
  {
    name: 'Vercel',
    path: 'm12 1.608 12 20.784H0Z',
  },
  {
    name: 'Notion',
    path: 'M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z',
  },
  {
    name: 'Airbnb',
    path: 'M12.001 18.275c-1.353-1.697-2.148-3.184-2.413-4.457-.263-1.027-.16-1.848.291-2.465.477-.71 1.188-1.056 2.121-1.056s1.643.345 2.12 1.063c.446.61.558 1.432.286 2.465-.291 1.298-1.085 2.785-2.412 4.458zm9.601 1.14c-.185 1.246-1.034 2.28-2.2 2.783-2.253.98-4.483-.583-6.392-2.704 3.157-3.951 3.74-7.028 2.385-9.018-.795-1.14-1.933-1.695-3.394-1.695-2.944 0-4.563 2.49-3.927 5.382.37 1.565 1.352 3.343 2.917 5.332-.98 1.085-1.91 1.856-2.732 2.333-.636.344-1.245.558-1.828.609-2.679.399-4.778-2.2-3.825-4.88.132-.345.395-.98.845-1.961l.025-.053c1.464-3.178 3.242-6.79 5.285-10.795l.053-.132.58-1.116c.45-.822.635-1.19 1.351-1.643.346-.21.77-.315 1.246-.315.954 0 1.698.558 2.016 1.007.158.239.345.557.582.9z',
  },
];

/**
 * One mark on the wall.
 *
 * Fixed height so every row measures to the same band, and the logo takes the
 * foreground colour rather than the brand's own — a customer strip that keeps
 * eight different brand colours is eight things competing with the page.
 */
function BrandMark({ name, path }: { name: string; path: string }) {
  const foreground = useCSSVariable('--color-foreground');
  const fill = typeof foreground === 'string' ? foreground : '#ffffff';

  return (
    <View className="h-11 flex-row items-center gap-2.5 rounded-xl border border-border px-4">
      <Svg width={18} height={18} viewBox="0 0 24 24" accessibilityLabel={name}>
        <Path d={path} fill={fill} />
      </Svg>
      <Text weight="medium" className="tracking-tight">
        {name}
      </Text>
    </View>
  );
}

function MarqueeStripDemo() {
  return (
    <Marquee spacing={12} speed={40} className="w-full">
      <View className="flex-row gap-3">
        {MARQUEE_STACK.map((label) => (
          <Badge key={label} variant="secondary">
            {label}
          </Badge>
        ))}
      </View>
    </Marquee>
  );
}

/**
 * The logo wall, full width.
 *
 * Two rows against each other, because one row of marks reads as a list that
 * happens to be sliding. The second row is offset by starting from a rotation
 * of the same set, so the two never show the same pair of names in a column.
 */
function MarqueeLogoWallVersion() {
  const second = [...MARQUEE_BRANDS.slice(4), ...MARQUEE_BRANDS.slice(0, 4)];

  return (
    <View className="flex-1 justify-center gap-8 px-0 py-4">
      <View className="gap-2 px-5">
        <Text size="sm" muted>
          Trusted by
        </Text>
        <Text size="xl" weight="semibold">
          Teams that ship on mobile
        </Text>
      </View>

      {/* Grouped, so the two rows share one pause control below them. Left to
          themselves each row pins its own to its bottom corner, and the upper
          one lands on top of the row underneath.

          The height on each row is the band the marks are drawn at, and it is
          not optional: a marquee's track fills the row rather than measuring
          it, so a row inside a container that sizes to its contents has
          nothing to fill and clips the marks away — leaving the group's pause
          control sitting over an empty strip. */}
      <Marquee.Group className="px-5">
        <Marquee spacing={12} speed={28} className="h-11 w-full">
          <View className="flex-row gap-3">
            {MARQUEE_BRANDS.map((brand) => (
              <BrandMark key={brand.name} name={brand.name} path={brand.path} />
            ))}
          </View>
        </Marquee>
        <Marquee spacing={12} speed={28} reverse className="h-11 w-full">
          <View className="flex-row gap-3">
            {second.map((brand) => (
              <BrandMark key={brand.name} name={brand.name} path={brand.path} />
            ))}
          </View>
        </Marquee>
      </Marquee.Group>
    </View>
  );
}

/**
 * A feed that keeps moving, which is the vertical case worth showing.
 *
 * The height is the container's to give — a vertical marquee has no content
 * width to take one from — and the cards are given a fixed width for the same
 * reason the logos are: something stretched to fill measures as nothing.
 *
 * `playing={false}` while a card is held, because a post that slides out from
 * under a finger cannot be read or tapped accurately, and this is the one demo
 * where the content is worth stopping for.
 */
const MARQUEE_POSTS = [
  {
    id: 'a',
    author: 'Priya Raman',
    handle: '@priya',
    body: 'Shipped the redesign behind a flag this morning. Rollout at 10% and the crash rate has not moved.',
    replies: '24',
  },
  {
    id: 'b',
    author: 'Tom Whitfield',
    handle: '@tomw',
    body: 'Spent the afternoon deleting a caching layer nobody could explain. Response times went down.',
    replies: '61',
  },
  {
    id: 'c',
    author: 'Ana Beltrán',
    handle: '@anab',
    body: 'The list virtualisation finally holds sixty frames on the cheap Android test device.',
    replies: '12',
  },
  {
    id: 'd',
    author: 'Kofi Mensah',
    handle: '@kofi',
    body: 'Reminder that a loading state showing invented numbers is worse than one showing nothing.',
    replies: '38',
  },
];

function MarqueeFeedVersion() {
  const [playing, setPlaying] = useState(true);

  return (
    <View className="flex-1 gap-4 py-4">
      <View className="flex-row items-center justify-between px-5">
        <View>
          <Text size="xl" weight="semibold">
            What people are saying
          </Text>
          <Text size="sm" muted>
            Hold a card to stop the feed
          </Text>
        </View>
        <Switch value={playing} onValueChange={setPlaying} />
      </View>

      {/* The switch in the header is the pause control here. */}
      <Marquee
        direction="vertical"
        spacing={12}
        speed={22}
        playing={playing}
        showPauseControl={false}
        className="flex-1 w-full"
      >
        <View className="gap-3 px-5">
          {/* The hold lives on a wrapper rather than on Post: the card is not
              itself pressable here, and the stats inside it keep their own
              presses either way. */}
          {MARQUEE_POSTS.map((post) => (
            <Pressable
              key={post.id}
              className="w-72"
              onPressIn={() => setPlaying(false)}
              onPressOut={() => setPlaying(true)}
            >
              <Post variant="compact" className="w-full">
                <Post.Header>
                  <Post.Author
                    name={post.author}
                    handle={post.handle}
                    fallback={post.author.slice(0, 1)}
                    timestamp="2h"
                  />
                </Post.Header>
                <Post.Body numberOfLines={3}>{post.body}</Post.Body>
                <Post.Footer>
                  <Post.Stat icon={MessageCircleIcon} value={post.replies} />
                </Post.Footer>
              </Post>
            </Pressable>
          ))}
        </View>
      </Marquee>
    </View>
  );
}

function MarqueeTwoRowDemo() {
  // Two rows travelling opposite ways is the arrangement that reads as motion
  // rather than as one row that happens to be sliding.
  return (
    <Marquee.Group className="w-full">
      <Marquee spacing={12} speed={35}>
        <View className="flex-row gap-3">
          {MARQUEE_STACK.map((label) => (
            <Chip key={label}>{label}</Chip>
          ))}
        </View>
      </Marquee>
      <Marquee spacing={12} speed={35} reverse>
        <View className="flex-row gap-3">
          {MARQUEE_RELEASES.map((label) => (
            <Chip key={label} variant="outline">
              {label}
            </Chip>
          ))}
        </View>
      </Marquee>
    </Marquee.Group>
  );
}

function MarqueeVerticalDemo() {
  // A vertical marquee has no content to take its height from, so the height
  // is the container's to give.
  return (
    <Marquee direction="vertical" spacing={12} speed={30} className="h-40 w-full">
      <View className="gap-3">
        {MARQUEE_RELEASES.map((label) => (
          <Surface key={label} className="w-full rounded-xl px-4 py-3">
            <Text weight="medium">{label}</Text>
          </Surface>
        ))}
      </View>
    </Marquee>
  );
}

function MarqueePlayingDemo() {
  const [playing, setPlaying] = useState(true);

  return (
    <View className="w-full gap-4">
      {/* The switch below is the pause control, so the built-in one is off:
          two controls for one piece of state is two things to keep in step. */}
      <Marquee spacing={12} speed={40} playing={playing} showPauseControl={false}>
        <View className="flex-row gap-3">
          {MARQUEE_STACK.map((label) => (
            <Badge key={label} variant="secondary">
              {label}
            </Badge>
          ))}
        </View>
      </Marquee>
      <View className="flex-row items-center justify-between">
        <Text size="sm" muted>
          Playing
        </Text>
        <Switch value={playing} onValueChange={setPlaying} />
      </View>
    </View>
  );
}

export const ENTRIES: ComponentEntry[] = [
{
    slug: 'line-chart',
    name: 'LineChart',
    summary: 'Animated time series, drawn on the UI thread',
    layout: 'pager',
    demos: [
      {
        label: 'Basic',
        id: 'basic',
        fullPage: true,
        description: 'Two straight-line series sharing one axis, with a legend.',
        render: () => <ChartBasicVersion />,
      },
      {
        label: 'Both axes',
        id: 'both-axes',
        fullPage: true,
        description: 'Value labels down the side, each centred on the grid line it names.',
        render: () => <ChartBothAxesVersion />,
      },
      {
        label: 'With dots',
        id: 'dots',
        fullPage: true,
        description: 'A dot at every point, for a short series where each reading matters.',
        render: () => <ChartDotsVersion />,
      },
      {
        label: 'Crosshair',
        id: 'crosshair',
        fullPage: true,
        description: 'Drag across the chart and a label rides the crosshair with the value.',
        render: () => <ChartCrosshairVersion />,
      },
      {
        label: 'Animated line',
        id: 'animated',
        fullPage: true,
        description: 'A Replay button re-runs the reveal through the chart ref.',
        render: () => <ChartAnimatedVersion />,
      },
      {
        label: 'Finance',
        id: 'finance',
        fullPage: true,
        description: 'A balance, a delta, and a range selector that tweens the axis on change.',
        render: () => <ChartFinanceVersion />,
      },
      {
        label: 'Dashed comparison',
        id: 'dashed',
        fullPage: true,
        description: 'A solid actual against a dashed target — told apart by shape, not just colour.',
        render: () => <ChartDashedVersion />,
      },
      {
        label: 'Multi-line',
        id: 'multi',
        fullPage: true,
        description: 'Four series in the chart-token ramp.',
        render: () => <ChartMultiVersion />,
      },
    ],
  },
{
    slug: 'kpi',
    name: 'Kpi',
    summary: 'One number, and what it is doing',
    layout: 'pager',
    demos: [
      {
        label: 'Default',
        id: 'default',
        fullPage: true,
        description: 'Number and change on the left, the shape it made on the right.',
        render: () => <KpiDefaultVersion />,
      },
      {
        label: 'With a sparkline',
        id: 'sparkline',
        fullPage: true,
        description: 'The shape under the number, and the shape beside it.',
        render: () => <KpiSparklineVersion />,
      },
      {
        label: 'With progress',
        id: 'progress',
        fullPage: true,
        description: 'Targets, with an icon, a badge and a bar under each number.',
        render: () => <KpiProgressVersion />,
      },
      {
        label: 'Several as one panel',
        id: 'group',
        fullPage: true,
        description: 'Divided by a rule rather than spaced apart, in a row and a column.',
        render: () => <KpiGroupVersion />,
      },
    ],
  },
{
    slug: 'radar-chart',
    name: 'RadarChart',
    summary: 'Several measures of one thing, on one shape',
    layout: 'pager',
    demos: [
      {
        label: 'One profile',
        id: 'single',
        fullPage: true,
        description: 'A filled polygon on polygonal rings, with a dot at each vertex.',
        render: () => <RadarSingleVersion />,
      },
      {
        label: 'Two compared',
        id: 'comparison',
        fullPage: true,
        description: 'Two profiles over each other, only the first of them filled.',
        render: () => <RadarComparisonVersion />,
      },
      {
        label: 'Outline on circles',
        id: 'outline',
        fullPage: true,
        description: 'Circular rings and no fill, for reading a value off a spoke.',
        render: () => <RadarOutlineVersion />,
      },
      {
        label: 'Switching the data',
        id: 'switch',
        fullPage: true,
        description: 'Tabs under the chart change what it draws, and the outline travels.',
        render: () => <RadarSwitchVersion />,
      },
    ],
  },
{
    slug: 'loader',
    name: 'Loader',
    summary: 'Nine loading animations behind one variant prop',
    demos: [
      {
        label: 'The nine',
        id: 'gallery',
        fullPage: true,
        description: 'All of them side by side, which is the only way to choose.',
        render: () => <LoaderGalleryVersion />,
      },
      {
        label: 'Waiting for a screen',
        id: 'screen',
        fullPage: true,
        description: 'Standing in for content that has not arrived yet.',
        render: () => <LoaderScreenVersion />,
      },
      {
        label: 'In place',
        id: 'inline',
        fullPage: true,
        description: 'Inside buttons and cards, taking its colour from the surface.',
        render: () => <LoaderInlineVersion />,
      },
      {
        label: 'Pulse dots',
        render: () => <Loader />,
      },
      {
        label: 'Wave physics',
        render: () => <Loader variant="wave-physics" />,
      },
      {
        label: 'Liquid dots',
        render: () => <Loader variant="liquid-dots" />,
      },
      {
        label: 'Morph ring',
        render: () => <Loader variant="morph-ring" />,
      },
    ],
  },
{
    slug: 'map',
    name: 'Map',
    summary: 'Vector map drawn from your theme tokens',
    // Every one of these is a whole screen. A map squeezed into a section
    // between two dividers demonstrates nothing except that it does not fit.
    demos: [
      {
        label: 'Places',
        id: 'places',
        fullPage: true,
        fullBleed: true,
        description: 'A street map that is the whole screen — search, pins and a place card.',
        render: () => <PlacesBlock />,
      },
      {
        label: 'Choropleth',
        id: 'choropleth',
        fullPage: true,
        description: 'One layer shaded by a style expression — switch the metric.',
        render: () => <ChoroplethBlock />,
      },
      {
        label: 'Heatmap',
        id: 'heatmap',
        fullPage: true,
        description: 'Density as a field, handing over to the points it was made of.',
        render: () => <HeatmapBlock />,
      },
      {
        label: 'Delivery tracker',
        id: 'delivery',
        fullPage: true,
        description: 'A driven leg and a planned one, told apart by dash.',
        render: () => <DeliveryTrackerBlock />,
      },
      {
        label: 'Store locator',
        id: 'stores',
        fullPage: true,
        description: 'A list and a map on one selection.',
        render: () => <StoreLocatorBlock />,
      },
      {
        label: 'Logistics network',
        id: 'network',
        fullPage: true,
        description: 'Arcs between sites, bowed so lanes sharing a hub stay legible.',
        render: () => <LogisticsNetworkBlock />,
      },
      {
        label: 'Uptime monitor',
        id: 'uptime',
        fullPage: true,
        description: 'Edge nodes coloured by state, spread across the world.',
        render: () => <UptimeMonitorBlock />,
      },
      {
        label: 'Cards over the map',
        id: 'overlays',
        fullPage: true,
        fullBleed: true,
        description: 'Cards along the top and bottom, and controls that move past them.',
        render: () => <RunSummaryBlock />,
      },
    ],
  },
{
    slug: 'markdown-editor',
    name: 'MarkdownEditor',
    summary: 'A field for writing markdown, and a way to see it rendered',
    demos: [
      { label: 'The whole thing', render: () => <MarkdownEditorDemo /> },
      { label: 'A floating toolbar', render: () => <MarkdownEditorPillDemo /> },
      { label: 'Reading first', render: () => <MarkdownEditorPreviewFirstDemo /> },
      { label: 'Composed by hand', render: () => <MarkdownEditorComposedDemo /> },
      { label: 'A comment box', render: () => <MarkdownEditorComposerDemo /> },
    ],
  },
{
    slug: 'marker',
    name: 'Marker',
    summary: 'Inline note between conversation turns',
    demos: [
      {
        label: 'Status rows',
        render: () => (
          <View className="w-full">
            <Marker>
              <Marker.Icon>
                <SearchIcon size={14} />
              </Marker.Icon>
              <Marker.Content>Explored 4 files</Marker.Content>
            </Marker>
            <Marker>
              <Marker.Icon>
                <CheckIcon size={14} />
              </Marker.Icon>
              <Marker.Content>Applied 2 edits to invoice.ts</Marker.Content>
            </Marker>
            <Marker>
              <Marker.Icon>
                <ShieldCheckIcon size={14} />
              </Marker.Icon>
              <Marker.Content>Type check passed</Marker.Content>
            </Marker>
          </View>
        ),
      },
      {
        label: 'A step still running',
        render: () => (
          <View className="w-full">
            <Marker>
              <Marker.Icon>
                <CheckIcon size={14} />
              </Marker.Icon>
              <Marker.Content>Read 12 files</Marker.Content>
            </Marker>
            {/* Shimmer marks the row in flight — dropped once it finishes. */}
            <Marker>
              <Marker.Icon>
                <SearchIcon size={14} />
              </Marker.Icon>
              <Marker.Content shimmer>Searching the codebase…</Marker.Content>
            </Marker>
          </View>
        ),
      },
      {
        label: 'Variants',
        render: () => (
          <View className="w-full gap-2">
            <Marker>
              <Marker.Icon>
                <InfoIcon size={14} />
              </Marker.Icon>
              <Marker.Content>default — the plain status row</Marker.Content>
            </Marker>
            <Marker variant="border">
              <Marker.Icon>
                <InfoIcon size={14} />
              </Marker.Icon>
              <Marker.Content>border — closed by a hairline</Marker.Content>
            </Marker>
            <Marker variant="separator">
              <Marker.Content>Yesterday</Marker.Content>
            </Marker>
          </View>
        ),
      },
      {
        label: 'In a transcript',
        render: () => (
          <View className="w-full gap-3">
            <Marker variant="separator">
              <Marker.Content>Today</Marker.Content>
            </Marker>

            <Message align="end">
              <Message.Content>
                <Message.Bubble>
                  <Message.BubbleContent>
                    Where is the invoice total calculated?
                  </Message.BubbleContent>
                </Message.Bubble>
              </Message.Content>
            </Message>

            <Marker onPress={() => {}}>
              <Marker.Icon>
                <SearchIcon size={14} />
              </Marker.Icon>
              <Marker.Content>Searched 128 files</Marker.Content>
            </Marker>

            <Message>
              <Message.Avatar>
                <Avatar size="sm" fallback="AI" />
              </Message.Avatar>
              <Message.Content>
                <Message.Bubble>
                  <Message.BubbleContent>
                    In `billing/total.ts` — it sums the line items, then applies
                    tax.
                  </Message.BubbleContent>
                </Message.Bubble>
              </Message.Content>
            </Message>
          </View>
        ),
      },
    ],
  },
{
    slug: 'marquee',
    name: 'Marquee',
    summary: 'Content that travels across its container on a loop',
    demos: [
      { label: 'A strip of badges', render: () => <MarqueeStripDemo /> },
      { label: 'Two rows, opposite ways', render: () => <MarqueeTwoRowDemo /> },
      { label: 'Vertical', render: () => <MarqueeVerticalDemo /> },
      { label: 'Holding it still', render: () => <MarqueePlayingDemo /> },
      {
        label: 'A wall of logos',
        id: 'logos',
        fullPage: true,
        description:
          'Two rows of customer marks travelling against each other, at the width the section actually runs at.',
        render: () => <MarqueeLogoWallVersion />,
      },
      {
        label: 'A feed that keeps moving',
        id: 'feed',
        fullPage: true,
        description:
          'Cards on the vertical axis, where the container has to give the height. Hold one to stop the travel.',
        render: () => <MarqueeFeedVersion />,
      },
    ],
  },
{
    slug: 'menu',
    name: 'Menu',
    summary: 'The list of things you can do to something',
    demos: [
      {
        label: 'Putting something behind the panel',
        render: () => (
          <View className="w-full items-center py-4">
            <Menu>
              <Menu.Trigger>
                <Button variant="outline">Tinted panel</Button>
              </Menu.Trigger>
              <Menu.Content align="start" width={224}>
                {/* The surface is a layer, so it can be replaced. A BlurView or
                    a gradient goes in the same slot. */}
                <Menu.Background className="bg-overlay">
                  <View className="flex-1 bg-foreground/5" />
                </Menu.Background>
                <Menu.Item icon={<PencilIcon size={16} />}>Rename</Menu.Item>
                <Menu.Item icon={<ShareNodesIcon size={16} />}>Share</Menu.Item>
                <Menu.Separator />
                <Menu.Item variant="destructive" icon={<TrashIcon size={16} />}>
                  Delete
                </Menu.Item>
              </Menu.Content>
            </Menu>
          </View>
        ),
      },
      {
        label: 'A menu of actions',
        render: () => (
          <View className="w-full items-center py-4">
            <Menu>
              <Menu.Trigger>
                <Button variant="outline">Options</Button>
              </Menu.Trigger>
              {/* Rows dismiss the panel as they run, which is what separates a
                  menu of verbs from a picker of values. */}
              <Menu.Content align="start" width={224}>
                <Menu.Item icon={<ShareNodesIcon size={16} />} shortcut="⌘S">
                  Share
                </Menu.Item>
                <Menu.Item icon={<PlusSquareIcon size={16} />}>Add to list</Menu.Item>
                <Menu.Item icon={<DownloadIcon size={16} />} disabled>
                  Download
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item variant="destructive" icon={<TrashIcon size={16} />}>
                  Delete
                </Menu.Item>
              </Menu.Content>
            </Menu>
          </View>
        ),
      },
      {
        label: 'Checkboxes and a radio group',
        render: () => <MenuViewOptionsDemo />,
      },
      {
        label: 'A submenu, and a row that explains itself',
        render: () => <MenuSubmenuDemo />,
      },
      {
        label: 'Labels, and rows that line up without an icon',
        render: () => (
          <View className="w-full items-center py-4">
            <Menu>
              <Menu.Trigger>
                <Button variant="ghost" size="icon" accessibilityLabel="More">
                  <EllipsisIcon size={18} />
                </Button>
              </Menu.Trigger>
              <Menu.Content align="end" width={232}>
                <Menu.Label inset>Account</Menu.Label>
                {/* `inset` reserves the icon column on a row that has no icon,
                    so its label starts where the others' labels do. */}
                <Menu.Item inset>Profile</Menu.Item>
                <Menu.Item inset shortcut="⌘,">
                  Settings
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item icon={<LockIcon size={16} />}>Lock screen</Menu.Item>
              </Menu.Content>
            </Menu>
          </View>
        ),
      },
      {
        label: 'A long menu, scrolled',
        render: () => (
          <View className="w-full items-center py-4">
            <Menu>
              <Menu.Trigger>
                <Button variant="outline">Jump to section</Button>
              </Menu.Trigger>
              {/* Capped at the room inside the safe area and scrolled, so the
                  last row is reachable however many there turn out to be. */}
              <Menu.Content align="start" width={230} maxHeight={260}>
                {Array.from({ length: 14 }, (_, index) => (
                  <Menu.Item key={index} inset>
                    {`Section ${index + 1}`}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu>
          </View>
        ),
      },
      {
        label: 'As a bottom sheet',
        render: () => (
          <View className="w-full items-center py-4">
            {/* The same rows, moved into a sheet — better on a small screen
                than a panel floating over the thing being acted on. */}
            <Menu presentation="bottom-sheet">
              <Menu.Trigger>
                <Button variant="outline">Open as a sheet</Button>
              </Menu.Trigger>
              <Menu.Content>
                <Menu.Item icon={<ShareNodesIcon size={16} />}>Share</Menu.Item>
                <Menu.Item icon={<BookmarkIcon size={16} />}>Save for later</Menu.Item>
                <Menu.Separator />
                <Menu.Item variant="destructive" icon={<TrashIcon size={16} />}>
                  Delete
                </Menu.Item>
              </Menu.Content>
            </Menu>
          </View>
        ),
      },
    ],
  }
];
export const ENTRIES_BY_SLUG = Object.fromEntries(ENTRIES.map((entry) => [entry.slug, entry]));

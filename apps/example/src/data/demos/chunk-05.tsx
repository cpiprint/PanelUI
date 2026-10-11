import { useState, type ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image, Pressable, ScrollView, View } from "react-native";
import { Avatar, Badge, BellIcon, Button, CalendarIcon, Card, CheckIcon, ChevronRightIcon, Frame, GridItem, HexChart, Input, InputGroup, Item, KeyboardAvoider, Label, LineChart, NumberInput, OtpInput, PackageIcon, PencilIcon, PlusIcon, PlusSquareIcon, ReceiptIcon, SearchBar, SearchIcon, SendIcon, ShieldCheckIcon, SparklesIcon, Separator, Skeleton, Text, XIcon, Tooltip } from "panelui-native";
import { useCSSVariable } from "uniwind";
import type { ComponentEntry } from '../component-types';

const PHOTO = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=60';

/** Stable remote portraits for the Avatar demos. */
const AVATARS = [
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=32',
  'https://i.pravatar.cc/150?img=47',
];

function NumberInputDemo() {
  const [qty, setQty] = useState(1);

  return (
    <Card className="w-full">
      <Card.Content className="gap-4 p-4">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text weight="medium">Wireless keyboard</Text>
            <Text size="sm" muted>
              {qty} × $49 = ${qty * 49}
            </Text>
          </View>
          <View className="w-32">
            <NumberInput value={qty} onValueChange={setQty} min={1} max={20} />
          </View>
        </View>
        <NumberInput
          label="Budget"
          defaultValue={40}
          min={0}
          max={1000}
          step={10}
          formatValue={(v) => `$${v}`}
        />
      </Card.Content>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Input — content inside the field                                           */
/* -------------------------------------------------------------------------- */

/**
 * The case this is here to prove: an icon that stays put when a label lands
 * above the field. The content is positioned against the field box, so nothing
 * added around the field can move it.
 */
function InputContentDemo() {
  const [query, setQuery] = useState('');

  return (
    <View className="w-full gap-4">
      <Input
        label="Description"
        placeholder="A short description"
        description="Shown on your public profile."
        startContent={<PencilIcon size={18} />}
      />

      <Input
        placeholder="Find a project"
        value={query}
        onChangeText={setQuery}
        // Wrapped so the magnifier stays decoration while the ✕ beside it
        // stays a button: the field's own `interactiveContent` covers both
        // ends at once, and only one of these two is a control.
        startContent={
          <View pointerEvents="none">
            <SearchIcon size={18} />
          </View>
        }
        endContent={
          query ? (
            <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear search">
              <XIcon size={16} />
            </Pressable>
          ) : null
        }
      />

      <Input
        label="Amount"
        placeholder="0.00"
        keyboardType="decimal-pad"
        startContent={<Text muted>$</Text>}
        endContent={<Text muted>USD</Text>}
      />

      <Input
        label="Note"
        multiline
        placeholder="Anything worth remembering"
        startContent={<PencilIcon size={18} />}
      />

      <Text size="sm" muted>
        Every field here has a label, and the icons have not moved. That is the
        difference from wrapping the whole component — a label lands above the
        field, so anything centred on the component drifts up with it.
      </Text>
    </View>
  );
}

/**
 * A verification field: six digits, and the row confirms the moment the last
 * one lands. `onComplete` fires once on the transition to full — the moment to
 * submit — rather than on every keystroke that leaves the field full.
 */
function OtpVerifyDemo() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'bad'>('idle');

  return (
    <View className="w-full items-center gap-4">
      <OtpInput
        value={code}
        onChangeText={(next) => {
          setCode(next);
          if (status !== 'idle') setStatus('idle');
        }}
        // 123456 passes; anything else reads as a wrong code.
        onComplete={(value) => setStatus(value === '123456' ? 'ok' : 'bad')}
        isInvalid={status === 'bad'}
        accessibilityLabel="Verification code"
      />
      <Text className="text-sm text-muted-foreground">
        {status === 'ok'
          ? 'Verified — the code was 123456.'
          : status === 'bad'
            ? 'That code didn’t match. Try 123456.'
            : 'Type a six-digit code (123456).'}
      </Text>
    </View>
  );
}

function PasswordInputDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <View className="w-full gap-1.5">
      <Label isRequired>Password</Label>
      <InputGroup>
        <InputGroup.Input placeholder="Enter your password" secureTextEntry={!visible} />
        <InputGroup.Suffix>
          <Button variant="ghost" size="sm" onPress={() => setVisible((v) => !v)}>
            {visible ? 'Hide' : 'Show'}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </View>
  );
}

/**
 * A field that has to get out of the keyboard's way inside a scroll view —
 * the case a fixed-height box cannot show.
 *
 * Focus "Comment", then scroll the form. The field holds its place between
 * "Subject" and "Signature": its lift decays to nothing as it scrolls clear of
 * the keyboard, and comes back as it scrolls under it again.
 */
function KeyboardLiftDemo() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerClassName="gap-4 px-5 pt-4"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Plain fields first, to make the point that only the focused avoiding
          field moves. Tapping one of these leaves the screen exactly as it is. */}
      <Input label="From" placeholder="you@example.com" />
      <Input label="To" placeholder="them@example.com" />
      <Input label="Subject" placeholder="An ordinary field" />
      <Input
        avoidKeyboard
        label="Comment"
        placeholder="Say something…"
        description="Lifts on focus, follows the scroll, settles back on blur."
        multiline
      />
      <Input label="Signature" placeholder="Sent from my phone" />
      <Input label="Reply-to" placeholder="Optional" />
      <Input label="Tags" placeholder="Comma separated" />
    </ScrollView>
  );
}

/**
 * The other half of the job: a bar already pinned to the bottom edge, which
 * should ride the keyboard rather than measure anything. `dock` moves it by the
 * keyboard height less the inset it is already sitting above.
 */
function KeyboardDockDemo() {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerClassName="gap-3 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {[
          'Every control ships with its accessibility role wired up.',
          'Animations run on the UI thread, so a busy list never drops them.',
          'Tokens are semantic — a theme swap moves every component at once.',
          'The composer below stays put while this list scrolls.',
          'Open the keyboard and it travels with it, frame for frame.',
        ].map((line) => (
          <Card key={line}>
            <Card.Content className="p-4">
              <Text size="sm">{line}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <KeyboardAvoider
        mode="dock"
        bottomInset={insets.bottom}
        pointerEvents="box-none"
        className="absolute left-0 right-0 px-5"
        style={{ bottom: insets.bottom + 16 }}
      >
        <View className="flex-row items-center gap-2 rounded-full border border-border bg-surface px-4 shadow-lg">
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            className="flex-1 border-0 bg-transparent px-0"
            containerClassName="flex-1"
            accessibilityLabel="Message"
          />
          <SendIcon size={18} />
        </View>
      </KeyboardAvoider>
    </View>
  );
}

/** Two series side by side, which is what a bar chart is for. */
/** Padding the header needs to line up inside a `Frame.Panel`, which has none. */
const CHART_HEADER = 'px-4 pt-3.5';

const money = (value: number) => `£${value.toLocaleString()}`;

const price = (value: number) => `$${value.toFixed(2)}`;

/* -------------------------------------------------------------------------- */
/* HexChart                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Four campaigns and the revenue each was credited with. Deliberately a long
 * split rather than an even one — an honest honeycomb has one series holding
 * half the field and one holding a corner of it, and a set of four near-equal
 * numbers would show none of what the arrangement is for.
 */
const ATTRIBUTION = [
  { label: 'Stir in strength', value: 3420 },
  { label: 'Healthier every day', value: 1880 },
  { label: 'Iron boost Q3', value: 840 },
  { label: 'Ambassador program', value: 610 },
];

const ATTRIBUTED = ATTRIBUTION.reduce((total, source) => total + source.value, 0);

/** The whole card: the total above, the honeycomb, and the key under it. */
function HexChartAttributionVersion() {
  const [active, setActive] = useState(-1);
  const source = active >= 0 ? ATTRIBUTION[active] : null;

  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Attributed revenue</Frame.Title>
          <Frame.Action>View full report</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <HexChart
            data={ATTRIBUTION}
            activeIndex={active}
            onActiveIndexChange={setActive}
          >
            {/* The readout follows the selection and falls back to the total,
                which is why it is passed in rather than derived by the header. */}
            <HexChart.Header
              className={CHART_HEADER}
              value={money(source ? source.value : ATTRIBUTED)}
              caption={source ? source.label : 'Across four campaigns'}
            />
            <HexChart.Cells />
            <HexChart.Tooltip formatValue={money} showCells />
            <HexChart.Legend className="px-4 pb-3.5" />
          </HexChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/**
 * `shape="grid"` instead, which fills every cell in reading order.
 *
 * The countable arrangement: a reader who wants to check that the second series
 * really is a quarter can count a row and multiply. The blob cannot be checked
 * that way, and does not ask to be.
 */
function HexChartWaffleVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Attributed revenue</Frame.Title>
          <Frame.Action>Every cell used</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <HexChart data={ATTRIBUTION} shape="grid" columns={16} aspectRatio={1.8}>
            <HexChart.Header
              className={CHART_HEADER}
              value={money(ATTRIBUTED)}
              caption="One cell is about half a percent"
            />
            <HexChart.Cells />
            <HexChart.Tooltip formatValue={money} />
            <HexChart.Legend className="px-4 pb-3.5" />
          </HexChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}

/**
 * Waiting for the split, with the field already drawn.
 *
 * The denominator is not what is loading — the shape of the chart is known
 * before its numbers are — so the field is there from the first frame and only
 * the colours arrive.
 */
function HexChartLoadingVersion() {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  return (
    <View className="flex-1 justify-center gap-4 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Attributed revenue</Frame.Title>
          <Frame.Action>{status === 'loading' ? 'Loading' : 'Live'}</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <HexChart data={ATTRIBUTION} status={status}>
            <HexChart.Header
              className={CHART_HEADER}
              value={status === 'loading' ? '—' : money(ATTRIBUTED)}
              caption="Across four campaigns"
            />
            <HexChart.Skeleton />
            <HexChart.Cells />
            <HexChart.Legend className="px-4 pb-3.5" />
          </HexChart>
        </Frame.Panel>
      </Frame>

      <Button
        variant="outline"
        onPress={() => setStatus(status === 'loading' ? 'ready' : 'loading')}
      >
        {status === 'loading' ? 'Load the split' : 'Back to loading'}
      </Button>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* GridItem                                                                   */
/* -------------------------------------------------------------------------- */

/** A dashboard's worth of numbers, at four sizes. */
function GridItemBentoDemo() {
  return (
    /*
     * A row height rather than an aspect, and it is set from what the tiles
     * have to hold rather than from the shape that looked right: the tallest
     * of these is an icon, a title, a figure and a line under it, and a cell
     * shorter than that clips the last of them. A tile's height is its cells.
     */
    <GridItem.Group columns={2} gap={12} rowHeight={164} className="w-full">
      <GridItem colSpan={2}>
        <GridItem.Media variant="icon">
          <SparklesIcon size={18} />
        </GridItem.Media>
        <GridItem.Title>Deploys</GridItem.Title>
        <GridItem.Value>1,284</GridItem.Value>
        <GridItem.Description numberOfLines={1}>
          this week, across 12 projects
        </GridItem.Description>
      </GridItem>
      <GridItem>
        <GridItem.Title>Uptime</GridItem.Title>
        <GridItem.Value>99.98%</GridItem.Value>
        <GridItem.Footer>
          <Badge variant="secondary">30 days</Badge>
        </GridItem.Footer>
      </GridItem>
      <GridItem variant="muted">
        <GridItem.Title>p95 latency</GridItem.Title>
        <GridItem.Value>142ms</GridItem.Value>
        <GridItem.Description numberOfLines={1}>down 18ms</GridItem.Description>
      </GridItem>
    </GridItem.Group>
  );
}

/**
 * What the spans actually do.
 *
 * The tall tile is the one to watch: the two after it tuck in beside it rather
 * than starting a new row, which is the thing a wrapping row of views cannot do
 * and the reason the group places its tiles itself.
 */
function GridItemSpansDemo() {
  return (
    <GridItem.Group columns={3} gap={10} className="w-full">
      <GridItem rowSpan={2} variant="muted">
        <GridItem.Title>rowSpan 2</GridItem.Title>
        <GridItem.Description>
          Two rows tall. The next tiles fill in beside it.
        </GridItem.Description>
      </GridItem>
      <GridItem colSpan={2}>
        <GridItem.Title>colSpan 2</GridItem.Title>
      </GridItem>
      <GridItem>
        <GridItem.Title>1 × 1</GridItem.Title>
      </GridItem>
      <GridItem>
        <GridItem.Title>1 × 1</GridItem.Title>
      </GridItem>
      <GridItem colSpan={3} variant="outline">
        <GridItem.Title>colSpan 3</GridItem.Title>
        <GridItem.Description>A full-width band under the rest.</GridItem.Description>
      </GridItem>
    </GridItem.Group>
  );
}

/** Tiles that go somewhere. Pressing one dims it and gives a little. */
function GridItemPressableDemo() {
  const [opened, setOpened] = useState<string | null>(null);

  const tiles = [
    { key: 'billing', label: 'Billing', caption: '3 invoices due' },
    { key: 'team', label: 'Team', caption: '12 members' },
    { key: 'keys', label: 'API keys', caption: '2 active' },
    { key: 'logs', label: 'Logs', caption: 'Live' },
  ];

  return (
    <View className="w-full gap-3">
      <GridItem.Group columns={2} gap={12} aspect={1.9} size="sm">
        {tiles.map((tile) => (
          <GridItem key={tile.key} onPress={() => setOpened(tile.label)}>
            <GridItem.Title>{tile.label}</GridItem.Title>
            <GridItem.Footer>
              <Text size="xs" className="flex-1 text-muted-foreground">
                {tile.caption}
              </Text>
              <ChevronRightIcon size={14} />
            </GridItem.Footer>
          </GridItem>
        ))}
      </GridItem.Group>
      <Text size="xs" muted className="text-center">
        {opened ? `Opened ${opened}` : 'Press a tile'}
      </Text>
    </View>
  );
}

/** Three across at the smaller density, for a grid of shortcuts. */
function GridItemCompactDemo() {
  const shortcuts = [
    { label: 'Search', icon: <SearchIcon size={16} /> },
    { label: 'Upload', icon: <PackageIcon size={16} /> },
    { label: 'Invite', icon: <PlusSquareIcon size={16} /> },
    { label: 'Export', icon: <ReceiptIcon size={16} /> },
    { label: 'Schedule', icon: <CalendarIcon size={16} /> },
    { label: 'Alerts', icon: <BellIcon size={16} /> },
  ];

  return (
    <GridItem.Group columns={3} gap={10} size="sm" className="w-full">
      {shortcuts.map((shortcut) => (
        <GridItem key={shortcut.label} onPress={() => {}}>
          <GridItem.Media variant="icon">{shortcut.icon}</GridItem.Media>
          <GridItem.Footer>
            <GridItem.Title numberOfLines={1}>{shortcut.label}</GridItem.Title>
          </GridItem.Footer>
        </GridItem>
      ))}
    </GridItem.Group>
  );
}

/** Seven days of something, for the tile that carries a shape behind it. */
const TILE_TREND = [
  { day: 'M', v: 18 },
  { day: 'T', v: 26 },
  { day: 'W', v: 21 },
  { day: 'T', v: 34 },
  { day: 'F', v: 41 },
  { day: 'S', v: 37 },
  { day: 'S', v: 52 },
];

/**
 * The layer behind the text, which is what makes a bento a bento rather than a
 * wall of stat cards. The tile clips it, so it is meant to run off the edges.
 */
function GridItemBackgroundDemo() {
  return (
    <GridItem.Group columns={2} gap={12} rowHeight={132} className="w-full">
      <GridItem colSpan={2}>
        <GridItem.Background>
          {/* Pinned to the bottom and allowed to bleed off both sides — the
              shape is the decoration, not a chart anyone reads values off. */}
          <View className="mt-auto h-20 w-full opacity-60">
            <LineChart data={TILE_TREND} compact aspectRatio={3.4}>
              <LineChart.Area dataKey="v" />
              <LineChart.Line dataKey="v" />
            </LineChart>
          </View>
        </GridItem.Background>
        <GridItem.Title>Requests</GridItem.Title>
        <GridItem.Value>52.4k</GridItem.Value>
        <GridItem.Description>up 41% on last week</GridItem.Description>
      </GridItem>
      <GridItem variant="muted">
        <GridItem.Background>
          <View className="absolute -bottom-4 -right-3 opacity-10">
            <SparklesIcon size={96} />
          </View>
        </GridItem.Background>
        <GridItem.Title>Cache hits</GridItem.Title>
        <GridItem.Value>94%</GridItem.Value>
      </GridItem>
      <GridItem variant="outline">
        <GridItem.Title>Errors</GridItem.Title>
        <GridItem.Value>7</GridItem.Value>
        <GridItem.Description>none critical</GridItem.Description>
      </GridItem>
    </GridItem.Group>
  );
}

/** Every tile carrying the same treatment, in the five chart colours. */
const WATERMARKS: {
  label: string;
  value: string;
  caption: string;
  icon: (color: string) => ReactNode;
  token: string;
}[] = [
  {
    label: 'Cache hits',
    value: '94%',
    caption: 'of 2.1M lookups',
    icon: (color) => <SparklesIcon size={72} color={color} />,
    token: '--color-chart-1',
  },
  {
    label: 'Alerts',
    value: '3',
    caption: 'two acknowledged',
    icon: (color) => <BellIcon size={72} color={color} />,
    token: '--color-chart-2',
  },
  {
    label: 'Blocked',
    value: '1,902',
    caption: 'requests today',
    icon: (color) => <ShieldCheckIcon size={72} color={color} />,
    token: '--color-chart-3',
  },
  {
    label: 'Bundles',
    value: '48 MB',
    caption: 'served from the edge',
    icon: (color) => <PackageIcon size={72} color={color} />,
    token: '--color-chart-4',
  },
];

/** One tile of the wall above, so the token hook has somewhere to live. */
function WatermarkTile({ tile }: { tile: (typeof WATERMARKS)[number] }) {
  const token = useCSSVariable(tile.token);
  const tint = typeof token === 'string' ? token : undefined;

  return (
    <GridItem>
      <GridItem.Background>
        {/*
         * Hung off the bottom-right corner and cut by the tile, which is the
         * whole trick: an icon that fits inside the tile is an icon, and one
         * that runs off two edges of it is a texture.
         */}
        <View className="absolute -bottom-6 -right-5 opacity-[0.14]">
          {tile.icon(tint ?? '#888888')}
        </View>
      </GridItem.Background>
      <GridItem.Title>{tile.label}</GridItem.Title>
      <GridItem.Value>{tile.value}</GridItem.Value>
      <GridItem.Footer>
        <Text size="xs" muted numberOfLines={1}>
          {tile.caption}
        </Text>
      </GridItem.Footer>
    </GridItem>
  );
}

/**
 * The watermark treatment across the whole wall rather than on one tile.
 *
 * It survives being repeated because the icon is not decoration on top of the
 * tile — it is the tile's own subject, at a size nobody reads it at, in that
 * series' colour. Four of them read as four different things; four of the same
 * icon would read as wallpaper.
 */
function GridItemWatermarksDemo() {
  return (
    <GridItem.Group columns={2} gap={12} rowHeight={132} className="w-full">
      {WATERMARKS.map((tile) => (
        <WatermarkTile key={tile.label} tile={tile} />
      ))}
    </GridItem.Group>
  );
}

/** A short list to filter, so the results move as fast as the typing does. */
const PRODUCTS = [
  'Wireless keyboard',
  'Mechanical keyboard',
  'Laptop stand',
  'USB-C hub',
  'Desk mat',
  'Monitor arm',
];

function SearchBarFilterDemo() {
  const [query, setQuery] = useState('');
  const results = PRODUCTS.filter((item) =>
    item.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <View className="w-full gap-4">
      <SearchBar
        placeholder="Search products"
        value={query}
        onChangeText={setQuery}
      />
      {results.length === 0 ? (
        <Text size="sm" muted>
          Nothing matches “{query}”.
        </Text>
      ) : (
        results.map((item) => (
          <Text key={item} size="sm">
            {item}
          </Text>
        ))
      )}
    </View>
  );
}

/**
 * The Cancel button as a screen uses it: it comes out while the field is being
 * edited and folds away again once it is not, so the row is only as wide as
 * the search when nobody is searching.
 */
function SearchBarCancelDemo() {
  const [query, setQuery] = useState('');
  const [cancelled, setCancelled] = useState(false);

  return (
    <View className="w-full gap-3">
      <SearchBar
        variant="filled"
        shape="pill"
        cancel="focus"
        placeholder="Search messages"
        value={query}
        onChangeText={(next) => {
          setQuery(next);
          setCancelled(false);
        }}
        onCancel={() => setCancelled(true)}
      />
      <Text size="sm" muted>
        {cancelled ? 'Search cancelled.' : 'Tap the field to bring Cancel out.'}
      </Text>
    </View>
  );
}

/**
 * A query that costs something: the spinner stands in for the clear button
 * while the search is in flight, and only runs once typing has paused.
 */
function SearchBarDebounceDemo() {
  const [query, setQuery] = useState('');
  const [ran, setRan] = useState('');
  const [pending, setPending] = useState(false);

  return (
    <View className="w-full gap-3">
      <SearchBar
        placeholder="Search the catalogue"
        debounce={400}
        loading={pending}
        value={query}
        onChangeText={(next) => {
          setQuery(next);
          setPending(next.length > 0 && next !== ran);
        }}
        onDebouncedChange={(next) => {
          setRan(next);
          setPending(false);
        }}
      />
      <Text size="sm" muted>
        {ran ? `Searched for “${ran}”.` : 'The search runs 400ms after you stop typing.'}
      </Text>
    </View>
  );
}

/**
 * The companies the picker searches over. The mark is each one's own icon,
 * fetched by domain — a coloured circle with an initial in it is a placeholder,
 * and a picker whose whole job is recognising a company should show the thing
 * being recognised.
 */
const COMPANIES = [
  { name: 'Claude', domain: 'claude.ai' },
  { name: 'Codex', domain: 'openai.com' },
  { name: 'Lovable', domain: 'lovable.dev' },
  { name: 'Cursor', domain: 'cursor.com' },
  { name: 'Replit', domain: 'replit.com' },
  { name: 'Vercel', domain: 'vercel.com' },
  { name: 'Linear', domain: 'linear.app' },
  { name: 'Figma', domain: 'figma.com' },
];

/*
 * Module scope, not inside the screen: declared in the body it would be a new
 * component *type* on every state change, and every button in the panel would
 * unmount and remount under the finger halfway through its own press.
 *
 * `SearchBar.Action` rather than a plain Pressable, because a control nested
 * inside a row takes the touch itself — the row never sees it and cannot hold
 * the field's focus on its behalf, so the press lands and the panel closes
 * under it.
 */
function AddButton({ name, onAdd }: { name: string; onAdd: (name: string) => void }) {
  return (
    <SearchBar.Action accessibilityLabel={`Add ${name}`} onPress={() => onAdd(name)}>
      <PlusIcon size={18} />
    </SearchBar.Action>
  );
}

function CompanyMark({ name, domain }: { name: string; domain: string }) {
  return (
    <Avatar
      size="sm"
      fallback={name.slice(0, 1)}
      source={{ uri: `https://www.google.com/s2/favicons?sz=128&domain=${domain}` }}
    />
  );
}

/**
 * The whole point of the panel, and the one thing a section between two
 * dividers cannot show: the field lifts to sit just above the keyboard, and the
 * results open upward out of it into the space that is actually free.
 *
 * Tap the field to see it move. Tap a row's + and the keyboard stays up, which
 * is what `keyboardShouldPersistTaps` inside the panel buys.
 */
function SearchBarPanelDemo() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [ran, setRan] = useState('');
  const [pending, setPending] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const trimmed = ran.trim().toLowerCase();
  const results = COMPANIES.filter((company) =>
    company.name.toLowerCase().includes(trimmed)
  );

  const add = (name: string) => {
    setPicked((current) => (current.includes(name) ? current : [...current, name]));
  };

  return (
    <View
      className="flex-1 justify-end gap-4 px-5 pt-4"
      style={{ paddingBottom: insets.bottom + 24 }}
    >
      <ScrollView
        contentContainerClassName="gap-2"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text size="sm" muted>
          {picked.length ? 'Your stack' : 'Nothing added yet. Search below.'}
        </Text>
        {picked.map((name) => {
          const company = COMPANIES.find((item) => item.name === name);
          return (
            <View key={name} className="flex-row items-center gap-3 py-1.5">
              <CompanyMark name={name} domain={company?.domain ?? 'example.com'} />
              <Text className="flex-1">{name}</Text>
            </View>
          );
        })}
      </ScrollView>

      <SearchBar
        avoidKeyboard
        variant="filled"
        placeholder="Search or enter company"
        debounce={400}
        loading={pending}
        value={query}
        onChangeText={(next) => {
          setQuery(next);
          setPending(next.length > 0 && next !== ran);
        }}
        onDebouncedChange={(next) => {
          setRan(next);
          setPending(false);
        }}
      >
        {query.length === 0 ? (
          <SearchBar.Section label="Suggested">
            {COMPANIES.slice(0, 4).map((company) => (
              <SearchBar.Item
                key={company.name}
                leading={<CompanyMark name={company.name} domain={company.domain} />}
                trailing={<AddButton name={company.name} onAdd={add} />}
                selected={picked.includes(company.name)}
                onPress={() => add(company.name)}
              >
                {company.name}
              </SearchBar.Item>
            ))}
          </SearchBar.Section>
        ) : pending ? (
          <SearchBar.Status loading>Searching …</SearchBar.Status>
        ) : results.length > 0 ? (
          <SearchBar.Section label="Results">
            {results.map((company) => (
              <SearchBar.Item
                key={company.name}
                leading={<CompanyMark name={company.name} domain={company.domain} />}
                trailing={<AddButton name={company.name} onAdd={add} />}
                selected={picked.includes(company.name)}
                onPress={() => add(company.name)}
              >
                {company.name}
              </SearchBar.Item>
            ))}
          </SearchBar.Section>
        ) : (
          <SearchBar.Status>No companies found</SearchBar.Status>
        )}
      </SearchBar>
    </View>
  );
}

/**
 * The same lift, with the `+` taken off the rows. The row is the button, and a
 * tick replaces the plus once something is in the stack — which is the shape to
 * reach for when adding is the only thing a result can do, since a row that
 * carries one button has two targets for one action.
 */
function SearchBarTapToAddDemo() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);

  const trimmed = query.trim().toLowerCase();
  const results = COMPANIES.filter((company) =>
    company.name.toLowerCase().includes(trimmed)
  );

  const toggle = (name: string) => {
    setPicked((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );
  };

  return (
    <View
      className="flex-1 justify-end gap-4 px-5 pt-4"
      style={{ paddingBottom: insets.bottom + 24 }}
    >
      <ScrollView
        contentContainerClassName="gap-2"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text size="sm" muted>
          {picked.length ? 'Your stack' : 'Tap a result to add it.'}
        </Text>
        {picked.map((name) => {
          const company = COMPANIES.find((item) => item.name === name);
          return (
            <View key={name} className="flex-row items-center gap-3 py-1.5">
              <CompanyMark name={name} domain={company?.domain ?? 'example.com'} />
              <Text className="flex-1">{name}</Text>
            </View>
          );
        })}
      </ScrollView>

      <SearchBar
        avoidKeyboard
        variant="filled"
        placeholder="Search or enter company"
        // Every company matches an empty query, so the panel would open at its
        // full height and run to the top of the screen — at which point the
        // page it is searching is no longer visible behind it. Five rows and a
        // heading; the rest scrolls.
        panelMaxHeight={248}
        value={query}
        onChangeText={setQuery}
      >
        {results.length > 0 ? (
          <SearchBar.Section label={query.length === 0 ? 'Suggested' : 'Results'}>
            {results.map((company) => (
              <SearchBar.Item
                key={company.name}
                leading={<CompanyMark name={company.name} domain={company.domain} />}
                trailing={
                  picked.includes(company.name) ? <CheckIcon size={18} /> : undefined
                }
                selected={picked.includes(company.name)}
                onPress={() => toggle(company.name)}
              >
                {company.name}
              </SearchBar.Item>
            ))}
          </SearchBar.Section>
        ) : (
          <SearchBar.Status>No companies found</SearchBar.Status>
        )}
      </SearchBar>
    </View>
  );
}

/**
 * Picks land in the field itself, as chips before the caret, so the query and
 * what it has produced are one control instead of a control and a list
 * somewhere above it.
 *
 * Backspace on an empty field takes the last one back off.
 */
function SearchBarTokensDemo() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);

  const trimmed = query.trim().toLowerCase();
  const results = COMPANIES.filter(
    (company) =>
      !picked.includes(company.name) && company.name.toLowerCase().includes(trimmed)
  );

  const add = (name: string) => {
    setPicked((current) => (current.includes(name) ? current : [...current, name]));
    setQuery('');
  };

  const remove = (name: string) => {
    setPicked((current) => current.filter((item) => item !== name));
  };

  return (
    <View
      className="flex-1 justify-end gap-4 px-5 pt-4"
      style={{ paddingBottom: insets.bottom + 24 }}
    >
      <View className="flex-1 justify-end">
        <Text size="sm" muted>
          {picked.length
            ? `${picked.length} in this comparison`
            : 'Pick a few companies to compare.'}
        </Text>
      </View>

      <SearchBar
        avoidKeyboard
        variant="filled"
        placeholder={picked.length ? 'Add another' : 'Search or enter company'}
        value={query}
        onChangeText={setQuery}
        onRemoveLastToken={() => setPicked((current) => current.slice(0, -1))}
        tokens={picked.map((name) => {
          const company = COMPANIES.find((item) => item.name === name);
          return (
            <SearchBar.Token
              key={name}
              leading={
                <Avatar
                  size="sm"
                  className="h-5 w-5"
                  fallback={name.slice(0, 1)}
                  source={{
                    uri: `https://www.google.com/s2/favicons?sz=128&domain=${company?.domain ?? 'example.com'}`,
                  }}
                />
              }
              onRemove={() => remove(name)}
            >
              {name}
            </SearchBar.Token>
          );
        })}
      >
        {results.length > 0 ? (
          <SearchBar.Section label={query.length === 0 ? 'Suggested' : 'Results'}>
            {results.map((company) => (
              <SearchBar.Item
                key={company.name}
                leading={<CompanyMark name={company.name} domain={company.domain} />}
                onPress={() => add(company.name)}
              >
                {company.name}
              </SearchBar.Item>
            ))}
          </SearchBar.Section>
        ) : (
          <SearchBar.Status>
            {picked.length === COMPANIES.length ? 'That is all of them' : 'No companies found'}
          </SearchBar.Status>
        )}
      </SearchBar>
    </View>
  );
}

export const ENTRIES: ComponentEntry[] = [
{
    slug: 'hex-chart',
    name: 'HexChart',
    summary: 'A whole broken into parts, counted out in cells',
    layout: 'pager',
    demos: [
      {
        label: 'Attribution',
        id: 'attribution',
        fullPage: true,
        description: 'Press a cell or a key entry, and the readout follows the selection.',
        render: () => <HexChartAttributionVersion />,
      },
      {
        label: 'Waffle',
        id: 'waffle',
        fullPage: true,
        description: 'Reading order and every cell used, for a split worth counting off.',
        render: () => <HexChartWaffleVersion />,
      },
      {
        label: 'Loading',
        id: 'loading',
        fullPage: true,
        description: 'The field is drawn before the split is known, and the colours fill in.',
        render: () => <HexChartLoadingVersion />,
      },
    ],
  },
{
    slug: 'input',
    name: 'Input',
    summary: 'Text field with label and validation',
    demos: [
      { label: 'Icons inside the field', render: () => <InputContentDemo /> },
      {
        label: 'States',
        render: () => (
          <View className="w-full gap-4">
            <Input label="Name" placeholder="Khalid Abdi" />
            <Input
              label="Description"
              placeholder="A short description"
              description="Shown on your public profile."
            />
            <Input
              label="Email"
              placeholder="you@example.com"
              errorMessage="This email is already taken."
            />
            <Input label="Plan" value="Premium" disabled />
          </View>
        ),
      },
      {
        label: 'Sizes',
        render: () => (
          <View className="w-full gap-4">
            <Input size="xs" label="Extra small" placeholder="32 tall" />
            <Input size="sm" label="Small" placeholder="40 tall" />
            <Input size="md" label="Medium" placeholder="48 tall" />
            <Input size="lg" label="Large" placeholder="56 tall" />
            <Input size="xl" label="Extra large" placeholder="64 tall" />
          </View>
        ),
      },
      {
        label: 'Filled',
        render: () => (
          // `filled` inside a card: a second border beside the card's own
          // reads as a seam, so the field carries a background instead.
          <Card className="w-full">
            <Card.Content className="gap-4 p-4">
              <Input variant="filled" label="Workspace" placeholder="Acme" isRequired />
              <Input
                variant="filled"
                label="Notes"
                placeholder="Anything we should know?"
                multiline
              />
            </Card.Content>
          </Card>
        ),
      },
      {
        label: 'In a form',
        render: () => (
          <Card className="w-full">
            <Card.Header>
              <Card.Title>Sign in</Card.Title>
              <Card.Description>Welcome back.</Card.Description>
            </Card.Header>
            <Card.Content className="gap-4">
              <Input label="Email" placeholder="you@example.com" isRequired />
              <Input label="Password" secureTextEntry placeholder="••••••••" isRequired />
            </Card.Content>
            <Card.Footer>
              <Button fullWidth>Continue</Button>
            </Card.Footer>
          </Card>
        ),
      },
      {
        label: 'Lifting in a scroll view',
        id: 'in-a-scroll-view',
        fullPage: true,
        description:
          'A field that lifts by its overlap with the keyboard, and keeps its place in the form as you scroll.',
        render: () => <KeyboardLiftDemo />,
      },
      {
        label: 'Docked composer',
        id: 'docked-composer',
        fullPage: true,
        description:
          'A bar pinned to the bottom edge that rides the keyboard up and back down.',
        render: () => <KeyboardDockDemo />,
      },
    ],
  },
{
    slug: 'input-group',
    name: 'InputGroup',
    summary: 'Input with prefix and suffix decorators',
    demos: [
      {
        label: 'With prefix',
        render: () => (
          <InputGroup className="w-full">
            <InputGroup.Prefix isDecorative>
              <SearchIcon size={16} />
            </InputGroup.Prefix>
            <InputGroup.Input placeholder="Search products…" />
          </InputGroup>
        ),
      },
      { label: 'Interactive suffix', render: () => <PasswordInputDemo /> },
      {
        label: 'Disabled',
        render: () => (
          <InputGroup isDisabled className="w-full">
            <InputGroup.Prefix isDecorative>
              <SearchIcon size={16} />
            </InputGroup.Prefix>
            <InputGroup.Input placeholder="Disabled input" />
          </InputGroup>
        ),
      },
    ],
  },
{
    slug: 'search-bar',
    name: 'SearchBar',
    summary: 'Search field with a clear button, a Cancel button and a panel of results',
    demos: [
      {
        label: 'Above the keyboard',
        id: 'above-the-keyboard',
        fullPage: true,
        description:
          'The field lifts clear of the keyboard on focus and the results open upward out of it.',
        render: () => <SearchBarPanelDemo />,
      },
      {
        label: 'Tap to add',
        id: 'tap-to-add',
        fullPage: true,
        description:
          'No button on the row: the row is the button, and a tick marks what is already in the stack.',
        render: () => <SearchBarTapToAddDemo />,
      },
      {
        label: 'Names in the field',
        id: 'tokens-in-the-field',
        fullPage: true,
        description:
          'Picks become chips inside the field, before the caret. Backspace on an empty field takes the last one back off.',
        render: () => <SearchBarTokensDemo />,
      },
      { label: 'Filtering a list', render: () => <SearchBarFilterDemo /> },
      { label: 'Cancel on focus', render: () => <SearchBarCancelDemo /> },
      { label: 'Debounced query', render: () => <SearchBarDebounceDemo /> },
      {
        label: 'Sizes and shapes',
        render: () => (
          <View className="w-full gap-5">
            <SearchBar size="sm" placeholder="Small" />
            <SearchBar size="md" variant="filled" placeholder="Medium, filled" />
            <SearchBar size="lg" shape="pill" placeholder="Large, pill" />
            <SearchBar placeholder="Disabled" defaultValue="Last query" disabled />
          </View>
        ),
      },
    ],
  },
{
    slug: 'number-input',
    name: 'NumberInput',
    summary: 'Numeric field stepped by buttons or typed',
    demos: [
      { label: 'Quantity & budget', render: () => <NumberInputDemo /> },
      {
        label: 'Bounds & step',
        render: () => (
          <View className="w-full gap-5">
            <NumberInput defaultValue={0} min={0} max={5} />
            <NumberInput defaultValue={0} min={0} max={1} step={0.1} />
            <NumberInput
              label="Guests"
              description="Up to eight per reservation."
              defaultValue={2}
              min={1}
              max={8}
            />
          </View>
        ),
      },
      {
        label: 'Sizes',
        render: () => (
          <View className="w-full gap-5">
            <NumberInput size="sm" defaultValue={1} />
            <NumberInput size="md" defaultValue={1} />
            <NumberInput size="lg" defaultValue={1} />
          </View>
        ),
      },
      {
        label: 'Variants',
        render: () => (
          <View className="w-full gap-5">
            <NumberInput variant="outline" defaultValue={1} />
            <NumberInput variant="filled" defaultValue={1} />
            <NumberInput defaultValue={3} disabled />
          </View>
        ),
      },
    ],
  },
{
    slug: 'otp-input',
    name: 'OtpInput',
    summary: 'One-time-code field, one cell per digit',
    demos: [
      { label: 'Verify a code', render: () => <OtpVerifyDemo /> },
      {
        label: 'Masked',
        render: () => (
          <View className="w-full items-center">
            <OtpInput length={4} mask defaultValue="12" />
          </View>
        ),
      },
      {
        label: 'Grouped',
        render: () => (
          <View className="w-full items-center">
            <OtpInput length={6} groupEvery={3} defaultValue="12" />
          </View>
        ),
      },
      {
        label: 'Sizes',
        render: () => (
          <View className="w-full items-center gap-4">
            <OtpInput size="sm" length={4} defaultValue="12" />
            <OtpInput size="md" length={4} defaultValue="12" />
            <OtpInput size="lg" length={4} defaultValue="12" />
          </View>
        ),
      },
      {
        label: 'Letters',
        render: () => (
          <View className="w-full items-center">
            <OtpInput length={5} type="text" placeholder="•" />
          </View>
        ),
      },
    ],
  },
{
    slug: 'grid-item',
    name: 'GridItem',
    summary: 'Bento tiles, and the grid that places them',
    demos: [
      { label: 'A bento of stats', render: () => <GridItemBentoDemo /> },
      { label: 'Spans', render: () => <GridItemSpansDemo /> },
      { label: 'Behind the text', render: () => <GridItemBackgroundDemo /> },
      { label: 'A wall of watermarks', render: () => <GridItemWatermarksDemo /> },
      { label: 'Pressable tiles', render: () => <GridItemPressableDemo /> },
      { label: 'Three across', render: () => <GridItemCompactDemo /> },
    ],
  },
{
    slug: 'item',
    name: 'Item',
    summary: 'Row of media, text and actions',
    demos: [
      {
        label: 'Variants',
        render: () => (
          <View className="w-full gap-3">
            {(['default', 'outline', 'muted'] as const).map((variant) => (
              <Item key={variant} variant={variant}>
                <Item.Media variant="icon">
                  <PackageIcon size={18} />
                </Item.Media>
                <Item.Content>
                  <Item.Title>{variant}</Item.Title>
                  <Item.Description>
                    The {variant} surface treatment.
                  </Item.Description>
                </Item.Content>
                <Item.Actions>
                  <Badge variant="secondary">New</Badge>
                </Item.Actions>
              </Item>
            ))}
          </View>
        ),
      },
      {
        label: 'Sizes',
        render: () => (
          <View className="w-full gap-3">
            {(['default', 'sm', 'xs'] as const).map((size) => (
              <Item key={size} variant="outline" size={size}>
                <Item.Media variant="icon">
                  <ReceiptIcon size={size === 'xs' ? 12 : 16} />
                </Item.Media>
                <Item.Content>
                  <Item.Title>Size {size}</Item.Title>
                  <Item.Description>
                    Media, title and description all follow it.
                  </Item.Description>
                </Item.Content>
              </Item>
            ))}
          </View>
        ),
      },
      {
        label: 'Media types',
        render: () => (
          <View className="w-full gap-3">
            <Item variant="outline">
              <Item.Media variant="icon">
                <BellIcon size={18} />
              </Item.Media>
              <Item.Content>
                <Item.Title>Icon tile</Item.Title>
                <Item.Description>variant=&quot;icon&quot;</Item.Description>
              </Item.Content>
            </Item>

            <Item variant="outline">
              <Item.Media variant="image">
                <Image source={{ uri: PHOTO }} className="h-full w-full" />
              </Item.Media>
              <Item.Content>
                <Item.Title>Thumbnail</Item.Title>
                <Item.Description>variant=&quot;image&quot;</Item.Description>
              </Item.Content>
            </Item>

            <Item variant="outline">
              <Item.Media>
                <Avatar size="md" source={{ uri: AVATARS[0] }} fallback="KA" />
              </Item.Media>
              <Item.Content>
                <Item.Title>Avatar passed through</Item.Title>
                <Item.Description>
                  The default media variant adds no box.
                </Item.Description>
              </Item.Content>
            </Item>
          </View>
        ),
      },
      {
        label: 'A settings group',
        render: () => (
          <Card className="w-full overflow-hidden">
            <Item.Group>
              {[
                ['Notifications', 'Push, email and in-app'],
                ['Privacy', 'Who can see your activity'],
                ['Appearance', 'Theme and text size'],
              ].map(([title, description], index) => (
                <View key={title}>
                  {index > 0 ? <Item.Separator /> : null}
                  <Item size="sm" onPress={() => {}}>
                    <Item.Content>
                      <Item.Title>{title}</Item.Title>
                      <Item.Description>{description}</Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      <ChevronRightIcon size={16} />
                    </Item.Actions>
                  </Item>
                </View>
              ))}
            </Item.Group>
          </Card>
        ),
      },
      {
        label: 'Horizontal group of cards',
        render: () => (
          <View className="w-full gap-4">
            <Text size="sm" muted>
              Two independent axes. `orientation` on the group runs the items
              across instead of down; `orientation` on each item stacks its own
              parts into a card. A carousel wants both.
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Item.Group orientation="horizontal">
                {[
                  ['Starter', '$0', 'One project'],
                  ['Pro', '$12', 'Unlimited projects'],
                  ['Team', '$40', 'Shared workspaces'],
                ].map(([name, price, summary]) => (
                  <Item
                    key={name}
                    orientation="vertical"
                    variant="outline"
                    className="w-48"
                  >
                    <Item.Media variant="icon">
                      <PackageIcon size={18} />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>{name}</Item.Title>
                      <Item.Description>{summary}</Item.Description>
                    </Item.Content>
                    <Item.Footer>
                      <Text weight="semibold">{price}</Text>
                      <Text size="xs" muted>
                        per month
                      </Text>
                    </Item.Footer>
                  </Item>
                ))}
              </Item.Group>
            </ScrollView>
          </View>
        ),
      },
      {
        label: 'A vertical item',
        render: () => (
          // orientation="vertical" is also what Header and Footer need — both
          // are full-width strips, so they only make sense once it stacks.
          <Item orientation="vertical" variant="outline">
            <Item.Header>
              <Badge variant="secondary">Draft</Badge>
              <Text size="xs" muted>
                Updated 2h ago
              </Text>
            </Item.Header>
            <Item.Content>
              <Item.Title>Quarterly report</Item.Title>
              <Item.Description>
                Revenue, retention and headcount for Q3.
              </Item.Description>
            </Item.Content>
            <Item.Footer>
              <Button size="sm" variant="outline">
                Preview
              </Button>
              <Button size="sm">Publish</Button>
            </Item.Footer>
          </Item>
        ),
      },
    ],
  },
{
    slug: 'label',
    name: 'Label',
    summary: 'Form field label with required and invalid states',
    demos: [
      {
        label: 'States',
        render: () => (
          <View className="w-full gap-5">
            <View className="gap-1.5">
              <Label>Username</Label>
              <Input placeholder="Choose a username" />
            </View>
            <View className="gap-1.5">
              <Label isRequired>Password</Label>
              <Input placeholder="Create a password" secureTextEntry />
            </View>
            <View className="gap-1.5">
              <Label isInvalid>Confirm password</Label>
              <Input value="different" errorMessage="Passwords do not match" />
            </View>
            <View className="gap-1.5">
              <Label isDisabled>Subscription plan</Label>
              <Input value="Premium" disabled />
            </View>
          </View>
        ),
      },
      {
        label: 'Custom layout',
        render: () => (
          <View className="w-full gap-1.5">
            <Label isRequired>
              <Label.Text className="text-base font-semibold">
                API key
              </Label.Text>
            </Label>
            <Input placeholder="sk-…" />
          </View>
        ),
      },
    ],
  }
];
export const ENTRIES_BY_SLUG = Object.fromEntries(ENTRIES.map((entry) => [entry.slug, entry]));

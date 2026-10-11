import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image, Pressable, ScrollView, View } from "react-native";
import { AppleIcon, Badge, BellIcon, Button, Card, CardIcon, CheckIcon, FileIcon, FolderIcon, FolderOpenIcon, Frame, GoogleIcon, InfoIcon, Item, KeyboardAvoider, Label, PlusSquareIcon, ReceiptIcon, SendIcon, ShareNodesIcon, ShieldAlertIcon, ShieldCheckIcon, Spinner, TagInput, Text, Textarea, ThemeSelector, type ThemeSelection, TimePicker, type TimeValue, formatTime, Timeline, Toast, ToggleButton, ToggleButtonGroup, Tooltip, Tree, useToast } from "panelui-native";
import type { ComponentEntry } from '../component-types';

const PHOTO = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=60';

/* -------------------------------------------------------------------------- */
/* TimePicker                                                                 */
/* -------------------------------------------------------------------------- */

/** The same wheel behind each of the three overlays it can arrive in. */
function TimePickerPresentationsDemo() {
  const [popover, setPopover] = useState<TimeValue>();
  const [dialog, setDialog] = useState<TimeValue>();
  const [sheet, setSheet] = useState<TimeValue>();

  return (
    <View className="w-full gap-6">
      <View className="gap-2">
        <Label>Popover</Label>
        <TimePicker value={popover} onValueChange={setPopover} />
      </View>

      <View className="gap-2">
        <Label>Dialog</Label>
        <TimePicker presentation="dialog" value={dialog} onValueChange={setDialog} />
      </View>

      <View className="gap-2">
        <Label>Bottom sheet</Label>
        <TimePicker presentation="bottom-sheet" value={sheet} onValueChange={setSheet} />
      </View>
    </View>
  );
}

/** 24-hour, and a wheel narrowed to the slots actually on offer. */
function TimePickerWheelDemo() {
  const [any, setAny] = useState<TimeValue>();
  const [slot, setSlot] = useState<TimeValue>();

  return (
    <View className="w-full gap-6">
      <View className="gap-2">
        <Label>A 24-hour clock</Label>
        <TimePicker hourCycle={24} value={any} onValueChange={setAny} />
      </View>

      <View className="gap-2">
        <Label>Within opening hours</Label>
        {/* The bounds are applied to the value, not to the scroll: a face
            reports the row it landed on and the picker clamps it. */}
        <TimePicker
          value={slot}
          onValueChange={setSlot}
          minTime={{ hour: 9, minute: 0 }}
          maxTime={{ hour: 17, minute: 30 }}
          minuteStep={15}
          placeholder="Pick a slot"
        />
      </View>
    </View>
  );
}

/** The face beside its list, inline so both are on screen at once. */
function TimePickerClockDemo() {
  const [time, setTime] = useState<TimeValue>({ hour: 19, minute: 0 });

  return (
    <View className="w-full items-center gap-4">
      <TimePicker presentation="inline" layout="clock" value={time} onValueChange={setTime} />
      <Text size="sm" muted>
        The hands sweep rather than jump. The face is there to say when in the
        day the highlighted row is, and a hand that jumps gives that away one
        row at a time.
      </Text>
    </View>
  );
}

/** The ruler where it belongs — a sheet, with a thumb on it. */
function TimePickerRulerDemo() {
  const [time, setTime] = useState<TimeValue>({ hour: 0, minute: 0 });

  return (
    <View className="w-full gap-6">
      <View className="gap-2">
        <Text size="2xl" weight="semibold">
          Reminder
        </Text>
        <Text muted>
          The readout reads at arm's length, which is what makes this the layout
          for a sheet. Swipe the scale; it comes to rest on a step.
        </Text>
      </View>

      <TimePicker
        layout="ruler"
        presentation="bottom-sheet"
        value={time}
        onValueChange={setTime}
        placeholder="Set a reminder"
      />

      <Text size="sm" muted>
        Chosen: {formatTime(time)}
      </Text>
    </View>
  );
}

type TimeEdge = 'start' | 'end';

/**
 * One end of the span, in the header readout.
 *
 * The lit one is the end the face is editing. Nothing else marks it, and
 * nothing else needs to: the readout is already the only place both times are
 * written down, so the answer to "which of these am I turning the face for" is
 * the one that is brighter.
 */
function TimeEdgeButton({
  label,
  time,
  active,
  onPress,
}: {
  label: string;
  time: TimeValue;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${formatTime(time)}`}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`rounded-md px-2 py-1 ${active ? 'bg-accent' : ''}`}
    >
      <Text size="sm" weight={active ? 'medium' : 'normal'} muted={!active}>
        {formatTime(time)}
      </Text>
    </Pressable>
  );
}

/**
 * The three sizes the ruler can state its own time at, one under the other.
 *
 * `default` is right when the scale is the only thing on the panel. Under
 * something that outranks it the big number becomes the largest text on screen
 * standing for the smaller half of an answer, which is what `compact` and
 * `none` are for.
 */
function TimePickerReadoutDemo() {
  const [time, setTime] = useState<TimeValue>({ hour: 14, minute: 30 });

  return (
    <View className="w-full gap-6">
      {(['default', 'compact', 'none'] as const).map((readout) => (
        <View key={readout} className="w-full gap-2">
          <Text size="xs" muted>
            readout=&quot;{readout}&quot;
          </Text>
          <TimePicker
            presentation="inline"
            layout="ruler"
            readout={readout}
            value={time}
            onValueChange={setTime}
          />
        </View>
      ))}
    </View>
  );
}

/**
 * A picker composed into a card rather than hidden behind a trigger.
 *
 * Two independent times behind one face — which is what a "single time or a
 * range" control actually is, and why the picker does not need a range mode of
 * its own to build one.
 */
function TimePickerFrameDemo() {
  const { toast } = useToast();
  const [edge, setEdge] = useState<TimeEdge>('start');
  const [start, setStart] = useState<TimeValue>({ hour: 19, minute: 0 });
  const [end, setEnd] = useState<TimeValue>({ hour: 21, minute: 30 });

  const editing = edge === 'start' ? start : end;
  const setEditing = edge === 'start' ? setStart : setEnd;

  /*
   * Tapping a time is how you choose which one the face edits — so there is no
   * separate pair of buttons above the card saying the same thing twice. The
   * readout lights up, and a toast says what the face is now for, because the
   * highlight alone is a small change to notice on the far side of the header.
   */
  const edit = (next: TimeEdge) => {
    setEdge(next);
    toast.show({
      variant: 'info',
      label: next === 'start' ? 'Editing the start' : 'Editing the end',
      description: 'Turn the face to set it.',
      duration: 2000,
    });
  };

  return (
    <View className="w-full gap-3">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Time</Frame.Title>
          <Frame.Action className="gap-1">
            <TimeEdgeButton
              label="Starts"
              time={start}
              active={edge === 'start'}
              onPress={() => edit('start')}
            />
            <Text size="sm" muted>
              –
            </Text>
            <TimeEdgeButton
              label="Ends"
              time={end}
              active={edge === 'end'}
              onPress={() => edit('end')}
            />
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Frame.Section className="items-center">
            <TimePicker
              presentation="inline"
              layout="clock"
              value={editing}
              onValueChange={setEditing}
            />
          </Frame.Section>
        </Frame.Panel>
      </Frame>

      <Text size="sm" muted>
        Tap either time to point the face at it.
      </Text>
    </View>
  );
}

function PlacementTooltip({
  placement,
}: {
  placement: 'top' | 'bottom' | 'left' | 'right';
}) {
  return (
    <Tooltip openOn="press" duration={0}>
      <Tooltip.Trigger>
        <Button variant="secondary" size="sm">
          {placement}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content placement={placement}>
        <Tooltip.Arrow />
        Opens {placement}
      </Tooltip.Content>
    </Tooltip>
  );
}

/**
 * The plain tag field: no list, no suggestions, and the value is whatever gets
 * typed. Return commits a tag, so does the comma, and backspace on an empty
 * field marks the last one before a second backspace takes it.
 */
function TagInputDemo() {
  const [tags, setTags] = useState<string[]>(['expo', 'reanimated']);

  return (
    <View className="w-full gap-3">
      <TagInput
        label="Topics"
        value={tags}
        onValueChange={setTags}
        placeholder="Add a topic"
        description="Return or a comma ends a tag."
        clearable
      />
      <Text size="sm" muted>
        {tags.length ? tags.join(' · ') : 'No topics yet'}
      </Text>
    </View>
  );
}

/**
 * A capped list that says why it stopped. `onReject` is the only way to tell
 * the difference between a tag that was refused and one the user never
 * finished typing.
 */
function TagInputLimitDemo() {
  const [tags, setTags] = useState<string[]>(['urgent', 'billing']);
  const [refused, setRefused] = useState<string | null>(null);

  return (
    <TagInput
      label="Labels"
      value={tags}
      onValueChange={(next) => {
        setRefused(null);
        setTags(next);
      }}
      max={4}
      showCount
      placeholder="Add a label"
      errorMessage={refused ?? undefined}
      onReject={(tag, reason) =>
        setRefused(
          reason === 'max'
            ? `Four labels is the limit — “${tag}” was not added.`
            : `“${tag}” is already on the list.`
        )
      }
    />
  );
}

/**
 * `validate` decides what counts as a tag at all. Anything without an @ is
 * turned away, and the field says so rather than silently swallowing it.
 */
function TagInputValidateDemo() {
  const [recipients, setRecipients] = useState<string[]>(['ana@example.com']);
  const [error, setError] = useState<string | null>(null);

  return (
    <TagInput
      label="Recipients"
      value={recipients}
      onValueChange={(next) => {
        setError(null);
        setRecipients(next);
      }}
      chipVariant="info"
      keyboardType="email-address"
      placeholder="name@example.com"
      delimiters={[',', ' ', ';']}
      validate={(tag) => tag.includes('@') && tag.includes('.')}
      onReject={(tag) => setError(`“${tag}” is not an email address.`)}
      errorMessage={error ?? undefined}
      description="A comma, a space or a semicolon ends an address."
    />
  );
}

function ToggleButtonDemo() {
  const [liked, setLiked] = useState(false);

  return (
    <View className="w-full gap-3">
      {/* Uncontrolled — it holds its own state. */}
      <ToggleButton defaultSelected>Follow</ToggleButton>

      {/* Controlled, with an icon beside a label. ToggleButton.Label reads the
          selected state itself, so nothing has to be threaded through. */}
      <ToggleButton selected={liked} onSelectedChange={setLiked}>
        <BellIcon size={16} />
        <ToggleButton.Label>{liked ? 'Subscribed' : 'Subscribe'}</ToggleButton.Label>
      </ToggleButton>

      <ToggleButton variant="ghost" iconOnly accessibilityLabel="Save">
        <PlusSquareIcon size={18} />
      </ToggleButton>
    </View>
  );
}

function ToggleButtonToolbarDemo() {
  const [marks, setMarks] = useState<string[]>(['shield']);

  return (
    <View className="w-full gap-3">
      {/* `multiple`: independent marks, any number on at once. */}
      <ToggleButtonGroup
        selectionMode="multiple"
        variant="ghost"
        value={marks}
        onValueChange={setMarks}
      >
        <ToggleButton id="shield" iconOnly accessibilityLabel="Protected">
          <ShieldCheckIcon size={18} />
        </ToggleButton>
        <ToggleButton id="bell" iconOnly accessibilityLabel="Notify">
          <BellIcon size={18} />
        </ToggleButton>
        <ToggleButton id="share" iconOnly accessibilityLabel="Shared">
          <ShareNodesIcon size={18} />
        </ToggleButton>
      </ToggleButtonGroup>
      <Text size="sm" muted>
        On: {marks.length ? marks.join(', ') : 'nothing'}
      </Text>
    </View>
  );
}

function ToggleButtonSingleDemo() {
  const [view, setView] = useState<string[]>(['day']);

  return (
    <View className="w-full gap-3">
      {/* `single`: picking one clears the last, and pressing the selected one
          again clears it — a filter you cannot turn off is a trap. */}
      <ToggleButtonGroup selectionMode="single" value={view} onValueChange={setView}>
        <ToggleButton id="day">Day</ToggleButton>
        <ToggleButton id="week">Week</ToggleButton>
        <ToggleButton id="month">Month</ToggleButton>
      </ToggleButtonGroup>
      <Text size="sm" muted>
        Showing: {view[0] ?? 'nothing'}
      </Text>
    </View>
  );
}

/** `autoGrow` only shows itself while you type, so this one holds its value. */
function TextareaGrowDemo() {
  const [message, setMessage] = useState('');

  return (
    <View className="w-full gap-4">
      <Textarea
        autoGrow
        rows={2}
        maxRows={6}
        label="Message"
        placeholder="Type a few lines…"
        description="Starts at two rows, grows to six, then scrolls."
        value={message}
        onChangeText={setMessage}
      />
      <Textarea rows={2} placeholder="Fixed at two rows, for comparison" />
    </View>
  );
}

/** The counter has to be driven by a real value to count anything. */
function TextareaCountDemo() {
  const [status, setStatus] = useState('Shipping the new calendar today.');

  return (
    <Textarea
      label="Status"
      rows={3}
      maxLength={140}
      showCount
      description="Keep it short."
      value={status}
      onChangeText={setStatus}
      containerClassName="w-full"
    />
  );
}

/**
 * A composer that both grows and gets out of the keyboard's way — the pair of
 * behaviours a chat input needs, and the one case a fixed box cannot show.
 */
function TextareaComposerDemo() {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerClassName="gap-3 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 160 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {[
          'The composer below starts at one row.',
          'Type past the first line and it opens up, a row at a time.',
          'At five rows it stops growing and scrolls instead.',
          'Focus it and it lifts by exactly its overlap with the keyboard.',
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
        <View className="flex-row items-end gap-2 rounded-3xl border border-border bg-surface p-2 shadow-lg">
          <Textarea
            autoGrow
            rows={1}
            maxRows={5}
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            className="flex-1 border-0 bg-transparent px-2"
            containerClassName="flex-1"
            accessibilityLabel="Message"
          />
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
            <SendIcon size={18} />
          </View>
        </View>
      </KeyboardAvoider>
    </View>
  );
}

const DEPLOY_LOG = [
  {
    time: '09:12',
    title: 'Migration drafted',
    badge: 'Assigned',
    tone: 'default' as const,
    Icon: PlusSquareIcon,
    body: 'Schema change written for the reporting cluster.',
  },
  {
    time: '09:34',
    title: 'Shadow traffic enabled',
    badge: 'Shadow',
    tone: 'info' as const,
    Icon: ShareNodesIcon,
    body: 'Mirroring 5% of reads with query timing captured.',
  },
  {
    time: '09:51',
    title: 'Replica lag alarm',
    badge: 'Holding',
    tone: 'warning' as const,
    Icon: ShieldAlertIcon,
    body: 'Lag passed 400ms in eu-west-2; the cutover is paused.',
  },
  {
    time: '10:05',
    title: 'Runbook circulated',
    badge: 'Docs',
    tone: 'default' as const,
    Icon: BellIcon,
    body: 'On-call has the rollback steps and the owner list.',
  },
  {
    time: '10:42',
    title: 'Cutover approved',
    badge: 'Ready',
    tone: 'success' as const,
    Icon: ShieldCheckIcon,
    body: 'Lag recovered and every pre-flight check is green.',
  },
];

/** Leading time column, outlined icon nodes, a chip beside each title. */
function DeployLogDemo() {
  return (
    <View className="w-full gap-4">
      <View>
        <Text size="sm" muted>
          Migration audit
        </Text>
        <Text size="xl" weight="semibold">
          Reporting cluster
        </Text>
      </View>
      <Timeline variant="icon" value={DEPLOY_LOG.length - 1} className="w-full">
        {DEPLOY_LOG.map((entry, index) => (
          <Timeline.Item
            key={entry.title}
            step={index}
            tone={entry.tone}
            last={index === DEPLOY_LOG.length - 1}
          >
            <Timeline.Aside className="w-12">
              <Timeline.Date>{entry.time}</Timeline.Date>
            </Timeline.Aside>
            <Timeline.Indicator>
              <entry.Icon size={15} />
            </Timeline.Indicator>
            <Timeline.Content>
              <Timeline.Header>
                <Timeline.Title>{entry.title}</Timeline.Title>
                <Badge variant="secondary">{entry.badge}</Badge>
              </Timeline.Header>
              <Timeline.Description>{entry.body}</Timeline.Description>
            </Timeline.Content>
          </Timeline.Item>
        ))}
      </Timeline>
    </View>
  );
}

/** Solid dots, timestamps trailing the title, one entry carrying media. */
function StudioFeedDemo() {
  return (
    <Timeline variant="dot" value={3} className="w-full">
      <Timeline.Item step={0} tone="info">
        <Timeline.Indicator />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Cover art uploaded</Timeline.Title>
            <Badge variant="info">Review</Badge>
            <Timeline.Trailing>10:18</Timeline.Trailing>
          </Timeline.Header>
          <View className="mt-2 overflow-hidden rounded-xl border border-border">
            <Image
              source={{ uri: PHOTO }}
              style={{ width: '100%', height: 140 }}
              resizeMode="cover"
            />
            <View className="gap-2 p-3">
              <Text size="sm" muted>
                Final crop is ready for retouch, with the detail shot and the
                thumbnail queued behind it.
              </Text>
              <View className="flex-row gap-2">
                <Badge variant="secondary">Hero</Badge>
                <Badge variant="secondary">4 crops</Badge>
              </View>
            </View>
          </View>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item step={1} tone="warning">
        <Timeline.Indicator />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Lighting pass reviewed</Timeline.Title>
            <Timeline.Trailing>10:27</Timeline.Trailing>
          </Timeline.Header>
          <Timeline.Description>
            The side profile reads clearly; keep the shadow soft.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item step={2} tone="success">
        <Timeline.Indicator />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Copy note resolved</Timeline.Title>
            <Timeline.Trailing>10:43</Timeline.Trailing>
          </Timeline.Header>
          <Timeline.Description>
            Launch tile copy now matches the campaign language.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item step={3} tone="info" last>
        <Timeline.Indicator />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Package exported</Timeline.Title>
            <Timeline.Trailing>11:06</Timeline.Trailing>
          </Timeline.Header>
          <Timeline.Description>
            Square crop, product view and thumbnail are out.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
    </Timeline>
  );
}

const LEDGER = [
  { title: 'Dispute opened', time: 'Mar 6, 10:34', tone: 'warning' as const, Icon: ShieldAlertIcon, body: 'The customer disputed a renewal; finance has seven days.' },
  { title: 'Payment captured', time: 'Mar 6, 10:21', tone: 'success' as const, Icon: CardIcon },
  { title: 'Payment authorised', time: 'Mar 6, 10:21', tone: 'default' as const, Icon: ShieldCheckIcon },
  { title: 'Invoice generated', time: 'Mar 6, 10:20', tone: 'default' as const, Icon: ReceiptIcon },
];

/** Dense rows for an audit trail — small nodes, timestamps trailing. */
function LedgerDemo() {
  return (
    <Timeline variant="compact" value={0} className="w-full">
      {LEDGER.map((entry, index) => (
        <Timeline.Item
          key={entry.title}
          step={index}
          tone={entry.tone}
          last={index === LEDGER.length - 1}
        >
          <Timeline.Indicator>
            <entry.Icon size={13} />
          </Timeline.Indicator>
          <Timeline.Content>
            <Timeline.Header>
              <Timeline.Title>{entry.title}</Timeline.Title>
              <Timeline.Trailing>{entry.time}</Timeline.Trailing>
            </Timeline.Header>
            {entry.body ? (
              <Timeline.Description>{entry.body}</Timeline.Description>
            ) : null}
          </Timeline.Content>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}

const HANDOFF = [
  {
    time: '09:15', team: 'Design', person: 'Nina Park', tone: 'default' as const,
    Icon: SendIcon, title: 'Checkout copy approved',
    stats: [['Screens', '18'], ['Open notes', '2']],
    body: 'Invoice copy, empty states and seat-change messages passed.',
  },
  {
    time: '12:05', team: 'Data', person: 'Maya Hart', tone: 'info' as const,
    Icon: ShareNodesIcon, title: 'Metrics pipeline connected',
    stats: [['Events', '12'], ['Lag', '42 s']],
    body: 'Billing telemetry is flowing into the release dashboard.',
  },
  {
    time: '15:00', team: 'Launch', person: 'Eli Wong', tone: 'success' as const,
    Icon: ShieldCheckIcon, title: 'Checklist signed off',
    stats: [['Checks', '9/9'], ['Window', '15 min']],
    body: 'Rollback owner, dashboard links and launch channel are pinned.',
  },
];

/** Meta column on the left, a stats strip under each title. */
function HandoffDemo() {
  return (
    <View className="w-full gap-4">
      <View className="items-center">
        <Text size="sm" muted>
          Launch review
        </Text>
        <Text size="xl" weight="semibold">
          Billing rollout
        </Text>
      </View>
      <Timeline variant="icon" value={HANDOFF.length - 1} className="w-full">
        {HANDOFF.map((entry, index) => (
          <Timeline.Item
            key={entry.title}
            step={index}
            tone={entry.tone}
            last={index === HANDOFF.length - 1}
          >
            <Timeline.Aside>
              <Timeline.Date>{entry.time}</Timeline.Date>
              <Timeline.Label>{entry.team}</Timeline.Label>
              <Timeline.Meta>{entry.person}</Timeline.Meta>
            </Timeline.Aside>
            <Timeline.Indicator>
              <entry.Icon size={15} />
            </Timeline.Indicator>
            <Timeline.Content>
              <Timeline.Title>{entry.title}</Timeline.Title>
              <Timeline.Stats>
                {entry.stats.map(([label, value]) => (
                  <Timeline.Stat key={label} label={label!} value={value!} />
                ))}
              </Timeline.Stats>
              <Timeline.Description>{entry.body}</Timeline.Description>
            </Timeline.Content>
          </Timeline.Item>
        ))}
      </Timeline>
    </View>
  );
}

const TIMELINE_DATA = [
  { date: 'Mar 12', title: 'Order placed', body: 'We received your order.' },
  { date: 'Mar 13', title: 'Packed', body: 'Your items left the warehouse.' },
  { date: 'Mar 15', title: 'In transit', body: 'Out with the courier.' },
  { date: 'Mar 17', title: 'Delivered', body: 'Left at the front door.' },
];

/** Renders the shared timeline data in whichever variant is asked for. */
function TimelineDemo({
  variant,
  value = 2,
}: {
  variant: 'dot' | 'icon' | 'numbered' | 'card';
  value?: number;
}) {
  return (
    <Timeline variant={variant} value={value} className="w-full">
      {TIMELINE_DATA.map((entry, index) => (
        <Timeline.Item
          key={entry.title}
          step={index}
          last={index === TIMELINE_DATA.length - 1}
        >
          <Timeline.Indicator>
            <CheckIcon size={14} />
          </Timeline.Indicator>
          <Timeline.Content>
            <Timeline.Header>
              <Timeline.Date>{entry.date}</Timeline.Date>
              <Timeline.Title>{entry.title}</Timeline.Title>
            </Timeline.Header>
            <Timeline.Description>{entry.body}</Timeline.Description>
          </Timeline.Content>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}

/**
 * A working life on a rail you swipe through.
 *
 * The shape a long history wants. Read top to bottom it is a page nobody
 * reaches the end of; laid out sideways, a stop is a column and the whole run
 * is one gesture.
 *
 * The quiet stretches carry the argument. A year with nothing on it collapses
 * to a tick, so it costs a thumb-width instead of a screen and the years that
 * did something keep their room. Nothing sets a width here — the columns take
 * it from whether they have content.
 *
 * Nothing is written above the rail per column. The masthead says where you
 * are, once, and it changes as you drag — which is the whole reason
 * `onColumnChange` exists. Repeating a year over every tick as well is the
 * same fact printed twice, and the smaller of the two copies is the one nobody
 * can read.
 */

/**
 * The marks.
 *
 * Three are real company marks in their own colours, drawn by the library and
 * used for the company each belongs to. The rest are plainly generic app tiles
 * with an initial in them — a placeholder that looks like a placeholder, which
 * is the honest thing to put in a logo slot for a company that does not exist.
 */
function AppTile({ letter, className }: { letter: string; className?: string }) {
  return (
    <View
      className={`h-11 w-11 items-center justify-center rounded-2xl border-2 border-background ${className}`}
    >
      <Text size="lg" weight="bold" className="text-white">
        {letter}
      </Text>
    </View>
  );
}

function MarkTile({ children }: { children: React.ReactNode }) {
  return (
    <View className="h-11 w-11 items-center justify-center rounded-2xl border-2 border-background bg-white">
      {children}
    </View>
  );
}

const LIFELINE: {
  year: string;
  label: string;
  title: string;
  mark: React.ReactNode;
  initials: string;
  events: string[];
}[] = [
  {
    year: '2016',
    label: 'Started at',
    title: 'Northgate',
    mark: <AppTile letter="N" className="bg-emerald-600" />,
    initials: 'KA',
    events: ['First commit, on a train, in a single file.'],
  },
  {
    year: '2017',
    label: 'Shipped at',
    title: 'Northgate',
    mark: <AppTile letter="N" className="bg-emerald-600" />,
    initials: 'KA',
    events: [
      'Rewrote the layout engine after the first real app hit sixty screens.',
      'Ten components, all of them buttons in disguise.',
    ],
  },
  {
    year: '2018',
    label: 'Quiet year at',
    title: 'Northgate',
    mark: <AppTile letter="N" className="bg-emerald-600" />,
    initials: 'KA',
    events: [],
  },
  {
    year: '2019',
    label: 'Joined',
    title: 'Apple',
    mark: (
      <MarkTile>
        <AppleIcon size={20} color="#000000" />
      </MarkTile>
    ),
    initials: 'KA',
    events: [
      'Moved the animations onto the UI thread and stopped apologising for the list.',
    ],
  },
  { year: '2020', label: 'Still at', title: 'Apple', mark: (
      <MarkTile>
        <AppleIcon size={20} color="#000000" />
      </MarkTile>
    ), initials: 'KA', events: [] },
  { year: '2021', label: 'Still at', title: 'Apple', mark: (
      <MarkTile>
        <AppleIcon size={20} color="#000000" />
      </MarkTile>
    ), initials: 'KA', events: [] },
  {
    year: '2022',
    label: 'Joined',
    title: 'Google',
    mark: (
      <MarkTile>
        <GoogleIcon size={20} />
      </MarkTile>
    ),
    initials: 'KA',
    events: [
      'Design tokens became one file, and dark mode stopped being a fork.',
      'The docs started generating themselves from the source.',
    ],
  },
  {
    year: '2023',
    label: 'Shipped at',
    title: 'Google',
    mark: (
      <MarkTile>
        <GoogleIcon size={20} />
      </MarkTile>
    ),
    initials: 'KA',
    events: ['Charts arrived — twelve of them, all on one scale engine.'],
  },
  {
    year: '2024',
    label: 'Quiet year at',
    title: 'Google',
    mark: (
      <MarkTile>
        <GoogleIcon size={20} />
      </MarkTile>
    ),
    initials: 'KA',
    events: [],
  },
  {
    year: '2025',
    label: 'Left for',
    title: 'PanelUI',
    mark: <AppTile letter="P" className="bg-indigo-600" />,
    initials: 'KA',
    events: [
      'The registry shipped, so a component could be copied instead of installed.',
    ],
  },
];

function LifelineDemo() {
  /*
   * Which column the reading edge is on. The masthead is the only thing that
   * reads it, and it is a state update per column rather than per frame — the
   * timeline reports the crossing, not the scroll.
   */
  const [active, setActive] = useState(0);
  const entry = LIFELINE[active] ?? LIFELINE[0]!;

  return (
    <View className="flex-1 justify-center">
      {/*
        The masthead: the marks, then what happened, then where. All three come
        from the column at the reading edge, so a drag changes the pair of
        tiles, the line above and the name — which is what makes the rail feel
        like it is moving through something rather than under a heading.
      */}
      <Timeline.Masthead
        className="px-5 pb-8"
        media={
          <>
            <View className="h-11 w-11 items-center justify-center rounded-2xl border-2 border-background bg-secondary">
              <Text size="sm" weight="semibold">
                {entry.initials}
              </Text>
            </View>
            <View className="-ms-3">{entry.mark}</View>
          </>
        }
        label={entry.label}
        title={entry.title}
      />

      <Timeline
        orientation="horizontal"
        haptics
        value={LIFELINE.length - 1}
        onColumnChange={setActive}
        className="pl-5"
      >
        {LIFELINE.map((item, index) => (
          <Timeline.Item
            key={item.year}
            step={index}
            last={index === LIFELINE.length - 1}
          >
            <Timeline.Indicator />
            <Timeline.Content>
              {item.events.map((event) => (
                <Timeline.Description key={event} className="pb-3">
                  {event}
                </Timeline.Description>
              ))}
            </Timeline.Content>
          </Timeline.Item>
        ))}
      </Timeline>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Tree                                                                       */
/* -------------------------------------------------------------------------- */

type TreeNodeData = { value: string; label: string; children?: TreeNodeData[] };

const PROJECT_TREE: TreeNodeData[] = [
  {
    value: 'src',
    label: 'src',
    children: [
      {
        value: 'src/components',
        label: 'components',
        children: [
          { value: 'src/components/button.tsx', label: 'button.tsx' },
          { value: 'src/components/tree.tsx', label: 'tree.tsx' },
        ],
      },
      {
        value: 'src/primitives',
        label: 'primitives',
        children: [{ value: 'src/primitives/text.tsx', label: 'text.tsx' }],
      },
      { value: 'src/index.ts', label: 'index.ts' },
    ],
  },
  { value: 'package.json', label: 'package.json' },
  { value: 'README.md', label: 'README.md' },
];

/**
 * One recursive renderer, shared by every Tree demo — a tree in an app is
 * almost always a walk over data rather than hand-written rows, so the demos
 * are written the way the component is actually used.
 *
 * Every row fills its `Tree.Icon`: a folder for a branch, a document for a
 * leaf. An icon slot left empty is still a slot, so a folder whose glyph is
 * missing pushes its name a full box away from its own chevron while the files
 * under it line up correctly — the row reads as broken rather than as spaced.
 * `expanded` is threaded down for the same reason the chevron turns: a folder
 * that is open should look open.
 */
function TreeNodes({ nodes, expanded }: { nodes: TreeNodeData[]; expanded: string[] }) {
  return (
    <>
      {nodes.map((node) => {
        const isOpen = expanded.includes(node.value);
        return (
          <Tree.Item key={node.value} value={node.value}>
            <Tree.Trigger>
              <Tree.Indicator />
              <Tree.Icon>
                {node.children ? (
                  isOpen ? (
                    <FolderOpenIcon size={15} />
                  ) : (
                    <FolderIcon size={15} />
                  )
                ) : (
                  <FileIcon size={14} />
                )}
              </Tree.Icon>
              <Tree.Label>{node.label}</Tree.Label>
            </Tree.Trigger>
            {node.children ? (
              <Tree.Group>
                <TreeNodes nodes={node.children} expanded={expanded} />
              </Tree.Group>
            ) : null}
          </Tree.Item>
        );
      })}
    </>
  );
}

/**
 * The file tree, with and without guide lines. Expansion is controlled rather
 * than left to `defaultExpanded` only because the rows need to know which
 * folders are open to draw the right glyph; the component does not require it.
 */
function TreeFilesDemo({ showLines = false }: { showLines?: boolean }) {
  const [expanded, setExpanded] = useState<string[]>(
    showLines ? ['src', 'src/components'] : ['src']
  );

  return (
    <Tree expanded={expanded} onExpandedChange={setExpanded} showLines={showLines}>
      <TreeNodes nodes={PROJECT_TREE} expanded={expanded} />
    </Tree>
  );
}

function TreeSelectionDemo({ mode }: { mode: 'single' | 'multiple' }) {
  const [selected, setSelected] = useState<string | string[]>(mode === 'multiple' ? [] : '');
  const [expanded, setExpanded] = useState<string[]>(['src', 'src/components']);
  const chosen = Array.isArray(selected) ? selected : selected ? [selected] : [];

  return (
    <View className="w-full gap-3">
      <Tree
        selectionMode={mode}
        value={selected}
        onValueChange={setSelected}
        expanded={expanded}
        onExpandedChange={setExpanded}
        showLines
      >
        <TreeNodes nodes={PROJECT_TREE} expanded={expanded} />
      </Tree>
      <Text size="xs" muted>
        {chosen.length ? chosen.join(', ') : 'Nothing selected'}
      </Text>
    </View>
  );
}

const LAZY_CHILDREN: TreeNodeData[] = [
  { value: 'archive/2024.zip', label: '2024.zip' },
  { value: 'archive/2025.zip', label: '2025.zip' },
];

/**
 * A branch whose contents are fetched the first time it opens. It has no
 * `Tree.Group` to be recognised by until they arrive, so it says `hasChildren`
 * to earn its chevron, and the fetch hangs off `onExpandedChange`.
 */
function TreeLazyDemo() {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<TreeNodeData[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExpandedChange = (next: string[]) => {
    setExpanded(next);
    if (next.includes('archive') && !loaded && !loading) {
      setLoading(true);
      setTimeout(() => {
        setLoaded(LAZY_CHILDREN);
        setLoading(false);
      }, 900);
    }
  };

  return (
    <Tree expanded={expanded} onExpandedChange={handleExpandedChange} showLines>
      <Tree.Item value="archive" hasChildren>
        <Tree.Trigger>
          <Tree.Indicator />
          <Tree.Icon>
            {expanded.includes('archive') ? (
              <FolderOpenIcon size={15} />
            ) : (
              <FolderIcon size={15} />
            )}
          </Tree.Icon>
          <Tree.Label>archive</Tree.Label>
          <Tree.Actions>{loading ? <Spinner size="sm" /> : null}</Tree.Actions>
        </Tree.Trigger>
        {loaded ? (
          <Tree.Group>
            <TreeNodes nodes={loaded} expanded={expanded} />
          </Tree.Group>
        ) : null}
      </Tree.Item>
      <TreeNodes nodes={PROJECT_TREE.slice(1)} expanded={expanded} />
    </Tree>
  );
}

const NAV_TREE: Array<TreeNodeData & { count?: number }> = [
  {
    value: 'inbox',
    label: 'Inbox',
    children: [
      { value: 'inbox/unread', label: 'Unread' },
      { value: 'inbox/flagged', label: 'Flagged' },
    ],
  },
  {
    value: 'projects',
    label: 'Projects',
    children: [
      { value: 'projects/panelui', label: 'PanelUI' },
      { value: 'projects/docs', label: 'Docs' },
    ],
  },
];

const NAV_COUNTS: Record<string, number> = {
  'inbox/unread': 12,
  'inbox/flagged': 3,
  'projects/panelui': 8,
};

/** A sidebar nav at `sm`, with a per-row count in the trailing slot. */
function TreeNavDemo() {
  const [active, setActive] = useState<string | string[]>('inbox/unread');

  return (
    <Tree
      size="sm"
      selectionMode="single"
      value={active}
      onValueChange={setActive}
      defaultExpanded={['inbox', 'projects']}
      expandOnPress={false}
    >
      {NAV_TREE.map((section) => (
        <Tree.Item key={section.value} value={section.value}>
          <Tree.Trigger>
            <Tree.Indicator />
            <Tree.Label>{section.label}</Tree.Label>
          </Tree.Trigger>
          <Tree.Group>
            {section.children?.map((child) => (
              <Tree.Item key={child.value} value={child.value}>
                <Tree.Trigger>
                  <Tree.Indicator />
                  <Tree.Label>{child.label}</Tree.Label>
                  <Tree.Actions>
                    {NAV_COUNTS[child.value] ? (
                      <Badge variant="secondary" count={NAV_COUNTS[child.value]} />
                    ) : null}
                  </Tree.Actions>
                </Tree.Trigger>
              </Tree.Item>
            ))}
          </Tree.Group>
        </Tree.Item>
      ))}
    </Tree>
  );
}

/**
 * One version page, and the reason there is a wrapper at all.
 *
 * The toast store is a single module-level queue with one viewport, mounted
 * once for the whole app — which is what lets `toast.show()` be called from
 * anywhere, and what means a toast raised here is still counting down after
 * you have left. Clearing on the way out is how each of these pages starts on
 * an empty screen rather than on whatever the last one left behind.
 */
function ToastVersion({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  useEffect(() => () => toast.hideAll(), [toast]);

  return <View className="flex-1 justify-center gap-3 px-5">{children}</View>;
}

function ToastStringVersion() {
  const { toast } = useToast();

  return (
    <ToastVersion>
      <Button variant="outline" onPress={() => toast.show('Link copied to clipboard')}>
        Simple string
      </Button>
    </ToastVersion>
  );
}

function ToastActionVersion() {
  const { toast } = useToast();

  return (
    <ToastVersion>
      <Button
        variant="outline"
        onPress={() =>
          toast.show({
            variant: 'success',
            label: 'Deployment complete',
            description: 'panelui.dev is live on production.',
            actionLabel: 'View',
          })
        }
      >
        With action
      </Button>
    </ToastVersion>
  );
}

function ToastDestructiveVersion() {
  const { toast } = useToast();

  return (
    <ToastVersion>
      <Button
        variant="outline"
        onPress={() =>
          toast.show({
            variant: 'destructive',
            label: 'Upload failed',
            description: 'The file exceeds the 25 MB limit.',
            placement: 'top',
          })
        }
      >
        Destructive, top
      </Button>
    </ToastVersion>
  );
}

function ToastStackVersion() {
  const { toast } = useToast();

  return (
    <ToastVersion>
      <Button
        variant="outline"
        onPress={() => {
          // Fired a fifth of a second apart rather than together: the deck is
          // built by things arriving, and four toasts on one frame is a deck
          // that was already there.
          (['default', 'info', 'success', 'warning'] as const).forEach(
            (variant, index) =>
              setTimeout(
                () =>
                  toast.show({
                    variant,
                    label: `Notification ${index + 1}`,
                    description: 'Swipe down to dismiss the front one.',
                    duration: 8000,
                  }),
                index * 220
              )
          );
        }}
      >
        Stack four
      </Button>
    </ToastVersion>
  );
}

function ToastHideAllVersion() {
  const { toast } = useToast();

  return (
    <ToastVersion>
      {/* Something to clear, first. `hideAll` on an empty queue is a button
          that does nothing, which demonstrates nothing. */}
      <Button
        variant="outline"
        onPress={() =>
          (['info', 'success', 'warning'] as const).forEach((variant, index) =>
            setTimeout(
              () =>
                toast.show({
                  variant,
                  label: `Notification ${index + 1}`,
                  duration: 20000,
                }),
              index * 220
            )
          )
        }
      >
        Raise three
      </Button>
      <Button variant="ghost" onPress={() => toast.hideAll()}>
        Hide all
      </Button>
    </ToastVersion>
  );
}

function ToastCustomVersion() {
  const { toast } = useToast();

  return (
    <ToastVersion>
      <Button
        variant="outline"
        onPress={() =>
          toast.show({
            duration: 6000,
            component: ({ hide }) => (
              <Toast variant="info" onHide={hide}>
                <Toast.Indicator />
                <Toast.Content>
                  <Toast.Title>Custom component</Toast.Title>
                  <Toast.Description>
                    Rendered entirely by the caller.
                  </Toast.Description>
                </Toast.Content>
                <Toast.Close />
              </Toast>
            ),
          })
        }
      >
        Custom component
      </Button>
    </ToastVersion>
  );
}

/**
 * The choice stored rather than applied.
 *
 * `applyTheme={false}` is what a settings screen wants once the preference has
 * to survive the app being closed: the app owns the value, writes it down, and
 * applies it here and on the next launch alike.
 */
function ThemeSelectorStoredDemo() {
  const [choice, setChoice] = useState<ThemeSelection>('system');

  return (
    <View className="w-full gap-3">
      <ThemeSelector
        label="Appearance"
        value={choice}
        applyTheme={false}
        onValueChange={setChoice}
      />
      <Text size="sm" muted>
        Stored as “{choice}” — nothing has changed the theme.
      </Text>
    </View>
  );
}

export const ENTRIES: ComponentEntry[] = [
{
    slug: 'toggle-button',
    name: 'ToggleButton',
    summary: 'A button that stays down',
    demos: [
      { label: 'On its own', render: () => <ToggleButtonDemo /> },
      { label: 'A toolbar of marks', render: () => <ToggleButtonToolbarDemo /> },
      { label: 'An either-or choice', render: () => <ToggleButtonSingleDemo /> },
      {
        label: 'Sizes',
        render: () => (
          <View className="w-full gap-3">
            <ToggleButtonGroup defaultValue={['xs']} size="xs">
              <ToggleButton id="xs">Extra small</ToggleButton>
              <ToggleButton id="xs2">Extra small</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup defaultValue={['s']} size="sm">
              <ToggleButton id="s">Small</ToggleButton>
              <ToggleButton id="s2">Small</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup defaultValue={['m']}>
              <ToggleButton id="m">Medium</ToggleButton>
              <ToggleButton id="m2">Medium</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup defaultValue={['l']} size="lg">
              <ToggleButton id="l">Large</ToggleButton>
              <ToggleButton id="l2">Large</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup defaultValue={['xl']} size="xl">
              <ToggleButton id="xl">Extra large</ToggleButton>
              <ToggleButton id="xl2">Extra large</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButton disabled defaultSelected>
              Disabled
            </ToggleButton>
          </View>
        ),
      },
    ],
  },
{
    slug: 'theme-selector',
    name: 'ThemeSelector',
    summary: 'Light, dark or the device, drawn as three miniature screens',
    demos: [
      {
        label: 'Three options and a heading',
        render: () => <ThemeSelector label="Choose a theme" />,
      },
      {
        label: 'The other drawing',
        render: () => <ThemeSelector variant="card" label="Appearance" />,
      },
      {
        label: 'Smaller',
        render: () => <ThemeSelector size="sm" variant="card" />,
      },
      {
        label: 'Light and dark only',
        render: () => (
          <ThemeSelector label="Appearance">
            <ThemeSelector.Option value="light" />
            <ThemeSelector.Option value="dark" />
          </ThemeSelector>
        ),
      },
      { label: 'Storing the choice', render: () => <ThemeSelectorStoredDemo /> },
    ],
  },
{
    slug: 'textarea',
    name: 'Textarea',
    summary: 'Text that runs to several lines, sized in rows',
    demos: [
      {
        label: 'Rows, not pixels',
        render: () => (
          <View className="w-full gap-4">
            <Textarea rows={2} placeholder="Two rows" />
            <Textarea rows={4} placeholder="Four rows" />
            <Textarea size="sm" rows={4} placeholder="Four smaller rows" />
          </View>
        ),
      },
      { label: 'Growing with the text', render: () => <TextareaGrowDemo /> },
      {
        label: 'Label, description and error',
        render: () => (
          <View className="w-full gap-4">
            <Textarea
              label="Bio"
              rows={3}
              placeholder="A short bio"
              description="Shown on your public profile."
            />
            <Textarea
              label="Feedback"
              rows={3}
              isRequired
              placeholder="What went wrong?"
              errorMessage="Tell us a little more."
            />
          </View>
        ),
      },
      { label: 'Counting characters', render: () => <TextareaCountDemo /> },
      {
        label: 'Sizes',
        render: () => (
          <View className="w-full gap-4">
            <Textarea size="xs" label="Extra small" rows={2} placeholder="13px type" />
            <Textarea size="sm" label="Small" rows={2} placeholder="14px type" />
            <Textarea size="md" label="Medium" rows={2} placeholder="16px type" />
            <Textarea size="lg" label="Large" rows={2} placeholder="16px type, roomier" />
            <Textarea size="xl" label="Extra large" rows={2} placeholder="18px type" />
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
              <Textarea
                variant="filled"
                label="Notes"
                rows={3}
                placeholder="Anything we should know?"
              />
            </Card.Content>
          </Card>
        ),
      },
      {
        label: 'A composer that avoids the keyboard',
        id: 'composer',
        fullPage: true,
        description:
          'A one-row composer that grows as the message does and rides the keyboard up.',
        render: () => <TextareaComposerDemo />,
      },
    ],
  },
{
    slug: 'tag-input',
    name: 'TagInput',
    summary: 'A field whose value is a list of tokens',
    demos: [
      { label: 'Typing tags', render: () => <TagInputDemo /> },
      { label: 'A capped list', render: () => <TagInputLimitDemo /> },
      { label: 'Deciding what counts', render: () => <TagInputValidateDemo /> },
      {
        label: 'Sizes',
        render: () => (
          <View className="w-full gap-4">
            <TagInput size="sm" defaultValue={['small']} placeholder="Small" />
            <TagInput size="md" defaultValue={['medium']} placeholder="Medium" />
            <TagInput size="lg" defaultValue={['large']} placeholder="Large" />
          </View>
        ),
      },
      {
        label: 'Filled',
        render: () => (
          // `filled` inside a card: a second border beside the card's own reads
          // as a seam, so the field carries a background instead.
          <Card className="w-full">
            <Card.Content className="gap-4 p-4">
              <TagInput
                variant="filled"
                label="Skills"
                defaultValue={['typescript', 'swift']}
                placeholder="Add a skill"
              />
            </Card.Content>
          </Card>
        ),
      },
      {
        label: 'States',
        render: () => (
          <View className="w-full gap-4">
            <TagInput
              label="Read-only"
              readOnly
              defaultValue={['locked', 'archived']}
            />
            <TagInput
              label="Disabled"
              disabled
              defaultValue={['unavailable']}
              placeholder="Add a tag"
            />
          </View>
        ),
      },
    ],
  },
{
    slug: 'time-picker',
    name: 'TimePicker',
    summary: 'A time of day, as a wheel, a clock or a swipeable scale',
    demos: [
      // The ruler leads: it is a trigger and a sheet, so it needs no more of
      // the screen than any other page here, and a Versions list of one row
      // pointing at it was a page spent on a link.
      { label: 'The ruler, in a sheet', render: () => <TimePickerRulerDemo /> },
      { label: 'Presentations', render: () => <TimePickerPresentationsDemo /> },
      { label: 'The wheel', render: () => <TimePickerWheelDemo /> },
      { label: 'The clock face', render: () => <TimePickerClockDemo /> },
      { label: 'How loud the readout is', render: () => <TimePickerReadoutDemo /> },
      { label: 'Inline, inside a Frame', render: () => <TimePickerFrameDemo /> },
    ],
  },
{
    slug: 'timeline',
    name: 'Timeline',
    summary: 'Vertical sequence of events',
    demos: [
      { label: 'Dot', render: () => <TimelineDemo variant="dot" /> },
      { label: 'Icon', render: () => <TimelineDemo variant="icon" /> },
      { label: 'Numbered', render: () => <TimelineDemo variant="numbered" /> },
      { label: 'Card', render: () => <TimelineDemo variant="card" /> },
      { label: 'Deploy log', render: () => <DeployLogDemo /> },
      { label: 'Studio feed', render: () => <StudioFeedDemo /> },
      { label: 'Ledger', render: () => <LedgerDemo /> },
      { label: 'Handoff', render: () => <HandoffDemo /> },
      {
        label: 'A working life, sideways',
        id: 'horizontal',
        fullPage: true,
        description:
          'Stops as columns on a rail wider than the screen, with a masthead that follows the drag.',
        render: () => <LifelineDemo />,
      },
    ],
  },
{
    slug: 'toast',
    name: 'Toast',
    summary: 'Transient notification with swipe to dismiss',
    demos: [
      {
        label: 'Simple string',
        id: 'string',
        fullPage: true,
        description: 'A string on its own, for a result that needs no title and no action.',
        render: () => <ToastStringVersion />,
      },
      {
        label: 'With action',
        id: 'action',
        fullPage: true,
        description: 'A title, a description and one thing to do about it.',
        render: () => <ToastActionVersion />,
      },
      {
        label: 'Destructive, top',
        id: 'destructive',
        fullPage: true,
        description: 'A failure, raised at the top edge instead of the bottom.',
        render: () => <ToastDestructiveVersion />,
      },
      {
        label: 'Stack four',
        id: 'stack',
        fullPage: true,
        description: 'Four arriving in turn — the newest in front, the rest peeking out behind it.',
        render: () => <ToastStackVersion />,
      },
      {
        label: 'Hide all',
        id: 'hide-all',
        fullPage: true,
        description: 'Clearing the whole queue at once, whatever is in it.',
        render: () => <ToastHideAllVersion />,
      },
      {
        label: 'Custom component',
        id: 'custom',
        fullPage: true,
        description: 'The toast drawn entirely by the caller, with the deck still managing it.',
        render: () => <ToastCustomVersion />,
      },
      {
        label: 'Anatomy',
        render: () => (
          <View className="w-full gap-3">
            <Toast variant="success">
              <Toast.Indicator />
              <Toast.Content>
                <Toast.Title>Changes saved</Toast.Title>
                <Toast.Description>Your profile is up to date.</Toast.Description>
              </Toast.Content>
              <Toast.Close />
            </Toast>
            <Toast variant="warning">
              <Toast.Indicator />
              <Toast.Content>
                <Toast.Title>Storage almost full</Toast.Title>
              </Toast.Content>
              <Toast.Action>Upgrade</Toast.Action>
            </Toast>
          </View>
        ),
      },
    ],
  },
{
    slug: 'tooltip',
    name: 'Tooltip',
    summary: 'A small label that names the thing under your finger',
    demos: [
      {
        label: 'Long press',
        render: () => (
          <Tooltip label="Copy link">
            <Tooltip.Trigger>
              <Button variant="outline">Press and hold</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Arrow />
              Copy link
            </Tooltip.Content>
          </Tooltip>
        ),
      },
      {
        label: 'On press',
        render: () => (
          <View className="flex-row items-center gap-3">
            <Tooltip openOn="press" label="More information">
              <Tooltip.Trigger>
                <Button variant="ghost" size="icon" accessibilityLabel="Info">
                  <InfoIcon size={20} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <Tooltip.Arrow />
                Syncs every 15 minutes
              </Tooltip.Content>
            </Tooltip>
            <Text size="sm" muted>
              Tap the icon
            </Text>
          </View>
        ),
      },
      {
        label: 'Placement',
        render: () => (
          // Each trigger is pinned to the side that leaves room for the label
          // to open the way its label says, so all four sides are distinct
          // rather than flipping inward near an edge.
          <View className="h-64 w-full justify-between py-4">
            <View className="flex-row justify-center">
              <PlacementTooltip placement="bottom" />
            </View>
            <View className="flex-row justify-between px-2">
              <PlacementTooltip placement="right" />
              <PlacementTooltip placement="left" />
            </View>
            <View className="flex-row justify-center">
              <PlacementTooltip placement="top" />
            </View>
          </View>
        ),
      },
      {
        label: 'Rich content',
        render: () => (
          <Tooltip openOn="press" duration={0}>
            <Tooltip.Trigger>
              <Button variant="secondary">Keyboard shortcut</Button>
            </Tooltip.Trigger>
            <Tooltip.Content className="flex-row items-center gap-2">
              <Tooltip.Arrow />
              <Tooltip.Text>Save</Tooltip.Text>
              <View className="rounded bg-background/20 px-1.5 py-0.5">
                <Text size="xs" weight="semibold" className="text-background">
                  ⌘S
                </Text>
              </View>
            </Tooltip.Content>
          </Tooltip>
        ),
      },
      {
        label: 'A panel, not a label',
        render: () => (
          // Past a line of text the inversion stops reading as a whisper and
          // starts reading as a panel with the wrong colours — so it becomes
          // one, and takes a width rather than running to whatever the
          // sentence happens to want.
          <Tooltip openOn="press" duration={0}>
            <Tooltip.Trigger>
              <Button variant="outline">What is streaming?</Button>
            </Tooltip.Trigger>
            <Tooltip.Content
              variant="surface"
              width={264}
              className="gap-1 p-3"
            >
              <Tooltip.Arrow />
              <Tooltip.Title>Streaming</Tooltip.Title>
              <Tooltip.Description>
                Tokens are rendered as they arrive rather than waiting for the
                whole reply, so the first words appear in a few hundred
                milliseconds.
              </Tooltip.Description>
            </Tooltip.Content>
          </Tooltip>
        ),
      },
      {
        label: 'Scrolled, when it has to be',
        render: () => (
          <Tooltip openOn="press" duration={0}>
            <Tooltip.Trigger>
              <Button variant="outline">Release notes</Button>
            </Tooltip.Trigger>
            <Tooltip.Content
              variant="surface"
              width={280}
              maxHeight={220}
              scrollable
              className="p-3"
            >
              <View className="gap-2">
                <Tooltip.Title>What changed in 0.30</Tooltip.Title>
                {[
                  'Textarea, sized in rows rather than pixels.',
                  'The menu panel draws on a replaceable background layer.',
                  'Tooltips follow the theme, and hold a panel of content.',
                  'The calendar frames itself and draws a continuous range.',
                  'Reasoning, Sources, Task, CodeBlock and Plan.',
                ].map((line) => (
                  <Tooltip.Description key={line}>{line}</Tooltip.Description>
                ))}
              </View>
            </Tooltip.Content>
          </Tooltip>
        ),
      },
    ],
  },
{
    slug: 'tree',
    name: 'Tree',
    summary: 'A hierarchy you can open a level at a time',
    demos: [
      { label: 'Default', render: () => <TreeFilesDemo /> },
      { label: 'Guide lines', render: () => <TreeFilesDemo showLines /> },
      { label: 'Single selection', render: () => <TreeSelectionDemo mode="single" /> },
      { label: 'Multiple selection', render: () => <TreeSelectionDemo mode="multiple" /> },
      { label: 'Sidebar nav', render: () => <TreeNavDemo /> },
      { label: 'Loads when opened', render: () => <TreeLazyDemo /> },
    ],
  }
];
export const ENTRIES_BY_SLUG = Object.fromEntries(ENTRIES.map((entry) => [entry.slug, entry]));

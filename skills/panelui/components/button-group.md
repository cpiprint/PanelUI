# ButtonGroup

Several buttons drawn as one control — a segmented run, a split action, a toolbar.

```tsx
import { ButtonGroup } from 'panelui-native';
// Copied into the project with the CLI instead:
// import { ButtonGroup } from '@/components/ui/button-group';
```

### Usage

```tsx
<ButtonGroup variant="outline">
  <Button startContent={<PencilIcon size={16} />}>Rename</Button>
  <Button startContent={<CopyIcon size={16} />}>Duplicate</Button>
  <Button startContent={<TrashIcon size={16} />} disabled>Remove</Button>
</ButtonGroup>
```

### Variants

- **orientation** — `horizontal` *(default)*, `vertical`
- **attached** — `true` *(default)*, `false`
- **size** — `xs`, `sm`, `md` *(default)*, `lg`, `xl`, `icon`
- **fullWidth** — `true`

### Props

#### `ButtonGroupProps`

Extends `ViewProps, Omit<ButtonGroupVariantProps, 'size' \| 'attached'>`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `string` | — | — |
| `orientation` | `ButtonGroupOrientation` | `horizontal` | Which way the run reads. Vertical is the toolbar down the side of a canvas. |
| `variant` | `ButtonVariant` | — | Fills in for any button that did not choose its own. |
| `size` | `ButtonSize` | `md` | Fills in for any button that did not choose its own, and sets the radius. |
| `attached` | `boolean` | `true` | Draw the run as one joined shape. On by default — that is what a group is. Turn it off for a plain row of separate buttons that should still share a variant and a size, which is a toolbar rather than a segmented control. |
| `fullWidth` | `boolean` | `false` | Span the container, with the segments sharing it equally. Equally, not by content: a row of segments at their natural widths is a row whose divisions move when the labels change, and a picker whose halves are different sizes reads as though one of them matters more. |
| `children` | `ReactNode` | — | — |

### Example — A view switcher

`variant` and `size` fill in for any button that did not choose its own, so a run of three does not repeat the same two props three times. The current segment says `secondary` for itself and wins — which is all “selected” needs to be once the surrounding shape is already drawn.

```tsx
const [view, setView] = useState('media');

<ButtonGroup size="sm">
  {views.map(({ value, label, icon: Icon }) => (
    <Button
      key={value}
      variant={view === value ? 'secondary' : 'ghost'}
      startContent={<Icon size={15} />}
      onPress={() => setView(value)}
    >
      {label}
    </Button>
  ))}
</ButtonGroup>
```

### Notes

### Why the container draws the border

A joined run could be built by giving the first and last segments their corners, squaring the ones between, and collapsing every shared edge with a negative margin. That works on the web and is a stack of off-by-one problems on a phone: the hairlines land on different fractions of a pixel per device, and a run that wraps has no first or last segment any more.

So the group draws the shape once — one border, one radius, one shadow, clipped — and the buttons inside draw none of their own. The dividers are real one-pixel views the group puts between its children, which is why they are always exactly one pixel and always in the same place.

### What a button gives up inside one

Its radius and its shadow, because the group owns both. Its border turns transparent rather than being removed — it is holding a pixel of the button's height, and dropping it would leave an `outline` segment a hair shorter than a `ghost` one beside it.

Its press feedback changes too. A button on its own shrinks slightly when pressed, which inside a joined run would pull the segment away from its neighbours and show the container through the gap, so an attached segment takes a background instead. Pass `pressScale` yourself to override that.

### Native buttons are not grouped

A `native` button is drawn by the platform, so it has no border, radius or shadow for the group to take over. Several of them in a row would be platform buttons with a border drawn around them rather than a segmented control, so a native button inside a group ignores it and stays exactly what it was.

---

Full page, with every example: https://panelui.dev/docs/components/button-group

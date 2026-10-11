# ToggleButton

A button that stays down, on its own or in a group.

```tsx
import { ToggleButton } from 'panelui-native';
// Copied into the project with the CLI instead:
// import { ToggleButton } from '@/components/ui/toggle-button';
```

### Anatomy

```tsx
<ToggleButtonGroup>
  <ToggleButton id="…">
    <Icon />
    <ToggleButton.Label>…</ToggleButton.Label>
  </ToggleButton>
</ToggleButtonGroup>
```

### Variants

- **variant** — `default` *(default)*, `ghost`
- **size** — `xs`, `sm`, `md` *(default)*, `lg`, `xl`
- **selected** — `true`, `false`
- **iconOnly** — `true`
- **disabled** — `true`

### Parts

- `ToggleButton.Label` — The label, when the button holds more than a string. Reads the selected state itself, so an icon-plus-text button does not thread the colour through by hand.

### Props

#### `ToggleButtonGroupProps`

Extends `ViewProps`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `string` | — | — |
| `selectionMode` | `ToggleSelectionMode` | `multiple` | `multiple` is a set of independent marks — bold *and* italic. `single` is an either-or choice where picking one clears the last. |
| `value` | `string[]` | — | Selected ids. Controlled — pair with `onValueChange`. |
| `defaultValue` | `string[]` | `[]` | Starting selection when uncontrolled. |
| `onValueChange` | `(value: string[]) => void` | — | — |
| `disabled` | `boolean` | `false` | Disables every button in the group. |
| `variant` | `ToggleButtonVariant` | `default` | Applied to every button that does not set its own. |
| `size` | `ToggleButtonSize` | `md` | — |
| `haptics` | `boolean` | — | A tick under the finger each time a button is pressed. Off by default — needs the optional `expo-haptics`, and is silent without it. Inherited by every button that does not set its own. |
| `children` | `ReactNode` | **required** | — |

#### `ToggleButtonProps`

Extends `Omit<AnimatedPressableProps, 'children' \| 'disabled'>, Omit<ToggleVariantProps, 'selected' \| 'disabled' \| 'iconOnly'>`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | — |
| `className` | `string` | — | — |
| `labelClassName` | `string` | — | Extra classes for the label when children is a string. |
| `id` | `string` | — | Identifies this button within a `ToggleButtonGroup`. Required there. |
| `selected` | `boolean` | — | Controlled selection. Ignored inside a group, which owns the state. |
| `defaultSelected` | `boolean` | `false` | Starting state when uncontrolled and outside a group. |
| `onSelectedChange` | `(selected: boolean) => void` | — | — |
| `disabled` | `boolean` | `false` | — |
| `haptics` | `boolean` | — | A tick under the finger each time the button is pressed. Off by default — needs the optional `expo-haptics`, and is silent without it. Inside a group, falls back to the group's `haptics`. |
| `iconOnly` | `boolean` | `false` | Square, with no horizontal padding — for a single icon. |
| `selectedClassName` | `string` | — | Extra classes applied only while selected. |
| `unselectedClassName` | `string` | — | Extra classes applied only while unselected. |

#### `ToggleButtonLabelProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `string` | — | — |
| `children` | `ReactNode` | **required** | — |

### Example — On its own

Uncontrolled with `defaultSelected`, or controlled with `selected` and `onSelectedChange`.

```tsx
<ToggleButton defaultSelected>Follow</ToggleButton>

const [liked, setLiked] = useState(false);

<ToggleButton selected={liked} onSelectedChange={setLiked}>
  <HeartIcon size={16} />
  <ToggleButton.Label>{liked ? 'Liked' : 'Like'}</ToggleButton.Label>
</ToggleButton>
```

### Notes

The selected state is announced, not just drawn: every button sets `accessibilityState.checked`, which is what a screen reader reads out as on or off. An `iconOnly` button has no label to read, so give it an `accessibilityLabel`.

A group takes `variant` and `size` and applies them to every button that does not set its own, so a toolbar is styled in one place.

Set `haptics` for a tick under the finger on each press — a toolbar of filters feels more like hardware for it. It needs the optional `expo-haptics` and is silent without it, so it is safe to leave on. A group's `haptics` is inherited by every button that does not set its own.

A supplied `onPress` runs before the selected-state transition. Other Pressable props are forwarded, but the component keeps ownership of its button role, checked/selected/disabled semantics, and primary press handler so those cannot drift away from the visible state.

---

Full page, with every example: https://panelui.dev/docs/components/toggle-button

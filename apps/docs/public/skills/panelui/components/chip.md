# Chip

Interactive pill — a filter, a tag, or a removable token.

```tsx
import { Chip } from 'panelui-native';
// Copied into the project with the CLI instead:
// import { Chip } from '@/components/ui/chip';
```

### Anatomy

```tsx
<Chip start={<Icon />} onClose={() => {}}>
  <Chip.Label>…</Chip.Label>
</Chip>
```

### Variants

- **variant** — `default` *(default)*, `primary`, `outline`, `success`, `warning`, `info`, `destructive`
- **size** — `xs`, `sm`, `md` *(default)*, `lg`, `xl`
- **selected** — `true`
- **closable** — `true`
- **disabled** — `true`

### Parts

- `Chip.Label` — The label, when the chip holds more than a string. Reads the chip's variant and selected state itself, so an icon-plus-text chip does not thread the colour through by hand.

### Props

#### `ChipProps`

Extends `Omit<AnimatedPressableProps, 'children' \| 'disabled'>, Omit<ChipVariantProps, 'selected' \| 'disabled' \| 'closable'>`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | — |
| `className` | `string` | — | — |
| `labelClassName` | `string` | — | Extra classes for the label when `children` is a string. |
| `selected` | `boolean` | — | The filter "on" state. Setting it (even to `false`) makes the chip a toggle, announced as such — pair it with `onPress` to flip it. |
| `disabled` | `boolean` | `false` | — |
| `start` | `ReactNode` | — | A leading icon or avatar, before the label. |
| `onClose` | `() => void` | — | Shows a trailing ✕ and calls this when it is pressed. The ✕ is its own hit target, so removing a chip never also fires its `onPress`. |
| `closeLabel` | `string` | `Remove` | Accessibility label for the ✕. Defaults to "Remove". |
| `haptics` | `boolean` | `false` | A tick under the finger when the chip is pressed or removed. Off by default — needs the optional `expo-haptics`, and is silent without it. |

#### `ChipLabelProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `string` | — | — |
| `children` | `ReactNode` | **required** | — |

### Example — Tags

A static token, in any of the tones. With no `onPress` it is a plain View — it does not invite a tap it will not answer.

```tsx
<Chip>Default</Chip>
<Chip variant="primary">Primary</Chip>
<Chip variant="success">Shipped</Chip>
<Chip variant="warning">Beta</Chip>
<Chip variant="info">New</Chip>
<Chip variant="outline">Draft</Chip>
```

### Notes

A chip is only pressable when you give it an `onPress` or a `selected` state — otherwise it is a plain tag and is not announced as a control. A `selected` chip is read out as checked or unchecked; a plain pressable one as a button.

The close button carries its own `accessibilityLabel` (“Remove” by default — override with `closeLabel`) and a generous hit slop, since a small pill leaves little room for the finger.

Set `haptics` for a tick under the finger on press or removal. It needs the optional `expo-haptics` and is silent without it.

A pressable chip forwards ordinary Pressable props, but keeps ownership of its role, selected/disabled semantics, classes, and haptic-aware `onPress` composition. The consumer callback receives the native event after the optional haptic tick.

---

Full page, with every example: https://panelui.dev/docs/components/chip

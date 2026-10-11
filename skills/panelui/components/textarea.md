# Textarea

Text field that runs to several lines, sized in rows.

```tsx
import { Textarea } from 'panelui-native';
// Copied into the project with the CLI instead:
// import { Textarea } from '@/components/ui/textarea';
```

### Usage

```tsx
<Textarea label="Notes" placeholder="Anything we should know?" />

<Textarea
  label="Bio"
  rows={3}
  description="Shown on your public profile."
/>

<Textarea
  autoGrow
  rows={2}
  maxRows={8}
  placeholder="Message"
/>

<Textarea
  label="Status"
  maxLength={280}
  showCount
  value={status}
  onChangeText={setStatus}
/>
```

### Variants

- **variant** — `outline` *(default)*, `filled`
- **size** — `xs`, `sm`, `md` *(default)*, `lg`, `xl`
- **disabled** — `true`
- **over** — `true`

### Props

#### `TextareaProps`

Extends `Omit<TextInputProps, 'multiline' \| 'numberOfLines'>, Omit<TextareaVariantProps, 'disabled' \| 'over'>`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `string` | — | — |
| `containerClassName` | `string` | — | — |
| `label` | `string` | — | — |
| `description` | `string` | — | — |
| `errorMessage` | `string` | — | Error message. When set, the field renders in its invalid state. |
| `isRequired` | `boolean` | — | Marks the field required — an asterisk on the label, and the a11y state. |
| `disabled` | `boolean` | — | — |
| `rows` | `number` | `4` | How many lines of text the field is tall before it scrolls or grows. |
| `autoGrow` | `boolean` | `false` | Grow with the text, one line at a time, up to `maxRows` — after which the field holds its height and scrolls instead. Without it the field stays at `rows` and scrolls from the first line past it. |
| `maxRows` | `number` | `10` | The tallest `autoGrow` will go. Ignored without it. |
| `showCount` | `boolean` | `false` | Show how much of `maxLength` is used, under the field. Needs `maxLength`; a counter with no limit to count towards says nothing. |
| `avoidKeyboard` | `boolean` | `false` | Keep the field clear of the software keyboard. Moves by exactly the overlap, and not at all when the field is already clear — or when the keyboard belongs to a different field. The overlap is re-read every frame while the field is focused, so the field keeps its place in the page as it scrolls under and back out of the keyboard. Install `react-native-keyboard-controller` for this to behave on Android. Do not toggle this at runtime — it changes which component renders the container, which would remount the field and drop focus. |
| `keyboardMode` | `KeyboardAvoidanceMode` | `lift` | How the field gets clear. `lift` moves it up by its overlap and follows the scroll — right for a field in the flow of a page. `dock` makes it travel with the keyboard, for a composer already pinned near the bottom edge; pair it with `keyboardBottomInset`. |
| `keyboardOffset` | `number` | `16` | Gap kept between the field and the keyboard. `keyboardMode="lift"` only. |
| `keyboardBottomInset` | `number` | `0` | How far above the bottom edge the field already sits — usually the safe area inset. `keyboardMode="dock"` only. |

### Example — Rows, not pixels

`rows` is how many lines of text the field is tall before it scrolls. It composes with `size`, so a small three-row field and a large three-row field are both three rows.

```tsx
<Textarea rows={2} placeholder="Two rows" />
<Textarea rows={4} placeholder="Four rows" />
<Textarea size="sm" rows={4} placeholder="Four smaller rows" />
```

### Notes

Accepts every `TextInputProps` except `multiline` and `numberOfLines`, both of which the component owns — it is always multiline, and its height comes from `rows`. `disabled` cannot be undone with the inherited `editable` prop. Passing `editable={false}` also applies the disabled styling and announced state, so the visual, native and accessibility contracts cannot disagree.

The height is computed rather than set as a class. A row count only becomes a height once you know how tall a line is, so the type size, its leading and the vertical padding are kept as numbers per `size` and the box is derived from them. Setting a line height in a class as well would give you two numbers that disagree.

`autoGrow` measures the text through `onContentSizeChange` and clamps the result between `rows` and `maxRows`. The field never shrinks below `rows`, so a field that has been typed into and cleared goes back to the height it started at rather than collapsing to one line.

`showCount` needs `maxLength` — a counter with no limit to count towards says nothing. It sits on the same row as the description, right-aligned, and turns `destructive` once the limit is reached.

`errorMessage` puts the field in its invalid state, the same as it does on `Input`: the border is tinted at rest as well as on focus, because the error is a fact about the value rather than about whether the field happens to be focused.

`avoidKeyboard` behaves exactly as it does on [Input](/docs/components/input#avoiding-the-keyboard) — it moves the field by its overlap with the keyboard and re-reads that overlap every frame while the field is focused. Do not toggle it at runtime; it changes which component renders the container, which would remount the field and drop focus.

---

Full page, with every example: https://panelui.dev/docs/components/textarea

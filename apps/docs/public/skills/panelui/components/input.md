# Input

Text field with label, description and error message.

```tsx
import { Input } from 'panelui-native';
// Copied into the project with the CLI instead:
// import { Input } from '@/components/ui/input';
```

### Usage

```tsx
<Input label="Email" placeholder="you@example.com" />

<Input variant="filled" size="lg" label="Workspace" isRequired />

<Input
  label="Description"
  placeholder="A short description"
  description="Shown on your public profile."
/>

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  errorMessage={error}
/>

// Lifts clear of the software keyboard when it would be covered.
<Input avoidKeyboard label="Comment" placeholder="Say something…" />
```

### Variants

- **variant** — `outline` *(default)*, `filled`
- **size** — `xs`, `sm`, `md` *(default)*, `lg`, `xl`
- **multiline** — `true`
- **disabled** — `true`

### Props

#### `InputProps`

Extends `TextInputProps, Omit<InputVariantProps, 'disabled' \| 'multiline'>`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `string` | — | — |
| `containerClassName` | `string` | — | — |
| `label` | `string` | — | — |
| `description` | `string` | — | — |
| `errorMessage` | `string` | — | Error message. When set, the field renders in its invalid state. |
| `isRequired` | `boolean` | — | Marks the field required — an asterisk on the label, and the a11y state. |
| `disabled` | `boolean` | — | — |
| `startContent` | `ReactNode` | — | Content inside the field, before the text — usually an icon. Measured, so the text is padded clear of it however wide it is. `start`, not `left`: it follows the reading direction, and swaps sides under `Direction dir="rtl"` along with the text it introduces. |
| `endContent` | `ReactNode` | — | Content inside the field, after the text — an icon, a unit, a count. |
| `interactiveContent` | `boolean` | `true` | Whether touches reach the content. On by default, so a button placed in the field — a clear ✕, a show-password eye, a unit picker — is pressable without anything else being passed. Only the content itself takes those touches: the padding around it is transparent, so a tap that misses the button still lands on the field and puts the caret in it. Turn it off for pure decoration, where the icon should not be a target at all and every pixel of the field should focus it. That also drops the content from the accessibility tree, which is right for an icon that only restates the label. |
| `avoidKeyboard` | `boolean` | `false` | Keep the field clear of the software keyboard. Moves by exactly the overlap, and not at all when the field is already clear — or when the keyboard belongs to a different field. The overlap is re-read every frame while the field is focused, so the field keeps its place in the page as it scrolls under and back out of the keyboard. Install `react-native-keyboard-controller` for this to behave on Android. Do not toggle this at runtime — it changes which component renders the container, which would remount the field and drop focus. |
| `keyboardMode` | `KeyboardAvoidanceMode` | `lift` | How the field gets clear. `lift` moves it up by its overlap and follows the scroll — right for a field in the flow of a page. `dock` makes it travel with the keyboard, for a composer already pinned near the bottom edge; pair it with `keyboardBottomInset`. |
| `keyboardOffset` | `number` | `16` | Gap kept between the field and the keyboard. `keyboardMode="lift"` only. |
| `keyboardBottomInset` | `number` | `0` | How far above the bottom edge the field already sits — usually the safe area inset. `keyboardMode="dock"` only. |

### Example — Label, description and error

Setting `errorMessage` also puts the field into its invalid state — you do not need a separate flag. The description is replaced by the error while one is present.

```tsx
<Input label="Name" placeholder="Khalid Abdi" />

<Input
  label="Description"
  placeholder="A short description"
  description="Shown on your public profile."
/>

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  errorMessage={emailError}
/>
```

### Notes

Accepts every `TextInputProps`. The placeholder colour is resolved from the theme, so it follows light and dark automatically.

The focus border is animated with a shared value rather than switched with a class, because a class can only be swapped wholesale — which is the snap the animation exists to avoid. An invalid field is tinted at rest as well as on focus: the error is a fact about the value, not about whether the field happens to be focused.

### Content inside the field

`startContent` and `endContent` are measured and turned into padding on the text, so a value never runs underneath them. Removing either one removes its measured padding in the same render, so a conditional clear button or spinner cannot leave an empty inset behind. They are positioned against the **field box** — not against the component — which is the whole reason they are props rather than something you compose around the outside: a label sits above the field and a description below it, so anything centred on the component as a whole drifts upward the moment a label is added.

They are `start` and `end` rather than left and right because they follow the reading direction, and swap sides under `Direction dir="rtl"` along with the text they introduce.

Content is pressable by default, so a button placed in the field — a clear ✕, a show-password eye, a unit picker — works without anything else being passed. Only the content itself takes those touches: the padding around it stays transparent, so a tap that misses the button still lands on the field and puts the caret in it.

Pass `interactiveContent={false}` for pure decoration. The icon stops being a target at all, every pixel of the field focuses it, and the content leaves the accessibility tree — which is what an icon that only restates the label should do.

The prop covers both ends at once, since it is one field. When one end is decoration and the other is a control, leave it on and wrap the decorative one in a `<View pointerEvents="none">`.

[InputGroup](/docs/components/input-group) is still the right answer for a decorator that is not part of the field: a button attached to its end, a select bolted to its start, an addon with a background of its own. It measures the same way; it just spans a different box.

### Avoiding the keyboard

`avoidKeyboard` measures the field and translates it by exactly the overlap with the keyboard — and not at all when the field is already above it, or when the keyboard was opened by a different field. Only the field being typed into moves; without that rule every avoiding field on the screen would lift at once and land stacked on top of the others. That is the difference from `KeyboardAvoidingView`, which shifts an entire subtree by the full keyboard height wherever the field happens to sit.

The overlap is re-measured every frame for as long as the field is focused and the keyboard is up, which is what lets a field inside a `ScrollView` hold its place: scroll it clear of the keyboard and the lift decays to nothing, scroll it back under and the lift returns. Measuring once at the moment of focus is right for exactly one frame — after that the field is holding an offset that belongs to where it used to be.

`keyboardMode="dock"` is the other shape of the problem: a composer or a search bar that is already pinned near the bottom edge and should ride the keyboard rather than get out of its way. It measures nothing; it travels by the keyboard height less `keyboardBottomInset`, the inset it is already sitting above.

Install `react-native-keyboard-controller` for this to behave on Android:

```sh
npx expo install react-native-keyboard-controller
```

It is an optional peer, and `PanelUIProvider` mounts its `KeyboardProvider` for you when it is present. Without it the hook falls back to Reanimated's `useAnimatedKeyboard`, which is deprecated in Reanimated 4 and — merely by being called — switches Android out of `adjustResize` for the whole app.

Use `keyboardOffset` to change the gap it keeps (16px by default). Do not toggle `avoidKeyboard` at runtime: it changes which component renders the container, which would remount the field and drop focus.

For anything that is not an Input — a toolbar, a composer, a whole card — use the `KeyboardAvoider` primitive or the `useKeyboardAvoidance` hook directly.

---

Full page, with every example: https://panelui.dev/docs/components/input

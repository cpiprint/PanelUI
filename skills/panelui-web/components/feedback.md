# Feedback

A dialog with a well to write in and two actions in the band around it.

```tsx
import { Feedback } from "@/components/panelui/feedback"
```

From npm the path is `panelui-web/feedback`. Install with `npx shadcn@latest add @panelui/feedback`.

## When to use it

Use it to ask for a sentence: what went wrong, what to fix first, why somebody gave the score they did. It is a dialog whose body is a place to write, with Cancel and Submit in the band around it.

`Submit` cannot be pressed while the field is empty, and it does not close the dialog. You close it once the message has been sent, so a send that fails still has somewhere to say so.

For a yes-or-no confirmation use a plain dialog. For a form with several fields, build the form.

## Usage

```tsx
<Feedback>
  <Feedback.Trigger>Send feedback</Feedback.Trigger>
  <Feedback.Content>
    <Feedback.Panel>
      <Feedback.Title>What should we fix first?</Feedback.Title>
      <Feedback.Close />
      <Feedback.Field placeholder="Tell us what got in your way" />
    </Feedback.Panel>
    <Feedback.Footer>
      <Feedback.Cancel />
      <Feedback.Submit onSubmit={(message) => send(message)} />
    </Feedback.Footer>
  </Feedback.Content>
</Feedback>
```

## Parts

```tsx
<Feedback>
  <Feedback.Trigger />
  <Feedback.Content>
    <Feedback.Panel>
      <Feedback.Title />
      <Feedback.Close />
      <Feedback.Field />
    </Feedback.Panel>
    <Feedback.Footer>
      <Feedback.Cancel />
      <Feedback.Submit />
    </Feedback.Footer>
  </Feedback.Content>
</Feedback>
```

- `Feedback.Trigger` — What opens the dialog. A plain button, or your own through `render`.
- `Feedback.Content` — The shell: the darker band and everything set in it. `inline` draws it in the page instead of over it.
- `Feedback.Panel` — The well. The title, the close button and the field go here, along with anything else the question needs.
- `Feedback.Title` — The question. In a dialog it is also the dialog's accessible name.
- `Feedback.Close` — The ✕ in the corner of the panel.
- `Feedback.Field` — The text area. It has no border of its own, because it is already inside a well.
- `Feedback.Footer` — The row the two actions sit in.
- `Feedback.Cancel` — Closes the dialog. Call `preventDefault` in `onClick` to do something else, such as going back a step.
- `Feedback.Submit` — Calls `onSubmit` with the message. Disabled while the field is empty unless you pass `disabled` yourself.

## Props

Every part also takes the props of the element it renders, and a `className`.

#### `FeedbackProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Whether the dialog is open, when the caller holds that. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the dialog asks to open or close. |
| `defaultOpen` | `boolean` | `false` | Whether it starts open, when the caller does not hold it. |
| `value` | `string` | — | The message, when the caller holds it. Leave unset to let the field keep it. |
| `defaultValue` | `string` | `''` | The message to start with, when the caller does not hold it. |
| `onValueChange` | `(value: string) => void` | — | Called with the message each time it changes. |
| `dismissible` | `boolean` | `true` | Whether a click outside or the Escape key closes the dialog. Turn it off for a message that would be lost by a stray click; Cancel and the close button still work. |

#### `FeedbackTriggerProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `render` | `ReactElement` | — | Your own element to be the trigger, such as a styled button. It is given the click handler and the attributes that tie it to the dialog. |

#### `FeedbackContentProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `inline` | `boolean` | `false` | Draw it in the page instead of over it: no backdrop, no trigger, always there. For a feedback box that is part of the page, such as the end of an article. `open` is ignored, and Cancel and the close button only report through `onOpenChange`. |
| `blur` | `boolean` | `false` | Frost the page behind the dialog instead of only dimming it. |

#### `FeedbackCloseProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | — | How the button announces itself to a screen reader. |

#### `FeedbackFieldProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `value` | `string` | — | The message. Leave unset to let the dialog hold it. |
| `onValueChange` | `(value: string) => void` | — | Called with the message each time it changes. |
| `minHeight` | `number` | `200` | Room to write in, in pixels, before the field starts to grow. |
| `maxHeight` | `number` | `360` | How tall the field may grow, in pixels, before the area round it scrolls. |

#### `FeedbackSubmitProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `onSubmit` | `(value: string) => void` | — | Called with the message. The dialog stays open: close it yourself once the message has been sent, so a failure still has somewhere to be shown. |

## In a Server Component

`Feedback` is a client component. A Server Component cannot read `Feedback.Trigger` off the import, so import each part by name: `FeedbackTrigger`, `FeedbackContent`, `FeedbackPanel`, `FeedbackTitle`, `FeedbackClose`, `FeedbackField`, `FeedbackFooter`, `FeedbackCancel`, `FeedbackSubmit`.

## Notes

#### In the page

`<Feedback.Content inline>` draws the same shell in the page, with no backdrop and nothing to open. Cancel and the close button have nothing to close there, so they only call `onOpenChange(false)`. Use that to clear the field or to hide the box.

#### Closing

A click outside the dialog or the Escape key closes it. Pass `dismissible={false}` to `Feedback` to turn both off, for a message that a stray click should not throw away. Cancel and the close button still work.

#### Keyboard

Enter adds a new line. Command+Enter on a Mac, or Control+Enter elsewhere, sends the message, as long as `Submit` is enabled. Focus is kept inside the dialog while it is open and returns to the trigger when it closes.

#### The empty state

While `Submit` is disabled it drops its fill, where most buttons would only dim. A dimmed accent button still looks like the one to press. Pass `disabled` to decide for yourself when the message can be sent: `disabled={false}` allows an empty one.

#### What it is built on

The dialog is the Base UI dialog, which the package depends on directly. It does not use your project's own dialog component, so it looks the same whichever one you have.

## Example

```tsx
'use client';

import { useState } from 'react';
import { Feedback } from '@/components/panelui/feedback';

export default function FeedbackInThePage() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  // Inline, there is nothing to close. Cancel and the ✕ report here instead,
  // and this page takes that to mean "start again".
  const reset = () => {
    setMessage('');
    setSent(false);
  };

  return (
    <Feedback value={message} onValueChange={setMessage} onOpenChange={reset}>
      <Feedback.Content inline>
        <Feedback.Panel>
          {sent ? (
            <>
              <Feedback.Title>Thank you</Feedback.Title>
              <p className="min-h-[200px] text-[17px] leading-6 text-muted-foreground">
                We read every message. If yours needs a reply, you will have one
                within a working day.
              </p>
            </>
          ) : (
            <>
              <Feedback.Title>What should we fix first?</Feedback.Title>
              <Feedback.Close label="Clear the message" />
              <Feedback.Field placeholder="Tell us what got in your way" />
            </>
          )}
        </Feedback.Panel>
        <Feedback.Footer>
          {sent ? (
            <Feedback.Cancel>Write another</Feedback.Cancel>
          ) : (
            <>
              <Feedback.Cancel>Clear</Feedback.Cancel>
              <Feedback.Submit onSubmit={() => setSent(true)} />
            </>
          )}
        </Feedback.Footer>
      </Feedback.Content>
    </Feedback>
  );
}
```

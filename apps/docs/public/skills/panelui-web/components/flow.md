# Flow

A canvas of nodes joined by edges, that you pan, zoom and rearrange.

```tsx
import { Flow } from "@/components/panelui/flow"
```

From npm the path is `panelui-web/flow`. Install with `npx shadcn@latest add @panelui/flow`.

## When to use it

Use it to show how things are connected and let somebody move them about: the stages of a pipeline, an automation, the parts of a system. Nodes are boxes with your own contents, edges join them, and the canvas is panned and zoomed.

It has the same parts and props as the app library's Flow, so a graph written for one reads the same in the other.

It lays nothing out for you. Every node is given a position, so for a graph whose shape comes from data you need to work the positions out first. For steps in a fixed order with nothing to rearrange, a list of steps is the simpler thing.

## Usage

```tsx
<Flow fitViewOnMount>
  <Flow.Background />
  <Flow.Node id="draft" position={{ x: 40, y: 20 }}>Draft</Flow.Node>
  <Flow.Node id="edit" position={{ x: 40, y: 150 }}>Edit</Flow.Node>
  <Flow.Edge from="draft" to="edit" arrow />
  <Flow.Controls />
</Flow>
```

## Parts

```tsx
<Flow>
  <Flow.Background />
  <Flow.Node id="…" position={…}>
    …
    <Flow.Handle />
  </Flow.Node>
  <Flow.Group id="…" position={…} />
  <Flow.Edge from="…" to="…" />
  <Flow.Controls />
  <Flow.MiniMap />
</Flow>
```

- `Flow.Background` — The pattern behind the graph: dots, lines or crosses. It moves and scales with the graph.
- `Flow.Node` — A box on the graph. `id` is what edges call it, `position` is where it starts, and its children are yours.
- `Flow.Handle` — A dot on a node's edge that a connection can be drawn from or dropped on. Give it an `id` to join an edge to it by name.
- `Flow.Edge` — A line from one node to another: a curve, a routed line or a straight one, optionally dashed, marching and with an arrowhead.
- `Flow.Group` — A dashed box with a label, round things that belong together. It is dragged as one and an edge can be joined to it.
- `Flow.Controls` — Buttons to zoom, fit everything in view and lock the canvas.
- `Flow.MiniMap` — The whole graph, small, with the part in view marked on it.

## Props

Every part also takes the props of the element it renders, and a `className`.

#### `FlowProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `defaultViewport` | `FlowViewport` | — | Where the canvas looks to begin with. |
| `minZoom` | `number` | `0.3` | The furthest out it can be zoomed. |
| `maxZoom` | `number` | `2.5` | The furthest in it can be zoomed. |
| `panOnDrag` | `boolean` | `true` | Whether dragging the pane pans it. |
| `zoomOnPinch` | `boolean` | `true` | Whether a pinch, or Control with the wheel, zooms it. |
| `fitViewOnMount` | `boolean` | `false` | Fits every node into view once they have been measured. |
| `fitViewPadding` | `number` | `48` | The room left round the nodes when fitting them, in pixels. |
| `onViewportChange` | `(viewport: FlowViewport) => void` | — | Called as the canvas is panned or zoomed. |
| `onNodeDragEnd` | `(id: string, position: FlowNodePosition) => void` | — | Called with a node's new position when a drag or a key press has moved it. |
| `onConnect` | `(connection: FlowConnection) => void` | — | Called when a connection drawn from a handle lands on another node. |
| `isValidConnection` | `(connection: FlowConnection) => boolean` | — | Decides whether a connection may land. Without it, any two different nodes may be joined. |
| `label` | `string` | `'Diagram'` | What a screen reader calls the canvas. |

#### `FlowBackgroundProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `variant` | `'dots' \| 'lines' \| 'cross' \| 'none'` | `'bezier'` | Dots, a grid of lines, small crosses, or nothing. |
| `gap` | `number` | `20` | The distance from one mark to the next, in pixels at a zoom of 1. |
| `size` | `number` | — | How big a mark is: a dot's radius, a line's thickness, half a cross's arm. |
| `className` | `string` | — | — |

#### `FlowNodeProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | `string` | **required** | What edges and `onNodeDragEnd` call this node. |
| `position` | `FlowNodePosition` | **required** | Where its top left corner is, on the graph. |
| `draggable` | `boolean` | `true` | Whether it can be dragged and moved with the arrow keys. |
| `selected` | `boolean` | `false` | Draws it as the one that has been picked. |
| `onPress` | `() => void` | — | Called when it is pressed without being dragged, or with Enter. |
| `onDelete` | `() => void` | — | Called when Delete or Backspace is pressed on it. |
| `moveStep` | `number` | — | How far one arrow key press moves it, in pixels. Shift moves four times as far. |

#### `FlowGroupProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | Written in the corner of the group. |

#### `FlowHandleProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | `string` | — | A name for this handle, so an edge can be joined to it and not only to the node. |
| `position` | `FlowSide` | `'bottom-right'` | Which face of the node it sits on. |
| `offset` | `number` | — | How far along that face, from 0 to 1. |

#### `FlowEdgeProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `from` | `FlowEndpointReference` | **required** | Where it leaves from: a node's `id`, or `{ node, handle }`. |
| `to` | `FlowEndpointReference` | **required** | Where it arrives. |
| `variant` | `FlowEdgeVariant` | `'bezier'` | A curve, a rounded right-angled route, a square one, or a straight line. |
| `animated` | `boolean` | `false` | Sets the dashes marching towards the target. |
| `dashed` | `boolean` | `false` | Draws it dashed. |
| `color` | `FlowColor` | — | One of the theme's roles. Without it the edge is a quiet grey. |
| `width` | `number` | `2` | How thick the line is, in pixels at a zoom of 1. |
| `arrow` | `boolean` | `false` | Draws an arrowhead where it arrives. |
| `fromSide` | `FlowSide` | — | The face it leaves from. Worked out from where the two nodes are when left out. |
| `toSide` | `FlowSide` | — | The face it arrives at. |
| `radius` | `number` | `8` | How round the corners of a `smoothstep` route are. |
| `gap` | `number` | `20` | How far a routed edge runs straight out of a node before it turns. |
| `curvature` | `number` | `0.25` | How far a `bezier` bulges when its target is behind its source. |

#### `FlowControlsProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `zoom` | `boolean` | `true` | Shows the two zoom buttons. |
| `fit` | `boolean` | `true` | Shows the button that fits every node into view. |
| `lock` | `boolean` | `true` | Shows the button that locks the canvas against panning, zooming and dragging. |
| `step` | `number` | `1.3` | How much one press of a zoom button zooms. |
| `position` | `FlowCorner` | `'bottom-right'` | Which corner of the canvas they sit in. |

#### `FlowMiniMapProps`

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `width` | `number` | `120` | How wide the map is, in pixels. |
| `height` | `number` | `80` | How tall the map is, in pixels. |
| `position` | `FlowCorner` | `'bottom-left'` | Which corner of the canvas it sits in. |

## In a Server Component

`Flow` is a client component. A Server Component cannot read `Flow.Background` off the import, so import each part by name: `FlowBackground`, `FlowNode`, `FlowHandle`, `FlowEdge`, `FlowGroup`, `FlowControls`, `FlowMiniMap`.

## Notes

#### Size

The canvas is 24rem tall and as wide as its container. Set a height with `className`.

#### Positions

`position` is the node's top left corner on the graph, in pixels at a zoom of 1. The canvas holds a node's position after that: a drag moves it, and `onNodeDragEnd` reports where it stopped. To move a node yourself, keep its position in state and pass the new one.

`fitViewOnMount` zooms and pans so every node is in view once they have been measured. It never zooms in past 1.

#### Edges

`from` and `to` are node ids, or `{ node, handle }` to join a handle by its `id`. The faces an edge uses are worked out from where the two nodes are, and change as one is dragged past the other; `fromSide` and `toSide` fix them.

`variant` is `bezier`, `smoothstep`, `step` or `straight`. `animated` sets dashes marching towards the target, and stops for anyone who has asked for reduced motion. `color` names one of the theme's roles; without it an edge is a quiet grey.

#### Panning and zooming

Drag the empty canvas to pan. Zoom with a pinch, or with Control or Command and the wheel. The plain wheel is left to the page, so a diagram in a long page does not trap its scroll. `Flow.Controls` has buttons for the same things, and a lock that stops all of it.

#### Keyboard

The canvas and every node are Tab stops. On the canvas the arrow keys pan, plus and minus zoom and 0 fits everything. On a node the arrow keys move it by `moveStep`, four times as far with Shift, Enter presses it and Delete calls `onDelete`.

A connection can only be drawn with a pointer. Where joining nodes matters to everyone, give them another way to do it, such as a menu on the node.

#### Inside a node

A node is a card by default; pass `className` to change it. Buttons, links and fields inside a node work as usual and do not start a drag. Put `data-no-drag` on anything else that should not.

#### Groups

A group's children are ordinary elements, laid out however you like inside it. They are not nodes: an edge is joined to the group, not to something in it.

## Example

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flow } from '@/components/panelui/flow';

/** An article on its way to being published, one stage under the other. */
const STAGES = [
  { id: 'draft', name: 'Draft', detail: '1,840 words', x: 40, y: 20 },
  { id: 'edit', name: 'Edit', detail: 'Two rounds', x: 40, y: 150 },
  { id: 'check', name: 'Fact check', detail: '14 claims', x: 170, y: 280 },
  { id: 'publish', name: 'Publish', detail: 'Thursday, 09:00', x: 40, y: 410 },
];

const TAG = {
  done: 'bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-(--success)',
  live: 'bg-[color-mix(in_oklab,var(--info)_14%,transparent)] text-(--info)',
  waiting: 'bg-muted text-muted-foreground',
};

export default function FlowPipeline() {
  // The stage being worked on. Everything before it is done.
  const [at, setAt] = useState(1);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <Flow fitViewOnMount label="Article pipeline" className="h-[40rem]">
        <Flow.Background variant="lines" gap={28} />
        {STAGES.map((stage, index) => {
          const state = index < at ? 'done' : index === at ? 'live' : 'waiting';
          return (
            <Flow.Node key={stage.id} id={stage.id} position={{ x: stage.x, y: stage.y }} className="w-56">
              <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
                <span className="text-sm text-muted-foreground">Stage {index + 1}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TAG[state]}`}>
                  {state === 'done' ? 'Done' : state === 'live' ? 'Now' : 'Waiting'}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-medium">{stage.name}</p>
                <p className="text-sm text-muted-foreground">{stage.detail}</p>
              </div>
            </Flow.Node>
          );
        })}
        {STAGES.slice(1).map((stage, index) => (
          <Flow.Edge
            key={stage.id}
            from={STAGES[index].id}
            to={stage.id}
            variant="smoothstep"
            gap={10}
            arrow
            // Only the edge into the stage being worked on is marching.
            animated={index + 1 === at}
            color={index + 1 === at ? 'info' : undefined}
          />
        ))}
        <Flow.Controls />
      </Flow>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={at === 0} onClick={() => setAt(at - 1)}>
          Back a stage
        </Button>
        <Button size="sm" disabled={at === STAGES.length - 1} onClick={() => setAt(at + 1)}>
          Advance
        </Button>
      </div>
    </div>
  );
}
```

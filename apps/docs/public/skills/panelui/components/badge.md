# Badge

Compact status label, dot, or notification count.

```tsx
import { Badge } from 'panelui-native';
// Copied into the project with the CLI instead:
// import { Badge } from '@/components/ui/badge';
```

### Usage

```tsx
<Badge>Default</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="destructive" count={128} />
<Badge variant="success" shape="dot" />
```

### Variants

- **size** — `xs`, `sm`, `md` *(default)*, `lg`, `xl`
- **shape** — `default` *(default)*, `dot`, `count`
- **variant** — `default` *(default)*, `secondary`, `outline`, `destructive`, `success`, `warning`, `info`

### Props

#### `BadgeProps`

Extends `ViewProps, VariantProps<typeof badgeVariants>`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | — |
| `className` | `string` | — | — |
| `labelClassName` | `string` | — | — |
| `count` | `number` | — | Renders a number instead of children, clamped to "99+". Implies the `count` shape unless you set one. |

### Example — Status labels

The default shape — a pill with a text label.

```tsx
<Badge>Default</Badge>
<Badge variant="success">Paid</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Failed</Badge>
<Badge variant="outline">Draft</Badge>
```

### Notes

`count` clamps at `99+` so the pill keeps its shape, and sets an "N unread" accessibility label. Passing `count` implies `shape="count"` unless you set a shape yourself.

---

Full page, with every example: https://panelui.dev/docs/components/badge

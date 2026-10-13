# panelui-web

PanelUI for the web: animated, data-rich React components, styled with Tailwind CSS on the
tokens a shadcn project already defines.

Documentation: [panelui.dev/docs/web](https://panelui.dev/docs/web)

## Two ways to use it

**Copy a component into your project** with the shadcn CLI. The source lands in
`components/panelui/` and is yours to edit:

```bash
npx shadcn@latest add https://panelui.dev/r/web/planet.json
```

**Or install the package** and import from it:

```bash
npm install panelui-web
```

```css
/* app/globals.css — let Tailwind see the classes the package uses */
@import "tailwindcss";
@source "../node_modules/panelui-web/dist";
```

```tsx
import { Planet } from 'panelui-web/planet';
```

Both read the same source, so a component looks and behaves the same either way.

## Requirements

- React 18 or newer
- Tailwind CSS 4
- The shadcn theme tokens (`--background`, `--foreground`, `--card`, `--muted`, `--border`,
  `--primary` and their `-foreground` pairs). `npx shadcn@latest init` writes them.

## License

MIT

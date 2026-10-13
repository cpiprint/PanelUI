'use client';

import { Flow } from 'panelui-web/flow';

export default function FlowThumb() {
  return (
    <Flow fitViewOnMount fitViewPadding={16} className="h-44 w-64 border-0 bg-transparent">
      <Flow.Node id="a" position={{ x: 0, y: 40 }} className="px-3 py-2 text-sm font-medium">
        Form
      </Flow.Node>
      <Flow.Node id="b" position={{ x: 150, y: 0 }} className="px-3 py-2 text-sm font-medium">
        Verify
      </Flow.Node>
      <Flow.Node id="c" position={{ x: 150, y: 90 }} className="px-3 py-2 text-sm font-medium">
        Welcome
      </Flow.Node>
      <Flow.Edge from="a" to="b" arrow animated color="info" />
      <Flow.Edge from="a" to="c" arrow />
    </Flow>
  );
}

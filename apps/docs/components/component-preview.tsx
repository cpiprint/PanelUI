'use client';

import { RotateCcwIcon } from 'lucide-react';
import { Suspense, useCallback, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { tabIndexForKey } from './composite-keyboard';
import { WEB_DEMOS } from './web-demos/index.generated';

/**
 * A web component running on its own docs page, with the source of exactly
 * what is running one tab away.
 *
 * The app's components are shown as recordings, because they are React Native
 * and this is a website. The web collection has no such excuse: the page can
 * render the real thing, so it does, and a reader can drag it, press it and
 * resize the window to find out what it does before installing anything.
 *
 * The code is the page's child rather than a prop. It is a fenced block in the
 * generated MDX, so it is highlighted at build time with every other code block
 * on the site and arrives here already drawn.
 */

const TABS = ['preview', 'code'] as const;
type Tab = (typeof TABS)[number];
const LABELS: Record<Tab, string> = { preview: 'Preview', code: 'Code' };

export interface ComponentPreviewProps {
  /** The demo to show, as `component/demo` under `components/web-demos`. */
  name: string;
  /** Least height of the preview, in pixels. Tall demos grow past it. */
  height?: number;
  /** `start` puts the demo at the top, for one that grows downwards as it is used. */
  align?: 'center' | 'start';
  /** The highlighted source, written under the tag in MDX. */
  children?: ReactNode;
}

export function ComponentPreview({ name, height = 360, align = 'center', children }: ComponentPreviewProps) {
  const [tab, setTab] = useState<Tab>('preview');
  // Bumped to remount the demo, so one that plays once on arrival can be
  // watched again without reloading the page.
  const [run, setRun] = useState(0);
  const id = useId();
  const refs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});
  const Demo = WEB_DEMOS[name];

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = tabIndexForKey(event.key, index, TABS.length);
    if (next === undefined) return;
    event.preventDefault();
    const value = TABS[next]!;
    setTab(value);
    refs.current[value]?.focus();
  }, []);

  return (
    <div className="not-prose my-6">
      <div className="flex items-center justify-between gap-3 pb-2">
        <div role="tablist" aria-label="Preview or code" className="flex items-center gap-1">
          {TABS.map((value, index) => (
            <button
              key={value}
              ref={(node) => {
                refs.current[value] = node;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${value}`}
              aria-controls={`${id}-panel-${value}`}
              aria-selected={tab === value}
              tabIndex={tab === value ? 0 : -1}
              onClick={() => setTab(value)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                'h-8 cursor-pointer rounded-md px-3 text-sm font-medium transition-colors',
                tab === value
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {LABELS[value]}
            </button>
          ))}
        </div>
        {tab === 'preview' ? (
          <button
            type="button"
            onClick={() => setRun((current) => current + 1)}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Restart the demo"
            title="Restart the demo"
          >
            <RotateCcwIcon className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel-preview`}
        aria-labelledby={`${id}-tab-preview`}
        hidden={tab !== 'preview'}
        className={cn(
          'relative w-full overflow-hidden rounded-xl border bg-background',
          tab === 'preview' && 'flex justify-center p-6 sm:p-10',
          align === 'center' ? 'items-center' : 'items-start'
        )}
        style={{ minHeight: height }}
      >
        {Demo ? (
          // A demo is its own chunk, so there is a moment before it arrives.
          // The frame already has its height, which is what keeps the page
          // from jumping when it does.
          <Suspense fallback={null}>
            <Demo key={run} />
          </Suspense>
        ) : (
          <p className="text-sm text-muted-foreground">No demo named {name}.</p>
        )}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel-code`}
        aria-labelledby={`${id}-tab-code`}
        hidden={tab !== 'code'}
        className="[&_figure]:my-0"
      >
        {children}
      </div>
    </div>
  );
}

'use client';

import { ChevronsDownUpIcon, RotateCcwIcon } from 'lucide-react';
import { Suspense, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { WEB_DEMOS } from './web-demos/index.generated';

/**
 * A web component running on its own docs page, with the source of exactly
 * what is running directly under it, in the same frame.
 *
 * The app's components are shown as recordings, because they are React Native
 * and this is a website. The web collection has no such excuse: the page can
 * render the real thing, so it does, and a reader can drag it, press it and
 * resize the window to find out what it does before installing anything.
 *
 * The code is not behind a tab. Its first lines show under the component,
 * fading out, with a button over them that opens the rest. A reader sees that
 * the code is there and what it starts with without having asked, and the
 * component is still on screen while they read it.
 *
 * The code is the page's child rather than a prop. It is a fenced block in the
 * generated MDX, so it is highlighted at build time with every other code block
 * on the site and arrives here already drawn.
 */

export interface ComponentPreviewProps {
  /** The demo to show, as `component/demo` under `components/web-demos`. */
  name: string;
  /** Least height of the preview, in pixels. Tall demos grow past it. */
  height?: number;
  /** `start` puts the demo at the top, for one that grows downwards as it is used. */
  align?: 'center' | 'start';
  /**
   * Gives the demo the whole frame, edge to edge, with no room round it. For
   * a component that is itself a surface, such as a canvas: set in a frame
   * with a margin it is a box in a box, with nothing in the margin.
   */
  flush?: boolean;
  /** The highlighted source, written under the tag in MDX. */
  children?: ReactNode;
}

export function ComponentPreview({
  name,
  height = 360,
  align = 'center',
  flush = false,
  children,
}: ComponentPreviewProps) {
  const [open, setOpen] = useState(false);
  // Bumped to remount the demo, so one that plays once on arrival can be
  // watched again without reloading the page.
  const [run, setRun] = useState(0);
  const id = useId();
  const frame = useRef<HTMLDivElement>(null);
  const Demo = WEB_DEMOS[name];

  const close = () => {
    setOpen(false);
    // Closing takes most of the code away from under the reader, so the frame
    // is brought back into view and they are not left looking at whatever
    // came after it.
    requestAnimationFrame(() => frame.current?.scrollIntoView({ block: 'nearest' }));
  };

  return (
    <div
      ref={frame}
      data-component-preview=""
      className="not-prose my-6 scroll-mt-24 overflow-hidden rounded-2xl border bg-background"
    >
      <div
        data-preview-stage=""
        data-flush={flush ? '' : undefined}
        className={cn(
          'relative flex w-full',
          !flush && 'justify-center p-6 sm:p-10',
          !flush && (align === 'center' ? 'items-center' : 'items-start')
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
        <button
          type="button"
          onClick={() => setRun((current) => current + 1)}
          className="absolute end-2 top-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-60 transition-[opacity,background-color,color] hover:bg-muted hover:text-foreground hover:opacity-100 focus-visible:opacity-100"
          aria-label="Restart the demo"
          title="Restart the demo"
        >
          <RotateCcwIcon className="size-4" aria-hidden="true" />
        </button>
      </div>

      {children ? (
        <div className="relative border-t bg-muted/40">
          <div
            id={`${id}-code`}
            data-preview-code=""
            data-open={open ? '' : undefined}
            // Closed, the code is a picture of itself: it cannot be tabbed
            // into or selected, since most of it is not there to select.
            inert={!open}
            className={cn(
              // The code block's own chrome comes off: inside this frame it
              // would be a box in a box.
              '[&_figure]:my-0 [&_figure]:rounded-none [&_figure]:border-0 [&_figure]:bg-transparent [&_figure]:shadow-none',
              // The copy button belongs to the open code. Over five faded
              // lines it would copy a file the reader has not seen.
              !open &&
                'max-h-32 overflow-hidden [mask-image:linear-gradient(to_bottom,black_25%,transparent_95%)] [&_button]:hidden'
            )}
          >
            {children}
          </div>

          {open ? (
            <div className="flex justify-center border-t py-2">
              <button
                type="button"
                onClick={close}
                aria-expanded="true"
                aria-controls={`${id}-code`}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronsDownUpIcon className="size-4" aria-hidden="true" />
                Collapse
              </button>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-expanded="false"
                aria-controls={`${id}-code`}
                className="inline-flex h-9 cursor-pointer items-center rounded-lg border bg-background px-3.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
              >
                View Code
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { useEffect, useRef, useState } from 'react';

/**
 * The source of a web component, for copying by hand.
 *
 * It is read from the same registry item the shadcn CLI installs, when the
 * reader opens the tab it sits in. Written into the page instead, a component
 * like Planet put fifty kilobytes of highlighted source into a page most
 * readers open for the preview and the install command, and into every
 * compile of it. Fetched, the page stays small and the source shown cannot be
 * anything other than what the CLI would have written.
 */

interface RegistryFile {
  path: string;
  content: string;
}

type State =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; files: RegistryFile[] }
  | { status: 'failed' };

export function RegistrySource({ name }: { name: string }) {
  const [state, setState] = useState<State>({ status: 'idle' });
  const sentinel = useRef<HTMLDivElement>(null);
  const address = `/r/web/${name}.json`;

  useEffect(() => {
    const node = sentinel.current;
    if (!node || state.status !== 'idle') return;
    // The tab this sits in is in the page whether or not it is open. Waiting
    // until it has a box on screen is waiting until somebody opened it.
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      setState({ status: 'loading' });
      fetch(address)
        .then((response) => {
          if (!response.ok) throw new Error(String(response.status));
          return response.json() as Promise<{ files: RegistryFile[] }>;
        })
        .then((item) => setState({ status: 'ready', files: item.files }))
        .catch(() => setState({ status: 'failed' }));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [address, state.status]);

  if (state.status === 'failed') {
    return (
      <p className="text-sm text-fd-muted-foreground">
        The source could not be loaded. It is in the registry item at{' '}
        <a className="underline underline-offset-4" href={address}>
          {address}
        </a>
        .
      </p>
    );
  }

  if (state.status !== 'ready') {
    return (
      <div ref={sentinel} className="text-sm text-fd-muted-foreground" aria-live="polite">
        {state.status === 'loading' ? 'Loading the source…' : null}
      </div>
    );
  }

  return (
    <div className="not-prose flex flex-col gap-4">
      {state.files.map((file) => (
        <CodeBlock key={file.path} title={file.path} allowCopy className="m-0">
          <Pre className="max-h-[420px]">
            <code className="px-4">{file.content}</code>
          </Pre>
        </CodeBlock>
      ))}
    </div>
  );
}

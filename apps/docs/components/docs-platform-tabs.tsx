'use client';

import { GlobeIcon, SmartphoneIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { LayoutLink } from '@/components/layout-link';
import { cn } from '@/lib/utils';

/**
 * The Web / App switch at the top of the docs sidebar.
 *
 * The docs are two collections that share a site: the app library, for Expo
 * and React Native, and the web one, for React. They have different
 * components, different installation and different readers, so the sidebar
 * shows one at a time and this is how you get to the other.
 *
 * They are links, not a toggle. Each side is a different set of pages at a
 * different address, and a link can be opened in a new tab, copied and
 * bookmarked, which a button that swaps the list underneath it cannot.
 */

const TABS = [
  { href: '/docs/web', label: 'Web', icon: GlobeIcon, hint: 'React components, built on shadcn' },
  { href: '/docs', label: 'App', icon: SmartphoneIcon, hint: 'Expo and React Native' },
] as const;

/** The address prefix that belongs to the web collection. Everything else is the app's. */
const WEB_ROOT = '/docs/web';

export function isWebDocs(pathname: string): boolean {
  return pathname === WEB_ROOT || pathname.startsWith(`${WEB_ROOT}/`);
}

export function DocsPlatformTabs() {
  const web = isWebDocs(usePathname());

  return (
    <nav
      aria-label="Documentation for"
      className="flex h-10 items-center gap-1 rounded-xl border bg-muted/60 p-1 text-sm"
    >
      {TABS.map(({ href, label, icon: Icon, hint }) => {
        const active = (href === WEB_ROOT) === web;
        return (
          <LayoutLink
            key={href}
            href={href}
            // On every docs page, so prefetching it would fetch the other
            // collection's landing page once per page view.
            prefetch={false}
            aria-current={active ? 'true' : undefined}
            title={hint}
            className={cn(
              'flex h-full flex-1 items-center justify-center gap-2 rounded-lg px-3 font-medium transition-colors',
              active
                ? 'bg-background text-foreground shadow-xs dark:bg-foreground/10'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon
              className={cn('size-4 shrink-0', active && 'text-indigo-500 dark:text-indigo-400')}
              aria-hidden="true"
            />
            {label}
          </LayoutLink>
        );
      })}
    </nav>
  );
}

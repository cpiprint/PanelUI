'use client';

import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { Suspense } from 'react';
import { TiltCard } from 'panelui-web/tilt-card';
import { Button } from '@/components/ui/button';
import { CopyInstall } from '@/components/copy-install';
import { WEB_DEMOS } from './web-demos/index.generated';

/**
 * The home page's section on the web collection.
 *
 * It shows the collection with the collection: three of its components
 * running, each in one of its own Tilt Cards. A screenshot would say what the
 * components look like; this says they are real and that they move.
 *
 * The components in the cards are the small demos the Components index uses,
 * and like there they are a picture and not a control. The card is the link.
 */

const CARDS = [
  {
    slug: 'planet',
    title: 'Planet',
    body: 'The world as dots on a globe you can turn, with markers pinned to it.',
    color: 'info',
  },
  {
    slug: 'kpi',
    title: 'KPI',
    body: 'One number and what it is doing, with the same parts as in the app.',
    color: 'success',
  },
  {
    slug: 'bar-picker',
    title: 'Bar Picker',
    body: 'A short run of values as columns of lights, one column picked.',
    color: 'warning',
  },
] as const;

const INSTALL = 'npx shadcn@latest add https://panelui.dev/r/web/planet.json';

export function HomeWebSection() {
  return (
    <section className="border-t px-6 py-20" id="web">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            The same library, for the web
          </h2>
          <p className="text-lg text-muted-foreground">
            A collection of components for React, built on shadcn/ui. They read the theme your
            project already has, and you add them one at a time with the CLI you already use.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {CARDS.map((card) => {
            const Thumb = WEB_DEMOS[`${card.slug}/thumb`];
            return (
              <TiltCard key={card.slug} color={card.color} cardClassName="flex h-full flex-col">
                <div
                  aria-hidden="true"
                  inert
                  className="pointer-events-none flex h-56 items-center justify-center overflow-hidden border-b bg-muted/40 p-5"
                >
                  {Thumb ? (
                    <Suspense fallback={null}>
                      <Thumb />
                    </Suspense>
                  ) : null}
                </div>
                <TiltCard.Layer depth={8} className="flex flex-col gap-1 p-5">
                  <h3 className="font-medium">
                    <Link
                      href={`/docs/web/components/${card.slug}`}
                      className="before:absolute before:inset-0"
                    >
                      {card.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground">{card.body}</p>
                </TiltCard.Layer>
              </TiltCard>
            );
          })}
        </div>

        <div className="flex flex-col items-start gap-4">
          <CopyInstall command={INSTALL} />
          <div className="flex flex-wrap gap-3">
            <Button render={<Link href="/docs/web/components" />}>
              See the web components
              <ArrowRightIcon />
            </Button>
            <Button variant="outline" render={<Link href="/docs/web/installation" />}>
              Install for your framework
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

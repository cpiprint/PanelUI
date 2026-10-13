import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AccordionCard,
  AlertCard,
  AreaChartCard,
  AttachmentCard,
  BarChartCard,
  CalendarCard,
  ChatCard,
  ControlsCard,
  FormCard,
  KpiCard,
  OtpCard,
  PlanCard,
  ReviewCard,
  SettingsCard,
  SlidersCard,
  StepsCard,
  TableCard,
  TabsCard,
  TimelineCard,
  UsageCard,
} from './cards';
import { Themer } from './themer';

/**
 * The home page's second screen: what the components look like, what they are
 * like to use, and what changes when the theme does.
 *
 * It is a wall, the full width of the window. Five columns of cards drift
 * slowly past, each a different length and each going its own way, so the
 * section is never showing the same thing twice in a row. The moment the
 * pointer comes onto the wall, or a key reaches it, everything holds still:
 * the cards are there to be pressed, and nobody can press something that is
 * moving away from them.
 *
 * Columns of stacked cards rather than one grid of equal cells: the previews
 * are different heights by nature, and a grid would either crop them or leave
 * holes.
 */

/** One column of the wall. */
function Column({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={
        'showcase-column flex flex-col gap-5 max-lg:w-80 max-lg:flex-none max-lg:snap-center' +
        (className ? ` ${className}` : '')
      }
    >
      {children}
    </div>
  );
}

export function Showcase(): React.ReactElement {
  return (
    <section className="border-t py-16" id="showcase">
      <div className="flex w-full flex-col gap-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 px-6 text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            One import, and it already looks like this
          </h2>
          <p className="text-balance text-muted-foreground">
            Go on, press something. Then switch the theme: every component reads the same
            tokens, so the whole wall changes at once, corners included.
          </p>
        </div>

        <Themer>
          {/* Past this, a keyboard is in among sixty controls that are only a
              demonstration. One link gets it out again. */}
          <a
            href="#after-showcase"
            className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-20 focus:rounded-lg focus:border focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-sm"
          >
            Skip the component previews
          </a>
          {/*
           * Clipped to a fixed height and faded at both ends, so the columns
           * have somewhere to drift from and to. Every column is taller than
           * this box, which is what the drift travels over.
           *
           * `--wall` and `--zoom` are read by the drift in `global.css`: a
           * column travels its own height less the wall's, and the wall's
           * height has to be said in the column's own, zoomed units.
           */}
          <div className="showcase-wall relative h-[40rem] overflow-hidden [--wall:40rem] [--zoom:1] [mask-image:linear-gradient(to_bottom,transparent,#000_7%,#000_86%,transparent)] sm:h-[46rem] sm:[--wall:46rem] sm:[--zoom:0.85] min-[120rem]:[--zoom:1]">
            {/*
             * `zoom`, because these are phone components on a desktop page.
             * Every size in them is the size it is on a device — an 18px card
             * title, a 48px field — and at full scale in a narrow column that
             * reads as a phone screenshot blown up. Zoom shrinks the drawing
             * and *widens* the layout in the same move, so nothing has to be
             * restyled to fit. On a phone they are shown at the size they are.
             *
             * Below `lg` the columns do not fit side by side, so the row
             * scrolls sideways under a finger and stops on a column.
             */}
            <div className="flex items-start gap-5 px-4 [zoom:var(--zoom)] max-lg:snap-x max-lg:snap-mandatory max-lg:overflow-x-auto max-lg:[scrollbar-width:none] lg:grid lg:grid-cols-4 lg:px-5 2xl:grid-cols-5">
              <Column>
                <ControlsCard />
                <AttachmentCard />
                <TimelineCard />
                <OtpCard />
              </Column>
              <Column>
                <AreaChartCard />
                <KpiCard />
                <BarChartCard />
                <PlanCard />
              </Column>
              <Column>
                <FormCard />
                <SlidersCard />
                <AlertCard />
                <AccordionCard />
              </Column>
              <Column>
                <ChatCard />
                <CalendarCard />
                <TabsCard />
                <TableCard />
              </Column>
              {/* Room for a fifth only on a wide screen. Below `lg` it is one
                  more column to swipe to. */}
              <Column className="lg:max-2xl:hidden">
                <SettingsCard />
                <ReviewCard />
                <UsageCard />
                <StepsCard />
              </Column>
            </div>
          </div>
        </Themer>

        <div id="after-showcase" className="mx-auto flex w-full max-w-5xl scroll-mt-24 justify-center px-6">
          <Button variant="outline" render={<Link href="/docs/components" />}>
            Browse every component
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </section>
  );
}

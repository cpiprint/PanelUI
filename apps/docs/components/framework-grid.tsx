import Link from 'next/link';
import { FRAMEWORKS } from './framework-icons';

/**
 * The frameworks the web collection has an installation guide for, as cards.
 *
 * A reader arrives knowing what their project is built with and nothing else,
 * so the choice is offered as the thing they recognise, the mark, with the
 * name under it for the two or three that look alike at a glance.
 */
export function FrameworkGrid() {
  return (
    <div className="not-prose my-6 grid gap-4 sm:grid-cols-2 sm:gap-6">
      {FRAMEWORKS.map(({ slug, name, mark }) => (
        <Link
          key={slug}
          href={`/docs/web/installation/${slug}`}
          className="flex w-full flex-col items-center rounded-xl border bg-card p-6 text-card-foreground transition-colors hover:bg-accent sm:p-10"
        >
          {mark}
          <p className="mt-2 font-medium">{name}</p>
        </Link>
      ))}
    </div>
  );
}

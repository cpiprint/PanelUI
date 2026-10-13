import Link from 'next/link';
import meta from '@/scripts/meta.json';
import { getComponentThumbnail } from '@/components/component-thumbnails';
import { SECTIONS } from '@/components/gallery-sections';

/**
 * The components index: every module in the library, as a card with a picture
 * of the shape it makes.
 *
 * This is the page somebody lands on to find out whether the thing they want
 * exists, and a list of a hundred and sixteen names and one-line descriptions
 * does not answer that — the names only work if you already know what the
 * library calls things. A silhouette does: you recognise the row of chips, or
 * the sheet coming up from the bottom, before you have read the word.
 *
 * The cards come from `scripts/meta.json`, which is the same file the pages
 * and the sidebar are generated from, so a component added there appears here
 * with no second list to keep in step. A slug with no thumbnail drawn for it
 * yet gets the empty panel rather than breaking the grid.
 */

type MetaOptions = {
  group?: string;
  category?: string;
  addedIn?: string;
  updatedIn?: string;
  alpha?: boolean;
  beta?: boolean;
};
type MetaEntry = [string, string, string, MetaOptions?];

/*
 * Through `unknown`: the JSON import is inferred as a heterogeneous tuple per
 * key, which does not overlap the shared shape even though every entry has it.
 * The generator is what guarantees the shape, and this is the one place that
 * has to say so.
 */
const entries = Object.entries(meta as unknown as Record<string, MetaEntry>);

function groupOf(entry: MetaEntry): string {
  return entry[3]?.group ?? 'components';
}

function categoryOf(entry: MetaEntry): string {
  const group = groupOf(entry);
  if (group === 'charts') return 'charts';
  if (group === 'ai-components') return 'ai';
  return entry[3]?.category ?? 'layout';
}

/*
 * No status pills here.
 *
 * `alpha`, `beta`, `new` and `updated` are all statements about a component's
 * release, and this page is a picture of what each one *is*. A badge is the
 * only saturated thing on a card of greys, so it takes the eye first — which
 * puts the loudest mark on the page next to the fact a reader is least likely
 * to be looking for. The sidebar carries them, and so does the page they land
 * on; two rows above the answer is soon enough.
 */
function ComponentCard({ slug, entry }: { slug: string; entry: MetaEntry }) {
  const [title, summary] = entry;
  const href = `/docs/${groupOf(entry)}/${slug}`;
  const thumbnail = getComponentThumbnail(slug);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-fd-border bg-fd-card transition-colors hover:border-fd-primary/40">
      <div className="grid grid-rows-[auto_1fr] gap-1 p-4">
        <h3 className="text-sm font-semibold text-fd-foreground">
          {/* The whole card is the target — the link's own box is only the
              name, so it stretches over the card rather than the card
              wrapping a link and swallowing the heading semantics. */}
          <Link href={href} className="before:absolute before:inset-0">
            {title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-fd-muted-foreground sm:h-[2lh]">
          {summary}
        </p>
      </div>

      {/*
        `pointer-events-none`: the wireframe is a picture of a control, not a
        control, and a thumbnail that reacts to a cursor is a thumbnail people
        try to press.
      */}
      <div className="pointer-events-none relative flex min-h-44 flex-1 items-center justify-center overflow-hidden border-t border-fd-border bg-fd-muted/40 px-6 py-6">
        {thumbnail}
      </div>
    </div>
  );
}

export function ComponentGallery() {
  return (
    <div className="not-prose flex flex-col gap-12">
      {SECTIONS.map(([category, heading, lede]) => {
        const section = entries
          .filter(([, entry]) => categoryOf(entry) === category)
          .sort(([, a], [, b]) => a[0].localeCompare(b[0]));
        if (section.length === 0) return null;

        return (
          <section key={category} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2
                id={category}
                className="scroll-m-20 text-xl font-semibold text-fd-foreground"
              >
                {heading}
              </h2>
              <p className="text-sm text-fd-muted-foreground">{lede}</p>
            </div>
            {/* Four across at the top width. The card is a name, two lines of
                description and a silhouette — none of which needs a third of
                the page — and four to a row is what lets a section be taken in
                without scrolling through it. */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {section.map(([slug, entry]) => (
                <ComponentCard key={slug} slug={slug} entry={entry} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

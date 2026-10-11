/**
 * Where things sit once something else is drawn over the map.
 *
 * A map that fills the screen usually has chrome on top of it: a card of
 * figures along the top, a summary along the bottom, the status bar, a
 * floating tab bar. The controls belong in a corner, and a corner is exactly
 * where that chrome goes, so left alone they end up underneath it.
 *
 * Everything drawn over the map therefore says how far in from its edge it
 * reaches, and the controls take the largest claim on their corner and sit
 * past it. This file is that arithmetic and nothing else, kept apart from the
 * views so it can be checked without a device.
 */

export type MapCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/** A band across the whole of one edge, or a single corner. */
export type MapOverlayPosition = 'top' | 'bottom' | MapCorner;

/** A distance from each edge of the map, in points. */
export interface MapInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** One number for every side, or only the sides that need one. */
export type MapInsetsInput = number | Partial<MapInsets>;

/** What one overlay takes: where it is, and how far in from that edge it reaches. */
export interface MapReservation {
  position: MapOverlayPosition;
  /** Points from the map's top or bottom edge to the overlay's far side. */
  extent: number;
}

/** The style offsets that pin a view: one vertical side and, for a corner, one horizontal. */
export type MapOffsets = Partial<MapInsets>;

/** A negative or missing inset is no inset. A view pushed off the map helps nobody. */
function clean(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

/** Expands the `inset` shorthand to four sides. */
export function toMapInsets(inset: MapInsetsInput | undefined): MapInsets {
  if (typeof inset === 'number') {
    const value = clean(inset);
    return { top: value, right: value, bottom: value, left: value };
  }
  return {
    top: clean(inset?.top),
    right: clean(inset?.right),
    bottom: clean(inset?.bottom),
    left: clean(inset?.left),
  };
}

/** Two sets of insets, side by side. */
export function addMapInsets(a: MapInsets, b: MapInsets): MapInsets {
  return {
    top: a.top + b.top,
    right: a.right + b.right,
    bottom: a.bottom + b.bottom,
    left: a.left + b.left,
  };
}

/** The corners a position covers. A band covers both corners of its edge. */
export function cornersOf(position: MapOverlayPosition): MapCorner[] {
  if (position === 'top') return ['top-left', 'top-right'];
  if (position === 'bottom') return ['bottom-left', 'bottom-right'];
  return [position];
}

/** The furthest any overlay reaches into a corner. 0 when nothing is there. */
export function reservedAt(
  corner: MapCorner,
  reservations: Iterable<MapReservation>
): number {
  let reserved = 0;
  for (const { position, extent } of reservations) {
    if (extent > reserved && cornersOf(position).includes(corner)) reserved = extent;
  }
  return reserved;
}

/**
 * Where an overlay is pinned, and how far it reaches once it has a height.
 *
 * A band is pinned on three sides so it spans the map between its insets. A
 * corner is pinned on two and is as wide as what is inside it.
 */
export function overlayOffsets(position: MapOverlayPosition, inset: MapInsets): MapOffsets {
  const vertical = position.startsWith('top') ? { top: inset.top } : { bottom: inset.bottom };
  if (position === 'top' || position === 'bottom') {
    return { ...vertical, left: inset.left, right: inset.right };
  }
  return position.endsWith('left')
    ? { ...vertical, left: inset.left }
    : { ...vertical, right: inset.right };
}

/**
 * The reservation an overlay makes once it has been measured.
 *
 * Nothing until it has a height. An overlay that is empty, or has not been
 * laid out yet, would otherwise claim its inset alone and nudge the controls
 * by a gap for a frame before moving them to where they belong.
 */
export function overlayReservation(
  position: MapOverlayPosition,
  inset: MapInsets,
  height: number
): MapReservation | null {
  if (clean(height) === 0) return null;
  const edge = position.startsWith('top') ? inset.top : inset.bottom;
  return { position, extent: edge + height };
}

/**
 * The distance a part keeps from each edge of the map.
 *
 * `inset` means the same thing on `Map.Controls` and `Map.Overlay`: how far
 * from the edge, with the standard gap on any side it leaves out. The safe
 * area is added on top, because a card 12 points from the edge of the screen
 * and a card 12 points below the status bar are both "12 points in" to the
 * person looking at them.
 */
export function resolveMapInsets(
  inset: MapInsetsInput | undefined,
  gap: number,
  safeArea: MapInsets
): MapInsets {
  const own =
    typeof inset === 'number'
      ? toMapInsets(inset)
      : toMapInsets({
          top: inset?.top ?? gap,
          right: inset?.right ?? gap,
          bottom: inset?.bottom ?? gap,
          left: inset?.left ?? gap,
        });
  return addMapInsets(own, toMapInsets(safeArea));
}

/**
 * Where a control stack in `corner` goes.
 *
 * `inset` is the stack's own distance from the map's edges. `reserved` is what
 * an overlay has taken from the same edge, and the stack sits one `gap` past
 * it. The two are not added: an overlay that already clears the status bar has
 * cleared it for the controls too, so whichever reaches further decides.
 */
export function controlsOffsets(
  corner: MapCorner,
  { gap, inset, reserved }: { gap: number; inset: MapInsets; reserved: number }
): MapOffsets {
  const top = corner.startsWith('top');
  const left = corner.endsWith('left');
  const past = clean(reserved) > 0 ? clean(reserved) + gap : 0;
  const vertical = Math.max(top ? inset.top : inset.bottom, past);
  const horizontal = left ? inset.left : inset.right;
  return {
    ...(top ? { top: vertical } : { bottom: vertical }),
    ...(left ? { left: horizontal } : { right: horizontal }),
  };
}

/** Total vertical space reserved above the home indicator for the floating tab bar + FAB. */
export const FLOATING_TAB_BAR_CLEARANCE = 108;

/** Height of the tab bar's icon/label row, excluding the bottom safe-area inset. */
export const TAB_BAR_HEIGHT = 64;
/**
 * Fully rounded (half the bar's height) — the bar is inset from the screen edges by
 * ModernTabBar's horizontal padding, so it reads as a floating pill rather than a
 * docked native bar. Derived from TAB_BAR_HEIGHT so the capsule shape always closes.
 */
export const TAB_BAR_RADIUS = TAB_BAR_HEIGHT / 2;

export const FAB_SIZE = 56;
/**
 * How far the FAB rises above the tab bar's top edge. Roughly half its own height so
 * it clearly reads as a floating button sitting on top of the bar, not a bump
 * embedded in it.
 */
export const FAB_ELEVATION = 30;

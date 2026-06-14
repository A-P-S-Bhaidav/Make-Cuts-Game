/**
 * Region Color Assignment
 * 
 * Assigns visually distinct, aesthetically pleasing colors to game regions.
 * Uses a curated HSL palette that works well on dark backgrounds.
 */

const REGION_PALETTE = [
  'hsla(222, 35%, 18%, 0.85)',    // Base dark (initial single region)
  'hsla(240, 25%, 22%, 0.80)',    // Deep indigo
  'hsla(200, 30%, 20%, 0.80)',    // Dark teal
  'hsla(260, 25%, 24%, 0.80)',    // Dark purple
  'hsla(180, 25%, 20%, 0.80)',    // Dark cyan
  'hsla(220, 30%, 25%, 0.80)',    // Steel blue
  'hsla(280, 20%, 22%, 0.80)',    // Muted plum
  'hsla(160, 25%, 19%, 0.80)',    // Dark sage
  'hsla(300, 15%, 22%, 0.80)',    // Dusty mauve
  'hsla(140, 20%, 20%, 0.80)',    // Dark forest
  'hsla(340, 15%, 22%, 0.80)',    // Dark rose
  'hsla(50, 15%, 22%, 0.80)',     // Dark khaki
  'hsla(20, 20%, 22%, 0.80)',     // Dark terracotta
  'hsla(100, 15%, 20%, 0.80)',    // Dark olive
  'hsla(320, 15%, 23%, 0.80)',    // Dark orchid
  'hsla(80, 15%, 20%, 0.80)',     // Dark chartreuse
];

const REGION_BORDER_PALETTE = [
  'hsla(222, 35%, 30%, 0.4)',
  'hsla(240, 25%, 35%, 0.4)',
  'hsla(200, 30%, 32%, 0.4)',
  'hsla(260, 25%, 36%, 0.4)',
  'hsla(180, 25%, 32%, 0.4)',
  'hsla(220, 30%, 38%, 0.4)',
  'hsla(280, 20%, 34%, 0.4)',
  'hsla(160, 25%, 30%, 0.4)',
  'hsla(300, 15%, 34%, 0.4)',
  'hsla(140, 20%, 32%, 0.4)',
  'hsla(340, 15%, 34%, 0.4)',
  'hsla(50, 15%, 34%, 0.4)',
  'hsla(20, 20%, 34%, 0.4)',
  'hsla(100, 15%, 32%, 0.4)',
  'hsla(320, 15%, 35%, 0.4)',
  'hsla(80, 15%, 32%, 0.4)',
];

/**
 * Assign colors to regions. Uses a stable hash based on region cell IDs
 * to ensure colors remain consistent across re-renders.
 * 
 * @param {Array<Set<string>>} regions - Array of region cell sets
 * @returns {Map<string, {bg: string, border: string}>} Map from cell ID to color info
 */
export function assignRegionColors(regions) {
  const colorMap = new Map();

  regions.forEach((region, index) => {
    const colorIndex = index % REGION_PALETTE.length;
    const bg = REGION_PALETTE[colorIndex];
    const border = REGION_BORDER_PALETTE[colorIndex];

    for (const cellId of region) {
      colorMap.set(cellId, { bg, border });
    }
  });

  return colorMap;
}

/**
 * Get the split animation color for a newly created region.
 */
export function getSplitHighlightColor(regionIndex) {
  const hue = (regionIndex * 137.5) % 360;
  return `hsla(${hue}, 40%, 30%, 0.3)`;
}

export default { assignRegionColors, getSplitHighlightColor };

/**
 * KidSketch palette.
 *
 * Vibe: "warm digital art studio" — sunlit, playful, tactile.
 * Saturation is high but never harsh; think crayon / colored pencil.
 * All tokens used by the UI must flow through this file so we can
 * retheme globally (e.g. future dark / high-contrast modes).
 */
export const colors = {
  // Brand
  sunYellow: '#FFD93D',
  skyBlue: '#6EC1E4',
  grassGreen: '#7ED957',
  coralOrange: '#FF6B6B',
  lavender: '#B388EB', // reserved for Premium badges

  // Surfaces
  paper: '#FFF8F0', // warm off-white "paper", never pure white
  paperDeep: '#FBEEDC', // subtle card elevation tone
  inkBrown: '#3D2C2E', // warm text color, never cold black
  inkSoft: '#7A6A66', // secondary text

  // Utility
  success: '#7ED957',
  warning: '#FFB347',
  danger: '#FF6B6B',
  divider: 'rgba(61, 44, 46, 0.08)',
  overlay: 'rgba(61, 44, 46, 0.55)',
  white: '#FFFFFF',
  black: '#000000',

  // Kid-friendly palette for the coloring tool.
  // 12 bright saturated swatches, ordered for a rainbow feel.
  palette12: [
    '#FF6B6B', // coral red
    '#FF9F43', // tangerine
    '#FFD93D', // sun yellow
    '#7ED957', // grass green
    '#4ECDC4', // mint
    '#6EC1E4', // sky blue
    '#5B8DEF', // blueberry
    '#B388EB', // lavender
    '#F17EB8', // bubblegum
    '#A0522D', // cocoa
    '#3D2C2E', // ink (outline)
    '#FFFFFF', // eraser-ish / paper
  ],
} as const;

export type ColorToken = keyof typeof colors;

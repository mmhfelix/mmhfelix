export { colors } from './colors';
export { typography, fontFamily } from './typography';
export { spacing, radius, touch, shadow } from './spacing';

/**
 * Convenience aggregate — import `theme` when you want the whole bundle
 * (common in screen files); import the specific token file when you
 * only need one group (keeps tree-shaking friendly for utility libs).
 */
import { colors } from './colors';
import { typography, fontFamily } from './typography';
import { spacing, radius, touch, shadow } from './spacing';

export const theme = {
  colors,
  typography,
  fontFamily,
  spacing,
  radius,
  touch,
  shadow,
} as const;

export type Theme = typeof theme;

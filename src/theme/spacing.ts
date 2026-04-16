/**
 * 4-pt base spacing grid. All paddings/margins in the UI must use these
 * tokens so touch targets scale predictably.
 *
 * Kid-friendly minimums:
 *  - minTouch = 56: Apple's HIG floor is 44, but we use 56 so small
 *    hands reliably hit a target.
 *  - radius.lg / xl used for cards + primary buttons to keep everything
 *    soft and pebble-like.
 */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const touch = {
  minTouch: 56,
  toolButton: 64,
} as const;

export const shadow = {
  card: {
    shadowColor: '#3D2C2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  floating: {
    shadowColor: '#3D2C2E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

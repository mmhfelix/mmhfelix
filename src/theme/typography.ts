import { TextStyle } from 'react-native';

/**
 * Typography tokens.
 *
 * We reference Baloo 2 / Quicksand for display and Nunito for body.
 * Fonts are loaded lazily in `app/_layout.tsx`; if a font is still
 * loading we fall back to the platform default so first paint never
 * blocks on font download.
 */
export const fontFamily = {
  display: 'Baloo2_700Bold',
  displayRegular: 'Baloo2_500Medium',
  body: 'Nunito_600SemiBold',
  bodyRegular: 'Nunito_400Regular',
} as const;

type Variant =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodyBold'
  | 'caption'
  | 'button';

export const typography: Record<Variant, TextStyle> = {
  // Hero copy on home / onboarding.
  display: {
    fontFamily: fontFamily.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 24,
    lineHeight: 30,
  },
  heading: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 16,
    lineHeight: 22,
  },
  bodyBold: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  // Buttons get a dedicated style so touch targets feel chunky.
  button: {
    fontFamily: fontFamily.body,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
};

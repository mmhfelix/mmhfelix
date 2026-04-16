import { colors } from '@/theme';

/**
 * The 5 kid-friendly coloring-page styles. `prompt` is the canonical
 * instruction we forward to the AI provider. `model` is an indirection
 * so we can swap between Replicate / Stability per-style later
 * (e.g. pixel art performs best on a different checkpoint).
 */
export type StylePresetId =
  | 'simple-lines'
  | 'cartoon-doodle'
  | 'storybook'
  | 'pixel-adventure'
  | 'color-by-number';

export type StylePreset = {
  id: StylePresetId;
  label: string;
  subtitle: string;
  emoji: string;
  tint: string;
  /** Minimum age the style is designed for. */
  ageMin: number;
  prompt: string;
  model: 'sketch' | 'pixel' | 'cbn';
};

export const STYLE_PRESETS: readonly StylePreset[] = [
  {
    id: 'simple-lines',
    label: 'Simple Lines',
    subtitle: 'Thick lines, big zones · ages 3-5',
    emoji: '✏️',
    tint: colors.sunYellow,
    ageMin: 3,
    prompt:
      'Convert to a children coloring page with very thick bold black outlines, large fillable regions, no shading, pure white background, minimal detail.',
    model: 'sketch',
  },
  {
    id: 'cartoon-doodle',
    label: 'Cartoon Doodle',
    subtitle: 'Round & cute',
    emoji: '🐻',
    tint: colors.coralOrange,
    ageMin: 4,
    prompt:
      'Convert to a cute cartoon doodle coloring page, rounded shapes, playful expressions, medium-thick outlines, pure white background.',
    model: 'sketch',
  },
  {
    id: 'storybook',
    label: 'Storybook',
    subtitle: 'Picture-book detail',
    emoji: '📖',
    tint: colors.grassGreen,
    ageMin: 6,
    prompt:
      'Convert to a picture-book style coloring page, moderate detail, clean outlines, whimsical composition, pure white background.',
    model: 'sketch',
  },
  {
    id: 'pixel-adventure',
    label: 'Pixel Adventure',
    subtitle: 'Retro game vibes',
    emoji: '🎮',
    tint: colors.skyBlue,
    ageMin: 6,
    prompt:
      'Convert to a 16-bit pixel art coloring page with visible pixel grid cells, black outlines around pixel clusters, white background.',
    model: 'pixel',
  },
  {
    id: 'color-by-number',
    label: 'By Numbers',
    subtitle: 'Follow the numbers',
    emoji: '🔢',
    tint: colors.lavender,
    ageMin: 7,
    prompt:
      'Convert to a color-by-number coloring page, each region outlined and labeled with a small number 1-12 indicating palette color, clean black outlines, pure white background.',
    model: 'cbn',
  },
];

export function findPreset(id: StylePresetId): StylePreset {
  const preset = STYLE_PRESETS.find((p) => p.id === id);
  if (!preset) {
    // We never expect this at runtime; hard-fail so the bug is loud.
    throw new Error(`Unknown style preset: ${id}`);
  }
  return preset;
}

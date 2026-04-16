import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, radius, shadow, spacing } from '@/theme';
import type { StylePreset } from '@/constants/styles';

import { Txt } from './Txt';

type Props = {
  preset: StylePreset;
  selected?: boolean;
  onPress: (preset: StylePreset) => void;
};

/**
 * A single tile in the "pick a style" grid.
 *
 * Selection state uses a thick accent border plus a lift shadow, so
 * the affordance is legible at a glance and works for kids who can't
 * yet read the caption.
 */
export function StyleCard({ preset, selected = false, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={preset.label}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress(preset);
      }}
      style={({ pressed }) => [
        styles.root,
        { backgroundColor: preset.tint },
        selected && {
          borderColor: colors.inkBrown,
          borderWidth: 3,
          ...shadow.floating,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.emojiRow}>
        <Txt variant="display" style={styles.emoji}>
          {preset.emoji}
        </Txt>
      </View>
      <Txt variant="heading" center style={styles.label}>
        {preset.label}
      </Txt>
      <Txt variant="caption" center color={colors.inkSoft}>
        {preset.subtitle}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: 'transparent',
    minHeight: 180,
    ...shadow.card,
  },
  emojiRow: { alignItems: 'center', marginBottom: spacing.sm },
  emoji: { fontSize: 56, lineHeight: 64 },
  label: { marginBottom: spacing.xxs },
  pressed: { transform: [{ scale: 0.97 }] },
});

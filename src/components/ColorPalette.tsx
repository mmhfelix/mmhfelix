import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, radius, shadow, spacing, touch } from '@/theme';

type Props = {
  value: string;
  onChange: (color: string) => void;
  /** Additional swatches appended after the stock 12. */
  extras?: readonly string[];
};

/**
 * Horizontal rainbow palette with 12 fixed swatches. We intentionally
 * keep the list short and ordered so parents can say "tap the red
 * one" and the position is predictable every time.
 */
export function ColorPalette({ value, onChange, extras = [] }: Props) {
  const swatches = [...colors.palette12, ...extras];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {swatches.map((c, idx) => {
        const selected = value.toLowerCase() === c.toLowerCase();
        return (
          <Pressable
            key={`${c}-${idx}`}
            accessibilityRole="button"
            accessibilityLabel={`Color ${c}`}
            onPress={() => {
              void Haptics.selectionAsync();
              onChange(c);
            }}
            style={({ pressed }) => [
              styles.swatch,
              { backgroundColor: c },
              selected && styles.selected,
              pressed && styles.pressed,
            ]}
          >
            {/* A white inner ring keeps the selection halo legible
                regardless of the underlying swatch color. */}
            {selected ? <View style={styles.innerRing} /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  swatch: {
    width: touch.minTouch,
    height: touch.minTouch,
    borderRadius: radius.pill,
    marginHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: 'rgba(61, 44, 46, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  selected: {
    borderColor: colors.inkBrown,
    borderWidth: 4,
    transform: [{ scale: 1.08 }],
  },
  pressed: { transform: [{ scale: 0.92 }] },
  innerRing: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.inkBrown,
  },
});

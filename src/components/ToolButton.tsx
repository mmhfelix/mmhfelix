import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, radius, shadow, touch } from '@/theme';

import { Txt } from './Txt';

type Props = {
  glyph: string;
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
};

/**
 * Big round canvas tool (undo, redo, eraser, brush, fill).
 *
 * Size is touch.toolButton (64) — larger than minTouch — because these
 * buttons live clustered together on the canvas and we want clear
 * spacing tolerance for small fingers.
 */
export function ToolButton({
  glyph,
  label,
  onPress,
  active = false,
  disabled = false,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
      onPress={() => {
        if (disabled) return;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.root,
        active && styles.active,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.inner}>
        <Txt variant="title" center>
          {glyph}
        </Txt>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: touch.toolButton,
    height: touch.toolButton,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadow.card,
  },
  inner: { alignItems: 'center', justifyContent: 'center' },
  active: {
    backgroundColor: colors.sunYellow,
    borderColor: colors.inkBrown,
  },
  disabled: { opacity: 0.35 },
  pressed: { transform: [{ scale: 0.94 }] },
});

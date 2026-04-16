import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, radius, spacing, touch, typography, shadow } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  /** Disable haptic feedback — rare (e.g. inside a list row). */
  silent?: boolean;
  testID?: string;
};

/**
 * The one button we use everywhere.
 *
 * Design choices:
 *  - minHeight = touch.minTouch (56) to satisfy the kid-friendly floor.
 *  - Every press fires a Light haptic by default; kids love the buzz
 *    and it also doubles as confirmation when audio is muted.
 *  - Variants cover the 4 real tones we use; anything else should
 *    become a dedicated component rather than a new variant.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  silent = false,
  testID,
}: Props) {
  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    if (!silent) {
      // Fire-and-forget; haptics should never block the press callback.
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [disabled, loading, onPress, silent]);

  const palette = getPalette(variant, disabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border },
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        variant === 'primary' && !disabled && shadow.card,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={palette.fg} />
        ) : (
          <>
            {icon ? <View style={styles.icon}>{icon}</View> : null}
            <Text style={[typography.button, { color: palette.fg }]}>
              {label}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

function getPalette(variant: Variant, disabled: boolean) {
  if (disabled) {
    return { bg: colors.divider, fg: colors.inkSoft, border: 'transparent' };
  }
  switch (variant) {
    case 'primary':
      return { bg: colors.sunYellow, fg: colors.inkBrown, border: 'transparent' };
    case 'secondary':
      return {
        bg: colors.paper,
        fg: colors.inkBrown,
        border: colors.inkBrown,
      };
    case 'ghost':
      return { bg: 'transparent', fg: colors.inkBrown, border: 'transparent' };
    case 'danger':
      return { bg: colors.coralOrange, fg: colors.white, border: 'transparent' };
  }
}

const styles = StyleSheet.create({
  base: {
    minHeight: touch.minTouch,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { transform: [{ scale: 0.97 }] },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { marginRight: spacing.sm },
});

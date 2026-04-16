import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing } from '@/theme';

type Props = ViewProps & {
  padded?: boolean;
  tone?: 'paper' | 'deep';
  style?: ViewStyle;
};

/**
 * The default surface. Always rounded and always casts a soft, warm
 * shadow so cards feel like hand-cut pieces of craft paper.
 */
export function Card({
  padded = true,
  tone = 'paper',
  style,
  children,
  ...rest
}: Props) {
  return (
    <View
      {...rest}
      style={[
        styles.base,
        {
          backgroundColor: tone === 'paper' ? colors.white : colors.paperDeep,
        },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    ...shadow.card,
  },
  padded: { padding: spacing.lg },
});

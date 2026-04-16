import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Txt } from './Txt';

/**
 * The lavender "PRO" pill we stamp onto premium-only affordances.
 * Kept as its own component so a change to the paywall branding
 * propagates everywhere.
 */
export function PremiumBadge() {
  return (
    <View style={styles.root}>
      <Txt variant="caption" color={colors.white} style={styles.text}>
        PRO
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.lavender,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, letterSpacing: 1, fontWeight: '700' },
});

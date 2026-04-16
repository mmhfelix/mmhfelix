import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  /** Let a child (e.g. a full-bleed canvas) paint edge-to-edge. */
  edgeToEdge?: boolean;
};

/**
 * Screen wrapper — enforces paper background, safe area insets, and
 * consistent horizontal gutter so individual screens don't have to
 * remember these rules.
 */
export function Screen({
  children,
  scroll = false,
  padded = true,
  edgeToEdge = false,
  style,
}: Props) {
  const content = (
    <View
      style={[
        styles.inner,
        padded && !edgeToEdge && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={edgeToEdge ? ['top'] : undefined}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  inner: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.xxxl },
});

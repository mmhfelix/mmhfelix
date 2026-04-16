import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { Txt } from './Txt';

type Props = {
  /** Large emoji / glyph that plays the role of the error mascot. */
  emoji: string;
  title: string;
  caption?: string;
  action?: React.ReactNode;
};

/**
 * Empty + error states.
 *
 * Per the design spec we *never* show raw error text to kids. We always
 * express the problem through an illustrative glyph + friendly copy
 * aimed at the parent, with an optional recovery button.
 */
export function EmptyState({ emoji, title, caption, action }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.mascot}>
        <Txt variant="display" style={styles.emoji}>
          {emoji}
        </Txt>
      </View>
      <Txt variant="title" center>
        {title}
      </Txt>
      {caption ? (
        <Txt variant="body" center color={colors.inkSoft} style={styles.caption}>
          {caption}
        </Txt>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  mascot: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.paperDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emoji: { fontSize: 64, lineHeight: 72 },
  caption: { marginTop: spacing.sm, maxWidth: 280 },
  action: { marginTop: spacing.xl },
});

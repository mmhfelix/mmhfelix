import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, View, Easing } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Txt } from './Txt';

type Props = {
  visible: boolean;
  caption?: string;
};

/**
 * Full-screen "AI is drawing..." overlay.
 *
 * We use a bouncing trio of dots rather than a spinner because an
 * indeterminate spinner feels cold; bouncing dots read as a character
 * thinking, which matches the "warm studio" vibe.
 */
export function LoadingOverlay({ visible, caption = 'Drawing your picture…' }: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Dots />
          <Txt variant="bodyBold" center style={styles.caption}>
            {caption}
          </Txt>
        </View>
      </View>
    </Modal>
  );
}

function Dots() {
  const anims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = anims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 120),
          Animated.timing(a, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(a, {
            toValue: 0,
            duration: 420,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [anims]);

  const tones = [colors.coralOrange, colors.sunYellow, colors.skyBlue];

  return (
    <View style={styles.dots}>
      {anims.map((a, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: tones[i] ?? colors.sunYellow,
              transform: [
                {
                  translateY: a.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -14],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.paper,
    padding: spacing.xl,
    borderRadius: radius.xl,
    minWidth: 240,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    height: 32,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginHorizontal: 6,
  },
  caption: { marginTop: spacing.xs },
});

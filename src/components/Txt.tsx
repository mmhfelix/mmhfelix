import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

import { colors, typography } from '@/theme';

type Variant = keyof typeof typography;

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  center?: boolean;
  style?: TextStyle;
};

/**
 * Typography primitive.
 *
 * Keeping a single component for all text means we can retheme
 * (e.g. bump font size for accessibility) from one place.
 */
export function Txt({
  variant = 'body',
  color = colors.inkBrown,
  center,
  style,
  children,
  ...rest
}: Props) {
  return (
    <Text
      {...rest}
      style={[
        typography[variant],
        { color },
        center && { textAlign: 'center' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

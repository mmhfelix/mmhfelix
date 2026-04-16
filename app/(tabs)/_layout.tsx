import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { colors, radius, shadow, spacing, touch } from '@/theme';

/**
 * Four bottom tabs — 🏠 Home / 📸 New / 🎨 Color / 👤 Me.
 *
 * We avoid library icon packs for MVP so that first install doesn't
 * require vector-icon native linking; emoji give us a zero-config,
 * universally-legible affordance kids can point at.
 */
const TABS: Array<{
  name: string;
  label: string;
  glyph: string;
}> = [
  { name: 'index', label: 'Home', glyph: '🏠' },
  { name: 'create', label: 'New', glyph: '📸' },
  { name: 'color', label: 'Color', glyph: '🎨' },
  { name: 'profile', label: 'Me', glyph: '👤' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.bar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.inkBrown,
        tabBarInactiveTintColor: colors.inkSoft,
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            tabBarAccessibilityLabel: t.label,
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} tab={t} />,
          }}
        />
      ))}
    </Tabs>
  );
}

function TabIcon({
  focused,
  tab,
}: {
  focused: boolean;
  tab: { label: string; glyph: string };
}) {
  return (
    <View style={[styles.item, focused && styles.itemActive]}>
      <Txt variant="heading" style={{ fontSize: focused ? 30 : 26 }}>
        {tab.glyph}
      </Txt>
      <Txt variant="caption" color={focused ? colors.inkBrown : colors.inkSoft}>
        {tab.label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 0,
    height: 84,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    ...shadow.floating,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: touch.minTouch,
    minHeight: touch.minTouch,
    paddingHorizontal: spacing.sm,
  },
  itemActive: {
    transform: [{ translateY: -2 }],
  },
});

import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

import { useSettingsStore } from '@/store/settings';
import { colors, radius, spacing } from '@/theme';

/**
 * Parental controls modal.
 *
 * Daily time limit is a single chip-row (0 / 15 / 30 / 60 min) rather
 * than a stepper because chips are less error-prone for parents to
 * tap in one shot.
 */
const LIMIT_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: 'Off', value: null },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
];

export default function ParentalScreen() {
  const settings = useSettingsStore();
  const [limit, setLimit] = useState<number | null>(settings.dailyTimeLimitMin);

  function handleSave() {
    useSettingsStore.getState().setDailyTimeLimit(limit);
    router.back();
  }

  return (
    <Screen scroll>
      <Txt variant="display" style={styles.title}>
        Grown-up controls
      </Txt>

      <Card style={styles.section}>
        <Txt variant="heading" style={{ marginBottom: spacing.sm }}>
          Daily time limit
        </Txt>
        <Txt variant="body" color={colors.inkSoft} style={{ marginBottom: spacing.md }}>
          When the limit is reached, KidSketch locks until tomorrow.
        </Txt>
        <View style={styles.chipRow}>
          {LIMIT_OPTIONS.map((opt) => {
            const active = limit === opt.value;
            return (
              <Pressable
                key={opt.label}
                onPress={() => setLimit(opt.value)}
                style={({ pressed }) => [
                  styles.chip,
                  active && styles.chipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Txt variant="bodyBold" color={active ? colors.inkBrown : colors.inkSoft}>
                  {opt.label}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.section}>
        <Txt variant="heading" style={{ marginBottom: spacing.sm }}>
          Safety
        </Txt>
        <Txt variant="body" color={colors.inkSoft}>
          • NSFW content filter is always on for every photo.{'\n'}
          • KidSketch has no external links or chat features.{'\n'}
          • We don&apos;t show ads and never share data with third parties.{'\n'}
          • Compliant with COPPA and the Apple Family Sharing guidelines.
        </Txt>
      </Card>

      <Button
        label="Save"
        onPress={handleSave}
        fullWidth
        style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xl, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.divider,
    backgroundColor: colors.white,
  },
  chipActive: {
    borderColor: colors.inkBrown,
    backgroundColor: colors.sunYellow,
  },
  pressed: { opacity: 0.7 },
});

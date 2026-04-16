import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StyleCard } from '@/components/StyleCard';
import { PremiumBadge } from '@/components/PremiumBadge';

import { STYLE_PRESETS, StylePreset } from '@/constants/styles';
import { themeOfTheDay } from '@/constants/dailyThemes';
import { colors, spacing, radius } from '@/theme';
import { useQuota } from '@/hooks/useQuota';
import { track, AnalyticsEvents } from '@/services/analytics';

/**
 * Home tab.
 *
 * Two main jobs:
 *  1. Promote today's daily theme (habit-loop engine).
 *  2. Let the parent pick a style *before* picking a photo — we keep
 *     style selection upstream of image capture so the camera viewfinder
 *     can show the right live preview once we wire it up.
 */
export default function HomeScreen() {
  const daily = useMemo(() => themeOfTheDay(), []);
  const [selected, setSelected] = useState<StylePreset>(STYLE_PRESETS[0]!);
  const { canTransform, remaining, isPro } = useQuota();

  const pairs = useMemo(() => pairwise(STYLE_PRESETS), []);

  const handleStart = () => {
    track(AnalyticsEvents.StyleSelected, { style_id: selected.id });
    router.push({ pathname: '/(tabs)/create', params: { styleId: selected.id } });
  };

  const handleDaily = () => {
    track(AnalyticsEvents.DailyThemeOpened, { theme_id: daily.id });
    router.push({
      pathname: '/result',
      params: { themeId: daily.id, source: 'daily' },
    });
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Txt variant="caption" color={colors.inkSoft}>
          Hello, little artist!
        </Txt>
        <Txt variant="display">Let&apos;s make something today</Txt>
      </View>

      {/* Daily theme promo — full-bleed card with a playful tint. */}
      <Card
        tone="deep"
        style={[styles.daily, { backgroundColor: daily.tint + '40' }]}
      >
        <View style={styles.dailyRow}>
          <Txt style={styles.dailyEmoji}>{daily.emoji}</Txt>
          <View style={{ flex: 1 }}>
            <Txt variant="caption" color={colors.inkSoft}>
              Theme of the day
            </Txt>
            <Txt variant="title">{daily.title}</Txt>
            <Txt variant="body" color={colors.inkSoft}>
              {daily.tagline}
            </Txt>
          </View>
        </View>
        <Button
          label="Start coloring"
          onPress={handleDaily}
          fullWidth
          style={{ marginTop: spacing.md }}
        />
      </Card>

      {/* Quota hint — nudges Free users toward Pro without scolding kids. */}
      <View style={styles.quotaRow}>
        <Txt variant="caption" color={colors.inkSoft}>
          {isPro
            ? 'Pro · unlimited transforms'
            : `${remaining} free photo${remaining === 1 ? '' : 's'} today`}
        </Txt>
        {!isPro && remaining <= 1 ? (
          <Button
            label="Unlock all"
            variant="ghost"
            onPress={() => router.push('/paywall')}
            style={{ paddingHorizontal: spacing.sm, minHeight: 36 }}
          />
        ) : null}
      </View>

      <Txt variant="heading" style={styles.sectionLabel}>
        Pick a style
      </Txt>

      {pairs.map((row, idx) => (
        <View key={idx} style={styles.row}>
          {row.map((preset) => (
            <View key={preset.id} style={styles.cell}>
              <StyleCard
                preset={preset}
                selected={selected.id === preset.id}
                onPress={setSelected}
              />
              {preset.id === 'color-by-number' ? (
                <View style={styles.badge}>
                  <PremiumBadge />
                </View>
              ) : null}
            </View>
          ))}
          {row.length === 1 ? <View style={styles.cell} /> : null}
        </View>
      ))}

      <View style={styles.cta}>
        <Button
          label={canTransform ? 'Take a photo' : 'Get unlimited'}
          onPress={canTransform ? handleStart : () => router.push('/paywall')}
          fullWidth
        />
      </View>
    </Screen>
  );
}

function pairwise<T>(items: readonly T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    out.push(items.slice(i, i + 2));
  }
  return out;
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xl, paddingBottom: spacing.lg },
  daily: { marginBottom: spacing.lg, borderRadius: radius.xl },
  dailyRow: { flexDirection: 'row', alignItems: 'center' },
  dailyEmoji: { fontSize: 56, marginRight: spacing.md },
  quotaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionLabel: { marginBottom: spacing.md, marginTop: spacing.xs },
  row: { flexDirection: 'row', marginBottom: spacing.md },
  cell: { flex: 1, marginHorizontal: spacing.xs, position: 'relative' },
  badge: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  cta: { marginTop: spacing.lg, marginBottom: spacing.xl },
});

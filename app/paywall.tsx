import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { PremiumBadge } from '@/components/PremiumBadge';

import { OFFERINGS, purchase, restore } from '@/services/revenuecat';
import { useSubscriptionStore } from '@/store/subscription';
import { track, AnalyticsEvents } from '@/services/analytics';
import { colors, radius, spacing } from '@/theme';

/**
 * Paywall shown when the user hits the free quota or taps any "Unlock"
 * affordance. Conversion tactic: emphasise the yearly tile (50% cheaper
 * per month) while keeping the copy gentle rather than scary.
 */
const BENEFITS = [
  '🎨  Unlimited AI coloring pages',
  '🖨  HD exports, printer-ready',
  '🌈  All 5 styles including Color-by-Number',
  '🎁  Early access to storybook mode',
  '🛡  Safe, ad-free, no social links',
];

export default function PaywallScreen() {
  const [selected, setSelected] = useState<string>(OFFERINGS[1]!.id);
  const [busy, setBusy] = useState(false);
  const grant = useSubscriptionStore((s) => s.grant);

  useEffect(() => {
    track(AnalyticsEvents.PaywallShown);
  }, []);

  async function handlePurchase() {
    try {
      setBusy(true);
      const result = await purchase(selected);
      if (result === 'granted') {
        grant(selected as 'family_monthly' | 'family_yearly');
        track(AnalyticsEvents.SubscriptionStarted, { offering_id: selected });
        router.back();
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore() {
    const result = await restore();
    if (result === 'granted') grant('family_yearly');
  }

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Txt style={styles.bigEmoji}>🌈</Txt>
        <Txt variant="display" center>
          Unlock KidSketch Pro
        </Txt>
        <Txt variant="body" color={colors.inkSoft} center>
          Make as many coloring pages as your little artist can dream up.
        </Txt>
      </View>

      <Card tone="deep" style={styles.benefits}>
        {BENEFITS.map((b) => (
          <Txt key={b} variant="body" style={styles.benefit}>
            {b}
          </Txt>
        ))}
      </Card>

      {OFFERINGS.map((o) => {
        const isSelected = selected === o.id;
        return (
          <Pressable
            key={o.id}
            onPress={() => setSelected(o.id)}
            style={({ pressed }) => [
              styles.offer,
              isSelected && styles.offerActive,
              pressed && styles.pressed,
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.offerTitle}>
                <Txt variant="heading">{o.title}</Txt>
                {o.highlighted ? <PremiumBadge /> : null}
              </View>
              <Txt variant="body" color={colors.inkSoft}>
                {o.priceLabel}
                {o.badge ? ` · ${o.badge}` : ''}
              </Txt>
            </View>
            <View style={[styles.radio, isSelected && styles.radioOn]}>
              {isSelected ? <View style={styles.radioDot} /> : null}
            </View>
          </Pressable>
        );
      })}

      <Button
        label={busy ? 'Unlocking…' : 'Start Pro'}
        onPress={handlePurchase}
        loading={busy}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />

      <View style={styles.secondaryRow}>
        <Button label="Restore" variant="ghost" onPress={handleRestore} />
        <Button label="Not now" variant="ghost" onPress={() => router.back()} />
      </View>

      <Txt variant="caption" color={colors.inkSoft} center style={styles.legal}>
        Subscriptions renew automatically. Cancel anytime in your App Store
        settings. No ads, no tracking, COPPA-compliant.
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: spacing.xl },
  bigEmoji: { fontSize: 72, lineHeight: 84 },
  benefits: { marginBottom: spacing.lg },
  benefit: { paddingVertical: spacing.xxs },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.divider,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  offerActive: {
    borderColor: colors.sunYellow,
    backgroundColor: colors.sunYellow + '20',
  },
  pressed: { opacity: 0.8 },
  offerTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.inkBrown },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.inkBrown,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: spacing.lg,
  },
  legal: { marginTop: spacing.lg, marginBottom: spacing.xl, paddingHorizontal: spacing.lg },
});

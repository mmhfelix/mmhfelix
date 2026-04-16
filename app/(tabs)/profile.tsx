import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { PremiumBadge } from '@/components/PremiumBadge';

import { useArtworksStore } from '@/store/artworks';
import { useSubscriptionStore } from '@/store/subscription';
import { useSettingsStore, FREE_DAILY_QUOTA } from '@/store/settings';
import { colors, radius, shadow, spacing } from '@/theme';

/**
 * Profile / "Me" tab.
 *
 * Three stacked sections:
 *  1. Entitlement card — current plan + CTA.
 *  2. Controls card — parental settings, sound, haptics.
 *  3. Favorites grid — pinned items from the gallery.
 *
 * Full gallery lives on the "Color" tab; here we just surface favorites
 * so the parent's dashboard view stays uncluttered.
 */
export default function ProfileScreen() {
  const items = useArtworksStore((s) => s.items);
  const toggleFavorite = useArtworksStore((s) => s.toggleFavorite);
  const favorites = items.filter((a) => a.favorite);

  const isPro = useSubscriptionStore((s) => s.isPro);
  const settings = useSettingsStore();
  const quotaRemaining = Math.max(0, FREE_DAILY_QUOTA - settings.dailyQuotaUsed);

  return (
    <Screen scroll>
      <Txt variant="display" style={styles.title}>
        My KidSketch
      </Txt>

      {/* Entitlement */}
      <Card style={styles.section}>
        <View style={styles.rowBetween}>
          <View>
            <Txt variant="heading">{isPro ? 'Family Pro' : 'Free plan'}</Txt>
            <Txt variant="caption" color={colors.inkSoft}>
              {isPro
                ? 'Unlimited transforms, HD exports, no watermark.'
                : `${quotaRemaining} of ${FREE_DAILY_QUOTA} free photos left today.`}
            </Txt>
          </View>
          {isPro ? <PremiumBadge /> : null}
        </View>
        {!isPro ? (
          <Button
            label="Unlock everything"
            onPress={() => router.push('/paywall')}
            fullWidth
            style={{ marginTop: spacing.md }}
          />
        ) : null}
      </Card>

      {/* Parental controls */}
      <Card style={styles.section}>
        <Txt variant="heading" style={{ marginBottom: spacing.sm }}>
          Grown-up controls
        </Txt>
        <Row
          label="Daily time limit"
          value={
            settings.dailyTimeLimitMin
              ? `${settings.dailyTimeLimitMin} min`
              : 'Off'
          }
          onPress={() => router.push('/parental')}
        />
        <Row
          label="Sound effects"
          value={settings.soundEnabled ? 'On' : 'Off'}
          onPress={() =>
            useSettingsStore
              .getState()
              .setSoundEnabled(!settings.soundEnabled)
          }
        />
        <Row
          label="Haptics"
          value={settings.hapticsEnabled ? 'On' : 'Off'}
          onPress={() =>
            useSettingsStore
              .getState()
              .setHapticsEnabled(!settings.hapticsEnabled)
          }
        />
        <Row label="Safe content filter" value="Always on" disabled />
      </Card>

      <Txt variant="heading" style={styles.favTitle}>
        Favorites
      </Txt>

      {favorites.length === 0 ? (
        <Txt variant="body" color={colors.inkSoft} center style={styles.emptyFav}>
          Tap the star on any page to save it here.
        </Txt>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(i) => i.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.favRow}
          renderItem={({ item }) => (
            <Pressable
              onLongPress={() => toggleFavorite(item.id)}
              onPress={() =>
                router.push({ pathname: '/canvas/[id]', params: { id: item.id } })
              }
              style={styles.favCard}
            >
              <Image source={{ uri: item.lineArtUri }} style={styles.favImg} />
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

function Row({
  label,
  value,
  onPress,
  disabled,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && !disabled && styles.rowPressed,
      ]}
    >
      <Txt variant="body">{label}</Txt>
      <Txt variant="bodyBold" color={disabled ? colors.inkSoft : colors.inkBrown}>
        {value}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xl, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowPressed: { opacity: 0.6 },
  favTitle: { marginBottom: spacing.md },
  favRow: { justifyContent: 'space-between', marginBottom: spacing.sm },
  favCard: {
    flex: 1,
    margin: spacing.xs,
    aspectRatio: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.white,
    ...shadow.card,
  },
  favImg: { flex: 1 },
  emptyFav: { paddingVertical: spacing.xl },
});

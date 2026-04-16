import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

import { useArtworksStore } from '@/store/artworks';
import { colors, radius, shadow, spacing } from '@/theme';

/**
 * "Color" tab — shows the pages ready to be colored. Tapping a card
 * routes into the Skia canvas for that artwork.
 */
export default function ColorTabScreen() {
  const items = useArtworksStore((s) => s.items);

  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState
          emoji="🎨"
          title="No pages yet"
          caption="Make a new coloring page from a photo to get started."
          action={
            <Button
              label="New photo"
              onPress={() => router.push('/(tabs)/create')}
            />
          }
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Txt variant="display">Your pages</Txt>
        <Txt variant="body" color={colors.inkSoft}>
          Tap one to start coloring.
        </Txt>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.column}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({ pathname: '/canvas/[id]', params: { id: item.id } })
            }
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <Image
              source={{ uri: item.lineArtUri }}
              style={styles.thumb}
              contentFit="cover"
            />
            {item.favorite ? (
              <View style={styles.favorite}>
                <Txt>⭐</Txt>
              </View>
            ) : null}
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.md },
  grid: { paddingHorizontal: spacing.sm, paddingBottom: spacing.xl },
  column: { justifyContent: 'space-between' },
  card: {
    flex: 1,
    margin: spacing.xs,
    aspectRatio: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    overflow: 'hidden',
    ...shadow.card,
  },
  thumb: { width: '100%', height: '100%' },
  pressed: { transform: [{ scale: 0.97 }] },
  favorite: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
});

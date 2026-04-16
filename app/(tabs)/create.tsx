import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StyleCard } from '@/components/StyleCard';

import { findPreset, STYLE_PRESETS, StylePreset, StylePresetId } from '@/constants/styles';
import { colors, radius, spacing } from '@/theme';
import { useQuota } from '@/hooks/useQuota';
import { AnalyticsEvents, track } from '@/services/analytics';

/**
 * "Create" tab: let the parent/child pick where the source photo
 * comes from (camera or gallery) plus confirm the style. When they
 * hit "Turn into coloring page" we navigate into the modal result
 * screen which owns the actual AI call + loading state.
 */
export default function CreateScreen() {
  const params = useLocalSearchParams<{ styleId?: StylePresetId }>();
  const initial = useMemo<StylePreset>(
    () => (params.styleId ? findPreset(params.styleId) : STYLE_PRESETS[0]!),
    [params.styleId]
  );
  const [preset, setPreset] = useState<StylePreset>(initial);
  const [sourceUri, setSourceUri] = useState<string | null>(null);
  const { canTransform } = useQuota();

  // Keep the card selection in sync when routed with a new styleId.
  useEffect(() => setPreset(initial), [initial]);

  async function pickFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (res.canceled || !res.assets[0]) return;
    track(AnalyticsEvents.PhotoPicked, { style_id: preset.id });
    setSourceUri(res.assets[0].uri);
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (res.canceled || !res.assets[0]) return;
    track(AnalyticsEvents.CameraOpened, { style_id: preset.id });
    setSourceUri(res.assets[0].uri);
  }

  function handleTransform() {
    if (!sourceUri) return;
    if (!canTransform) {
      router.push('/paywall');
      return;
    }
    router.push({
      pathname: '/result',
      params: { sourceUri, styleId: preset.id, source: 'photo' },
    });
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Txt variant="display">New artwork</Txt>
        <Txt variant="body" color={colors.inkSoft}>
          Pick a photo, then choose a style.
        </Txt>
      </View>

      <Card tone="deep" style={styles.preview}>
        {sourceUri ? (
          <Image source={{ uri: sourceUri }} style={styles.previewImage} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Txt style={styles.placeholderEmoji}>📷</Txt>
            <Txt variant="body" color={colors.inkSoft} center>
              Your photo will appear here
            </Txt>
          </View>
        )}
      </Card>

      <View style={styles.sourceRow}>
        <Button
          label="Camera"
          onPress={takePhoto}
          variant="secondary"
          style={{ flex: 1, marginRight: spacing.sm }}
        />
        <Button
          label="Gallery"
          onPress={pickFromLibrary}
          variant="secondary"
          style={{ flex: 1, marginLeft: spacing.sm }}
        />
      </View>

      <Txt variant="heading" style={styles.sectionLabel}>
        Style
      </Txt>

      {/* Horizontal-ish grid: on a single-column screen we stack 2 per row. */}
      {chunk(STYLE_PRESETS, 2).map((row, idx) => (
        <View key={idx} style={styles.row}>
          {row.map((p) => (
            <View key={p.id} style={styles.cell}>
              <StyleCard preset={p} selected={preset.id === p.id} onPress={setPreset} />
            </View>
          ))}
          {row.length === 1 ? <View style={styles.cell} /> : null}
        </View>
      ))}

      <Button
        label="Turn into coloring page"
        onPress={handleTransform}
        disabled={!sourceUri}
        fullWidth
        style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}
      />
    </Screen>
  );
}

function chunk<T>(arr: readonly T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xl, paddingBottom: spacing.lg },
  preview: { aspectRatio: 1, overflow: 'hidden', padding: 0, marginBottom: spacing.md },
  previewImage: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  placeholderEmoji: { fontSize: 80, lineHeight: 90, marginBottom: spacing.md },
  sourceRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  sectionLabel: { marginBottom: spacing.md },
  row: { flexDirection: 'row', marginBottom: spacing.md },
  cell: { flex: 1, marginHorizontal: spacing.xs },
});

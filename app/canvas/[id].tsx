import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Canvas,
  Image as SkiaImage,
  Path,
  Skia,
  useImage,
  SkPath,
  Group,
} from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { Screen } from '@/components/Screen';
import { Txt } from '@/components/Txt';
import { Button } from '@/components/Button';
import { ColorPalette } from '@/components/ColorPalette';
import { ToolButton } from '@/components/ToolButton';
import { EmptyState } from '@/components/EmptyState';

import { colors, radius, spacing } from '@/theme';
import { useArtworksStore } from '@/store/artworks';

/**
 * Skia coloring canvas.
 *
 * MVP model: we paint free-form brush strokes in a child's chosen
 * color underneath the line-art image. The line-art sits on top in
 * multiply blend mode so thick outlines stay visible over any fill.
 *
 * Stroke history is kept as an array of (color, path, width) tuples.
 * Undo / redo use a second array as the redo stack. Erase works by
 * painting with the paper background color — simpler than true pixel
 * erase and visually indistinguishable.
 */
type Stroke = {
  color: string;
  width: number;
  path: SkPath;
};

type Tool = 'brush' | 'eraser';

const BRUSH_WIDTHS = { brush: 18, eraser: 32 } as const;

export default function CanvasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const art = useArtworksStore((s) => s.items.find((a) => a.id === id));
  const image = useImage(art?.lineArtUri ?? null);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redo, setRedo] = useState<Stroke[]>([]);
  const [color, setColor] = useState<string>(colors.palette12[0]!);
  const [tool, setTool] = useState<Tool>('brush');

  // Active stroke being drawn — React-state for paint, but the path
  // itself is mutated on the native thread via a ref for perf.
  const activePathRef = useRef<SkPath | null>(null);
  const [, forcePaint] = useState(0);

  const canvasSize = useMemo(() => {
    const side = Math.min(
      Dimensions.get('window').width - spacing.lg * 2,
      420
    );
    return side;
  }, []);

  const commitStroke = useCallback(() => {
    const p = activePathRef.current;
    if (!p) return;
    const paintColor = tool === 'eraser' ? colors.white : color;
    setStrokes((prev) => [...prev, { color: paintColor, width: BRUSH_WIDTHS[tool], path: p }]);
    setRedo([]); // any new stroke invalidates the redo stack
    activePathRef.current = null;
    forcePaint((n) => n + 1);
  }, [color, tool]);

  // Pan gesture kept on the JS thread via `.runOnJS(true)`.
  // Skia paths are JS-side objects and we mutate a ref directly — a
  // worklet pipeline would require copying path state over the bridge
  // each frame. For kid-sized brush strokes the JS thread is plenty
  // fast and the code stays readable.
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .runOnJS(true)
        .onStart((e) => {
          const p = Skia.Path.Make();
          p.moveTo(e.x, e.y);
          activePathRef.current = p;
          forcePaint((n) => n + 1);
        })
        .onUpdate((e) => {
          const p = activePathRef.current;
          if (p) {
            p.lineTo(e.x, e.y);
            forcePaint((n) => n + 1);
          }
        })
        .onEnd(commitStroke),
    [commitStroke]
  );

  const handleUndo = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1]!;
      setRedo((r) => [...r, last]);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return prev.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedo((r) => {
      if (r.length === 0) return r;
      const last = r[r.length - 1]!;
      setStrokes((s) => [...s, last]);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return r.slice(0, -1);
    });
  }, []);

  const handleClear = useCallback(() => {
    if (strokes.length === 0) return;
    Alert.alert('Start over?', 'Your colors will be erased.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Start over',
        style: 'destructive',
        onPress: () => {
          setStrokes([]);
          setRedo([]);
        },
      },
    ]);
  }, [strokes.length]);

  function handleDone() {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // MVP: simply return. A follow-up would snapshot the Skia surface
    // with `makeImageSnapshot()` and persist `coloredUri` to the store.
    router.back();
  }

  if (!art) {
    return (
      <Screen>
        <EmptyState
          emoji="🔍"
          title="Artwork not found"
          caption="It may have been deleted."
          action={<Button label="Go back" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  return (
    <Screen edgeToEdge padded={false}>
      <View style={styles.header}>
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
        <Txt variant="heading">Coloring</Txt>
        <Button label="Done" variant="ghost" onPress={handleDone} />
      </View>

      <View style={styles.canvasWrap}>
        <GestureDetector gesture={pan}>
          <View
            style={[
              styles.canvasFrame,
              { width: canvasSize, height: canvasSize },
            ]}
          >
            <Canvas style={{ flex: 1 }}>
              {/* White page under everything — lets the eraser "reveal" paper. */}
              <Group>
                {strokes.map((s, idx) => (
                  <Path
                    key={idx}
                    path={s.path}
                    color={s.color}
                    style="stroke"
                    strokeWidth={s.width}
                    strokeCap="round"
                    strokeJoin="round"
                  />
                ))}
                {activePathRef.current ? (
                  <Path
                    path={activePathRef.current}
                    color={tool === 'eraser' ? colors.white : color}
                    style="stroke"
                    strokeWidth={BRUSH_WIDTHS[tool]}
                    strokeCap="round"
                    strokeJoin="round"
                  />
                ) : null}
                {image ? (
                  <SkiaImage
                    image={image}
                    x={0}
                    y={0}
                    width={canvasSize}
                    height={canvasSize}
                    fit="contain"
                    // `multiply` keeps dark outlines visible over fills.
                    blendMode="multiply"
                  />
                ) : null}
              </Group>
            </Canvas>
          </View>
        </GestureDetector>
      </View>

      <View style={styles.tools}>
        <ToolButton
          glyph="↶"
          label="Undo"
          onPress={handleUndo}
          disabled={strokes.length === 0}
        />
        <ToolButton
          glyph="↷"
          label="Redo"
          onPress={handleRedo}
          disabled={redo.length === 0}
        />
        <ToolButton
          glyph="🖌"
          label="Brush"
          active={tool === 'brush'}
          onPress={() => setTool('brush')}
        />
        <ToolButton
          glyph="🩹"
          label="Eraser"
          active={tool === 'eraser'}
          onPress={() => setTool('eraser')}
        />
        <ToolButton glyph="🧼" label="Clear" onPress={handleClear} />
      </View>

      <View style={styles.palette}>
        <ColorPalette value={color} onChange={setColor} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  canvasWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  canvasFrame: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.divider,
  },
  tools: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  palette: {
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.paperDeep,
  },
});

import { GLView } from 'expo-gl';
import { useRef } from 'react';
import { PanResponder, View, type StyleProp, type ViewStyle } from 'react-native';

import type { GarmentKind, Species } from '@/src/domain';
import { startPetView, type PetView, type StageState } from '@/src/petView';

export function PetStage({
  species,
  breed,
  garment,
  style,
}: {
  species: Species;
  breed: string;
  garment?: { kind: GarmentKind; photo: string } | null;
  style?: StyleProp<ViewStyle>;
}) {
  const state = useRef<StageState>({ species, breed, garment: garment || null });
  state.current = { species, breed, garment: garment || null };
  const view = useRef<PetView | null>(null);
  const lastX = useRef(0);
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastX.current = 0;
        view.current?.setDragging(true);
      },
      onPanResponderMove: (_event, gesture) => {
        view.current?.addYaw((gesture.dx - lastX.current) * 0.01);
        lastX.current = gesture.dx;
      },
      onPanResponderRelease: () => view.current?.setDragging(false),
      onPanResponderTerminate: () => view.current?.setDragging(false),
    }),
  ).current;

  return (
    <View style={[{ height: 280, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F6E8E8' }, style]} {...pan.panHandlers}>
      <GLView
        style={{ flex: 1 }}
        onContextCreate={(gl) => {
          const canvas = {
            width: gl.drawingBufferWidth,
            height: gl.drawingBufferHeight,
            clientWidth: gl.drawingBufferWidth,
            clientHeight: gl.drawingBufferHeight,
            style: {},
            addEventListener() {},
            removeEventListener() {},
          } as unknown as HTMLCanvasElement;
          view.current = startPetView({
            canvas,
            context: gl as unknown as WebGLRenderingContext,
            getState: () => state.current,
            initialWidth: gl.drawingBufferWidth,
            initialHeight: gl.drawingBufferHeight,
            endFrame: () => gl.endFrameEXP(),
          });
        }}
      />
    </View>
  );
}

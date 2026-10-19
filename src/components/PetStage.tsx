import { GLView } from 'expo-gl';
import { useEffect, useRef, useState } from 'react';
import { PanResponder, View, type StyleProp, type ViewStyle } from 'react-native';

import type { GarmentKind, Species } from '@/src/domain';
import { startPetView, type PetView, type StageState } from '@/src/petView';

// three r163 起，构造函数会拒绝带 WebGLRenderingContext 原型的上下文。
// expo-gl 的上下文正是这个原型，正式包里这个异常会直接退出。转发给 three 的是一个没有该原型的对象。
function forwardGl(gl: object): WebGLRenderingContext {
  const host: object = Object.create(null);
  return new Proxy(host, {
    get(_target, prop) {
      const value = Reflect.get(gl, prop, gl);
      if (typeof value === 'function') return (...args: unknown[]) => Reflect.apply(value as (...args: unknown[]) => unknown, gl, args);
      return value;
    },
    set(_target, prop, value) {
      Reflect.set(gl, prop, value, gl);
      return true;
    },
  }) as WebGLRenderingContext;
}

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
  const [failed, setFailed] = useState(false);
  useEffect(() => () => view.current?.stop(), []);

  function fail() {
    view.current?.stop();
    view.current = null;
    setFailed(true);
  }
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

  const frameStyle = [{ height: 280, borderRadius: 20, overflow: 'hidden' as const, backgroundColor: '#F6E8E8' }, style];
  if (failed) return <View style={frameStyle} />;

  return (
    <View style={frameStyle} {...pan.panHandlers}>
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
          try {
            view.current?.stop();
            view.current = startPetView({
              canvas,
              context: forwardGl(gl),
              getState: () => state.current,
              initialWidth: gl.drawingBufferWidth,
              initialHeight: gl.drawingBufferHeight,
              endFrame: () => gl.endFrameEXP(),
              onError: fail,
            });
          } catch {
            fail();
          }
        }}
      />
    </View>
  );
}

import { useEffect, useId, useRef } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import type { GarmentKind, Species } from '@/src/domain';
import { startPetView, type StageState } from '@/src/petView';

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
  const hostId = `pet-stage-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const state = useRef<StageState>({ species, breed, garment: garment || null });
  state.current = { species, breed, garment: garment || null };

  useEffect(() => {
    const parent = document.getElementById(hostId);
    if (!parent) return;
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.touchAction = 'none';
    parent.appendChild(canvas);
    const view = startPetView({
      canvas,
      element: parent,
      getState: () => state.current,
      initialWidth: parent.clientWidth || 320,
      initialHeight: parent.clientHeight || 280,
    });
    const observer = new ResizeObserver(() => view.resize(parent.clientWidth, parent.clientHeight));
    observer.observe(parent);
    return () => {
      observer.disconnect();
      view.stop();
      canvas.remove();
    };
  }, [hostId]);

  return <View nativeID={hostId} style={[{ height: 280, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F6E8E8' }, style]} />;
}

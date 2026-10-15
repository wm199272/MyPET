import { requireNativeModule } from 'expo-modules-core';

type Label = { identifier: string; confidence: number };

export function classifyNative(uri: string): Promise<Label[]> {
  const native = requireNativeModule<{ classify: (uri: string) => Promise<Label[]> }>('BreedVision');
  return native.classify(uri);
}

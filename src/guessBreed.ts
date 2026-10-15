import { Platform } from 'react-native';

import { breedFromLabels, type BreedGuess, type BreedHit } from '@/src/breedLabels';

export async function guessBreed(uri: string): Promise<BreedGuess | null> {
  try {
    const labels = Platform.OS === 'web' ? await classifyWeb(uri) : await classifyNative(uri);
    return breedFromLabels(labels);
  } catch {
    return null;
  }
}

async function classifyNative(uri: string): Promise<BreedHit[]> {
  const native = await import('breed-vision');
  return native.classifyNative(uri);
}

async function classifyWeb(uri: string): Promise<BreedHit[]> {
  await loadScript('/breed-model/tf.min.js');
  await loadScript('/breed-model/mobilenet.min.js');
  const scope = globalThis as typeof globalThis & {
    tf?: unknown;
    mobilenet?: {
      load: (options?: { version?: number; alpha?: number; modelUrl?: string; inputRange?: [number, number] }) => Promise<{
        classify: (image: HTMLImageElement, topk?: number) => Promise<{ className: string; probability: number }[]>;
      }>;
    };
  };
  if (!scope.mobilenet) return [];
  const image = await loadImage(uri);
  const model = await scope.mobilenet.load({
    version: 2,
    alpha: 1,
    modelUrl: '/breed-model/model.json',
    inputRange: [-1, 1],
  });
  const predictions = await model.classify(image, 5);
  return predictions.map((item) => ({ identifier: item.className, confidence: item.probability }));
}

function loadScript(src: string): Promise<void> {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('script'));
    document.head.appendChild(script);
  });
}

function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('image'));
    image.src = uri;
  });
}

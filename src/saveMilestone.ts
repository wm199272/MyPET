import { RefObject } from 'react';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

import { Milestone } from './domain';

export async function saveMilestone(ref: RefObject<View | null>, _petName: string, _item: Milestone): Promise<string> {
  if (!ref.current) return '卡片还没准备好';
  const perm = await MediaLibrary.requestPermissionsAsync(true);
  if (!perm.granted) return '没有相册权限';
  const uri = await captureRef(ref, { format: 'png', quality: 1 });
  await MediaLibrary.saveToLibraryAsync(uri);
  return '已存到相册';
}

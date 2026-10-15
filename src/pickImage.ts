import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import { persistImage } from '@/src/photos';

export async function pickImage(name: string): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('无法打开相册', '请允许访问照片后再选择。');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled || !result.assets[0]) return null;
  return persistImage(result.assets[0].uri, name);
}

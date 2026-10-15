import { Image, View } from 'react-native';

import { LineIcon } from '@/src/components/LineIcon';
import { Pet } from '@/src/domain';
import { colors } from '@/src/theme';

export function PetAvatar({ pet, size = 84 }: { pet: Pet; size?: number }) {
  if (pet.avatar) {
    return <Image source={{ uri: pet.avatar }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  const icon = pet.species === 'cat' ? 'cat' : pet.species === 'dog' ? 'dog' : 'paw';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <LineIcon name={icon} size={Math.round(size * 0.46)} color={colors.primary} />
    </View>
  );
}

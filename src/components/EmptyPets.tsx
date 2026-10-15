import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LineIcon } from '@/src/components/LineIcon';
import { Button } from '@/src/components/ui';
import { colors } from '@/src/theme';

export function EmptyPets({ onAdd, detail }: { onAdd: () => void; detail?: ReactNode }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.mark}>
        <LineIcon name="paw" size={36} color={colors.primary} />
      </View>
      <Text style={styles.title}>先记下第一只</Text>
      {detail}
      <Button title="添加宠物" onPress={onAdd} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  mark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 20, fontSize: 22, fontWeight: '500', color: colors.text, lineHeight: 32 },
  button: { alignSelf: 'stretch', marginTop: 28 },
});

import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Field } from '@/src/components/ui';
import type { Species } from '@/src/domain';
import { breedNames } from '@/src/petFigure';
import { colors } from '@/src/theme';

export function BreedPicker({
  species,
  value,
  onChange,
}: {
  species: Species;
  value: string;
  onChange: (breed: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  if (species === 'other') {
    return <Text style={styles.hint}>其他物种共用一个形象，不用选品种。</Text>;
  }
  const names = breedNames(species);
  return (
    <Field label="品种">
      <Pressable accessibilityRole="button" accessibilityLabel={value || '选择品种'} onPress={() => setOpen(true)} style={styles.pick}>
        <Text style={styles.title}>{value || '选择品种'}</Text>
        <Text style={styles.note}>{species === 'cat' ? '猫' : '狗'}有 {names.length} 种，选中后形象就固定成这一品种</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>{species === 'cat' ? '选择猫的品种' : '选择狗的品种'}</Text>
            <ScrollView style={styles.list}>
              {names.map((name) => (
                <Pressable
                  key={name}
                  accessibilityRole="button"
                  accessibilityLabel={name}
                  style={styles.row}
                  onPress={() => {
                    onChange(name);
                    setOpen(false);
                  }}>
                  <Text style={styles.title}>{name}</Text>
                  {value === name ? <Text style={styles.mark}>当前</Text> : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </Field>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  pick: { backgroundColor: colors.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.line },
  title: { fontSize: 15, color: colors.text, fontWeight: '500', lineHeight: 22 },
  note: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(61,51,53,0.28)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  list: { maxHeight: 420 },
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  mark: { color: colors.primary, fontSize: 13, fontWeight: '600' },
});

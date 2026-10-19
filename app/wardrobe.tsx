import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PetStage } from '@/src/components/PetStage';
import { Button, Segment } from '@/src/components/ui';
import { GarmentKind, garmentKindLabel, uid } from '@/src/domain';
import { prepareGarmentPhoto } from '@/src/garmentPhoto';
import { figureFor } from '@/src/petFigure';
import { pickImage } from '@/src/pickImage';
import { useArchive } from '@/src/store';
import { colors } from '@/src/theme';

const kinds: { value: GarmentKind; label: string }[] = [
  { value: 'harness', label: '胸背' },
  { value: 'onesie', label: '四脚衣' },
  { value: 'cooling', label: '凉凉衣' },
];

export default function WardrobeScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const archive = useArchive();
  const insets = useSafeAreaInsets();
  const pet = archive.data.pets.find((item) => item.id === params.petId) || archive.currentPet;
  const [kind, setKind] = useState<GarmentKind>('harness');
  const [saving, setSaving] = useState(false);
  if (!archive.ready) return <View style={styles.screen} />;
  if (!pet) return <View style={styles.screen}><Text style={styles.missing}>先添加一只宠物。</Text></View>;
  const selected = pet;

  const figure = figureFor(selected.species, selected.breed);
  const clothes = archive.data.garments.filter((item) => item.petId === selected.id);
  const worn = clothes.find((item) => item.worn) || null;

  async function upload() {
    if (saving) return;
    const id = uid();
    const picked = await pickImage(`garment-${id}.jpg`);
    if (!picked) return;
    setSaving(true);
    const photo = await prepareGarmentPhoto(picked);
    await archive.saveGarment({ id, petId: selected.id, kind, name: garmentKindLabel[kind], photo, worn: false });
    await archive.wearGarment(selected.id, id);
    setSaving(false);
    archive.showToast('已经穿上');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
      <PetStage species={selected.species} breed={selected.breed} garment={worn ? { kind: worn.kind, photo: worn.photo } : null} />
      <Text style={styles.caption}>{selected.name} · {figure.title}</Text>
      <Text style={styles.hint}>形象按品种固定。拖动可以转动。上传的照片会贴到对应位置：胸背在前胸和背上，四脚衣包住身体，凉凉衣盖在背上。</Text>
      <Segment value={kind} onChange={setKind} options={kinds} />
      <Button title={saving ? '正在保存' : `上传${garmentKindLabel[kind]}`} onPress={() => void upload()} disabled={saving} style={styles.upload} />
      {clothes.length === 0 ? <Text style={styles.hint}>还没有衣服。选好种类后，从相册上传一张衣服照片。</Text> : clothes.map((item) => (
        <View key={item.id} style={styles.row}>
          <Image source={{ uri: item.photo }} style={styles.thumb} />
          <View style={styles.rowBody}>
            <Text style={styles.name}>{garmentKindLabel[item.kind]}{item.worn ? ' · 穿着' : ''}</Text>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={() => void archive.wearGarment(selected.id, item.worn ? '' : item.id)} style={styles.action}>
                <Text style={styles.link}>{item.worn ? '脱掉' : '穿上'}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => Alert.alert('删除这件衣服？', '删除后无法恢复。', [
                  { text: '取消', style: 'cancel' },
                  { text: '删除', style: 'destructive', onPress: () => void archive.removeGarment(item.id) },
                ])}
                style={styles.action}>
                <Text style={styles.danger}>删除</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20 },
  missing: { textAlign: 'center', marginTop: 48, color: colors.textSecondary },
  caption: { marginTop: 12, fontSize: 16, fontWeight: '500', color: colors.text, lineHeight: 24 },
  hint: { marginTop: 8, marginBottom: 16, color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  upload: { marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: 20, padding: 12, marginTop: 10 },
  thumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: colors.primarySoft },
  rowBody: { flex: 1 },
  name: { fontSize: 15, color: colors.text, fontWeight: '500', lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  action: { minHeight: 44, justifyContent: 'center', paddingRight: 12 },
  link: { color: colors.primary, fontWeight: '600' },
  danger: { color: colors.danger, fontWeight: '600' },
});

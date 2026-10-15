import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';

import { EmptyPets } from '@/src/components/EmptyPets';
import {
  RecordType,
  buildTimeline,
  formatDate,
  groupTimeline,
  recordTypeLabel,
  recordTypes,
} from '@/src/domain';
import { useArchive } from '@/src/store';
import { colors } from '@/src/theme';

export default function RecordsScreen() {
  const archive = useArchive();
  const [type, setType] = useState<RecordType | 'all'>('all');
  const [petId, setPetId] = useState<string>('current');
  const [adding, setAdding] = useState(false);

  const selectedPetId = petId === 'current' ? archive.currentPet?.id ?? 'all' : petId;
  const entries = useMemo(() => {
    return buildTimeline(archive.data, archive.settings.weightUnit).filter((item) => {
      if (selectedPetId !== 'all' && item.petId !== selectedPetId) return false;
      if (type !== 'all' && item.type !== type) return false;
      return true;
    });
  }, [archive.data, archive.settings.weightUnit, selectedPetId, type]);

  const sections = useMemo(() => groupTimeline(entries, type), [entries, type]);

  if (!archive.ready) return <View style={styles.screen} />;
  if (archive.data.pets.length === 0) return <EmptyPets onAdd={() => router.push('/pet/new')} />;

  return (
    <View style={styles.screen}>
      <View style={styles.pinned}>
        <Text style={styles.pinnedName} numberOfLines={1}>
          {selectedPetId === 'all' ? '全部宠物' : archive.data.pets.find((pet) => pet.id === selectedPetId)?.name}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filters}>
        {archive.data.pets.length > 1 ? (
          <>
            <Filter label="全部宠物" selected={selectedPetId === 'all'} onPress={() => setPetId('all')} />
            {archive.data.pets.map((pet) => (
              <Filter key={pet.id} label={pet.name} selected={selectedPetId === pet.id} onPress={() => setPetId(pet.id)} />
            ))}
          </>
        ) : null}
        <Filter label="全部" selected={type === 'all'} onPress={() => setType('all')} />
        {recordTypes.map((item) => (
          <Filter key={item} label={recordTypeLabel[item]} selected={type === item} onPress={() => setType(item)} />
        ))}
        <Pressable onPress={() => setAdding(true)} style={styles.addButton}>
          <Text style={styles.add}>记一笔</Text>
        </Pressable>
      </ScrollView>
      <SectionList
        sections={sections}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>这个筛选下还没有记录</Text>}
        renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
        renderItem={({ item }) => {
          const petName = archive.data.pets.find((pet) => pet.id === item.petId)?.name;
          return (
            <Pressable style={styles.row} onPress={() => router.push(`/record/${item.type}?id=${item.id}`)}>
              <Text style={styles.date}>{formatDate(type === 'food' ? item.expiresOn || item.date : item.date)}</Text>
              <View style={styles.rowBody}>
                <Text style={styles.title}>{recordTypeLabel[item.type]}{selectedPetId === 'all' && petName ? ` · ${petName}` : ''}</Text>
                <Text style={styles.summary}>{item.summary}</Text>
              </View>
            </Pressable>
          );
        }}
      />
      <Modal visible={adding} transparent animationType="fade" onRequestClose={() => setAdding(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAdding(false)}>
          <Pressable style={styles.sheet}>
            <Text style={styles.sheetTitle}>记一笔</Text>
            <View style={styles.typeGrid}>
              {recordTypes.map((item) => (
                <Pressable
                  key={item}
                  style={styles.typeChip}
                  onPress={() => {
                    setAdding(false);
                    router.push(`/record/${item}`);
                  }}>
                  <Text style={styles.typeText}>{recordTypeLabel[item]}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Filter({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.filter, selected && styles.filterOn]}>
      <Text style={[styles.filterText, selected && styles.filterTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  pinned: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 2, backgroundColor: colors.bg },
  pinnedName: { fontSize: 18, fontWeight: '500', color: colors.text, lineHeight: 26 },
  filterBar: { flexGrow: 0, maxHeight: 68 },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  filter: { minHeight: 44, justifyContent: 'center', backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line },
  filterOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.text, fontSize: 14 },
  filterTextOn: { color: colors.white },
  addButton: { justifyContent: 'center', paddingHorizontal: 8 },
  add: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  list: { paddingHorizontal: 20, paddingBottom: 28 },
  section: { marginTop: 16, marginBottom: 8, color: colors.textSecondary, fontSize: 13 },
  row: { flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderRadius: 20, padding: 16, marginBottom: 10, minHeight: 64 },
  date: { width: 72, color: colors.textSecondary, fontSize: 13, paddingTop: 2 },
  rowBody: { flex: 1 },
  title: { color: colors.text, fontSize: 15, fontWeight: '500' },
  summary: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 48 },
  backdrop: { flex: 1, backgroundColor: 'rgba(61,51,53,0.28)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 14 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeChip: { backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  typeText: { color: colors.primary, fontSize: 15 },
});

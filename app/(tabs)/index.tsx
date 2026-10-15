import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyPets } from '@/src/components/EmptyPets';
import { LineIcon, LineIconName } from '@/src/components/LineIcon';
import { MilestoneSheet } from '@/src/components/MilestoneSheet';
import { PetAvatar } from '@/src/components/PetAvatar';
import { Card, Countdown, SectionTitle } from '@/src/components/ui';
import {
  Milestone,
  RecordType,
  Suggestion,
  ageLabel,
  buildSuggestions,
  buildTimeline,
  forecastFood,
  formatDate,
  listDue,
  listMilestones,
  listOnThisDay,
  rationStatus,
  recordTypeLabel,
  speciesLabel,
} from '@/src/domain';
import { useArchive } from '@/src/store';
import { colors, shadow } from '@/src/theme';

const shortcuts: { type: RecordType; label: string; icon: LineIconName }[] = [
  { type: 'weight', label: '体重', icon: 'scale' },
  { type: 'bath', label: '洗澡', icon: 'bath' },
  { type: 'deworm', label: '驱虫', icon: 'bug' },
  { type: 'expense', label: '记账', icon: 'wallet' },
];

export default function HomeScreen() {
  const archive = useArchive();
  const insets = useSafeAreaInsets();
  const [switching, setSwitching] = useState(false);
  const [card, setCard] = useState<Milestone | null>(null);
  if (!archive.ready) return <View style={styles.screen} />;
  if (!archive.currentPet) return <EmptyPets onAdd={() => router.push('/pet/new')} />;

  const pet = archive.currentPet;
  const unit = pet.weightUnit || archive.settings.weightUnit;
  const due = listDue(pet, archive.data);
  const milestones = listMilestones(pet, archive.data, unit);
  const memories = listOnThisDay(archive.data, pet.id, unit);
  const rations = archive.data.foods.flatMap((food) => {
    if (food.petId !== pet.id) return [];
    const forecast = forecastFood(pet, archive.data.weights, food);
    return forecast ? [{ food, forecast }] : [];
  });
  const suggestions = buildSuggestions(pet, archive.data, unit).slice(0, 2);
  const recent = buildTimeline(archive.data, unit)
    .filter((item) => item.petId === pet.id)
    .slice(0, 3);

  return (
    <View style={styles.screen}>
    <ScrollView stickyHeaderIndices={[0]} style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.sticky}>
        <Card style={[shadow, styles.hero]}>
          <View style={styles.petRow}>
            <PetAvatar pet={pet} size={84} />
            <View style={styles.petText}>
              <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
              <Text style={styles.petMeta} numberOfLines={1}>{pet.breed || speciesLabel[pet.species]}</Text>
              <Text style={styles.petMeta}>{ageLabel(pet.birthday)}</Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="切换宠物" onPress={() => setSwitching(true)} style={styles.switchHit} hitSlop={8}>
            <Text style={styles.switch}>切换</Text>
          </Pressable>
        </Card>
      </View>

      {milestones.length > 0 ? (
        <>
          <SectionTitle title="里程碑" />
          {milestones.map((item) => (
            <View key={item.id} style={styles.recent}>
              <View style={styles.recentBody}>
                <Text style={styles.dueTitle}>{item.title}</Text>
                <Text style={styles.dueSub}>{item.basis}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`做成卡片 ${item.title}`} onPress={() => setCard(item)} style={styles.cardHit}>
                <Text style={styles.switch}>做成卡片</Text>
              </Pressable>
            </View>
          ))}
        </>
      ) : null}

      {memories.length > 0 ? (
        <>
          <SectionTitle title="一年前的今天" />
          {memories.map((item) => (
            <Pressable key={`${item.type}-${item.id}`} style={styles.recent} onPress={() => router.push(`/record/${item.type}?id=${item.id}`)}>
              <Text style={styles.recentType}>{recordTypeLabel[item.type]}</Text>
              <View style={styles.recentBody}>
                <SummaryLine text={item.summary} />
                <Text style={styles.dueSub}>{formatDate(item.date)}</Text>
              </View>
            </Pressable>
          ))}
        </>
      ) : null}

      {rations.length > 0 ? (
        <>
          <SectionTitle title="口粮" />
          {rations.map((item) => (
            <Pressable key={item.food.id} style={styles.recent} onPress={() => router.push(`/record/food?id=${item.food.id}`)}>
              <View style={styles.recentBody}>
                <Text style={styles.dueTitle}>{item.food.brand}</Text>
                <Text style={styles.dueTitle}>每天 {item.forecast.dailyGrams} 克 · {rationStatus(item.forecast)}</Text>
                <Text style={styles.dueSub}>{formatDate(item.forecast.finishOn)}吃完</Text>
              </View>
            </Pressable>
          ))}
        </>
      ) : null}

      <SectionTitle title="即将到期" />
      {due.length === 0 ? <Text style={styles.quiet}>还没有到期事项</Text> : due.slice(0, 4).map((item) => (
        <View key={item.key} style={styles.dueRow}>
          <View style={[styles.bar, { backgroundColor: item.days < 0 ? colors.danger : item.days <= 7 ? colors.warn : colors.sage }]} />
          <View style={styles.dueBody}>
            <Text style={styles.dueTitle}>{item.title}</Text>
            <Countdown days={item.days} />
          </View>
        </View>
      ))}

      {suggestions.map((item) => (
        <SuggestionCard key={item.id} item={item} />
      ))}

      <SectionTitle title="最近记录" />
      {recent.length === 0 ? (
        <Text style={styles.quiet}>记下一笔后会出现在这里</Text>
      ) : (
        recent.map((item) => (
          <Pressable key={`${item.type}-${item.id}`} style={styles.recent} onPress={() => router.push(`/record/${item.type}?id=${item.id}`)}>
            <Text style={styles.recentType}>{recordTypeLabel[item.type]}</Text>
            <View style={styles.recentBody}>
              <SummaryLine text={item.summary} />
              <Text style={styles.dueSub}>{formatDate(item.date)}</Text>
            </View>
          </Pressable>
        ))
      )}

      <View style={styles.shortcuts}>
        {shortcuts.map((item) => (
          <Pressable key={item.type} accessibilityRole="button" accessibilityLabel={item.label} style={styles.shortcut} onPress={() => router.push(`/record/${item.type}?from=home`)}>
            <View style={styles.shortcutIcon}>
              <LineIcon name={item.icon} size={22} color={colors.primary} />
            </View>
            <Text style={styles.shortcutLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="登记猫粮或狗粮" style={styles.rationEntry} onPress={() => router.push('/record/food?from=home')}>
        <Text style={styles.switch}>登记猫粮 / 狗粮</Text>
      </Pressable>
    </ScrollView>
      <Modal visible={switching} transparent animationType="slide" onRequestClose={() => setSwitching(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSwitching(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 28) }]}>
            <Text style={styles.sheetTitle}>切换宠物</Text>
            {archive.data.pets.map((item) => (
              <Pressable
                key={item.id}
                style={styles.sheetRow}
                onPress={() => {
                  void archive.setCurrentPetId(item.id);
                  setSwitching(false);
                }}>
                <Text style={styles.dueTitle}>{item.name}</Text>
                {item.id === pet.id ? <LineIcon name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
      <MilestoneSheet petName={pet.name} milestone={card} onClose={() => setCard(null)} onSaved={(message) => archive.showToast(message)} />
    </View>
  );
}

function SuggestionCard({ item }: { item: Suggestion }) {
  const tone = item.tone === 'overdue' ? colors.danger : colors.warn;
  return (
    <View style={styles.suggest}>
      <View style={[styles.bar, { backgroundColor: tone }]} />
      <View style={styles.dueBody}>
        <Text style={styles.dueTitle}>{item.text}</Text>
        <Text style={styles.dueSub}>{item.basis}</Text>
        <Pressable onPress={() => openSuggestion(item)} style={styles.suggestAction}>
          <Text style={styles.switch}>{item.actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SummaryLine({ text }: { text: string }) {
  const match = text.match(/^(\d+(?:\.\d+)?)(\s*)(斤|公斤|元)(.*)$/);
  if (!match) return <Text style={styles.dueTitle}>{text}</Text>;
  return (
    <Text>
      <Text style={styles.figure}>{match[1]}</Text>
      <Text style={styles.unit}>{match[2]}{match[3]}</Text>
      <Text style={styles.dueTitle}>{match[4]}</Text>
    </Text>
  );
}

function openSuggestion(item: Suggestion) {
  if (item.action === 'stats') {
    router.push(item.focus ? `/stats?focus=${item.focus}` : '/stats');
    return;
  }
  if (item.action === 'open-record' && item.recordId) {
    router.push(`/record/${item.recordType}?id=${item.recordId}`);
    return;
  }
  router.push(`/record/${item.recordType}`);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  sticky: { backgroundColor: colors.bg, marginHorizontal: -20, paddingHorizontal: 20, paddingBottom: 8 },
  hero: { padding: 20, minHeight: 132 },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingRight: 48 },
  petText: { flex: 1 },
  petName: { fontSize: 22, fontWeight: '500', color: colors.text, lineHeight: 30 },
  petMeta: { marginTop: 4, color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  switchHit: { position: 'absolute', top: 8, right: 8, zIndex: 2, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  switch: { color: colors.primary, fontSize: 14, fontWeight: '500' },
  quiet: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 8 },
  dueRow: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 20, marginBottom: 10, overflow: 'hidden', minHeight: 64 },
  bar: { width: 3 },
  dueBody: { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  dueTitle: { fontSize: 15, color: colors.text, fontWeight: '500', lineHeight: 22 },
  figure: { color: colors.text, fontWeight: '500', fontSize: 16, fontVariant: ['tabular-nums'] },
  unit: { color: colors.textSecondary, fontSize: 13 },
  dueSub: { marginTop: 4, fontSize: 13, lineHeight: 20, color: colors.textSecondary },
  suggest: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 20, marginTop: 10, overflow: 'hidden' },
  suggestAction: { marginTop: 8, alignSelf: 'flex-start' },
  recent: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: 20, padding: 16, marginBottom: 10, minHeight: 64 },
  recentType: { minWidth: 44, color: colors.primary, fontSize: 13, fontWeight: '500', lineHeight: 20 },
  recentBody: { flex: 1 },
  cardHit: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  shortcuts: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 },
  shortcut: { alignItems: 'center', minWidth: 64, minHeight: 44 },
  shortcutIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: { marginTop: 8, fontSize: 13, color: colors.text },
  rationEntry: { marginTop: 18, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(61,51,53,0.28)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 28 },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  sheetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
});

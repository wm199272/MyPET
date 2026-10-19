import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyPets } from '@/src/components/EmptyPets';
import { LineIcon } from '@/src/components/LineIcon';
import { PetStage } from '@/src/components/PetStage';
import { MilestoneSheet } from '@/src/components/MilestoneSheet';
import { PetAvatar } from '@/src/components/PetAvatar';
import { Card, Countdown, SectionTitle } from '@/src/components/ui';
import {
  Milestone,
  Suggestion,
  ageLabel,
  buildSuggestions,
  buildTimeline,
  foodKindLabel,
  forecastFood,
  formatDate,
  formatMoney,
  linkedFoodSpend,
  listDue,
  listMilestones,
  listOnThisDay,
  rationStatus,
  recordTypeLabel,
  speciesLabel,
} from '@/src/domain';
import { castFortune } from '@/src/fortune';
import { figureFor } from '@/src/petFigure';
import { useArchive } from '@/src/store';
import { colors, shadow } from '@/src/theme';

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
    if (food.petId !== pet.id || food.remaining === 'finished') return [];
    const forecast = forecastFood(pet, archive.data.weights, food);
    const spend = linkedFoodSpend(archive.data, food.id) ?? (food.cost != null && food.cost > 0 ? food.cost : null);
    if (!forecast && spend == null) return [];
    return [{ food, forecast, spend }];
  });
  const suggestions = buildSuggestions(pet, archive.data, unit).slice(0, 2);
  const recent = buildTimeline(archive.data, unit)
    .filter((item) => item.petId === pet.id)
    .slice(0, 3);
  const reading = castFortune(pet);
  const worn = archive.data.garments.find((item) => item.petId === pet.id && item.worn) || null;
  const figure = figureFor(pet.species, pet.breed);

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

      <View style={styles.stageCard}>
        <PetStage species={pet.species} breed={pet.breed} garment={worn ? { kind: worn.kind, photo: worn.photo } : null} />
        <View style={styles.stageBar}>
          <View style={styles.recentBody}>
            <Text style={styles.dueTitle}>立体形象 · {figure.title}</Text>
            <Text style={styles.dueSub}>拖动可以转动{worn ? ` · 穿着${worn.name}` : ''}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="试衣间" onPress={() => router.push('/wardrobe')} style={styles.cardHit}>
            <Text style={styles.switch}>试衣间</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`给${pet.name}算一卦`}
        style={styles.fortune}
        onPress={() => router.push('/fortune' as Href)}>
        {reading ? <HexStamp bits={reading.bits} moving={reading.moving} /> : null}
        <View style={styles.recentBody}>
          <Text style={styles.dueTitle}>给{pet.name}算一卦</Text>
          <Text style={styles.dueSub}>用生日{pet.adoptedOn ? '和到家日' : ''}</Text>
        </View>
        <Text style={styles.switch}>看卦</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`给${pet.name}摇铜钱`}
        style={styles.fortune}
        onPress={() => router.push('/fortune/coins' as Href)}>
        <View style={styles.recentBody}>
          <Text style={styles.dueTitle}>摇铜钱</Text>
          <Text style={styles.dueSub}>问眼前的一件事，摇六次</Text>
        </View>
        <Text style={styles.switch}>去摇</Text>
      </Pressable>

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
                <Text style={styles.dueTitle}>{foodKindLabel[item.food.kind]} · {item.food.brand}</Text>
                {item.forecast ? (
                  <Text style={styles.dueTitle}>每天 {item.forecast.dailyGrams} 克 · {rationStatus(item.forecast)}</Text>
                ) : null}
                <Text style={styles.dueSub}>
                  {item.forecast ? `${formatDate(item.forecast.finishOn)}吃完` : item.food.expiresOn ? `保质期 ${formatDate(item.food.expiresOn)}` : '补上公斤和开封日期后会估算吃完'}
                  {item.spend != null ? ` · ${formatMoney(item.spend)}` : ''}
                </Text>
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

function HexStamp({ bits, moving }: { bits: string; moving: number }) {
  return (
    <View style={styles.stamp}>
      {bits.split('').reverse().map((bit, index) => {
        const on = bits.length - index === moving;
        const color = on ? colors.primary : colors.text;
        if (bit === '1') return <View key={index} style={[styles.stampYang, { backgroundColor: color }]} />;
        return (
          <View key={index} style={styles.stampYin}>
            <View style={[styles.stampHalf, { backgroundColor: color }]} />
            <View style={styles.stampGap} />
            <View style={[styles.stampHalf, { backgroundColor: color }]} />
          </View>
        );
      })}
    </View>
  );
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
  stageCard: { backgroundColor: colors.card, borderRadius: 20, marginBottom: 8, overflow: 'hidden' },
  stageBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  fortune: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: 20, padding: 16, marginBottom: 8, minHeight: 64 },
  stamp: { width: 36, gap: 3 },
  stampYang: { height: 3, borderRadius: 2 },
  stampYin: { flexDirection: 'row', height: 3 },
  stampHalf: { flex: 1, borderRadius: 2 },
  stampGap: { width: 4 },
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
  backdrop: { flex: 1, backgroundColor: 'rgba(61,51,53,0.28)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 28 },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  sheetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
});

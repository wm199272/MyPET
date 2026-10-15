import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MonthBars, DashedEmpty, WeightChart } from '@/src/components/Charts';
import { EmptyPets } from '@/src/components/EmptyPets';
import { Card, Figure, SectionTitle, Segment } from '@/src/components/ui';
import {
  ExpenseCategory,
  RangeKey,
  Suggestion,
  buildSuggestions,
  careStatuses,
  diffDays,
  expenseCategoryLabel,
  formatDate,
  monthKey,
  rangeStart,
  recentMonthKeys,
  todayISO,
} from '@/src/domain';
import { useArchive } from '@/src/store';
import { colors } from '@/src/theme';

export default function StatsScreen() {
  const archive = useArchive();
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<string, number>>({});
  const [range, setRange] = useState<RangeKey>('30');
  const [spendMode, setSpendMode] = useState<'category' | 'month'>('category');

  function scrollToSection(key: string) {
    const y = sectionY.current[key];
    if (y == null) return;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
  }

  useEffect(() => {
    if (focus === 'weight' || focus === 'spend') scrollToSection(focus);
  }, [focus]);

  if (!archive.ready) return <View style={styles.screen} />;
  if (!archive.currentPet) return <EmptyPets onAdd={() => router.push('/pet/new')} />;

  const pet = archive.currentPet;
  const today = todayISO();
  const start = rangeStart(today, range);
  const unit = pet.weightUnit || archive.settings.weightUnit;
  const weights = archive.data.weights
    .filter((row) => row.petId === pet.id && row.date >= start && row.date <= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const monthExpenses = archive.data.expenses.filter((row) => row.petId === pet.id && monthKey(row.date) === monthKey(today));
  const monthTotal = monthExpenses.reduce((sum, row) => sum + row.amount, 0);
  const byCategory = (Object.keys(expenseCategoryLabel) as ExpenseCategory[])
    .map((category) => ({
      category,
      amount: monthExpenses.filter((row) => row.category === category).reduce((sum, row) => sum + row.amount, 0),
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const months = recentMonthKeys(today, 6).map((key) => ({
    label: `${Number(key.slice(5))}月`,
    total: archive.data.expenses
      .filter((row) => row.petId === pet.id && monthKey(row.date) === key)
      .reduce((sum, row) => sum + row.amount, 0),
  }));
  const care = careStatuses(pet, archive.data, today);
  const foods = archive.data.foods.filter((food) => food.petId === pet.id && food.remaining !== 'finished');
  const withinWeek = foods.filter((food) => food.expiresOn && diffDays(today, food.expiresOn) >= 0 && diffDays(today, food.expiresOn) <= 7).length;
  const opened = foods.filter((food) => food.openedOn);
  const suggestions = buildSuggestions(pet, archive.data, unit, today);

  function remember(key: string, y: number) {
    sectionY.current[key] = y;
    if (focus === key) scrollToSection(key);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.pinned}>
        <Text style={styles.pinnedName} numberOfLines={1}>{pet.name}</Text>
      </View>
      {archive.data.pets.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pets}>
          {archive.data.pets.map((item) => (
            <Pressable key={item.id} onPress={() => void archive.setCurrentPetId(item.id)} style={[styles.petChip, item.id === pet.id && styles.petChipOn]}>
              <Text style={[styles.petChipText, item.id === pet.id && styles.petChipTextOn]}>{item.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    <ScrollView ref={scrollRef} style={styles.screen} contentContainerStyle={styles.content}>
      <Segment
        value={range}
        onChange={setRange}
        options={[
          { value: '30', label: '近 30 天' },
          { value: '90', label: '近 90 天' },
          { value: '365', label: '近 12 个月' },
        ]}
      />

      <View onLayout={(event) => remember('weight', event.nativeEvent.layout.y)}>
        <SectionTitle title="体重" />
        <Card>
          <WeightChart points={weights} unit={unit} />
        </Card>
      </View>

      <View onLayout={(event) => remember('spend', event.nativeEvent.layout.y)}>
      <SectionTitle
        title="消费"
        extra={<Text style={styles.monthLabel}>本月 <Figure value={monthTotal.toFixed(2)} unit="元" /></Text>}
      />
      <Card>
        <Segment
          value={spendMode}
          onChange={setSpendMode}
          options={[
            { value: 'category', label: '按分类' },
            { value: 'month', label: '近 6 个月' },
          ]}
        />
        {spendMode === 'category' ? (
          byCategory.length === 0 ? (
            <DashedEmpty text="这个月还没有消费" />
          ) : (
            byCategory.map((item) => (
              <View key={item.category} style={styles.cat}>
                <View style={styles.catHead}>
                  <Text style={styles.catName}>{expenseCategoryLabel[item.category]}</Text>
                  <Figure value={item.amount.toFixed(2)} unit="元" />
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.max(8, (item.amount / byCategory[0].amount) * 100)}%` }]} />
                </View>
              </View>
            ))
          )
        ) : months.every((month) => month.total === 0) ? (
          <DashedEmpty text="近 6 个月还没有消费" />
        ) : (
          <MonthBars months={months} />
        )}
      </Card>
      </View>

      <SectionTitle title="护理" />
      {care.map((item) => (
        <View key={item.key} style={styles.care}>
          <View style={[styles.dot, { backgroundColor: toneColor(item.tone) }]} />
          <View style={styles.careBody}>
            <Text style={styles.catName}>{item.title}</Text>
            <Text style={styles.quiet}>{item.detail}</Text>
          </View>
        </View>
      ))}

      <SectionTitle title="食品" />
      <Card>
        <Text style={styles.catName}>7 天内到期 <Figure value={String(withinWeek)} unit="项" /></Text>
        <Text style={styles.openedTitle}>已开封未吃完</Text>
        {opened.length === 0 ? <Text style={styles.quiet}>没有已开封、还没吃完的食品</Text> : opened.map((food) => (
          <Text key={food.id} style={styles.foodLine}>
            {food.brand} · {formatDate(food.openedOn, today)}开封 · 已 {diffDays(food.openedOn, today)} 天
          </Text>
        ))}
      </Card>

      <SectionTitle title="建议" />
      {suggestions.length === 0 ? (
        <View style={styles.suggest}>
          <View style={[styles.suggestBar, { backgroundColor: colors.sage }]} />
          <View style={styles.careBody}>
            <Text style={styles.quiet}>最近的记录都在计划内</Text>
          </View>
        </View>
      ) : (
        suggestions.map((item) => <SuggestionRow key={item.id} item={item} onFocus={scrollToSection} />)
      )}
    </ScrollView>
    </View>
  );
}

function SuggestionRow({ item, onFocus }: { item: Suggestion; onFocus: (key: string) => void }) {
  return (
    <View style={styles.suggest}>
      <View style={[styles.suggestBar, { backgroundColor: item.tone === 'overdue' ? colors.danger : colors.warn }]} />
      <View style={styles.careBody}>
        <Text style={styles.catName}>{item.text}</Text>
        <Text style={styles.quiet}>{item.basis}</Text>
        <Pressable
          onPress={() => {
            if (item.action === 'stats') {
              onFocus(item.focus || 'weight');
              return;
            }
            if (item.action === 'open-record' && item.recordId) router.push(`/record/${item.recordType}?id=${item.recordId}`);
            else router.push(`/record/${item.recordType}`);
          }}
          style={styles.action}>
          <Text style={styles.actionText}>{item.actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function toneColor(tone: 'ok' | 'soon' | 'overdue' | 'muted') {
  if (tone === 'overdue') return colors.danger;
  if (tone === 'soon') return colors.warn;
  if (tone === 'ok') return colors.sage;
  return colors.line;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  pinned: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, backgroundColor: colors.bg },
  pinnedName: { fontSize: 18, fontWeight: '500', color: colors.text, lineHeight: 26 },
  content: { padding: 20, paddingBottom: 36, gap: 8 },
  pets: { gap: 8, paddingHorizontal: 20, paddingBottom: 8 },
  petChip: { borderRadius: 999, minHeight: 44, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  petChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  petChipText: { color: colors.text },
  petChipTextOn: { color: colors.white },
  quiet: { color: colors.textSecondary, fontSize: 13, lineHeight: 22, marginTop: 4 },
  cat: { marginTop: 14 },
  catHead: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { color: colors.text, fontSize: 15, fontWeight: '500' },
  catAmount: { color: colors.text, fontSize: 15 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.line, marginTop: 8, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  care: { flexDirection: 'row', gap: 10, backgroundColor: colors.card, borderRadius: 20, padding: 16, marginBottom: 10, minHeight: 64 },
  careBody: { flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  foodLine: { color: colors.text, fontSize: 14, paddingVertical: 6 },
  openedTitle: { marginTop: 12, color: colors.textSecondary, fontSize: 13 },
  suggest: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 20, overflow: 'hidden', marginBottom: 10, minHeight: 64 },
  suggestBar: { width: 3 },
  action: { marginTop: 8, alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  actionText: { color: colors.primary, fontWeight: '600' },
  monthLabel: { color: colors.textSecondary, fontSize: 13 },
});

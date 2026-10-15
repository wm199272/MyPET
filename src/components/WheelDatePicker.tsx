import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatFullDate, isISODate, todayISO } from '@/src/domain';
import { colors } from '@/src/theme';

const ITEM_HEIGHT = 44;
const VISIBLE = 5;

export function DateField({
  label,
  value,
  onChange,
  error,
  minimum = '2000-01-01',
  maximum = '2036-12-31',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  minimum?: string;
  maximum?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" style={styles.input} onPress={() => setOpen(true)}>
        <Text style={value ? styles.value : styles.placeholder}>{value ? formatFullDate(value) : '请选择'}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <WheelDatePicker
        visible={open}
        value={value}
        minimum={minimum}
        maximum={maximum}
        onCancel={() => setOpen(false)}
        onConfirm={(next) => {
          onChange(next);
          setOpen(false);
        }}
      />
    </View>
  );
}

export function WheelDatePicker({
  visible,
  value,
  minimum,
  maximum,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  value: string;
  minimum: string;
  maximum: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}) {
  const initial = isISODate(value) ? value : todayISO();
  const [year, setYear] = useState(Number(initial.slice(0, 4)));
  const [month, setMonth] = useState(Number(initial.slice(5, 7)));
  const [day, setDay] = useState(Number(initial.slice(8, 10)));

  useEffect(() => {
    if (!visible) return;
    const next = isISODate(value) ? value : todayISO();
    setYear(Number(next.slice(0, 4)));
    setMonth(Number(next.slice(5, 7)));
    setDay(Number(next.slice(8, 10)));
  }, [visible, value]);

  const years = range(Number(minimum.slice(0, 4)), Number(maximum.slice(0, 4)));
  const months = range(1, 12);
  const days = range(1, daysInMonth(year, month));
  const safeDay = Math.min(day, days.length);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="关闭" style={styles.dismiss} onPress={onCancel} />
        <View style={styles.sheet}>
          <Text style={styles.preview}>{formatFullDate(toISO(year, month, safeDay))}</Text>
          <View style={styles.wheels}>
            <View style={styles.highlight} pointerEvents="none" />
            <Column values={years} selected={year} format={(item) => `${item}年`} onSelect={setYear} />
            <Column values={months} selected={month} format={(item) => `${item}月`} onSelect={setMonth} />
            <Column values={days} selected={safeDay} format={(item) => `${item}日`} onSelect={setDay} />
          </View>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.action}>
              <Text style={styles.cancel}>取消</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                const iso = clampDate(toISO(year, month, safeDay), minimum, maximum);
                onConfirm(iso);
              }}
              style={styles.action}>
              <Text style={styles.confirm}>确定</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Column({
  values,
  selected,
  format,
  onSelect,
}: {
  values: number[];
  selected: number;
  format: (value: number) => string;
  onSelect: (value: number) => void;
}) {
  const ref = useRef<ScrollView>(null);
  const selectedRef = useRef(selected);
  const fromUser = useRef(false);
  selectedRef.current = selected;
  const listKey = `${values.length}:${values[0]}:${values[values.length - 1]}`;

  useEffect(() => {
    if (fromUser.current) {
      fromUser.current = false;
      return;
    }
    const index = Math.max(0, values.indexOf(selected));
    const timer = setTimeout(() => {
      ref.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
    }, 0);
    return () => clearTimeout(timer);
  }, [selected, listKey]);

  function settle(offsetY: number) {
    const index = Math.max(0, Math.min(values.length - 1, Math.round(offsetY / ITEM_HEIGHT)));
    ref.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
    const next = values[index];
    if (next !== selectedRef.current) {
      fromUser.current = true;
      onSelect(next);
    }
  }

  return (
    <ScrollView
      ref={ref}
      style={styles.column}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
      onScroll={(event) => {
        const index = Math.max(0, Math.min(values.length - 1, Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT)));
        const next = values[index];
        if (next !== selectedRef.current) {
          fromUser.current = true;
          onSelect(next);
        }
      }}
      onScrollEndDrag={(event) => {
        const velocity = event.nativeEvent.velocity?.y ?? 0;
        if (Math.abs(velocity) < 0.1) settle(event.nativeEvent.contentOffset.y);
      }}
      onMomentumScrollEnd={(event) => settle(event.nativeEvent.contentOffset.y)}>
      {values.map((item) => (
        <View key={item} style={styles.item}>
          <Text style={item === selected ? styles.itemOn : styles.itemOff}>{format(item)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function range(start: number, end: number): number[] {
  const values: number[] = [];
  for (let value = start; value <= end; value += 1) values.push(value);
  return values;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function clampDate(value: string, minimum: string, maximum: string): string {
  if (value < minimum) return minimum;
  if (value > maximum) return maximum;
  return value;
}

const styles = StyleSheet.create({
  field: { marginBottom: 18 },
  label: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  value: { fontSize: 16, color: colors.text },
  placeholder: { fontSize: 16, color: colors.textSecondary },
  error: { color: colors.danger, fontSize: 13, marginTop: 6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(61,51,53,0.28)', justifyContent: 'flex-end' },
  dismiss: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  sheet: { zIndex: 1, backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 18, paddingBottom: 20 },
  preview: { textAlign: 'center', fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 8 },
  wheels: { height: ITEM_HEIGHT * VISIBLE, flexDirection: 'row', marginHorizontal: 16 },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  column: { flex: 1, height: ITEM_HEIGHT * VISIBLE },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  itemOn: { fontSize: 18, fontWeight: '600', color: colors.text },
  itemOff: { fontSize: 16, color: colors.textSecondary },
  actions: { flexDirection: 'row', marginTop: 8 },
  action: { flex: 1, height: 48, alignItems: 'center', justifyContent: 'center' },
  cancel: { color: colors.textSecondary, fontSize: 16 },
  confirm: { color: colors.primary, fontSize: 16, fontWeight: '600' },
});

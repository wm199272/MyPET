import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { router, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LineIcon, type LineIconName } from '@/src/components/LineIcon';
import { useArchive } from '@/src/store';
import { colors, shadow } from '@/src/theme';

const actions: { type: string; label: string; icon: LineIconName }[] = [
  { type: 'weight', label: '体重', icon: 'scale' },
  { type: 'checkup', label: '体检', icon: 'checkup' },
  { type: 'vaccine', label: '疫苗', icon: 'vaccine' },
  { type: 'bath', label: '洗澡', icon: 'bath' },
  { type: 'deworm', label: '驱虫', icon: 'bug' },
  { type: 'expense', label: '记账', icon: 'wallet' },
  { type: 'food', label: '口粮', icon: 'bowl' },
];

export function RecordTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const archive = useArchive();
  const [open, setOpen] = useState(false);
  const [barHeight, setBarHeight] = useState(64);
  const pending = useRef<Href | null>(null);
  const bottom = Math.max(insets.bottom, 8);

  useEffect(() => {
    if (open || !pending.current) return;
    const href = pending.current;
    pending.current = null;
    router.push(href);
  }, [open]);

  function openRecord(type: string) {
    pending.current = archive.data.pets.length === 0 ? '/pet/new' : `/record/${type}?from=home`;
    setOpen(false);
  }

  return (
    <View style={[styles.bar, { paddingBottom: bottom }]} onLayout={(event) => setBarHeight(event.nativeEvent.layout.height)}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const color = focused ? colors.primary : colors.textSecondary;
        const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title ?? route.name;
        const tab = (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            style={styles.tab}>
            {options.tabBarIcon?.({ focused, color, size: 22 })}
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
        if (index !== 2) return tab;
        return [
          <Pressable
            key="record-actions"
            accessibilityRole="button"
            accessibilityLabel="记一笔"
            accessibilityState={{ expanded: open }}
            onPress={() => setOpen(true)}
            style={styles.tab}>
            <View style={styles.plus}>
              <PlusGlyph />
            </View>
          </Pressable>,
          tab,
        ];
      })}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <Pressable accessibilityLabel="收起" style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={[styles.menuWrap, { bottom: barHeight + 12 }]}>
            <View style={styles.grid}>
              {actions.map((item) => (
                <Pressable key={item.type} accessibilityRole="button" accessibilityLabel={item.label} style={styles.action} onPress={() => openRecord(item.type)}>
                  <View style={styles.actionIcon}>
                    <LineIcon name={item.icon} size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.actionLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="收起记录" onPress={() => setOpen(false)} style={[styles.plusSlot, { height: barHeight, paddingBottom: bottom }]}>
            <View style={[styles.plus, styles.plusOpen]}>
              <PlusGlyph />
            </View>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function PlusGlyph() {
  return (
    <View style={styles.glyph}>
      <View style={styles.glyphBar} />
      <View style={[styles.glyphBar, styles.glyphStem]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 6,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 52, gap: 2 },
  label: { fontSize: 11, lineHeight: 14 },
  plus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  plusOpen: { transform: [{ rotate: '45deg' }] },
  glyph: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  glyphBar: { position: 'absolute', width: 16, height: 2, borderRadius: 1, backgroundColor: colors.white },
  glyphStem: { width: 2, height: 16 },
  modal: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(61,51,53,0.28)' },
  menuWrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 2 },
  grid: {
    width: 292,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 8,
    ...shadow,
  },
  action: { width: 88, minHeight: 72, alignItems: 'center', justifyContent: 'center' },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { marginTop: 6, fontSize: 13, lineHeight: 18, color: colors.text },
  plusSlot: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 3 },
});

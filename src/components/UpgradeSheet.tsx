import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui';
import { colors } from '@/src/theme';

const benefits = [
  '同时记录多只宠物，不再只限一只',
  '云端备份，换手机不丢档案',
  '和家人一起共养，各自记的都汇到同一份档案',
];

export function UpgradeSheet({ visible, onClose, onConfirm }: { visible: boolean; onClose: () => void; onConfirm: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 28) }]} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>开通家庭版</Text>
          <Text style={styles.price}>¥18 / 月　或　¥168 / 年</Text>
          {benefits.map((item) => (
            <View key={item} style={styles.benefit}>
              <View style={styles.dot} />
              <Text style={styles.benefitText}>{item}</Text>
            </View>
          ))}
          <Text style={styles.note}>支付通道上线前，可以先免费体验家庭版全部功能。</Text>
          <Button title="开通家庭版" onPress={onConfirm} style={styles.confirm} />
          <Pressable onPress={onClose} style={styles.laterHit}>
            <Text style={styles.later}>稍后再说</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(61,51,53,0.32)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 10 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '600', color: colors.text, textAlign: 'center' },
  price: { marginTop: 6, fontSize: 15, color: colors.primary, textAlign: 'center', fontWeight: '500' },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.sage },
  benefitText: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
  note: { marginTop: 18, fontSize: 13, color: colors.textSecondary, lineHeight: 20, textAlign: 'center' },
  confirm: { marginTop: 14 },
  laterHit: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', marginTop: 6 },
  later: { color: colors.textSecondary, fontSize: 14 },
});

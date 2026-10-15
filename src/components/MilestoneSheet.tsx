import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Milestone } from '@/src/domain';
import { saveMilestone } from '@/src/saveMilestone';
import { colors, shadow } from '@/src/theme';

export function MilestoneSheet({
  petName,
  milestone,
  onClose,
  onSaved,
}: {
  petName: string;
  milestone: Milestone | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const cardRef = useRef<View>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!milestone || saving) return;
    setSaving(true);
    try {
      onSaved(await saveMilestone(cardRef, petName, milestone));
    } catch {
      onSaved('没能保存图片');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={milestone !== null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panel} onPress={(event) => event.stopPropagation()}>
          {milestone ? (
            <View ref={cardRef} collapsable={false} style={[styles.card, shadow]}>
              <Text style={styles.kicker}>MyPET</Text>
              <Text style={styles.name}>{petName}</Text>
              <Text style={styles.title}>{milestone.title}</Text>
              {milestone.detail ? <Text style={styles.detail}>{milestone.detail}</Text> : null}
              <Text style={styles.basis}>{milestone.basis}</Text>
            </View>
          ) : null}
          <Pressable accessibilityRole="button" accessibilityLabel="保存图片" style={styles.save} onPress={() => void save()}>
            {saving ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.saveText}>保存图片</Text>}
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="关闭" style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>关闭</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(61,51,53,0.28)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  panel: { width: '100%', maxWidth: 360 },
  card: { backgroundColor: colors.primary, borderRadius: 28, paddingHorizontal: 28, paddingTop: 28, paddingBottom: 32, minHeight: 280 },
  kicker: { color: colors.primarySoft, fontSize: 13, lineHeight: 20 },
  name: { marginTop: 28, color: colors.white, fontSize: 28, lineHeight: 36, fontWeight: '500' },
  title: { marginTop: 12, color: colors.white, fontSize: 34, lineHeight: 44, fontWeight: '500' },
  detail: { marginTop: 8, color: colors.bg, fontSize: 16, lineHeight: 24 },
  basis: { marginTop: 28, color: colors.primarySoft, fontSize: 14, lineHeight: 22 },
  save: { marginTop: 20, minHeight: 48, borderRadius: 24, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: colors.primary, fontSize: 16, fontWeight: '500' },
  close: { marginTop: 8, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.textSecondary, fontSize: 14 },
});

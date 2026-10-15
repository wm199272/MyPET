import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { PetAvatar } from '@/src/components/PetAvatar';
import { UpgradeSheet } from '@/src/components/UpgradeSheet';
import { Card, SectionTitle, Segment } from '@/src/components/ui';
import { ageLabel, petLimitFor, planLabel, speciesLabel } from '@/src/domain';
import { useArchive } from '@/src/store';
import { colors } from '@/src/theme';

export default function MeScreen() {
  const archive = useArchive();
  const [showUpgrade, setShowUpgrade] = useState(false);
  if (!archive.ready) return <View style={styles.screen} />;

  const plan = archive.settings.plan;
  const limit = petLimitFor(plan);
  const petCount = archive.data.pets.length;
  const atLimit = plan === 'free' && petCount >= limit;

  async function confirmUpgrade() {
    // 支付通道上线前，先免费体验家庭版；接入支付后改为校验服务端订阅凭证。
    await archive.setPlan('family', '');
    setShowUpgrade(false);
    archive.showToast('已开通家庭版');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionTitle title="宠物" />
      {archive.data.pets.length === 0 ? <Text style={styles.quiet}>还没有宠物</Text> : null}
      {archive.data.pets.map((pet) => (
        <Pressable key={pet.id} style={styles.pet} onPress={() => router.push(`/pet/${pet.id}`)}>
          <PetAvatar pet={pet} size={48} />
          <View style={styles.petBody}>
            <Text style={styles.name}>{pet.name}</Text>
            <Text style={styles.quiet}>{speciesLabel[pet.species]} · {ageLabel(pet.birthday) || '未填生日'}</Text>
          </View>
          <Text style={styles.link}>档案</Text>
        </Pressable>
      ))}
      {atLimit ? (
        <Pressable onPress={() => setShowUpgrade(true)} style={styles.add}>
          <Text style={styles.link}>添加宠物（已达上限，升级解锁）</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => router.push('/pet/new')} style={styles.add}>
          <Text style={styles.link}>添加宠物</Text>
        </Pressable>
      )}

      <SectionTitle title="当前套餐" />
      <Card>
        <View style={styles.row}>
          <Text style={styles.name}>{planLabel(plan)}</Text>
          <Text style={styles.quiet}>{plan === 'family' ? '不限宠物数量' : `可记录 ${limit} 只宠物 · 已用 ${petCount}`}</Text>
        </View>
        {plan === 'free' ? (
          <Pressable onPress={() => setShowUpgrade(true)} style={styles.upgradeHit}>
            <Text style={styles.upgrade}>升级家庭版 · 云同步 / 家庭共养 / 不限宠物</Text>
          </Pressable>
        ) : (
          <Text style={styles.hint}>已包含云同步与家庭共养。续费管理将在支付通道上线后开放。</Text>
        )}
      </Card>

      <SectionTitle title="提醒" />
      <Card>
        <View style={styles.row}>
          <Text style={styles.name}>到期提醒</Text>
          <Switch
            value={archive.settings.notificationsEnabled}
            onValueChange={(value) => void archive.setNotifications(value)}
            trackColor={{ false: colors.line, true: colors.sage }}
            thumbColor={colors.white}
          />
        </View>
        <Text style={styles.hint}>食品保质期和口粮吃完都提前 7 天和当天各提醒一次，驱虫、疫苗和体检提前 3 天和当天各提醒一次。</Text>
        {Platform.OS === 'web' ? <Text style={styles.hint}>系统通知会在手机 App 里发出，这里的开关会保存下来。</Text> : null}
        {archive.data.pets.map((pet) => (
          <View key={pet.id} style={styles.petSwitch}>
            <Text style={styles.name}>{pet.name}</Text>
            <Switch
              value={pet.remindersEnabled}
              onValueChange={(value) => void archive.savePet({ ...pet, remindersEnabled: value })}
              trackColor={{ false: colors.line, true: colors.sage }}
              thumbColor={colors.white}
            />
          </View>
        ))}
      </Card>

      <SectionTitle title="新宠物默认单位" />
      <Segment
        value={archive.settings.weightUnit}
        onChange={(value) => void archive.setWeightUnit(value)}
        options={[
          { value: 'jin', label: '斤' },
          { value: 'kg', label: '公斤' },
        ]}
      />

      <SectionTitle title="关于" />
      <Card>
        <Text style={styles.name}>MyPET</Text>
        <Text style={styles.hint}>记录默认保存在这台手机上。开通家庭版后，会加密备份到云端，也能和家人一起共养。</Text>
      </Card>
      <UpgradeSheet visible={showUpgrade} onClose={() => setShowUpgrade(false)} onConfirm={() => void confirmUpgrade()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 36 },
  pet: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: 20, padding: 14, marginBottom: 10, minHeight: 72 },
  petBody: { flex: 1 },
  name: { fontSize: 16, fontWeight: '500', color: colors.text, lineHeight: 24 },
  quiet: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 2 },
  link: { color: colors.primary, fontWeight: '500' },
  add: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  upgradeHit: { marginTop: 12, minHeight: 44, justifyContent: 'center' },
  upgrade: { color: colors.primary, fontWeight: '500', fontSize: 14, lineHeight: 20 },
  petSwitch: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, minHeight: 44 },
  hint: { color: colors.textSecondary, fontSize: 13, lineHeight: 22, marginTop: 8 },
});

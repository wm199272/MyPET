import { router, useFocusEffect, useNavigation, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { StickShake } from '@/src/components/StickShake';
import { DateField } from '@/src/components/WheelDatePicker';
import { Button, Field, Segment } from '@/src/components/ui';
import { todayISO, type Gender } from '@/src/domain';
import { useArchive } from '@/src/store';
import { colors } from '@/src/theme';

export default function FortuneAskScreen() {
  const archive = useArchive();
  const pet = archive.currentPet;
  const [birthday, setBirthday] = useState(pet?.birthday ?? '');
  const [adoptedOn, setAdoptedOn] = useState(pet?.adoptedOn ?? '');
  const [gender, setGender] = useState<Gender>(pet?.gender ?? 'unknown');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [casting, setCasting] = useState(false);
  const castToken = useRef(0);
  const navigation = useNavigation();

  useEffect(() => {
    const unsub = navigation.addListener('blur', () => {
      castToken.current += 1;
      setCasting(false);
      setSaving(false);
    });
    return unsub;
  }, [navigation]);

  useFocusEffect(useCallback(() => {
    if (!pet) return;
    setBirthday(pet.birthday);
    setAdoptedOn(pet.adoptedOn);
    setGender(pet.gender);
    setError('');
  }, [pet]));

  if (!archive.ready) return <View style={styles.screen} />;
  if (!pet) {
    return (
      <View style={styles.empty}>
        <Text style={styles.quiet}>先添加一只宠物。</Text>
        <Button title="添加宠物" onPress={() => router.push('/pet/new')} />
      </View>
    );
  }

  async function cast() {
    if (!pet || saving) return;
    if (!birthday) {
      setError('请选择生日');
      return;
    }
    const token = castToken.current + 1;
    castToken.current = token;
    setSaving(true);
    setCasting(true);
    await archive.savePet({ ...pet, birthday, adoptedOn, gender });
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 5000);
    });
    if (castToken.current !== token) return;
    setSaving(false);
    router.push('/fortune/result' as Href);
  }

  if (casting) {
    return (
      <View style={styles.casting}>
        <StickShake />
        <Text style={styles.castingText}>{pet.name}正在摇签</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.name}>{pet.name}</Text>
      <Text style={styles.quiet}>生日用来起这一卦。到家日填了，会按进门那天一起算。没有记下时辰。</Text>
      <DateField label="生日" value={birthday} onChange={(value) => { setBirthday(value); setError(''); }} error={error} maximum={todayISO()} minimum="1995-01-01" />
      <DateField label="到家日期" value={adoptedOn} onChange={setAdoptedOn} maximum={todayISO()} minimum="1995-01-01" />
      <Text style={styles.hint}>到家日可以先空着，补上之后会重算。</Text>
      <Field label="性别">
        <Segment value={gender} onChange={setGender} options={[{ value: 'male', label: '公' }, { value: 'female', label: '母' }, { value: 'unknown', label: '未知' }]} />
      </Field>
      <Button title="起卦" onPress={() => { void cast(); }} disabled={saving} />
      <Text style={styles.coinHint}>问眼前的一件事，用摇铜钱。不改上面这一卦。</Text>
      <Button title="摇铜钱" variant="quiet" onPress={() => router.push('/fortune/coins' as Href)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  empty: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center', gap: 16 },
  name: { fontSize: 22, fontWeight: '500', color: colors.text, lineHeight: 30 },
  quiet: { marginTop: 8, marginBottom: 20, color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  hint: { marginTop: -6, marginBottom: 18, color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  coinHint: { marginTop: 18, marginBottom: 4, color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  casting: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  castingText: { marginTop: 8, fontSize: 16, lineHeight: 24, color: colors.text },
});

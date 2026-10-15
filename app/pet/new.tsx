import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateField } from '@/src/components/WheelDatePicker';
import { UpgradeSheet } from '@/src/components/UpgradeSheet';
import { Button, Field, Segment, TextField } from '@/src/components/ui';
import { Gender, Pet, Species, defaultBathInterval, petLimitFor, todayISO, uid } from '@/src/domain';
import { pickImage } from '@/src/pickImage';
import { guessBreed } from '@/src/guessBreed';
import { useArchive } from '@/src/store';
import { colors } from '@/src/theme';

export default function NewPetScreen() {
  const archive = useArchive();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2>(1);
  const [id] = useState(uid);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [birthday, setBirthday] = useState('');
  const [breed, setBreed] = useState('');
  const [neutered, setNeutered] = useState(false);
  const [adoptedOn, setAdoptedOn] = useState('');
  const [avatar, setAvatar] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const atLimit = archive.settings.plan === 'free' && archive.data.pets.length >= petLimitFor('free');

  async function confirmUpgrade() {
    // 支付通道上线前，先免费体验家庭版；接入支付后这里改为校验服务端订阅凭证。
    await archive.setPlan('family', '');
    archive.showToast('已开通家庭版');
  }

  function validateStepOne() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = '请填写名字';
    if (!species) next.species = '请选择物种';
    if (!gender) next.gender = '请选择性别';
    if (!birthday) next.birthday = '请选择生日';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save() {
    if (!species || !gender || saving) return;
    setSaving(true);
    const pet: Pet = {
      id,
      name: name.trim(),
      species,
      breed: breed.trim(),
      gender,
      neutered,
      birthday,
      adoptedOn,
      chip: '',
      note: '',
      avatar,
      weightUnit: archive.settings.weightUnit,
      bathInterval: defaultBathInterval(species),
      dewormInternalInterval: 90,
      dewormExternalInterval: 30,
      remindersEnabled: true,
      createdAt: new Date().toISOString(),
    };
    await archive.savePet(pet);
    await archive.setCurrentPetId(id);
    archive.showToast('已记下');
    setSaving(false);
    router.back();
  }

  if (atLimit) {
    return (
      <View style={styles.screen}>
        <UpgradeSheet
          visible
          onClose={() => router.back()}
          onConfirm={() => void confirmUpgrade()}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.step}>{step === 1 ? '先记下它是谁' : '还可以补充这些'}</Text>
        {step === 1 ? (
          <>
            <Field label="名字" error={errors.name}>
              <TextField value={name} onChangeText={(text) => { setName(text); if (!text.trim()) setErrors((prev) => ({ ...prev, name: '请填写名字' })); else setErrors((prev) => ({ ...prev, name: '' })); }} placeholder="例如：豆包" maxLength={20} />
            </Field>
            <Field label="物种" error={errors.species}>
              <Segment
                value={species}
                onChange={(value) => { setSpecies(value); setErrors((prev) => ({ ...prev, species: '' })); }}
                options={[{ value: 'cat', label: '猫' }, { value: 'dog', label: '狗' }, { value: 'other', label: '其他' }]}
              />
            </Field>
            <Field label="性别" error={errors.gender}>
              <Segment
                value={gender}
                onChange={(value) => { setGender(value); setErrors((prev) => ({ ...prev, gender: '' })); }}
                options={[{ value: 'female', label: '母' }, { value: 'male', label: '公' }, { value: 'unknown', label: '未知' }]}
              />
            </Field>
            <DateField label="生日" value={birthday} onChange={(value) => { setBirthday(value); setErrors((prev) => ({ ...prev, birthday: '' })); }} error={errors.birthday} maximum={todayISO()} minimum="1995-01-01" />
          </>
        ) : (
          <>
            <Pressable
              style={styles.avatar}
              onPress={() => {
                void pickImage(`${id}.jpg`).then(async (uri) => {
                  if (!uri) return;
                  setAvatar(uri);
                  archive.showToast('正在识别品种');
                  const guess = await guessBreed(uri);
                  if (!guess) {
                    archive.showToast('没能从这张照片看出品种');
                    return;
                  }
                  if (species && species !== 'other' && guess.species !== species) {
                    archive.showToast(guess.species === 'cat' ? '照片更像一只猫' : '照片更像一只狗');
                    return;
                  }
                  setBreed(guess.breed);
                  archive.showToast(`照片看起来是${guess.breed}`);
                });
              }}>
              {avatar ? <Image source={{ uri: avatar }} style={styles.avatarImage} /> : <Ionicons name="image-outline" size={28} color={colors.primary} />}
              <Text style={styles.avatarText}>{avatar ? '更换头像' : '添加头像'}</Text>
            </Pressable>
            <Text style={styles.avatarHint}>上传后会根据照片猜测品种，可以再改。</Text>
            <Field label="品种">
              <TextField value={breed} onChangeText={setBreed} placeholder="例如：英国短毛猫" />
            </Field>
            <Field label="绝育">
              <Segment value={neutered ? 'yes' : 'no'} onChange={(value) => setNeutered(value === 'yes')} options={[{ value: 'no', label: '还没有' }, { value: 'yes', label: '已绝育' }]} />
            </Field>
            <DateField label="到家日期" value={adoptedOn} onChange={setAdoptedOn} maximum={todayISO()} minimum="1995-01-01" />
          </>
        )}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {step === 1 ? (
          <Button title="下一步" onPress={() => { if (validateStepOne()) setStep(2); }} />
        ) : (
          <>
            <Button title="跳过" variant="quiet" onPress={() => void save()} disabled={saving} />
            <Button title="保存" onPress={() => void save()} disabled={saving} />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 12 },
  step: { fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: 20 },
  footer: { paddingHorizontal: 20, paddingTop: 8, gap: 4 },
  avatar: { alignItems: 'center', marginBottom: 20 },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  avatarText: { marginTop: 8, color: colors.primary, fontWeight: '600' },
  avatarHint: { textAlign: 'center', color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: -12, marginBottom: 16 },
});

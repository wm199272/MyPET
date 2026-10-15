import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateField } from '@/src/components/WheelDatePicker';
import { Button, Field, Segment, TextField } from '@/src/components/ui';
import { Gender, Species, WeightUnit, countRecords, todayISO } from '@/src/domain';
import { pickImage } from '@/src/pickImage';
import { guessBreed } from '@/src/guessBreed';
import { useArchive } from '@/src/store';
import { colors } from '@/src/theme';

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const archive = useArchive();
  const insets = useSafeAreaInsets();
  const pet = archive.data.pets.find((item) => item.id === id);
  if (!archive.ready) return <View style={styles.screen} />;
  if (!pet) return <View style={styles.screen}><Text style={styles.missing}>没有找到这只宠物</Text></View>;
  return <Editor petId={pet.id} />;
}

function Editor({ petId }: { petId: string }) {
  const archive = useArchive();
  const insets = useSafeAreaInsets();
  const pet = archive.data.pets.find((item) => item.id === petId)!;
  const [name, setName] = useState(pet.name);
  const [species, setSpecies] = useState<Species>(pet.species);
  const [gender, setGender] = useState<Gender>(pet.gender);
  const [birthday, setBirthday] = useState(pet.birthday);
  const [breed, setBreed] = useState(pet.breed);
  const [neutered, setNeutered] = useState(pet.neutered);
  const [adoptedOn, setAdoptedOn] = useState(pet.adoptedOn);
  const [chip, setChip] = useState(pet.chip);
  const [note, setNote] = useState(pet.note);
  const [avatar, setAvatar] = useState(pet.avatar);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(pet.weightUnit || 'jin');
  const [bathInterval, setBathInterval] = useState(String(pet.bathInterval));
  const [internalInterval, setInternalInterval] = useState(String(pet.dewormInternalInterval));
  const [externalInterval, setExternalInterval] = useState(String(pet.dewormExternalInterval));
  const [reminders, setReminders] = useState(pet.remindersEnabled);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function intervalError(value: string) {
    if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 365) return '请填写 1 到 365 的天数';
    return '';
  }

  async function save() {
    const nextErrors = {
      name: name.trim() ? '' : '请填写名字',
      birthday: birthday ? '' : '请选择生日',
      bath: intervalError(bathInterval),
      internal: intervalError(internalInterval),
      external: intervalError(externalInterval),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean) || saving) return;
    setSaving(true);
    await archive.savePet({
      ...pet,
      name: name.trim(),
      species,
      gender,
      birthday,
      breed: breed.trim(),
      neutered,
      adoptedOn,
      chip: chip.trim(),
      note: note.trim(),
      avatar,
      weightUnit,
      bathInterval: Number(bathInterval),
      dewormInternalInterval: Number(internalInterval),
      dewormExternalInterval: Number(externalInterval),
      remindersEnabled: reminders,
    });
    archive.showToast('已记下');
    setSaving(false);
    router.back();
  }

  function confirmDelete() {
    const count = countRecords(pet.id, archive.data);
    Alert.alert('删除这只宠物？', `会一并删除 ${count} 条记录，删除后无法恢复。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          void archive.removePet(pet.id).then(() => router.back());
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.avatar} onPress={() => {
          void pickImage(`${pet.id}.jpg`).then(async (uri) => {
            if (!uri) return;
            setAvatar(uri);
            archive.showToast('正在识别品种');
            const guess = await guessBreed(uri);
            if (!guess) {
              archive.showToast('没能从这张照片看出品种');
              return;
            }
            if (species !== 'other' && guess.species !== species) {
              archive.showToast(guess.species === 'cat' ? '照片更像一只猫' : '照片更像一只狗');
              return;
            }
            setBreed(guess.breed);
            archive.showToast(`照片看起来是${guess.breed}`);
          });
        }}>
          {avatar ? <Image source={{ uri: avatar }} style={styles.avatarImage} /> : <Ionicons name="image-outline" size={28} color={colors.primary} />}
          <Text style={styles.link}>{avatar ? '更换头像' : '添加头像'}</Text>
        </Pressable>
        <Text style={styles.avatarHint}>上传后会根据照片猜测品种，可以再改。</Text>
        <Field label="名字" error={errors.name}>
          <TextField value={name} onChangeText={(text) => { setName(text); setErrors((prev) => ({ ...prev, name: text.trim() ? '' : '请填写名字' })); }} />
        </Field>
        <Field label="物种">
          <Segment value={species} onChange={setSpecies} options={[{ value: 'cat', label: '猫' }, { value: 'dog', label: '狗' }, { value: 'other', label: '其他' }]} />
        </Field>
        <Field label="性别">
          <Segment value={gender} onChange={setGender} options={[{ value: 'female', label: '母' }, { value: 'male', label: '公' }, { value: 'unknown', label: '未知' }]} />
        </Field>
        <DateField label="生日" value={birthday} onChange={setBirthday} error={errors.birthday} maximum={todayISO()} minimum="1995-01-01" />
        <Field label="品种">
          <TextField value={breed} onChangeText={setBreed} placeholder="例如：英国短毛猫" />
        </Field>
        <Field label="绝育">
          <Segment value={neutered ? 'yes' : 'no'} onChange={(value) => setNeutered(value === 'yes')} options={[{ value: 'no', label: '还没有' }, { value: 'yes', label: '已绝育' }]} />
        </Field>
        <DateField label="到家日期" value={adoptedOn} onChange={setAdoptedOn} maximum={todayISO()} minimum="1995-01-01" />
        <Field label="体重单位">
          <Segment value={weightUnit} onChange={setWeightUnit} options={[{ value: 'jin', label: '斤' }, { value: 'kg', label: '公斤' }]} />
        </Field>
        <Field label="芯片号">
          <TextField value={chip} onChangeText={setChip} />
        </Field>
        <Field label="备注">
          <TextField value={note} onChangeText={setNote} multiline />
        </Field>
        <Field label="洗澡间隔（天）" error={errors.bath}>
          <TextField value={bathInterval} onChangeText={setBathInterval} keyboardType="number-pad" />
        </Field>
        <Field label="体内驱虫间隔（天）" error={errors.internal}>
          <TextField value={internalInterval} onChangeText={setInternalInterval} keyboardType="number-pad" />
        </Field>
        <Field label="体外驱虫间隔（天）" error={errors.external}>
          <TextField value={externalInterval} onChangeText={setExternalInterval} keyboardType="number-pad" />
        </Field>
        <View style={styles.remind}>
          <Text style={styles.remindText}>这只宠物的提醒</Text>
          <Switch value={reminders} onValueChange={setReminders} trackColor={{ false: colors.line, true: colors.sage }} thumbColor={colors.white} />
        </View>
        <Button title="删除这只宠物" variant="danger" onPress={confirmDelete} />
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button title="保存" onPress={() => void save()} disabled={saving} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 16 },
  missing: { textAlign: 'center', marginTop: 48, color: colors.textSecondary },
  avatar: { alignItems: 'center', marginBottom: 16 },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  link: { marginTop: 8, color: colors.primary, fontWeight: '600' },
  avatarHint: { textAlign: 'center', color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: -8, marginBottom: 16 },
  remind: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  remindText: { fontSize: 16, color: colors.text },
  footer: { paddingHorizontal: 20, paddingTop: 8 },
});

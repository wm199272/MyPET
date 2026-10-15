import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect, useState, type ReactNode } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateField } from '@/src/components/WheelDatePicker';
import { Button, Field, Segment, TextField } from '@/src/components/ui';
import {
  BathPlace,
  DewormType,
  ExpenseCategory,
  ExpenseRecord,
  FoodKind,
  FoodRemaining,
  Pet,
  RecordType,
  WeightCondition,
  addDays,
  checkupItems,
  diffDays,
  displayToKg,
  formatDate,
  forecastFood,
  isRecordType,
  kgToDisplay,
  rationStatus,
  recordTypeLabel,
  todayISO,
  uid,
} from '@/src/domain';
import { guidesFor } from '@/src/feedingGuides';
import { medicinesFor } from '@/src/dewormMedicines';
import { pickImage } from '@/src/pickImage';
import { useArchive } from '@/src/store';
import { colors } from '@/src/theme';

export default function RecordScreen() {
  const params = useLocalSearchParams<{ type: string; id?: string; from?: string }>();
  const type = typeof params.type === 'string' && isRecordType(params.type) ? params.type : null;
  const recordId = typeof params.id === 'string' ? params.id : '';
  returnHome = params.from === 'home';
  const archive = useArchive();
  if (!type) return <View style={styles.screen} />;
  if (!archive.ready) return <View style={styles.screen} />;
  if (archive.data.pets.length === 0) {
    return (
      <View style={styles.screen}>
        <Text style={styles.missing}>先添加一只宠物，再记这一笔。</Text>
      </View>
    );
  }
  return <RecordForm type={type} recordId={recordId} />;
}

function RecordForm({ type, recordId }: { type: RecordType; recordId: string }) {
  const archive = useArchive();
  const navigation = useNavigation();
  const editing = Boolean(recordId);
  useLayoutEffect(() => {
    navigation.setOptions({ title: `${editing ? '编辑' : '记'}${recordTypeLabel[type]}` });
  }, [editing, navigation, type]);

  if (type === 'weight') return <WeightForm recordId={recordId} />;
  if (type === 'checkup') return <CheckupForm recordId={recordId} />;
  if (type === 'bath') return <BathForm recordId={recordId} />;
  if (type === 'deworm') return <DewormForm recordId={recordId} />;
  if (type === 'vaccine') return <VaccineForm recordId={recordId} />;
  if (type === 'food') return <FoodForm recordId={recordId} />;
  return <ExpenseForm recordId={recordId} />;
}

function usePetChoice(initialPetId: string) {
  const archive = useArchive();
  const fallback = initialPetId || archive.currentPet?.id || archive.data.pets[0].id;
  const [petId, setPetId] = useState(fallback);
  const pet = archive.data.pets.find((item) => item.id === petId) ?? archive.data.pets[0];
  return { pet, petId, setPetId, pets: archive.data.pets, locked: Boolean(initialPetId) };
}

function PetChoice({ petId, pets, locked, onChange }: { petId: string; pets: Pet[]; locked: boolean; onChange: (id: string) => void }) {
  if (pets.length < 2) return null;
  return (
    <Field label="宠物">
      <Segment value={petId} onChange={locked ? () => undefined : onChange} options={pets.map((pet) => ({ value: pet.id, label: pet.name }))} />
    </Field>
  );
}

function FormShell({ children, onSave, onDelete, saving }: { children: ReactNode; onSave: () => void; onDelete?: () => void; saving: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
        {onDelete ? <Button title="删除这条记录" variant="danger" onPress={onDelete} style={styles.delete} /> : null}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button title="保存" onPress={onSave} disabled={saving} />
      </View>
    </KeyboardAvoidingView>
  );
}

let returnHome = false;

function finish(showToast: (message: string) => void) {
  showToast('已记下');
  if (returnHome) router.navigate('/');
  else router.back();
}

function askDelete(message: string, action: () => Promise<void>) {
  Alert.alert('删除这条记录？', message, [
    { text: '取消', style: 'cancel' },
    { text: '删除', style: 'destructive', onPress: () => { void action().then(() => router.back()); } },
  ]);
}

function WeightForm({ recordId }: { recordId: string }) {
  const archive = useArchive();
  const existing = archive.data.weights.find((row) => row.id === recordId);
  const choice = usePetChoice(existing?.petId || '');
  const unit = choice.pet.weightUnit || archive.settings.weightUnit;
  const [date, setDate] = useState(existing?.date || todayISO());
  const [weight, setWeight] = useState(existing ? kgToDisplay(existing.weightKg, unit).toFixed(1) : '');
  const [condition, setCondition] = useState<WeightCondition | ''>(existing?.condition || '');
  const [note, setNote] = useState(existing?.note || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    const parsed = parseDecimal(weight, 1);
    if (parsed == null || parsed <= 0) {
      setError('请填写体重大于 0');
      return;
    }
    setSaving(true);
    await archive.saveWeight({
      id: existing?.id || uid(),
      petId: choice.pet.id,
      date,
      weightKg: displayToKg(parsed, unit),
      condition,
      note: note.trim(),
    });
    setSaving(false);
    finish(archive.showToast);
  }

  return (
    <FormShell onSave={() => void save()} saving={saving} onDelete={existing ? () => askDelete('删除后无法恢复。', () => archive.removeRecord('weight', existing.id)) : undefined}>
      <PetChoice petId={choice.petId} pets={choice.pets} locked={choice.locked} onChange={choice.setPetId} />
      <DateField label="日期" value={date} onChange={setDate} maximum={todayISO()} minimum="2010-01-01" />
      <Field label={unit === 'jin' ? '体重（斤）' : '体重（公斤）'} error={error}>
        <TextField value={weight} onChangeText={(text) => { setWeight(sanitizeDecimal(text, 1)); setError(''); }} keyboardType="decimal-pad" placeholder="0.0" />
      </Field>
      <Field label="体况">
        <Segment value={condition || null} onChange={(value) => setCondition(value)} options={[{ value: 'thin', label: '偏瘦' }, { value: 'normal', label: '标准' }, { value: 'heavy', label: '偏胖' }]} />
      </Field>
      <Field label="备注">
        <TextField value={note} onChangeText={setNote} multiline />
      </Field>
    </FormShell>
  );
}

function CheckupForm({ recordId }: { recordId: string }) {
  const archive = useArchive();
  const existing = archive.data.checkups.find((row) => row.id === recordId);
  const choice = usePetChoice(existing?.petId || '');
  const [date, setDate] = useState(existing?.date || todayISO());
  const [hospital, setHospital] = useState(existing?.hospital || '');
  const [items, setItems] = useState<string[]>(existing?.items || []);
  const [summary, setSummary] = useState(existing?.summary || '');
  const [nextDate, setNextDate] = useState(existing?.nextDate || '');
  const [cost, setCost] = useState(existing?.cost ? existing.cost.toFixed(2) : '');
  const [photo, setPhoto] = useState(existing?.photo || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    const amount = parseMoney(cost);
    if (amount === 'invalid') {
      setError('请填写正确的金额');
      return;
    }
    setSaving(true);
    await archive.saveCheckup({
      id: existing?.id || uid(),
      petId: choice.pet.id,
      date,
      hospital: hospital.trim(),
      items,
      summary: summary.trim(),
      nextDate,
      cost: amount,
      photo,
    });
    setSaving(false);
    finish(archive.showToast);
  }

  return (
    <FormShell
      onSave={() => void save()}
      saving={saving}
      onDelete={existing ? () => askDelete(existing.cost ? '关联的消费也会一起删除。' : '删除后无法恢复。', () => archive.removeRecord('checkup', existing.id)) : undefined}>
      <PetChoice petId={choice.petId} pets={choice.pets} locked={choice.locked} onChange={choice.setPetId} />
      <DateField label="日期" value={date} onChange={setDate} maximum={todayISO()} minimum="2010-01-01" />
      <Field label="医院">
        <TextField value={hospital} onChangeText={setHospital} />
      </Field>
      <Field label="项目">
        <Segment
          value={null}
          onChange={(value) => setItems((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))}
          options={checkupItems.map((item) => ({ value: item, label: items.includes(item) ? `${item} ✓` : item }))}
        />
      </Field>
      <Field label="结论摘要">
        <TextField value={summary} onChangeText={setSummary} multiline />
      </Field>
      <DateField label="下次体检" value={nextDate} onChange={setNextDate} minimum={date} maximum="2036-12-31" />
      <Field label="花费（元）" error={error}>
        <TextField value={cost} onChangeText={(text) => { setCost(sanitizeDecimal(text, 2)); setError(''); }} keyboardType="decimal-pad" placeholder="0.00" />
      </Field>
      <Pressable style={styles.photo} onPress={() => { void pickImage(`checkup-${existing?.id || 'new'}.jpg`).then((uri) => { if (uri) setPhoto(uri); }); }}>
        {photo ? <Image source={{ uri: photo }} style={styles.photoImage} /> : <Text style={styles.link}>添加检查单照片</Text>}
      </Pressable>
    </FormShell>
  );
}

function BathForm({ recordId }: { recordId: string }) {
  const archive = useArchive();
  const existing = archive.data.baths.find((row) => row.id === recordId);
  const choice = usePetChoice(existing?.petId || '');
  const [date, setDate] = useState(existing?.date || todayISO());
  const [place, setPlace] = useState<BathPlace>(existing?.place || 'home');
  const [shopName, setShopName] = useState(existing?.shopName || '');
  const [cost, setCost] = useState(existing?.cost ? existing.cost.toFixed(2) : '');
  const [note, setNote] = useState(existing?.note || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    const amount = parseMoney(cost);
    if (amount === 'invalid') {
      setError('请填写正确的金额');
      return;
    }
    setSaving(true);
    await archive.saveBath({
      id: existing?.id || uid(),
      petId: choice.pet.id,
      date,
      place,
      shopName: shopName.trim(),
      cost: amount,
      note: note.trim(),
    });
    setSaving(false);
    finish(archive.showToast);
  }

  return (
    <FormShell onSave={() => void save()} saving={saving} onDelete={existing ? () => askDelete(existing.cost ? '关联的消费也会一起删除。' : '删除后无法恢复。', () => archive.removeRecord('bath', existing.id)) : undefined}>
      <PetChoice petId={choice.petId} pets={choice.pets} locked={choice.locked} onChange={choice.setPetId} />
      <DateField label="日期" value={date} onChange={setDate} maximum={todayISO()} minimum="2010-01-01" />
      <Field label="方式">
        <Segment value={place} onChange={setPlace} options={[{ value: 'home', label: '家中' }, { value: 'shop', label: '门店' }]} />
      </Field>
      {place === 'shop' ? (
        <Field label="门店">
          <TextField value={shopName} onChangeText={setShopName} />
        </Field>
      ) : null}
      <Field label="花费（元）" error={error}>
        <TextField value={cost} onChangeText={(text) => { setCost(sanitizeDecimal(text, 2)); setError(''); }} keyboardType="decimal-pad" placeholder="0.00" />
      </Field>
      <Field label="备注">
        <TextField value={note} onChangeText={setNote} multiline />
      </Field>
    </FormShell>
  );
}

function DewormForm({ recordId }: { recordId: string }) {
  const archive = useArchive();
  const existing = archive.data.deworms.find((row) => row.id === recordId);
  const choice = usePetChoice(existing?.petId || '');
  const [date, setDate] = useState(existing?.date || todayISO());
  const [type, setType] = useState<DewormType>(existing?.type || 'internal');
  const [medicine, setMedicine] = useState(existing?.medicine || '');
  const [nextDate, setNextDate] = useState(existing?.nextDate || addDays(existing?.date || todayISO(), choice.pet.dewormInternalInterval));
  const [coverDays, setCoverDays] = useState(existing?.nextDate ? String(Math.max(diffDays(existing.date, existing.nextDate), 0)) : '');
  const [manualNext, setManualNext] = useState(Boolean(existing?.nextDate));
  const [pickingMedicine, setPickingMedicine] = useState(false);
  const [saving, setSaving] = useState(false);
  const options = medicinesFor(choice.pet.species);

  function intervalFor(nextType: DewormType) {
    return nextType === 'external' ? choice.pet.dewormExternalInterval : choice.pet.dewormInternalInterval;
  }

  function applyCoverDays(daysText: string, from = date) {
    setCoverDays(daysText);
    if (/^\d+$/.test(daysText) && Number(daysText) > 0) {
      setNextDate(addDays(from, Number(daysText)));
      setManualNext(true);
    }
  }

  return (
    <FormShell
      saving={saving}
      onDelete={existing ? () => askDelete('删除后无法恢复。', () => archive.removeRecord('deworm', existing.id)) : undefined}
      onSave={() => {
        void (async () => {
          setSaving(true);
          await archive.saveDeworm({
            id: existing?.id || uid(),
            petId: choice.pet.id,
            date,
            type,
            medicine: medicine.trim(),
            nextDate: type === 'both' && !manualNext ? '' : nextDate,
          });
          setSaving(false);
          finish(archive.showToast);
        })();
      }}>
      <PetChoice petId={choice.petId} pets={choice.pets} locked={choice.locked} onChange={choice.setPetId} />
      <DateField
        label="日期"
        value={date}
        maximum={todayISO()}
        minimum="2010-01-01"
        onChange={(value) => {
          setDate(value);
          if (/^\d+$/.test(coverDays) && Number(coverDays) > 0) setNextDate(addDays(value, Number(coverDays)));
          else if (!manualNext && type !== 'both') setNextDate(addDays(value, intervalFor(type)));
        }}
      />
      <Field label="类型">
        <Segment
          value={type}
          onChange={(value) => {
            setType(value);
            if (!manualNext) setNextDate(value === 'both' ? '' : addDays(date, intervalFor(value)));
          }}
          options={[{ value: 'internal', label: '体内' }, { value: 'external', label: '体外' }, { value: 'both', label: '体内外' }]}
        />
      </Field>
      <Field label="药品">
        <Pressable accessibilityRole="button" onPress={() => setPickingMedicine(true)} style={styles.guidePick}>
          <Text style={styles.dueTitle}>{medicine.trim() || '选择常见驱虫药'}</Text>
          <Text style={styles.note}>也可以在下面自己写品牌</Text>
        </Pressable>
        <TextField value={medicine} onChangeText={setMedicine} placeholder="品牌" />
      </Field>
      <Field label="有效天数">
        <TextField value={coverDays} onChangeText={applyCoverDays} keyboardType="number-pad" placeholder="例如：30" />
      </Field>
      <Text style={styles.hint}>天数来自包装上的下次用药间隔，可以改，也可以直接改下次日期。</Text>
      <DateField
        label="下次日期"
        value={nextDate}
        minimum={date}
        maximum="2036-12-31"
        onChange={(value) => { setManualNext(true); setNextDate(value); }}
      />
      {type === 'both' && !manualNext ? <Text style={styles.hint}>体内和体外会按这只宠物各自的间隔计算。</Text> : null}
      <Modal visible={pickingMedicine} transparent animationType="slide" onRequestClose={() => setPickingMedicine(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPickingMedicine(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>常见驱虫药</Text>
            <ScrollView style={styles.guideList}>
              {options.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name} ${item.days} 天`}
                  style={styles.guideRow}
                  onPress={() => {
                    setMedicine(item.name);
                    setType(item.type);
                    applyCoverDays(String(item.days));
                    setPickingMedicine(false);
                  }}>
                  <Text style={styles.dueTitle}>{item.name} · {item.days} 天</Text>
                  <Text style={styles.note}>{item.note}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </FormShell>
  );
}

function VaccineForm({ recordId }: { recordId: string }) {
  const archive = useArchive();
  const existing = archive.data.vaccines.find((row) => row.id === recordId);
  const choice = usePetChoice(existing?.petId || '');
  const [name, setName] = useState(existing?.name || '');
  const [date, setDate] = useState(existing?.date || todayISO());
  const [nextDate, setNextDate] = useState(existing?.nextDate || '');
  const [hospital, setHospital] = useState(existing?.hospital || '');
  const [cost, setCost] = useState(existing?.cost ? existing.cost.toFixed(2) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function save() {
    const amount = parseMoney(cost);
    const next = { name: name.trim() ? '' : '请填写疫苗名称', cost: amount === 'invalid' ? '请填写正确的金额' : '' };
    setErrors(next);
    if (next.name || next.cost) return;
    setSaving(true);
    await archive.saveVaccine({
      id: existing?.id || uid(),
      petId: choice.pet.id,
      date,
      name: name.trim(),
      nextDate,
      hospital: hospital.trim(),
      cost: amount === 'invalid' ? null : amount,
    });
    setSaving(false);
    finish(archive.showToast);
  }

  return (
    <FormShell onSave={() => void save()} saving={saving} onDelete={existing ? () => askDelete(existing.cost ? '关联的消费也会一起删除。' : '删除后无法恢复。', () => archive.removeRecord('vaccine', existing.id)) : undefined}>
      <PetChoice petId={choice.petId} pets={choice.pets} locked={choice.locked} onChange={choice.setPetId} />
      <Field label="名称" error={errors.name}>
        <TextField value={name} onChangeText={(text) => { setName(text); setErrors((prev) => ({ ...prev, name: text.trim() ? '' : '请填写疫苗名称' })); }} placeholder="例如：猫三联" />
      </Field>
      <DateField label="接种日期" value={date} onChange={setDate} maximum={todayISO()} minimum="2010-01-01" />
      <DateField label="下一针" value={nextDate} onChange={setNextDate} minimum={date} maximum="2036-12-31" />
      <Field label="医院">
        <TextField value={hospital} onChangeText={setHospital} />
      </Field>
      <Field label="花费（元）" error={errors.cost}>
        <TextField value={cost} onChangeText={(text) => { setCost(sanitizeDecimal(text, 2)); setErrors((prev) => ({ ...prev, cost: '' })); }} keyboardType="decimal-pad" placeholder="0.00" />
      </Field>
    </FormShell>
  );
}

function ExpenseForm({ recordId }: { recordId: string }) {
  const archive = useArchive();
  const existing = archive.data.expenses.find((row) => row.id === recordId);
  const choice = usePetChoice(existing?.petId || '');
  const [date, setDate] = useState(existing?.date || todayISO());
  const [amount, setAmount] = useState(existing ? existing.amount.toFixed(2) : '');
  const [category, setCategory] = useState<ExpenseCategory>(existing?.category || 'food');
  const [note, setNote] = useState(existing?.note || '');
  const [link, setLink] = useState(existing?.sourceType && existing.sourceId ? `${existing.sourceType}:${existing.sourceId}` : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const careOptions = careLinks(archive.data, choice.pet.id);
  const activeLink = careOptions.some((item) => item.value === link) ? link : '';

  async function save() {
    const parsed = parseMoney(amount);
    if (parsed == null || parsed === 'invalid' || parsed <= 0) {
      setError('请填写金额');
      return;
    }
    const picked = careOptions.find((item) => item.value === activeLink);
    const sourceType = picked?.sourceType || '';
    const sourceId = picked?.sourceId || '';
    setSaving(true);
    await archive.saveExpense({
      id: existing?.id || uid(),
      petId: choice.pet.id,
      date,
      amount: parsed,
      category,
      note: note.trim(),
      sourceType,
      sourceId,
    });
    setSaving(false);
    finish(archive.showToast);
  }

  return (
    <FormShell onSave={() => void save()} saving={saving} onDelete={existing ? () => askDelete('删除后无法恢复。', () => archive.removeRecord('expense', existing.id)) : undefined}>
      <PetChoice petId={choice.petId} pets={choice.pets} locked={choice.locked} onChange={choice.setPetId} />
      <DateField label="日期" value={date} onChange={setDate} maximum={todayISO()} minimum="2010-01-01" />
      <Field label="金额（元）" error={error}>
        <TextField value={amount} onChangeText={(text) => { setAmount(sanitizeDecimal(text, 2)); setError(text.trim() ? '' : '请填写金额'); }} keyboardType="decimal-pad" placeholder="0.00" />
      </Field>
      <Field label="分类">
        <Segment
          value={category}
          onChange={setCategory}
          options={[
            { value: 'food', label: '粮食' },
            { value: 'snack', label: '零食' },
            { value: 'medical', label: '医疗' },
            { value: 'groom', label: '洗护' },
            { value: 'supply', label: '用品' },
            { value: 'other', label: '其他' },
          ]}
        />
      </Field>
      {careOptions.length > 1 ? (
        <Field label="关联护理记录">
          <Segment
            value={activeLink}
            onChange={(value) => {
              setLink(value);
              const picked = careOptions.find((item) => item.value === value);
              if (picked?.category) setCategory(picked.category);
            }}
            options={careOptions.map((item) => ({ value: item.value, label: item.label }))}
          />
        </Field>
      ) : null}
      <Field label="备注">
        <TextField value={note} onChangeText={setNote} multiline />
      </Field>
      {activeLink ? <Text style={styles.hint}>会和这条护理记录共用同一笔花费，不会再记一笔。</Text> : null}
    </FormShell>
  );
}

function careLinks(data: ReturnType<typeof useArchive>['data'], petId: string) {
  const options: { value: string; label: string; sourceType: ExpenseRecord['sourceType']; sourceId: string; category?: ExpenseCategory }[] = [
    { value: '', label: '不关联', sourceType: '', sourceId: '' },
  ];
  data.checkups
    .filter((row) => row.petId === petId)
    .forEach((row) => options.push({ value: `checkup:${row.id}`, label: `体检 ${formatDate(row.date)}`, sourceType: 'checkup', sourceId: row.id, category: 'medical' }));
  data.baths
    .filter((row) => row.petId === petId)
    .forEach((row) => options.push({ value: `bath:${row.id}`, label: `洗澡 ${formatDate(row.date)}`, sourceType: 'bath', sourceId: row.id, category: 'groom' }));
  data.vaccines
    .filter((row) => row.petId === petId)
    .forEach((row) => options.push({ value: `vaccine:${row.id}`, label: `疫苗 ${formatDate(row.date)}`, sourceType: 'vaccine', sourceId: row.id, category: 'medical' }));
  return options;
}

function FoodForm({ recordId }: { recordId: string }) {
  const archive = useArchive();
  const existing = archive.data.foods.find((row) => row.id === recordId);
  const choice = usePetChoice(existing?.petId || '');
  const [brand, setBrand] = useState(existing?.brand || '');
  const [kind, setKind] = useState<FoodKind>(existing?.kind || 'staple');
  const [spec, setSpec] = useState(existing?.spec || '');
  const [producedOn, setProducedOn] = useState(existing?.producedOn || '');
  const [expiresOn, setExpiresOn] = useState(existing?.expiresOn || '');
  const [openedOn, setOpenedOn] = useState(existing?.openedOn || '');
  const [openedDays, setOpenedDays] = useState(existing?.openedDays ? String(existing.openedDays) : '');
  const [remaining, setRemaining] = useState<FoodRemaining>(existing?.remaining || 'plenty');
  const [guideId, setGuideId] = useState(existing?.guideId || '');
  const [bagText, setBagText] = useState(existing?.bagGrams ? trimKg(existing.bagGrams / 1000) : '');
  const [dailyText, setDailyText] = useState(existing?.dailyGrams ? String(existing.dailyGrams) : '');
  const [picking, setPicking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const guides = guidesFor(choice.pet.species);
  const selectedGuide = guides.find((guide) => guide.id === guideId);
  const bagKg = parseDecimal(bagText, 2);
  const draftForecast = forecastFood(choice.pet, archive.data.weights, {
    id: existing?.id || 'draft',
    petId: choice.pet.id,
    brand: brand.trim() || selectedGuide?.product || '',
    kind,
    spec,
    producedOn,
    expiresOn,
    openedOn,
    openedDays: null,
    remaining,
    loggedOn: existing?.loggedOn || todayISO(),
    guideId,
    bagGrams: bagKg != null && bagKg > 0 ? Math.round(bagKg * 1000) : null,
    dailyGrams: guideId === 'custom' && /^\d+$/.test(dailyText) ? Number(dailyText) : null,
  });

  async function save() {
    const days = openedDays.trim();
    const usingRation = Boolean(guideId);
    const next = {
      brand: brand.trim() ? '' : '请填写品牌',
      expiresOn: expiresOn ? '' : '请选择保质期',
      openedDays: !days || (/^\d+$/.test(days) && Number(days) > 0) ? '' : '请填写开封后可食用天数',
      bag: !usingRation || (bagKg != null && bagKg > 0) ? '' : '请填写这袋有多少公斤',
      daily: guideId !== 'custom' || (/^\d+$/.test(dailyText.trim()) && Number(dailyText) > 0) ? '' : '请填写每天吃多少克',
      openedOn: !usingRation || openedOn ? '' : '请选择开封日期',
      guide: guideId !== 'pending' ? '' : '请选择一个包装表',
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setSaving(true);
    const guide = guides.find((item) => item.id === guideId);
    await archive.saveFood({
      id: existing?.id || uid(),
      petId: choice.pet.id,
      brand: brand.trim() || (guide ? `${guide.brand} ${guide.product}` : ''),
      kind,
      spec: spec.trim(),
      producedOn,
      expiresOn,
      openedOn,
      openedDays: days ? Number(days) : null,
      remaining,
      loggedOn: existing?.loggedOn || todayISO(),
      guideId,
      bagGrams: bagKg != null && bagKg > 0 ? Math.round(bagKg * 1000) : null,
      dailyGrams: guideId === 'custom' ? Number(dailyText) : null,
    });
    setSaving(false);
    finish(archive.showToast);
  }

  return (
    <FormShell onSave={() => void save()} saving={saving} onDelete={existing ? () => askDelete('删除后无法恢复。', () => archive.removeRecord('food', existing.id)) : undefined}>
      <PetChoice petId={choice.petId} pets={choice.pets} locked={choice.locked} onChange={choice.setPetId} />
      <Field label="品牌" error={errors.brand}>
        <TextField value={brand} onChangeText={(text) => { setBrand(text); setErrors((prev) => ({ ...prev, brand: text.trim() ? '' : '请填写品牌' })); }} />
      </Field>
      <Field label="种类">
        <Segment value={kind} onChange={setKind} options={[{ value: 'staple', label: '主粮' }, { value: 'snack', label: '零食' }, { value: 'can', label: '罐头' }, { value: 'supplement', label: '营养品' }]} />
      </Field>
      {kind === 'staple' ? (
        <>
          <Field label="每日用量" error={errors.guide}>
            <Segment
              value={guideId === 'custom' ? 'custom' : guideId ? 'guide' : 'off'}
              onChange={(value) => {
                if (value === 'off') setGuideId('');
                else if (value === 'custom') setGuideId('custom');
                else {
                  if (!selectedGuide) setGuideId('pending');
                  setPicking(true);
                }
              }}
              options={[{ value: 'off', label: '不估算' }, { value: 'guide', label: '包装表' }, { value: 'custom', label: '自己填' }]}
            />
          </Field>
          {choice.pet.species === 'other' ? <Text style={styles.hint}>猫粮和狗粮的包装表只覆盖猫和狗。自己填每天的克数，也可以估算吃完日期。</Text> : null}
          {selectedGuide ? (
            <Pressable accessibilityRole="button" onPress={() => setPicking(true)} style={styles.guidePick}>
              <Text style={styles.dueTitle}>{selectedGuide.brand} {selectedGuide.product}</Text>
              <Text style={styles.note}>{selectedGuide.note}</Text>
            </Pressable>
          ) : guideId && guideId !== 'custom' ? (
            <Pressable accessibilityRole="button" onPress={() => setPicking(true)}><Text style={styles.link}>选择包装表</Text></Pressable>
          ) : null}
          {guideId === 'custom' ? (
            <Field label="每天吃多少克" error={errors.daily}>
              <TextField value={dailyText} onChangeText={setDailyText} keyboardType="number-pad" placeholder="例如：56" />
            </Field>
          ) : null}
          {guideId ? (
            <Field label="这袋有多少公斤" error={errors.bag}>
              <TextField value={bagText} onChangeText={(text) => setBagText(sanitizeDecimal(text, 2))} keyboardType="decimal-pad" placeholder="例如：1.5" />
            </Field>
          ) : null}
          {draftForecast ? (
            <View style={styles.ration}>
              <Text style={styles.dueTitle}>每天 {draftForecast.dailyGrams} 克 · {rationStatus(draftForecast)}</Text>
              <Text style={styles.note}>{draftForecast.basis}</Text>
              <Text style={styles.note}>预计 {formatDate(draftForecast.finishOn)}吃完。这是包装表估算，没有计入零食。</Text>
            </View>
          ) : guideId && guideId !== 'custom' && !archive.data.weights.some((row) => row.petId === choice.pet.id) ? (
            <Text style={styles.hint}>先记一笔体重，才能按包装表估算每天吃多少。</Text>
          ) : null}
        </>
      ) : null}
      <Field label="规格">
        <TextField value={spec} onChangeText={setSpec} placeholder="例如：1.5 公斤" />
      </Field>
      <DateField label="生产日期" value={producedOn} onChange={setProducedOn} maximum={todayISO()} minimum="2015-01-01" />
      <DateField label="保质期至" value={expiresOn} onChange={(value) => { setExpiresOn(value); setErrors((prev) => ({ ...prev, expiresOn: '' })); }} error={errors.expiresOn} minimum="2015-01-01" maximum="2036-12-31" />
      <DateField label="开封日期" value={openedOn} onChange={(value) => { setOpenedOn(value); setErrors((prev) => ({ ...prev, openedOn: '' })); }} error={errors.openedOn} maximum={todayISO()} minimum="2015-01-01" />
      <Field label="开封后可食用天数" error={errors.openedDays}>
        <TextField value={openedDays} onChangeText={setOpenedDays} keyboardType="number-pad" />
      </Field>
      <Field label="剩余">
        <Segment value={remaining} onChange={setRemaining} options={[{ value: 'plenty', label: '充足' }, { value: 'low', label: '不多' }, { value: 'finished', label: '已吃完' }]} />
      </Field>
      <Modal visible={picking} transparent animationType="slide" onRequestClose={() => setPicking(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPicking(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>选择包装表</Text>
            <ScrollView style={styles.guideList}>
              {guides.length === 0 ? <Text style={styles.note}>包装表只覆盖猫和狗。可以改用「自己填」，写上每天吃多少克。</Text> : guides.map((guide) => (
                <Pressable
                  key={guide.id}
                  accessibilityRole="button"
                  accessibilityLabel={guide.product}
                  style={styles.guideRow}
                  onPress={() => {
                    setGuideId(guide.id);
                    setBrand(`${guide.brand} ${guide.product}`);
                    setErrors((prev) => ({ ...prev, brand: '', guide: '' }));
                    setPicking(false);
                  }}>
                  <Text style={styles.dueTitle}>{guide.brand} {guide.product}</Text>
                  <Text style={styles.note}>{guide.note}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </FormShell>
  );
}

function trimKg(kg: number): string {
  return String(Math.round(kg * 100) / 100);
}

function sanitizeDecimal(text: string, places: number): string {
  const cleaned = text.replace(/[^\d.]/g, '');
  const [whole, fraction] = cleaned.split('.');
  if (fraction === undefined) return whole;
  return `${whole}.${fraction.slice(0, places)}`;
}

function parseDecimal(text: string, places: number): number | null {
  const pattern = places === 1 ? /^\d+(\.\d)?$/ : /^\d+(\.\d{1,2})?$/;
  if (!pattern.test(text.trim())) return null;
  return Number(text);
}

function parseMoney(text: string): number | null | 'invalid' {
  if (!text.trim()) return null;
  const parsed = parseDecimal(text, 2);
  if (parsed == null || parsed < 0) return 'invalid';
  return parsed;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 16 },
  footer: { paddingHorizontal: 20, paddingTop: 8 },
  delete: { marginTop: 8 },
  missing: { textAlign: 'center', marginTop: 48, color: colors.textSecondary },
  hint: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: -8, marginBottom: 16 },
  ration: { backgroundColor: colors.primarySoft, borderRadius: 16, padding: 14, marginBottom: 16 },
  guidePick: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 16 },
  guideList: { maxHeight: 360 },
  guideRow: { paddingVertical: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(61,51,53,0.28)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  dueTitle: { fontSize: 15, color: colors.text, fontWeight: '500', lineHeight: 22 },
  note: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 4 },
  link: { color: colors.primary, fontWeight: '600' },
  photo: { marginBottom: 12 },
  photoImage: { width: '100%', height: 180, borderRadius: 16 },
});

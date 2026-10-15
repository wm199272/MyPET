import {
  ArchiveData,
  BathRecord,
  CheckupRecord,
  DewormRecord,
  ExpenseCategory,
  ExpenseRecord,
  FoodRecord,
  Pet,
  Settings,
  VaccineRecord,
  WeightRecord,
  defaultSettings,
  emptyArchive,
} from '@/src/domain';

const KEY = 'pet-archive-web-v1';

type Persisted = { data: ArchiveData; settings: Settings };

function read(): Persisted {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    if (!raw) return { data: emptyArchive(), settings: defaultSettings() };
    const parsed = JSON.parse(raw) as Persisted;
    const data = parsed.data ?? emptyArchive();
    const settings = { ...defaultSettings(), ...parsed.settings };
    data.pets = (data.pets || []).map((pet) => ({
      ...pet,
      weightUnit: pet.weightUnit === 'kg' || pet.weightUnit === 'jin' ? pet.weightUnit : settings.weightUnit,
    }));
    if (!data.pets.some((pet) => pet.id === settings.currentPetId)) {
      settings.currentPetId = data.pets[0]?.id ?? '';
    }
    return { data, settings };
  } catch {
    return { data: emptyArchive(), settings: defaultSettings() };
  }
}

function write(state: Persisted) {
  globalThis.localStorage?.setItem(KEY, JSON.stringify(state));
}

function upsert<T extends { id: string }>(rows: T[], row: T): T[] {
  const index = rows.findIndex((item) => item.id === row.id);
  if (index < 0) return [...rows, row];
  const next = [...rows];
  next[index] = row;
  return next;
}

export async function loadState(): Promise<{ data: ArchiveData; settings: Settings }> {
  return read();
}

export async function saveSettings(settings: Settings) {
  const state = read();
  state.settings = settings;
  write(state);
}

export async function savePet(pet: Pet) {
  const state = read();
  state.data.pets = upsert(state.data.pets, pet);
  if (!state.settings.currentPetId) state.settings.currentPetId = pet.id;
  write(state);
}

export async function deletePet(id: string) {
  const state = read();
  state.data.pets = state.data.pets.filter((pet) => pet.id !== id);
  state.data.weights = state.data.weights.filter((row) => row.petId !== id);
  state.data.checkups = state.data.checkups.filter((row) => row.petId !== id);
  state.data.baths = state.data.baths.filter((row) => row.petId !== id);
  state.data.deworms = state.data.deworms.filter((row) => row.petId !== id);
  state.data.vaccines = state.data.vaccines.filter((row) => row.petId !== id);
  state.data.expenses = state.data.expenses.filter((row) => row.petId !== id);
  state.data.foods = state.data.foods.filter((row) => row.petId !== id);
  if (state.settings.currentPetId === id) state.settings.currentPetId = state.data.pets[0]?.id ?? '';
  write(state);
}

export async function saveWeight(row: WeightRecord) {
  const state = read();
  state.data.weights = upsert(
    state.data.weights.filter((item) => !(item.petId === row.petId && item.date === row.date && item.id !== row.id)),
    row,
  );
  write(state);
}

function syncLinkedExpense(
  state: Persisted,
  sourceType: 'checkup' | 'bath' | 'vaccine',
  sourceId: string,
  petId: string,
  date: string,
  cost: number | null,
  note: string,
  category: ExpenseCategory,
) {
  const existing = state.data.expenses.find((row) => row.sourceType === sourceType && row.sourceId === sourceId);
  if (cost == null || cost <= 0) {
    state.data.expenses = state.data.expenses.filter((row) => row.id !== existing?.id);
    return;
  }
  const next: ExpenseRecord = {
    id: existing?.id || `${sourceType}-${sourceId}`,
    petId,
    date,
    amount: cost,
    category,
    note,
    sourceType,
    sourceId,
  };
  state.data.expenses = upsert(state.data.expenses, next);
}

export async function saveCheckup(row: CheckupRecord) {
  const state = read();
  state.data.checkups = upsert(state.data.checkups, row);
  syncLinkedExpense(state, 'checkup', row.id, row.petId, row.date, row.cost, '体检', 'medical');
  write(state);
}

export async function saveBath(row: BathRecord) {
  const state = read();
  state.data.baths = upsert(state.data.baths, row);
  syncLinkedExpense(state, 'bath', row.id, row.petId, row.date, row.cost, row.place === 'shop' ? row.shopName || '洗澡' : '洗澡', 'groom');
  write(state);
}

export async function saveDeworm(row: DewormRecord) {
  const state = read();
  state.data.deworms = upsert(state.data.deworms, row);
  write(state);
}

export async function saveVaccine(row: VaccineRecord) {
  const state = read();
  state.data.vaccines = upsert(state.data.vaccines, row);
  syncLinkedExpense(state, 'vaccine', row.id, row.petId, row.date, row.cost, row.name || '疫苗', 'medical');
  write(state);
}

export async function saveExpense(row: ExpenseRecord) {
  const state = read();
  let next = row;
  if (row.sourceType && row.sourceId) {
    const linked = state.data.expenses.find(
      (item) => item.sourceType === row.sourceType && item.sourceId === row.sourceId && item.id !== row.id,
    );
    if (linked) {
      state.data.expenses = state.data.expenses.filter((item) => item.id !== row.id);
      next = { ...row, id: linked.id };
    }
  }
  const previous = state.data.expenses.find((item) => item.id === next.id);
  state.data.expenses = upsert(state.data.expenses, next);
  if (
    previous?.sourceType &&
    previous.sourceId &&
    (previous.sourceType !== next.sourceType || previous.sourceId !== next.sourceId)
  ) {
    writeCareCost(state, previous.sourceType, previous.sourceId, null);
  }
  if (next.sourceType && next.sourceId) writeCareCost(state, next.sourceType, next.sourceId, next.amount);
  write(state);
}

function writeCareCost(
  state: Persisted,
  sourceType: 'checkup' | 'bath' | 'vaccine',
  sourceId: string,
  cost: number | null,
) {
  if (sourceType === 'checkup') {
    state.data.checkups = state.data.checkups.map((item) => (item.id === sourceId ? { ...item, cost } : item));
  }
  if (sourceType === 'bath') {
    state.data.baths = state.data.baths.map((item) => (item.id === sourceId ? { ...item, cost } : item));
  }
  if (sourceType === 'vaccine') {
    state.data.vaccines = state.data.vaccines.map((item) => (item.id === sourceId ? { ...item, cost } : item));
  }
}

export async function saveFood(row: FoodRecord) {
  const state = read();
  state.data.foods = upsert(state.data.foods, row);
  write(state);
}

export async function deleteRecord(type: 'weight' | 'checkup' | 'bath' | 'deworm' | 'vaccine' | 'expense' | 'food', id: string) {
  const state = read();
  if (type === 'weight') state.data.weights = state.data.weights.filter((row) => row.id !== id);
  if (type === 'checkup') state.data.checkups = state.data.checkups.filter((row) => row.id !== id);
  if (type === 'bath') state.data.baths = state.data.baths.filter((row) => row.id !== id);
  if (type === 'deworm') state.data.deworms = state.data.deworms.filter((row) => row.id !== id);
  if (type === 'vaccine') state.data.vaccines = state.data.vaccines.filter((row) => row.id !== id);
  if (type === 'expense') state.data.expenses = state.data.expenses.filter((row) => row.id !== id);
  if (type === 'food') state.data.foods = state.data.foods.filter((row) => row.id !== id);
  if (type === 'checkup' || type === 'bath' || type === 'vaccine') {
    state.data.expenses = state.data.expenses.filter((row) => !(row.sourceType === type && row.sourceId === id));
  }
  write(state);
}

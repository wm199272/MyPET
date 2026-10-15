import * as SQLite from 'expo-sqlite';

import {
  ArchiveData,
  BathRecord,
  CheckupRecord,
  DewormRecord,
  ExpenseRecord,
  FoodRecord,
  Pet,
  Settings,
  VaccineRecord,
  WeightRecord,
  defaultSettings,
  emptyArchive,
} from '@/src/domain';

const SCHEMA = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL,
  neutered INTEGER NOT NULL DEFAULT 0,
  birthday TEXT NOT NULL DEFAULT '',
  adopted_on TEXT NOT NULL DEFAULT '',
  chip TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  weight_unit TEXT NOT NULL DEFAULT 'jin',
  bath_interval INTEGER NOT NULL,
  deworm_internal_interval INTEGER NOT NULL,
  deworm_external_interval INTEGER NOT NULL,
  reminders_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS weights (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  recorded_on TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  condition TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS checkups (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  recorded_on TEXT NOT NULL,
  hospital TEXT NOT NULL DEFAULT '',
  items TEXT NOT NULL DEFAULT '[]',
  summary TEXT NOT NULL DEFAULT '',
  next_date TEXT NOT NULL DEFAULT '',
  cost REAL,
  photo TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS baths (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  recorded_on TEXT NOT NULL,
  place TEXT NOT NULL,
  shop_name TEXT NOT NULL DEFAULT '',
  cost REAL,
  note TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS deworms (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  recorded_on TEXT NOT NULL,
  type TEXT NOT NULL,
  medicine TEXT NOT NULL DEFAULT '',
  next_date TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS vaccines (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  recorded_on TEXT NOT NULL,
  name TEXT NOT NULL,
  next_date TEXT NOT NULL DEFAULT '',
  hospital TEXT NOT NULL DEFAULT '',
  cost REAL,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  recorded_on TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  source_type TEXT NOT NULL DEFAULT '',
  source_id TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS foods (
  id TEXT PRIMARY KEY NOT NULL,
  pet_id TEXT NOT NULL,
  brand TEXT NOT NULL,
  kind TEXT NOT NULL,
  spec TEXT NOT NULL DEFAULT '',
  produced_on TEXT NOT NULL DEFAULT '',
  expires_on TEXT NOT NULL DEFAULT '',
  opened_on TEXT NOT NULL DEFAULT '',
  opened_days INTEGER,
  remaining TEXT NOT NULL,
  logged_on TEXT NOT NULL,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('pet-archive.db').then(async (db) => {
      await db.execAsync(SCHEMA);
      const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(pets)');
      if (!columns.some((column) => column.name === 'weight_unit')) {
        await db.execAsync("ALTER TABLE pets ADD COLUMN weight_unit TEXT NOT NULL DEFAULT 'jin'");
      }
      return db;
    });
  }
  return databasePromise;
}

type PetRow = {
  id: string;
  name: string;
  species: Pet['species'];
  breed: string;
  gender: Pet['gender'];
  neutered: number;
  birthday: string;
  adopted_on: string;
  chip: string;
  note: string;
  avatar: string;
  weight_unit: Pet['weightUnit'] | null;
  bath_interval: number;
  deworm_internal_interval: number;
  deworm_external_interval: number;
  reminders_enabled: number;
  created_at: string;
};

function mapPet(row: PetRow): Pet {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    gender: row.gender,
    neutered: row.neutered === 1,
    birthday: row.birthday,
    adoptedOn: row.adopted_on,
    chip: row.chip,
    note: row.note,
    avatar: row.avatar,
    weightUnit: row.weight_unit === 'kg' ? 'kg' : 'jin',
    bathInterval: row.bath_interval,
    dewormInternalInterval: row.deworm_internal_interval,
    dewormExternalInterval: row.deworm_external_interval,
    remindersEnabled: row.reminders_enabled === 1,
    createdAt: row.created_at,
  };
}

export async function loadState(): Promise<{ data: ArchiveData; settings: Settings }> {
  const db = await getDatabase();
  const [pets, weights, checkups, baths, deworms, vaccines, expenses, foods, settingRows] = await Promise.all([
    db.getAllAsync<PetRow>('SELECT * FROM pets ORDER BY created_at ASC'),
    db.getAllAsync<{ id: string; pet_id: string; recorded_on: string; weight_kg: number; condition: WeightRecord['condition']; note: string }>(
      'SELECT * FROM weights',
    ),
    db.getAllAsync<{ id: string; pet_id: string; recorded_on: string; hospital: string; items: string; summary: string; next_date: string; cost: number | null; photo: string }>(
      'SELECT * FROM checkups',
    ),
    db.getAllAsync<{ id: string; pet_id: string; recorded_on: string; place: BathRecord['place']; shop_name: string; cost: number | null; note: string }>(
      'SELECT * FROM baths',
    ),
    db.getAllAsync<{ id: string; pet_id: string; recorded_on: string; type: DewormRecord['type']; medicine: string; next_date: string }>(
      'SELECT * FROM deworms',
    ),
    db.getAllAsync<{ id: string; pet_id: string; recorded_on: string; name: string; next_date: string; hospital: string; cost: number | null }>(
      'SELECT * FROM vaccines',
    ),
    db.getAllAsync<{ id: string; pet_id: string; recorded_on: string; amount: number; category: ExpenseRecord['category']; note: string; source_type: ExpenseRecord['sourceType']; source_id: string }>(
      'SELECT * FROM expenses',
    ),
    db.getAllAsync<{ id: string; pet_id: string; brand: string; kind: FoodRecord['kind']; spec: string; produced_on: string; expires_on: string; opened_on: string; opened_days: number | null; remaining: FoodRecord['remaining']; logged_on: string }>(
      'SELECT * FROM foods',
    ),
    db.getAllAsync<{ key: string; value: string }>('SELECT * FROM settings'),
  ]);

  const settings = defaultSettings();
  settingRows.forEach((row) => {
    if (row.key === 'weightUnit' && (row.value === 'jin' || row.value === 'kg')) settings.weightUnit = row.value;
    if (row.key === 'notificationsEnabled') settings.notificationsEnabled = row.value === '1';
    if (row.key === 'currentPetId') settings.currentPetId = row.value;
    if (row.key === 'plan' && (row.value === 'free' || row.value === 'family')) settings.plan = row.value;
    if (row.key === 'planExpiresAt') settings.planExpiresAt = row.value;
  });

  const data: ArchiveData = {
    pets: pets.map(mapPet),
    weights: weights.map((row) => ({
      id: row.id,
      petId: row.pet_id,
      date: row.recorded_on,
      weightKg: row.weight_kg,
      condition: row.condition || '',
      note: row.note,
    })),
    checkups: checkups.map((row) => ({
      id: row.id,
      petId: row.pet_id,
      date: row.recorded_on,
      hospital: row.hospital,
      items: parseItems(row.items),
      summary: row.summary,
      nextDate: row.next_date,
      cost: row.cost,
      photo: row.photo,
    })),
    baths: baths.map((row) => ({
      id: row.id,
      petId: row.pet_id,
      date: row.recorded_on,
      place: row.place,
      shopName: row.shop_name,
      cost: row.cost,
      note: row.note,
    })),
    deworms: deworms.map((row) => ({
      id: row.id,
      petId: row.pet_id,
      date: row.recorded_on,
      type: row.type,
      medicine: row.medicine,
      nextDate: row.next_date,
    })),
    vaccines: vaccines.map((row) => ({
      id: row.id,
      petId: row.pet_id,
      date: row.recorded_on,
      name: row.name,
      nextDate: row.next_date,
      hospital: row.hospital,
      cost: row.cost,
    })),
    expenses: expenses.map((row) => ({
      id: row.id,
      petId: row.pet_id,
      date: row.recorded_on,
      amount: row.amount,
      category: row.category,
      note: row.note,
      sourceType: row.source_type || '',
      sourceId: row.source_id,
    })),
    foods: foods.map((row) => ({
      id: row.id,
      petId: row.pet_id,
      brand: row.brand,
      kind: row.kind,
      spec: row.spec,
      producedOn: row.produced_on,
      expiresOn: row.expires_on,
      openedOn: row.opened_on,
      openedDays: row.opened_days,
      remaining: row.remaining,
      loggedOn: row.logged_on,
    })),
  };

  if (data.pets.length === 0) return { data: emptyArchive(), settings: { ...settings, currentPetId: '' } };
  if (!data.pets.some((pet) => pet.id === settings.currentPetId)) {
    settings.currentPetId = data.pets[0].id;
  }
  return { data, settings };
}

function parseItems(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

async function putSetting(key: string, value: string) {
  const db = await getDatabase();
  await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', key, value);
}

export async function saveSettings(settings: Settings) {
  await putSetting('weightUnit', settings.weightUnit);
  await putSetting('notificationsEnabled', settings.notificationsEnabled ? '1' : '0');
  await putSetting('currentPetId', settings.currentPetId);
  await putSetting('plan', settings.plan);
  await putSetting('planExpiresAt', settings.planExpiresAt);
}

export async function savePet(pet: Pet) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO pets (
      id, name, species, breed, gender, neutered, birthday, adopted_on, chip, note, avatar, weight_unit,
      bath_interval, deworm_internal_interval, deworm_external_interval, reminders_enabled, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      species = excluded.species,
      breed = excluded.breed,
      gender = excluded.gender,
      neutered = excluded.neutered,
      birthday = excluded.birthday,
      adopted_on = excluded.adopted_on,
      chip = excluded.chip,
      note = excluded.note,
      avatar = excluded.avatar,
      weight_unit = excluded.weight_unit,
      bath_interval = excluded.bath_interval,
      deworm_internal_interval = excluded.deworm_internal_interval,
      deworm_external_interval = excluded.deworm_external_interval,
      reminders_enabled = excluded.reminders_enabled`,
    pet.id,
    pet.name,
    pet.species,
    pet.breed,
    pet.gender,
    pet.neutered ? 1 : 0,
    pet.birthday,
    pet.adoptedOn,
    pet.chip,
    pet.note,
    pet.avatar,
    pet.weightUnit === 'kg' ? 'kg' : 'jin',
    pet.bathInterval,
    pet.dewormInternalInterval,
    pet.dewormExternalInterval,
    pet.remindersEnabled ? 1 : 0,
    pet.createdAt,
  );
}

export async function deletePet(id: string) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM pets WHERE id = ?', id);
}

export async function saveWeight(row: WeightRecord) {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM weights WHERE pet_id = ? AND recorded_on = ? AND id != ?', row.petId, row.date, row.id);
    await db.runAsync(
      `INSERT INTO weights (id, pet_id, recorded_on, weight_kg, condition, note) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET pet_id = excluded.pet_id, recorded_on = excluded.recorded_on, weight_kg = excluded.weight_kg, condition = excluded.condition, note = excluded.note`,
      row.id,
      row.petId,
      row.date,
      row.weightKg,
      row.condition,
      row.note,
    );
  });
}

async function syncLinkedExpense(
  db: SQLite.SQLiteDatabase,
  sourceType: 'checkup' | 'bath' | 'vaccine',
  sourceId: string,
  petId: string,
  date: string,
  cost: number | null,
  note: string,
  category: ExpenseRecord['category'],
) {
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM expenses WHERE source_type = ? AND source_id = ?',
    sourceType,
    sourceId,
  );
  if (cost == null || cost <= 0) {
    if (existing) await db.runAsync('DELETE FROM expenses WHERE id = ?', existing.id);
    return;
  }
  if (existing) {
    await db.runAsync(
      'UPDATE expenses SET pet_id = ?, recorded_on = ?, amount = ?, category = ?, note = ? WHERE id = ?',
      petId,
      date,
      cost,
      category,
      note,
      existing.id,
    );
    return;
  }
  await db.runAsync(
    'INSERT INTO expenses (id, pet_id, recorded_on, amount, category, note, source_type, source_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    `${sourceType}-${sourceId}`,
    petId,
    date,
    cost,
    category,
    note,
    sourceType,
    sourceId,
  );
}

export async function saveCheckup(row: CheckupRecord) {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO checkups (id, pet_id, recorded_on, hospital, items, summary, next_date, cost, photo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         pet_id = excluded.pet_id, recorded_on = excluded.recorded_on, hospital = excluded.hospital,
         items = excluded.items, summary = excluded.summary, next_date = excluded.next_date,
         cost = excluded.cost, photo = excluded.photo`,
      row.id,
      row.petId,
      row.date,
      row.hospital,
      JSON.stringify(row.items),
      row.summary,
      row.nextDate,
      row.cost,
      row.photo,
    );
    await syncLinkedExpense(db, 'checkup', row.id, row.petId, row.date, row.cost, '体检', 'medical');
  });
}

export async function saveBath(row: BathRecord) {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO baths (id, pet_id, recorded_on, place, shop_name, cost, note) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET pet_id = excluded.pet_id, recorded_on = excluded.recorded_on, place = excluded.place, shop_name = excluded.shop_name, cost = excluded.cost, note = excluded.note`,
      row.id,
      row.petId,
      row.date,
      row.place,
      row.shopName,
      row.cost,
      row.note,
    );
    await syncLinkedExpense(db, 'bath', row.id, row.petId, row.date, row.cost, row.place === 'shop' ? row.shopName || '洗澡' : '洗澡', 'groom');
  });
}

export async function saveDeworm(row: DewormRecord) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO deworms (id, pet_id, recorded_on, type, medicine, next_date) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET pet_id = excluded.pet_id, recorded_on = excluded.recorded_on, type = excluded.type, medicine = excluded.medicine, next_date = excluded.next_date`,
    row.id,
    row.petId,
    row.date,
    row.type,
    row.medicine,
    row.nextDate,
  );
}

export async function saveVaccine(row: VaccineRecord) {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO vaccines (id, pet_id, recorded_on, name, next_date, hospital, cost) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET pet_id = excluded.pet_id, recorded_on = excluded.recorded_on, name = excluded.name, next_date = excluded.next_date, hospital = excluded.hospital, cost = excluded.cost`,
      row.id,
      row.petId,
      row.date,
      row.name,
      row.nextDate,
      row.hospital,
      row.cost,
    );
    await syncLinkedExpense(db, 'vaccine', row.id, row.petId, row.date, row.cost, row.name || '疫苗', 'medical');
  });
}

export async function saveExpense(row: ExpenseRecord) {
  const db = await getDatabase();
  let next = row;
  if (row.sourceType && row.sourceId) {
    const linked = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM expenses WHERE source_type = ? AND source_id = ? AND id != ?',
      row.sourceType,
      row.sourceId,
      row.id,
    );
    if (linked) {
      await db.runAsync('DELETE FROM expenses WHERE id = ?', row.id);
      next = { ...row, id: linked.id };
    }
  }
  const previous = await db.getFirstAsync<{ source_type: ExpenseRecord['sourceType']; source_id: string }>(
    'SELECT source_type, source_id FROM expenses WHERE id = ?',
    next.id,
  );
  await db.runAsync(
    `INSERT INTO expenses (id, pet_id, recorded_on, amount, category, note, source_type, source_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET pet_id = excluded.pet_id, recorded_on = excluded.recorded_on, amount = excluded.amount, category = excluded.category, note = excluded.note, source_type = excluded.source_type, source_id = excluded.source_id`,
    next.id,
    next.petId,
    next.date,
    next.amount,
    next.category,
    next.note,
    next.sourceType,
    next.sourceId,
  );
  if (
    previous?.source_type &&
    previous.source_id &&
    (previous.source_type !== next.sourceType || previous.source_id !== next.sourceId)
  ) {
    await writeCareCost(db, previous.source_type, previous.source_id, null);
  }
  if (next.sourceType && next.sourceId) {
    await writeCareCost(db, next.sourceType, next.sourceId, next.amount);
  }
}

async function writeCareCost(
  db: SQLite.SQLiteDatabase,
  sourceType: 'checkup' | 'bath' | 'vaccine',
  sourceId: string,
  cost: number | null,
) {
  const table = sourceType === 'checkup' ? 'checkups' : sourceType === 'bath' ? 'baths' : 'vaccines';
  await db.runAsync(`UPDATE ${table} SET cost = ? WHERE id = ?`, cost, sourceId);
}

export async function saveFood(row: FoodRecord) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO foods (id, pet_id, brand, kind, spec, produced_on, expires_on, opened_on, opened_days, remaining, logged_on)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       pet_id = excluded.pet_id, brand = excluded.brand, kind = excluded.kind, spec = excluded.spec,
       produced_on = excluded.produced_on, expires_on = excluded.expires_on, opened_on = excluded.opened_on,
       opened_days = excluded.opened_days, remaining = excluded.remaining, logged_on = excluded.logged_on`,
    row.id,
    row.petId,
    row.brand,
    row.kind,
    row.spec,
    row.producedOn,
    row.expiresOn,
    row.openedOn,
    row.openedDays,
    row.remaining,
    row.loggedOn,
  );
}

const tables = {
  weight: 'weights',
  checkup: 'checkups',
  bath: 'baths',
  deworm: 'deworms',
  vaccine: 'vaccines',
  expense: 'expenses',
  food: 'foods',
} as const;

export async function deleteRecord(type: keyof typeof tables, id: string) {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    if (type === 'checkup' || type === 'bath' || type === 'vaccine') {
      await db.runAsync('DELETE FROM expenses WHERE source_type = ? AND source_id = ?', type, id);
    }
    await db.runAsync(`DELETE FROM ${tables[type]} WHERE id = ?`, id);
  });
}

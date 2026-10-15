export type Species = 'cat' | 'dog' | 'other';
export type Gender = 'female' | 'male' | 'unknown';
export type WeightUnit = 'jin' | 'kg';
export type WeightCondition = 'thin' | 'normal' | 'heavy';
export type ExpenseCategory = 'food' | 'snack' | 'medical' | 'groom' | 'supply' | 'other';
export type FoodKind = 'staple' | 'snack' | 'can' | 'supplement';
export type FoodRemaining = 'plenty' | 'low' | 'finished';
export type DewormType = 'internal' | 'external' | 'both';
export type BathPlace = 'home' | 'shop';
export type RecordType = 'weight' | 'checkup' | 'bath' | 'deworm' | 'vaccine' | 'expense' | 'food';
export type RangeKey = '30' | '90' | '365';

export type Pet = {
  id: string;
  name: string;
  species: Species;
  breed: string;
  gender: Gender;
  neutered: boolean;
  birthday: string;
  adoptedOn: string;
  chip: string;
  note: string;
  avatar: string;
  weightUnit: WeightUnit;
  bathInterval: number;
  dewormInternalInterval: number;
  dewormExternalInterval: number;
  remindersEnabled: boolean;
  createdAt: string;
};

export type WeightRecord = {
  id: string;
  petId: string;
  date: string;
  weightKg: number;
  condition: WeightCondition | '';
  note: string;
};

export type CheckupRecord = {
  id: string;
  petId: string;
  date: string;
  hospital: string;
  items: string[];
  summary: string;
  nextDate: string;
  cost: number | null;
  photo: string;
};

export type BathRecord = {
  id: string;
  petId: string;
  date: string;
  place: BathPlace;
  shopName: string;
  cost: number | null;
  note: string;
};

export type DewormRecord = {
  id: string;
  petId: string;
  date: string;
  type: DewormType;
  medicine: string;
  nextDate: string;
};

export type VaccineRecord = {
  id: string;
  petId: string;
  date: string;
  name: string;
  nextDate: string;
  hospital: string;
  cost: number | null;
};

export type ExpenseRecord = {
  id: string;
  petId: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  note: string;
  sourceType: '' | 'checkup' | 'bath' | 'vaccine';
  sourceId: string;
};

export type FoodRecord = {
  id: string;
  petId: string;
  brand: string;
  kind: FoodKind;
  spec: string;
  producedOn: string;
  expiresOn: string;
  openedOn: string;
  openedDays: number | null;
  remaining: FoodRemaining;
  loggedOn: string;
};

export type Plan = 'free' | 'family';

export type Settings = {
  weightUnit: WeightUnit;
  notificationsEnabled: boolean;
  currentPetId: string;
  plan: Plan;
  planExpiresAt: string;
};

export const FREE_PET_LIMIT = 1;

export function petLimitFor(plan: Plan): number {
  return plan === 'family' ? Number.MAX_SAFE_INTEGER : FREE_PET_LIMIT;
}

export function planLabel(plan: Plan): string {
  return plan === 'family' ? '家庭版' : '免费版';
}

export type ArchiveData = {
  pets: Pet[];
  weights: WeightRecord[];
  checkups: CheckupRecord[];
  baths: BathRecord[];
  deworms: DewormRecord[];
  vaccines: VaccineRecord[];
  expenses: ExpenseRecord[];
  foods: FoodRecord[];
};

export const emptyArchive = (): ArchiveData => ({
  pets: [],
  weights: [],
  checkups: [],
  baths: [],
  deworms: [],
  vaccines: [],
  expenses: [],
  foods: [],
});

export const defaultSettings = (): Settings => ({
  weightUnit: 'jin',
  notificationsEnabled: true,
  currentPetId: '',
  plan: 'free',
  planExpiresAt: '',
});

export const recordTypes: RecordType[] = [
  'weight',
  'checkup',
  'bath',
  'deworm',
  'vaccine',
  'expense',
  'food',
];

export const recordTypeLabel: Record<RecordType, string> = {
  weight: '体重',
  checkup: '体检',
  bath: '洗澡',
  deworm: '驱虫',
  vaccine: '疫苗',
  expense: '消费',
  food: '食品',
};

export const speciesLabel: Record<Species, string> = {
  cat: '猫',
  dog: '狗',
  other: '其他',
};

export const genderLabel: Record<Gender, string> = {
  female: '母',
  male: '公',
  unknown: '未知',
};

export const expenseCategoryLabel: Record<ExpenseCategory, string> = {
  food: '粮食',
  snack: '零食',
  medical: '医疗',
  groom: '洗护',
  supply: '用品',
  other: '其他',
};

export const foodKindLabel: Record<FoodKind, string> = {
  staple: '主粮',
  snack: '零食',
  can: '罐头',
  supplement: '营养品',
};

export const foodRemainingLabel: Record<FoodRemaining, string> = {
  plenty: '充足',
  low: '不多',
  finished: '已吃完',
};

export const dewormTypeLabel: Record<DewormType, string> = {
  internal: '体内',
  external: '体外',
  both: '体内外',
};

export const conditionLabel: Record<WeightCondition, string> = {
  thin: '偏瘦',
  normal: '标准',
  heavy: '偏胖',
};

export const checkupItems = ['血常规', '生化', '影像', '其他'] as const;

export function isRecordType(value: string): value is RecordType {
  return recordTypes.includes(value as RecordType);
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultBathInterval(species: Species): number {
  return species === 'dog' ? 14 : 30;
}

export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map((part) => Number(part));
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatISODate(date: Date): string {
  return todayISO(date);
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

export function diffDays(from: string, to: string): number {
  const ms = parseISODate(to).getTime() - parseISODate(from).getTime();
  return Math.round(ms / 86400000);
}

export function yearsAgo(iso: string, years: number): string {
  const date = parseISODate(iso);
  const month = date.getMonth();
  const day = date.getDate();
  date.setFullYear(date.getFullYear() - years, month, day);
  if (date.getMonth() !== month) date.setDate(0);
  return formatISODate(date);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function isAnniversary(start: string, today: string): boolean {
  if (!isISODate(start) || !isISODate(today)) return false;
  if (Number(today.slice(0, 4)) - Number(start.slice(0, 4)) < 1) return false;
  if (start.slice(5) === today.slice(5)) return true;
  return start.slice(5) === '02-29' && today.slice(5) === '02-28' && !isLeapYear(Number(today.slice(0, 4)));
}

export function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = parseISODate(value);
  return formatISODate(date) === value;
}

export function formatDate(iso: string, today = todayISO()): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  if (year === today.slice(0, 4)) return `${Number(month)}月${Number(day)}日`;
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export function formatFullDate(iso: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export function ageLabel(birthday: string, today = todayISO()): string {
  if (!birthday) return '';
  const birth = parseISODate(birthday);
  const now = parseISODate(today);
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months <= 0) return '未满 1 个月';
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years <= 0) return `${rest} 个月`;
  if (rest === 0) return `${years} 岁`;
  return `${years} 岁 ${rest} 个月`;
}

export function kgToDisplay(kg: number, unit: WeightUnit): number {
  return unit === 'jin' ? kg * 2 : kg;
}

export function displayToKg(value: number, unit: WeightUnit): number {
  return unit === 'jin' ? value / 2 : value;
}

export function formatWeight(kg: number, unit: WeightUnit): string {
  const unitLabel = unit === 'jin' ? '斤' : '公斤';
  return `${kgToDisplay(kg, unit).toFixed(1)} ${unitLabel}`;
}

export function formatMoney(amount: number): string {
  return `${amount.toFixed(2)} 元`;
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function recentMonthKeys(today: string, count: number): string[] {
  const [yearText, monthText] = today.split('-');
  let year = Number(yearText);
  let month = Number(monthText);
  const keys: string[] = [];
  for (let i = 0; i < count; i += 1) {
    keys.unshift(`${year}-${String(month).padStart(2, '0')}`);
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
  }
  return keys;
}

export function previousCompleteMonthKeys(today: string, count: number): string[] {
  const firstOfMonth = `${today.slice(0, 7)}-01`;
  return recentMonthKeys(addDays(firstOfMonth, -1), count);
}

export function rangeStart(today: string, range: RangeKey): string {
  if (range === '365') {
    const date = parseISODate(today);
    date.setFullYear(date.getFullYear() - 1);
    return formatISODate(date);
  }
  return addDays(today, range === '30' ? -29 : -89);
}

function byDateDesc<T extends { date: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function latestByDate<T extends { date: string }>(rows: T[]): T | undefined {
  return byDateDesc(rows)[0];
}

export type DueItem = {
  key: string;
  petId: string;
  title: string;
  due: string;
  days: number;
};

export function listDue(pet: Pet, data: ArchiveData, today = todayISO()): DueItem[] {
  const items: DueItem[] = [];
  const push = (key: string, title: string, due: string) => {
    if (!due) return;
    const days = diffDays(today, due);
    if (days <= 14) items.push({ key, petId: pet.id, title, due, days });
  };

  const lastBath = latestByDate(data.baths.filter((row) => row.petId === pet.id));
  if (lastBath) push(`bath-${pet.id}`, '洗澡', addDays(lastBath.date, pet.bathInterval));

  const lastInternal = latestByDate(
    data.deworms.filter((row) => row.petId === pet.id && (row.type === 'internal' || row.type === 'both')),
  );
  if (lastInternal) {
    push(
      `deworm-in-${pet.id}`,
      '体内驱虫',
      lastInternal.nextDate || addDays(lastInternal.date, pet.dewormInternalInterval),
    );
  }

  const lastExternal = latestByDate(
    data.deworms.filter((row) => row.petId === pet.id && (row.type === 'external' || row.type === 'both')),
  );
  if (lastExternal) {
    push(
      `deworm-out-${pet.id}`,
      '体外驱虫',
      lastExternal.nextDate || addDays(lastExternal.date, pet.dewormExternalInterval),
    );
  }

  data.vaccines
    .filter((row) => row.petId === pet.id && row.nextDate)
    .forEach((row) => push(`vaccine-${row.id}`, row.name || '疫苗', row.nextDate));

  data.checkups
    .filter((row) => row.petId === pet.id && row.nextDate)
    .forEach((row) => push(`checkup-${row.id}`, '体检', row.nextDate));

  data.foods
    .filter((row) => row.petId === pet.id && row.remaining !== 'finished' && row.expiresOn)
    .forEach((row) => push(`food-${row.id}`, row.brand, row.expiresOn));

  return items.sort((a, b) => a.days - b.days);
}

export function dueLabel(days: number): string {
  if (days < 0) return `逾期 ${-days} 天`;
  if (days === 0) return '今天';
  return `还有 ${days} 天`;
}

export type TimelineEntry = {
  id: string;
  petId: string;
  type: RecordType;
  date: string;
  title: string;
  summary: string;
  expiresOn?: string;
  finished?: boolean;
};

export function buildTimeline(data: ArchiveData, fallbackUnit: WeightUnit, today = todayISO()): TimelineEntry[] {
  const unitOf = (petId: string) => data.pets.find((pet) => pet.id === petId)?.weightUnit || fallbackUnit;
  const entries: TimelineEntry[] = [];
  data.weights.forEach((row) => {
    const condition = row.condition ? ` · ${conditionLabel[row.condition]}` : '';
    entries.push({
      id: row.id,
      petId: row.petId,
      type: 'weight',
      date: row.date,
      title: '体重',
      summary: `${formatWeight(row.weightKg, unitOf(row.petId))}${condition}`,
    });
  });
  data.checkups.forEach((row) => {
    entries.push({
      id: row.id,
      petId: row.petId,
      type: 'checkup',
      date: row.date,
      title: '体检',
      summary: row.hospital || row.summary || '已记录',
    });
  });
  data.baths.forEach((row) => {
    entries.push({
      id: row.id,
      petId: row.petId,
      type: 'bath',
      date: row.date,
      title: '洗澡',
      summary: row.place === 'shop' ? row.shopName || '门店' : '家中',
    });
  });
  data.deworms.forEach((row) => {
    entries.push({
      id: row.id,
      petId: row.petId,
      type: 'deworm',
      date: row.date,
      title: '驱虫',
      summary: `${dewormTypeLabel[row.type]}${row.medicine ? ` · ${row.medicine}` : ''}`,
    });
  });
  data.vaccines.forEach((row) => {
    entries.push({
      id: row.id,
      petId: row.petId,
      type: 'vaccine',
      date: row.date,
      title: '疫苗',
      summary: row.name,
    });
  });
  data.expenses.forEach((row) => {
    entries.push({
      id: row.id,
      petId: row.petId,
      type: 'expense',
      date: row.date,
      title: '消费',
      summary: `${formatMoney(row.amount)} · ${expenseCategoryLabel[row.category]}`,
    });
  });
  data.foods.forEach((row) => {
    const expiry = row.expiresOn ? `到期 ${formatDate(row.expiresOn, today)}` : '未填保质期';
    entries.push({
      id: row.id,
      petId: row.petId,
      type: 'food',
      date: row.loggedOn || row.expiresOn || today,
      expiresOn: row.expiresOn,
      finished: row.remaining === 'finished',
      title: '食品',
      summary: `${row.brand} · ${foodRemainingLabel[row.remaining]} · ${expiry}`,
    });
  });
  return entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function groupTimeline(entries: TimelineEntry[], type: RecordType | 'all') {
  if (type === 'food') {
    const active = entries
      .filter((entry) => !entry.finished)
      .sort((a, b) => (a.expiresOn || '9999-12-31').localeCompare(b.expiresOn || '9999-12-31'));
    const finished = entries.filter((entry) => entry.finished);
    const sections = monthSections(active, (entry) => entry.expiresOn || entry.date, 'asc');
    if (finished.length > 0) sections.push({ title: '已吃完', data: finished });
    return sections;
  }
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return monthSections(sorted, (entry) => entry.date, 'desc');
}

function monthSections(
  entries: TimelineEntry[],
  dateOf: (entry: TimelineEntry) => string,
  order: 'asc' | 'desc',
) {
  const groups = new Map<string, TimelineEntry[]>();
  entries.forEach((entry) => {
    const key = monthKey(dateOf(entry) || '0000-01-01');
    groups.set(key, [...(groups.get(key) || []), entry]);
  });
  const keys = [...groups.keys()].sort((a, b) => (order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)));
  return keys.map((key) => ({
    title: key.startsWith('0000') ? '未填日期' : `${key.slice(0, 4)}年${Number(key.slice(5))}月`,
    data: groups.get(key) || [],
  }));
}

export function listOnThisDay(data: ArchiveData, petId: string, unit: WeightUnit, today = todayISO()): TimelineEntry[] {
  const then = yearsAgo(today, 1);
  return buildTimeline(data, unit, today)
    .filter((entry) => entry.petId === petId && entry.date === then)
    .sort((a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id));
}

export type Milestone = {
  id: string;
  title: string;
  detail: string;
  basis: string;
};

export function listMilestones(pet: Pet, data: ArchiveData, unit: WeightUnit, today = todayISO()): Milestone[] {
  const items: Milestone[] = [];
  if (isAnniversary(pet.birthday, today)) {
    const years = Number(today.slice(0, 4)) - Number(pet.birthday.slice(0, 4));
    items.push({
      id: `birthday-${years}`,
      title: `${years} 岁了`,
      detail: '',
      basis: `生日 ${formatFullDate(pet.birthday)}`,
    });
  }
  if (isAnniversary(pet.adoptedOn, today)) {
    const years = Number(today.slice(0, 4)) - Number(pet.adoptedOn.slice(0, 4));
    items.push({
      id: `home-${years}`,
      title: `到家 ${years} 年`,
      detail: '',
      basis: `到家 ${formatFullDate(pet.adoptedOn)}`,
    });
  }

  const weights = data.weights
    .filter((row) => row.petId === pet.id)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  if (weights.length === 1) {
    const first = weights[0];
    const days = diffDays(first.date, today);
    if (days >= 0 && days <= 7) {
      items.push({
        id: `first-weight-${first.id}`,
        title: '第一笔体重',
        detail: formatWeight(first.weightKg, unit),
        basis: formatFullDate(first.date),
      });
    }
  }
  if (weights.length >= 2) {
    const latest = weights[weights.length - 1];
    const prev = weights[weights.length - 2];
    const days = diffDays(latest.date, today);
    const latestValue = kgToDisplay(latest.weightKg, unit);
    const prevValue = kgToDisplay(prev.weightKg, unit);
    if (days >= 0 && days <= 7 && Math.floor(latestValue) !== Math.floor(prevValue)) {
      const unitLabel = unit === 'jin' ? '斤' : '公斤';
      items.push({
        id: `weight-line-${latest.id}`,
        title: `体重到了 ${Math.floor(latestValue)} ${unitLabel}`,
        detail: `${prevValue.toFixed(1)} ${unitLabel} → ${latestValue.toFixed(1)} ${unitLabel}`,
        basis: `${formatDate(prev.date, today)} 到 ${formatDate(latest.date, today)}`,
      });
    }
  }

  const firstDeworm = data.deworms
    .filter((row) => row.petId === pet.id)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  if (firstDeworm && isAnniversary(firstDeworm.date, today)) {
    const years = Number(today.slice(0, 4)) - Number(firstDeworm.date.slice(0, 4));
    items.push({
      id: `deworm-year-${years}`,
      title: `驱虫满 ${years} 年`,
      detail: '从第一次驱虫算起',
      basis: `第一次驱虫 ${formatFullDate(firstDeworm.date)}`,
    });
  }
  return items;
}

export type SuggestionAction = 'open-record' | 'add-record' | 'stats';

export type Suggestion = {
  id: string;
  tone: 'soon' | 'overdue';
  text: string;
  basis: string;
  action: SuggestionAction;
  recordType: RecordType;
  recordId?: string;
  actionLabel: string;
  focus?: 'weight' | 'spend';
};

export function buildSuggestions(pet: Pet, data: ArchiveData, unit: WeightUnit, today = todayISO()): Suggestion[] {
  const suggestions: Suggestion[] = [];

  data.foods
    .filter((food) => food.petId === pet.id && food.remaining !== 'finished')
    .forEach((food) => {
      if (food.expiresOn) {
        const days = diffDays(today, food.expiresOn);
        if (days < 0) {
          suggestions.push({
            id: `food-exp-${food.id}`,
            tone: 'overdue',
            text: `${food.brand} 已过期 ${-days} 天`,
            basis: `保质期 ${formatFullDate(food.expiresOn)}`,
            action: 'open-record',
            recordType: 'food',
            recordId: food.id,
            actionLabel: '去查看',
          });
        } else if (days <= 7) {
          suggestions.push({
            id: `food-exp-${food.id}`,
            tone: 'soon',
            text: `${food.brand} 还有 ${days} 天到期`,
            basis: `保质期 ${formatFullDate(food.expiresOn)}`,
            action: 'open-record',
            recordType: 'food',
            recordId: food.id,
            actionLabel: '去查看',
          });
        }
      }
      if (food.openedOn && food.openedDays && food.openedDays > 0) {
        const opened = diffDays(food.openedOn, today);
        if (opened > food.openedDays) {
          suggestions.push({
            id: `food-open-${food.id}`,
            tone: 'overdue',
            text: `${food.brand} 已开封 ${opened} 天，超过可食用天数`,
            basis: `开封于 ${formatFullDate(food.openedOn)}，可食用 ${food.openedDays} 天`,
            action: 'open-record',
            recordType: 'food',
            recordId: food.id,
            actionLabel: '去查看',
          });
        }
      }
    });

  const lastInternal = latestByDate(
    data.deworms.filter((row) => row.petId === pet.id && (row.type === 'internal' || row.type === 'both')),
  );
  if (lastInternal) {
    pushSchedule(suggestions, {
      id: `deworm-in-${pet.id}`,
      title: '体内驱虫',
      due: lastInternal.nextDate || addDays(lastInternal.date, pet.dewormInternalInterval),
      recordType: 'deworm',
      today,
    });
  }
  const lastExternal = latestByDate(
    data.deworms.filter((row) => row.petId === pet.id && (row.type === 'external' || row.type === 'both')),
  );
  if (lastExternal) {
    pushSchedule(suggestions, {
      id: `deworm-out-${pet.id}`,
      title: '体外驱虫',
      due: lastExternal.nextDate || addDays(lastExternal.date, pet.dewormExternalInterval),
      recordType: 'deworm',
      today,
    });
  }
  data.vaccines
    .filter((row) => row.petId === pet.id && row.nextDate)
    .forEach((row) => {
      pushSchedule(suggestions, {
        id: `vaccine-${row.id}`,
        title: row.name || '疫苗',
        due: row.nextDate,
        recordType: 'vaccine',
        today,
      });
    });
  data.checkups
    .filter((row) => row.petId === pet.id && row.nextDate)
    .forEach((row) => {
      pushSchedule(suggestions, {
        id: `checkup-${row.id}`,
        title: '体检',
        due: row.nextDate,
        recordType: 'checkup',
        today,
      });
    });

  const lastBath = latestByDate(data.baths.filter((row) => row.petId === pet.id));
  if (lastBath) {
    const since = diffDays(lastBath.date, today);
    if (since > pet.bathInterval) {
      suggestions.push({
        id: `bath-${pet.id}`,
        tone: 'overdue',
        text: `已经 ${since} 天没有洗澡记录`,
        basis: `上次洗澡 ${formatFullDate(lastBath.date)}，间隔 ${pet.bathInterval} 天`,
        action: 'add-record',
        recordType: 'bath',
        actionLabel: '记一笔',
      });
    }
  }

  const weights = data.weights.filter((row) => row.petId === pet.id);
  const baselineDate = addDays(today, -30);
  const baseline = latestByDate(weights.filter((row) => row.date <= baselineDate));
  const current = latestByDate(weights.filter((row) => row.date > baselineDate && row.date <= today));
  if (weights.length >= 2 && baseline && current && baseline.id !== current.id && baseline.weightKg > 0) {
    const ratio = (current.weightKg - baseline.weightKg) / baseline.weightKg;
    if (Math.abs(ratio) > 0.08) {
      const percent = Math.round(Math.abs(ratio) * 100);
      suggestions.push({
        id: `weight-${pet.id}`,
        tone: 'soon',
        text: `近 30 天体重 ${ratio > 0 ? '上升' : '下降'} ${percent}%`,
        basis: `${formatFullDate(baseline.date)} ${formatWeight(baseline.weightKg, unit)}，${formatFullDate(current.date)} ${formatWeight(current.weightKg, unit)}`,
        action: 'stats',
        recordType: 'weight',
        actionLabel: '查看曲线',
        focus: 'weight',
      });
    }
  }

  const petExpenses = data.expenses.filter((row) => row.petId === pet.id);
  const thisKey = monthKey(today);
  const thisMonth = petExpenses.filter((row) => monthKey(row.date) === thisKey);
  const thisTotal = thisMonth.reduce((sum, row) => sum + row.amount, 0);
  const previousKeys = previousCompleteMonthKeys(today, 3);
  const previousTotals = previousKeys.map((key) =>
    petExpenses.filter((row) => monthKey(row.date) === key).reduce((sum, row) => sum + row.amount, 0),
  );
  const average = previousTotals.reduce((sum, value) => sum + value, 0) / 3;
  if (thisTotal > 0 && average > 0 && thisTotal >= average * 1.5) {
    const percent = Math.round((thisTotal / average - 1) * 100);
    const byCategory = new Map<ExpenseCategory, number>();
    thisMonth.forEach((row) => byCategory.set(row.category, (byCategory.get(row.category) || 0) + row.amount));
    const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];
    suggestions.push({
      id: `spend-${pet.id}`,
      tone: 'soon',
      text: `这个月花费比近 3 个月平均高 ${percent}%`,
      basis: `本月 ${formatMoney(thisTotal)}，近 3 个月平均 ${formatMoney(average)}，最高的是${expenseCategoryLabel[top[0]]}`,
      action: 'stats',
      recordType: 'expense',
      actionLabel: '查看消费',
      focus: 'spend',
    });
  }

  const rank = (item: Suggestion) => (item.tone === 'overdue' ? 0 : 1);
  return suggestions.sort((a, b) => rank(a) - rank(b));
}

function pushSchedule(
  suggestions: Suggestion[],
  input: { id: string; title: string; due: string; recordType: RecordType; today: string },
) {
  const days = diffDays(input.today, input.due);
  if (days < 0) {
    suggestions.push({
      id: input.id,
      tone: 'overdue',
      text: `${input.title} 已逾期 ${-days} 天`,
      basis: `下次日期 ${formatFullDate(input.due)}`,
      action: 'add-record',
      recordType: input.recordType,
      actionLabel: '记一笔',
    });
    return;
  }
  if (days <= 7) {
    suggestions.push({
      id: input.id,
      tone: 'soon',
      text: `${input.title} 还有 ${days} 天`,
      basis: `下次日期 ${formatFullDate(input.due)}`,
      action: 'add-record',
      recordType: input.recordType,
      actionLabel: '记一笔',
    });
  }
}

export type CareStatus = {
  key: string;
  title: string;
  last: string;
  detail: string;
  tone: 'ok' | 'soon' | 'overdue' | 'muted';
};

export function careStatuses(pet: Pet, data: ArchiveData, today = todayISO()): CareStatus[] {
  const bath = latestByDate(data.baths.filter((row) => row.petId === pet.id));
  const internal = latestByDate(
    data.deworms.filter((row) => row.petId === pet.id && (row.type === 'internal' || row.type === 'both')),
  );
  const external = latestByDate(
    data.deworms.filter((row) => row.petId === pet.id && (row.type === 'external' || row.type === 'both')),
  );
  const vaccines = data.vaccines.filter((row) => row.petId === pet.id);
  const vaccineWithNext = vaccines
    .filter((row) => row.nextDate)
    .sort((a, b) => diffDays(today, a.nextDate) - diffDays(today, b.nextDate))[0];
  const checkup = latestByDate(data.checkups.filter((row) => row.petId === pet.id));

  return [
    careFromSchedule('bath', '洗澡', bath?.date || '', bath ? addDays(bath.date, pet.bathInterval) : '', today),
    careFromSchedule(
      'internal',
      '体内驱虫',
      internal?.date || '',
      internal ? internal.nextDate || addDays(internal.date, pet.dewormInternalInterval) : '',
      today,
    ),
    careFromSchedule(
      'external',
      '体外驱虫',
      external?.date || '',
      external ? external.nextDate || addDays(external.date, pet.dewormExternalInterval) : '',
      today,
    ),
    careFromSchedule(
      'vaccine',
      '疫苗',
      (vaccineWithNext || latestByDate(vaccines))?.date || '',
      vaccineWithNext?.nextDate || '',
      today,
    ),
    careFromSchedule('checkup', '体检', checkup?.date || '', checkup?.nextDate || '', today),
  ];
}

function careFromSchedule(key: string, title: string, last: string, due: string, today: string): CareStatus {
  if (!last && !due) {
    return { key, title, last: '', detail: '还没有记录', tone: 'muted' };
  }
  if (!due) {
    return { key, title, last, detail: last ? `上次 ${formatDate(last, today)}` : '未设下次日期', tone: 'muted' };
  }
  const days = diffDays(today, due);
  const lastText = last ? `上次 ${formatDate(last, today)} · ` : '';
  if (days < 0) return { key, title, last, detail: `${lastText}已过期 ${-days} 天`, tone: 'overdue' };
  return {
    key,
    title,
    last,
    detail: `${lastText}距下次还有 ${days} 天`,
    tone: days <= 7 ? 'soon' : 'ok',
  };
}

export function countRecords(petId: string, data: ArchiveData): number {
  return (
    data.weights.filter((row) => row.petId === petId).length +
    data.checkups.filter((row) => row.petId === petId).length +
    data.baths.filter((row) => row.petId === petId).length +
    data.deworms.filter((row) => row.petId === petId).length +
    data.vaccines.filter((row) => row.petId === petId).length +
    data.expenses.filter((row) => row.petId === petId).length +
    data.foods.filter((row) => row.petId === petId).length
  );
}

export function expenseCategoryForSource(source: 'checkup' | 'bath' | 'vaccine'): ExpenseCategory {
  return source === 'bath' ? 'groom' : 'medical';
}

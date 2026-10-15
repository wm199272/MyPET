import { addDays, ageLabel, buildSuggestions, careStatuses, groupTimeline, isAnniversary, listMilestones, listOnThisDay, todayISO, yearsAgo, type ArchiveData, type Pet, type TimelineEntry } from './domain.ts';

const today = '2026-10-14';

function pet(): Pet {
  return {
    id: 'p1',
    name: '豆包',
    species: 'cat',
    breed: '',
    gender: 'female',
    neutered: true,
    birthday: '2024-01-01',
    adoptedOn: '',
    chip: '',
    note: '',
    avatar: '',
    weightUnit: 'jin',
    bathInterval: 30,
    dewormInternalInterval: 90,
    dewormExternalInterval: 30,
    remindersEnabled: true,
    createdAt: today,
  };
}

function empty(): ArchiveData {
  return { pets: [pet()], weights: [], checkups: [], baths: [], deworms: [], vaccines: [], expenses: [], foods: [] };
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const base = empty();
const foodSoon = buildSuggestions(pet(), {
  ...base,
  foods: [{ id: 'f1', petId: 'p1', brand: '主食罐', kind: 'can', spec: '', producedOn: '', expiresOn: addDays(today, 3), openedOn: '', openedDays: null, remaining: 'plenty', loggedOn: today }],
}, 'jin', today);
assert(foodSoon.some((item) => item.text === '主食罐 还有 3 天到期'), '食品临期');

const foodLate = buildSuggestions(pet(), {
  ...base,
  foods: [{ id: 'f1', petId: 'p1', brand: '主食罐', kind: 'can', spec: '', producedOn: '', expiresOn: addDays(today, -2), openedOn: '', openedDays: null, remaining: 'plenty', loggedOn: today }],
}, 'jin', today);
assert(foodLate.some((item) => item.text === '主食罐 已过期 2 天'), '食品过期');

const opened = buildSuggestions(pet(), {
  ...base,
  foods: [{ id: 'f1', petId: 'p1', brand: '主粮', kind: 'staple', spec: '', producedOn: '', expiresOn: addDays(today, 40), openedOn: addDays(today, -10), openedDays: 7, remaining: 'plenty', loggedOn: today }],
}, 'jin', today);
assert(opened.some((item) => item.text.includes('已开封 10 天')), '开封超期');

const finished = buildSuggestions(pet(), {
  ...base,
  foods: [{ id: 'f1', petId: 'p1', brand: '主粮', kind: 'staple', spec: '', producedOn: '', expiresOn: addDays(today, -1), openedOn: '', openedDays: null, remaining: 'finished', loggedOn: today }],
}, 'jin', today);
assert(finished.length === 0, '吃完后不再提醒');

const overdue = buildSuggestions(pet(), {
  ...base,
  deworms: [{ id: 'd1', petId: 'p1', date: addDays(today, -94), type: 'internal', medicine: '', nextDate: addDays(today, -4) }],
}, 'jin', today);
assert(overdue.some((item) => item.text === '体内驱虫 已逾期 4 天'), '驱虫逾期');

const weights = buildSuggestions(pet(), {
  ...base,
  weights: [
    { id: 'w1', petId: 'p1', date: addDays(today, -40), weightKg: 4, condition: '', note: '' },
    { id: 'w2', petId: 'p1', date: today, weightKg: 4.5, condition: '', note: '' },
  ],
}, 'jin', today);
assert(weights.some((item) => item.text.includes('上升')), '体重变化');

const calm = buildSuggestions(pet(), {
  ...base,
  weights: [
    { id: 'w1', petId: 'p1', date: addDays(today, -40), weightKg: 4, condition: '', note: '' },
    { id: 'w2', petId: 'p1', date: today, weightKg: 4.1, condition: '', note: '' },
  ],
}, 'jin', today);
assert(!calm.some((item) => item.id.startsWith('weight')), '小幅体重不提醒');

const spend = buildSuggestions(pet(), {
  ...base,
  expenses: [
    { id: 'e1', petId: 'p1', date: '2026-07-10', amount: 100, category: 'medical', note: '', sourceType: '', sourceId: '' },
    { id: 'e2', petId: 'p1', date: '2026-08-10', amount: 100, category: 'medical', note: '', sourceType: '', sourceId: '' },
    { id: 'e3', petId: 'p1', date: '2026-09-10', amount: 100, category: 'medical', note: '', sourceType: '', sourceId: '' },
    { id: 'e4', petId: 'p1', date: today, amount: 200, category: 'medical', note: '', sourceType: '', sourceId: '' },
  ],
}, 'jin', today);
assert(spend.some((item) => item.text.includes('高')), '消费偏高');

assert(todayISO(new Date(2026, 9, 14)) === '2026-10-14', '日期格式');
assert(ageLabel('2024-07-14', today) === '2 岁 3 个月', '年龄');

const foodEntries: TimelineEntry[] = [
  { id: 'a', petId: 'p1', type: 'food', date: '2026-10-01', title: '食品', summary: '后到期', expiresOn: '2026-12-01', finished: false },
  { id: 'b', petId: 'p1', type: 'food', date: '2026-10-02', title: '食品', summary: '先到期', expiresOn: '2026-10-20', finished: false },
  { id: 'c', petId: 'p1', type: 'food', date: '2026-10-03', title: '食品', summary: '吃完', expiresOn: '2026-10-01', finished: true },
];
const foodSections = groupTimeline(foodEntries, 'food');
assert(foodSections[0]?.data[0]?.id === 'b', '食品按到期日排序');
assert(foodSections.at(-1)?.title === '已吃完', '已吃完沉底');

const mixed: TimelineEntry[] = [
  { id: 'w', petId: 'p1', type: 'weight', date: '2026-09-01', title: '体重', summary: '' },
  { id: 'e', petId: 'p1', type: 'expense', date: '2026-10-02', title: '消费', summary: '' },
];
const months = groupTimeline(mixed, 'all');
assert(months[0]?.title === '2026年10月' && months[1]?.title === '2026年9月', '记录按月分组');

const dueToday = buildSuggestions(pet(), {
  ...base,
  foods: [{ id: 'f1', petId: 'p1', brand: '主食罐', kind: 'can', spec: '', producedOn: '', expiresOn: today, openedOn: '', openedDays: null, remaining: 'plenty', loggedOn: today }],
}, 'jin', today);
assert(dueToday.some((item) => item.text === '主食罐 还有 0 天到期' && item.actionLabel === '去查看' && item.basis.includes('2026年10月14日')), '当天到期');

const oneWeight = buildSuggestions(pet(), {
  ...base,
  weights: [{ id: 'w1', petId: 'p1', date: today, weightKg: 4, condition: '', note: '' }],
}, 'jin', today);
assert(!oneWeight.some((item) => item.id.startsWith('weight')), '单次体重不提醒');

const exactSpend = buildSuggestions(pet(), {
  ...base,
  expenses: [
    { id: 'e1', petId: 'p1', date: '2026-07-10', amount: 100, category: 'food', note: '', sourceType: '', sourceId: '' },
    { id: 'e2', petId: 'p1', date: '2026-08-10', amount: 100, category: 'food', note: '', sourceType: '', sourceId: '' },
    { id: 'e3', petId: 'p1', date: '2026-09-10', amount: 100, category: 'food', note: '', sourceType: '', sourceId: '' },
    { id: 'e4', petId: 'p1', date: today, amount: 150, category: 'medical', note: '', sourceType: '', sourceId: '' },
  ],
}, 'jin', today);
assert(exactSpend.some((item) => item.text === '这个月花费比近 3 个月平均高 50%' && item.basis.includes('医疗')), '消费高 50% 并指出分类');

const loneSpend = buildSuggestions(pet(), {
  ...base,
  expenses: [{ id: 'e1', petId: 'p1', date: today, amount: 500, category: 'medical', note: '', sourceType: '', sourceId: '' }],
}, 'jin', today);
assert(!loneSpend.some((item) => item.id.startsWith('spend')), '没有月均对照时不比较消费');

const bath = careStatuses(pet(), {
  ...base,
  baths: [{ id: 'b1', petId: 'p1', date: addDays(today, -40), place: 'home', shopName: '', cost: null, note: '' }],
}, today).find((item) => item.key === 'bath');
assert(bath?.detail.includes('上次') && bath.detail.includes('已过期 10 天'), '洗澡状态卡');

const schedule = buildSuggestions(pet(), {
  ...base,
  vaccines: [{ id: 'v1', petId: 'p1', date: addDays(today, -20), name: '狂犬', nextDate: today, hospital: '', cost: null }],
}, 'jin', today);
assert(schedule.some((item) => item.text === '狂犬 还有 0 天' && item.actionLabel === '记一笔'), '到期当天');

assert(yearsAgo('2026-10-15', 1) === '2025-10-15', '一年前的今天');
assert(yearsAgo('2024-02-29', 1) === '2023-02-28', '闰日往前一年');
assert(isAnniversary('2020-02-29', '2023-02-28'), '闰日生日在平年');
assert(!isAnniversary('2026-10-14', today), '同一年不是周年');

const memory = listOnThisDay({
  ...base,
  weights: [{ id: 'old', petId: 'p1', date: '2025-10-14', weightKg: 4.1, condition: '', note: '' }],
  baths: [{ id: 'bath-old', petId: 'p1', date: '2025-10-13', place: 'home', shopName: '', cost: null, note: '' }],
}, 'p1', 'jin', today);
assert(memory.length === 1 && memory[0]?.summary.startsWith('8.2'), '只取去年同一天');

const birthdayPet = pet();
birthdayPet.birthday = '2024-10-14';
birthdayPet.adoptedOn = '2025-10-14';
const milestones = listMilestones(birthdayPet, {
  ...base,
  deworms: [{ id: 'd0', petId: 'p1', date: '2024-10-14', type: 'both', medicine: '', nextDate: '' }],
}, 'jin', today);
assert(milestones.some((item) => item.title === '2 岁了'), '生日');
assert(milestones.some((item) => item.title === '到家 1 年'), '到家周年');
assert(milestones.some((item) => item.title === '驱虫满 2 年'), '驱虫满一年');

const first = listMilestones(pet(), {
  ...base,
  weights: [{ id: 'w1', petId: 'p1', date: today, weightKg: 4, condition: '', note: '' }],
}, 'jin', today);
assert(first.some((item) => item.title === '第一笔体重' && item.detail === '8.0 斤'), '第一次称重');

const crossed = listMilestones(pet(), {
  ...base,
  weights: [
    { id: 'w1', petId: 'p1', date: '2026-10-01', weightKg: 4.8, condition: '', note: '' },
    { id: 'w2', petId: 'p1', date: today, weightKg: 5.1, condition: '', note: '' },
  ],
}, 'jin', today);
assert(crossed.some((item) => item.title === '体重到了 10 斤'), '体重跨过整数');
assert(!listMilestones(pet(), base, 'jin', today).length, '没有记录就没有里程碑');

console.log('domain rules ok');

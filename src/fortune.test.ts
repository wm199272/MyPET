import { pillarsOf, trialsFor } from './bazi.ts';
import { castCoins, castFortune, knownHexagramCount, sentenceFor, throwOnce, type CoinFace, type CoinThrow, type FortunePet } from './fortune.ts';
import { hexagrams } from './zhouyi.ts';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function oscar(): FortunePet {
  return {
    name: '奥斯卡',
    species: 'dog',
    breed: '柯基',
    gender: 'male',
    birthday: '2021-05-01',
    adoptedOn: '2021-07-24',
  };
}

const birth = pillarsOf('2021-05-01');
assert(birth.yearName === '辛丑' && birth.monthName === '壬辰' && birth.dayName === '己酉', `生日三柱 ${birth.yearName} ${birth.monthName} ${birth.dayName}`);
assert(birth.dayNayin === '大驿土', birth.dayNayin);

const home = pillarsOf('2021-07-24');
assert(home.dayName === '癸酉' && home.dayNayin === '剑锋金', `${home.dayName} ${home.dayNayin}`);

assert(pillarsOf('2000-01-01').dayName === '戊午', '2000-01-01 戊午');
assert(pillarsOf('2021-02-03').yearName === '庚子' && pillarsOf('2021-02-03').monthName === '己丑', '立春前仍是庚子年丑月');
assert(pillarsOf('2021-02-04').yearName === '辛丑' && pillarsOf('2021-02-04').monthName === '庚寅', '立春后辛丑年寅月');
assert(pillarsOf('2021-04-04').monthName === '辛卯', `清明夜里交节，4月4日仍是卯月，实际 ${pillarsOf('2021-04-04').monthName}`);
assert(pillarsOf('2021-04-05').monthName === '壬辰', '4月5日进入辰月');
assert(pillarsOf('2021-01-04').monthName[1] === '子', '小寒前是子月');
assert(pillarsOf('2021-01-05').monthName[1] === '丑', '小寒当天上午交节，算丑月');

assert(knownHexagramCount() === 64, '六十四卦');
const missing = hexagrams.map((item) => item.name).filter((name) => !sentenceFor(name));
assert(missing.length === 0, `缺卦意 ${missing.join(' ')}`);

const reading = castFortune(oscar(), '2026-10-16');
assert(reading !== null, '奥斯卡该起出卦');
if (reading) {
  assert(reading.imageName === '火雷噬嗑', reading.imageName);
  assert(reading.changedName === '天雷无妄', reading.changedName);
  assert(reading.lineLabel.includes('第 5 根') && reading.lineLabel.includes('最要紧') && !reading.lineLabel.includes('当中'), reading.lineLabel);
  assert(reading.bits === '100101' && reading.changedBits === '100111', `${reading.bits} -> ${reading.changedBits}`);
  const section = (heading: string) => reading.sections.find((item) => item.heading === heading);
  const yearNow = section('今年');
  const nature = section('性格');
  const company = section('相处');
  const body = section('身子');
  const mouth = section('吃和嘴');
  const later = section('以后');
  const birthDay = section('生日');
  assert(reading.sections.map((item) => item.heading).join(',') === '今年,性格,相处,身子,吃和嘴,以后,生日', reading.sections.map((item) => item.heading).join(','));
  assert(yearNow !== undefined && yearNow.body.includes('没有碰上') && yearNow.body.includes('吃饭和牙齿') && yearNow.body.includes('饭量忽然变少') && !yearNow.body.includes('羊刃'), yearNow?.body ?? '');
  assert(yearNow !== undefined && yearNow.term.includes('丙午') && !yearNow.term.includes('羊刃'), yearNow?.term ?? '');
  assert(nature !== undefined && nature.body.includes('用牙认世界') && !nature.body.includes('外卦'), nature?.body ?? '');
  assert(nature !== undefined && nature.term.includes('火雷噬嗑') && nature.term.includes('外卦离'), nature?.term ?? '');
  assert(company !== undefined && company.term.includes('得黄金') && company.term.includes('六五'), company?.term ?? '');
  assert(company !== undefined && !company.body.includes('六五') && company.body.includes('饭照常吃') && company.body.includes('饭点'), company?.body ?? '');
  assert(body !== undefined && body.body.includes('腰') && body.body.includes('惊蛰到清明') && !body.body.includes('硬骨头'), body?.body ?? '');
  assert(body !== undefined && body.term.includes('日支') && !body.body.includes('日支'), body?.term ?? '');
  assert(mouth !== undefined && mouth.body.includes('硬骨头') && mouth.body.includes('饭量'), mouth?.body ?? '');
  assert(later !== undefined && later.body.includes('不装') && !later.body.includes('卦辞'), later?.body ?? '');
  assert(later !== undefined && later.term.includes('眚'), later?.term ?? '');
  assert(birthDay !== undefined && birthDay.body.includes('驿站') && birthDay.body.includes('牙口') && birthDay.body.includes('按生日和到家日算的'), birthDay?.body ?? '');
  assert(birthDay !== undefined && birthDay.term.includes('大驿土') && birthDay.term.includes('剑锋金'), birthDay?.term ?? '');
  const near = reading.trials.filter((item) => !item.late);
  assert(near.map((item) => item.year).join(',') === '2027,2029', near.map((item) => item.title).join(' | '));
  assert(near[0].term.includes('羊刃') && near[0].term.includes('偏印') && !near[0].body.includes('羊刃') && !near[0].body.includes('偏印'), `${near[0].body} || ${near[0].term}`);
  assert(near[1].term.includes('伏吟') && near[1].term.includes('自刑') && !near[1].body.includes('伏吟'), `${near[1].body} || ${near[1].term}`);
  assert(reading.trials.some((item) => item.late && item.year === 2035), reading.trials.map((item) => item.title).join(' | '));
  assert(reading.note.includes('不能代替看病') && !reading.note.includes('除以'), reading.note);
  assert(reading.method.includes('除以 8'), reading.method);
}

const noHome = castFortune({ ...oscar(), adoptedOn: '' }, '2026-10-16');
assert(noHome !== null && noHome.note.includes('不能代替看病') && noHome.sections.some((item) => item.heading === '生日' && item.body.includes('到家日还空着')), noHome?.note ?? '空');
assert(castFortune({ ...oscar(), birthday: '' }) === null, '没有生日不起卦');

const cat = castFortune({ ...oscar(), name: '豆包', species: 'cat', breed: '英国短毛猫', gender: 'female', birthday: '2024-01-01', adoptedOn: '' }, '2026-10-16');
assert(cat !== null && !cat.sections.some((item) => item.body.includes('他')), '母猫不称他');
assert(trialsFor('2021-05-01', '2026-10-16').some((item) => item.year === 2027), '2027 在劫年里');

function rollOf(value: CoinThrow['value']): CoinThrow {
  const faces: Record<CoinThrow['value'], [CoinFace, CoinFace, CoinFace]> = {
    6: ['character', 'character', 'character'],
    7: ['character', 'back', 'back'],
    8: ['character', 'character', 'back'],
    9: ['back', 'back', 'back'],
  };
  return { faces: faces[value], value };
}

const asked = castCoins('这阵子饭量变少', 'male', [9, 8, 7, 6, 7, 8].map((value) => rollOf(value as CoinThrow['value'])));
assert(asked !== null && asked.imageName === '水火既济' && asked.changedName === '泽山咸', `${asked?.imageName} -> ${asked?.changedName}`);
assert(asked !== null && asked.moving.join(',') === '1,4', asked?.moving.join(',') ?? '');
assert(asked !== null && asked.bits === '101010' && asked.changedBits === '001110', `${asked?.bits} -> ${asked?.changedBits}`);
assert(asked !== null && asked.verdict === 'turn' && asked.title === '有波折，能过去' && asked.summary === '难是真的，这件事过得去。', `${asked?.title} ${asked?.summary}`);
assert(asked !== null && !asked.summary.includes('饭点') && asked.term.includes('老阳') && asked.term.includes('老阴') && !asked.term.includes('曳其轮'), asked?.term ?? '');
assert(asked !== null && asked.note.includes('不能代替看病'), asked?.note ?? '');
assert(asked !== null && asked.method.includes('背背背=9') && asked.method.includes('字字字=6'), asked?.method ?? '');

const still = castCoins('要不要换粮', 'male', [7, 7, 7, 7, 7, 7].map(() => rollOf(7)));
assert(still !== null && still.imageName === '乾为天' && still.moving.length === 0 && still.verdict === 'hold' && still.summary === '这件事不会自己变。', still?.summary ?? '');

const flipped = castCoins('整个翻面', 'male', [9, 9, 9, 9, 9, 9].map(() => rollOf(9)));
assert(flipped !== null && flipped.imageName === '乾为天' && flipped.changedName === '坤为地' && flipped.verdict === 'flip', `${flipped?.imageName} ${flipped?.title}`);

const femaleCoins = castCoins('这阵子饭量变少', 'female', [9, 8, 7, 6, 7, 8].map((value) => rollOf(value as CoinThrow['value'])));
assert(femaleCoins !== null && ![femaleCoins.title, femaleCoins.summary, femaleCoins.note].some((text) => text.includes('他')), '母宠摇铜钱不称他');
assert(castCoins('   ', 'male', [7, 7, 7, 7, 7, 7].map(() => rollOf(7))) === null, '空问题不给卦');
assert(castCoins('只问一件', 'male', [rollOf(7)]) === null, '没摇满六次不给卦');
assert(throwOnce(() => 0).value === 6 && throwOnce(() => 0.9).value === 9, '字是 2，背是 3');

console.log('fortune ok');

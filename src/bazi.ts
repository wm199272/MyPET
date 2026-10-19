const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
const ELEMENTS = ['木', '火', '土', '金', '水'] as const;

const NAYIN = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火', '涧下水', '城头土', '白蜡金', '杨柳木',
  '泉中水', '屋上土', '霹雳火', '松柏木', '长流水', '沙中金', '山下火', '平地木', '壁上土', '金箔金',
  '佛灯火', '天河水', '大驿土', '钗钏金', '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水',
] as const;

const NAYIN_GLOSS: Record<(typeof NAYIN)[number], string> = {
  海中金: '他不爱一上来就贴人。认准了谁，才会把亲近给出去，陌生人硬搂，他会躲。',
  炉中火: '他身上热，情绪也热。人在旁边看着，他才不会热过了头。',
  大林木: '他能长得很壮，也占地方。家里要留出走动的空，关太小他会烦。',
  路旁土: '他愿意跟着人走。你去哪儿，他觉得家就在哪儿，人一停，他才停。',
  剑锋金: '牙口利，啃和咬都来得干脆。硬东西要限量，不然先伤的是牙。',
  山头火: '他看得远，反应也猛。风吹草动会先炸一下，确认安全才放下。',
  涧下水: '精力细，但停不下来。别指望他一天到晚躺着，短短的玩和走，他需要。',
  城头土: '他会守着自己的地盘，也对生人有距离。进门的人要让他先闻一闻，别直接抱。',
  白蜡金: '他看着亮，其实不经硬碰。摔一下、吓一下，恢复得比看起来慢。',
  杨柳木: '他会顺着你，也会自己弯回来。硬拉硬拽没用，顺着来，他才肯走。',
  泉中水: '他的安心来自这个家。家稳定，他的精神就稳定。',
  屋上土: '他把这个家当成要盖住的地方。搬家、装修、家里进新人，他都会先紧张一阵。',
  霹雳火: '他的高兴和害怕都来得很突然。打雷、摔门、鞭炮，要提前让他有个能躲的角落。',
  松柏木: '他长得慢，也耐得住。别用别人家同龄的速度来催他。',
  长流水: '精力像流水，停不下来。每天都要有正经的走和玩，不然精力会变成拆家。',
  沙中金: '好处要相处一阵才看得见。头几天别急着下结论，他不是冷，是还没把你认全。',
  山下火: '热藏在里面。表面还好，其实已经燥了，夏天和剧烈跑跳要早一点停。',
  平地木: '他要平地，要能往两边走。老关在一处，腿和心情都会僵。',
  壁上土: '他贴着家，不爱挪窝。出门可以，但回家的门和床要还是原来的。',
  金箔金: '他看着精致，其实不经摔、不经吓。落地、碰撞，都比壮的品种要小心。',
  佛灯火: '他会照着人的情绪走，自己也耗。你紧张，他跟着紧张，你先稳，他才稳。',
  天河水: '情绪来得快，去得也快。吓着了别一直追着哄，给他几分钟自己缓。',
  大驿土: '他像路上的驿站，走到一个地方就想停下来安家。家一旦定了，再搬就会不安。',
  钗钏金: '他喜欢贴身，人在旁边才踏实。单独关太久，他会一直找你。',
  桑柘木: '他是慢慢养出来的。饭、信任、规矩，都是一天一天加上去的，急不来。',
  大溪水: '平时看着浅，急起来没过脚。平时乖，真被惹到会一下子冲出来。',
  沙中土: '注意力容易散。新环境里要有人在旁边拢着，不然他会自己转圈、自己慌。',
  天上火: '精神旺的时候很旺，也容易热过头。旺的日子更要让他有地方凉快、有时候停。',
  石榴木: '外面看着硬，里面心眼多、事也多。别只看他能忍，不舒服他会先藏着。',
  大海水: '他能容下家里的人和事，也能被太多刺激淹没。客人多、声音杂的日子，给他一间安静的屋。',
};

const MONTH_STARTS: { branch: number; longitude: number; name: string; span: string }[] = [
  { branch: 2, longitude: 315, name: '立春', span: '立春到惊蛰' },
  { branch: 3, longitude: 345, name: '惊蛰', span: '惊蛰到清明' },
  { branch: 4, longitude: 15, name: '清明', span: '清明到立夏' },
  { branch: 5, longitude: 45, name: '立夏', span: '立夏到芒种' },
  { branch: 6, longitude: 75, name: '芒种', span: '芒种到小暑' },
  { branch: 7, longitude: 105, name: '小暑', span: '小暑到立秋' },
  { branch: 8, longitude: 135, name: '立秋', span: '立秋到白露' },
  { branch: 9, longitude: 165, name: '白露', span: '白露到寒露' },
  { branch: 10, longitude: 195, name: '寒露', span: '寒露到立冬' },
  { branch: 11, longitude: 225, name: '立冬', span: '立冬到大雪' },
  { branch: 0, longitude: 255, name: '大雪', span: '大雪到小寒' },
  { branch: 1, longitude: 285, name: '小寒', span: '小寒到立春' },
];

const MAIN_QI = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8];
const BLADE = [3, 4, 6, 7, 6, 7, 9, 10, 0, 1];
const SELF_PUNISH = new Set([4, 6, 9, 11]);
const HARM = new Set(['0-7', '7-0', '1-6', '6-1', '2-5', '5-2', '3-4', '4-3', '8-11', '11-8', '9-10', '10-9']);
const DAY_BASE = 2459291;
const termCache = new Map<string, string>();

export type TenGod = '比肩' | '劫财' | '食神' | '伤官' | '偏财' | '正财' | '七杀' | '正官' | '偏印' | '正印';

export type Pillars = {
  yearStem: number;
  yearBranch: number;
  monthStem: number;
  monthBranch: number;
  dayStem: number;
  dayBranch: number;
  yearName: string;
  monthName: string;
  dayName: string;
  dayNayin: string;
};

export type Trial = {
  year: number;
  title: string;
  body: string;
  term: string;
  late: boolean;
  soon: boolean;
};

export function stemName(index: number): string {
  return STEMS[((index % 10) + 10) % 10];
}

export function branchName(index: number): string {
  return BRANCHES[((index % 12) + 12) % 12];
}

export function elementName(stem: number): string {
  return ELEMENTS[Math.floor((((stem % 10) + 10) % 10) / 2)];
}

export function nayinGloss(name: string): string {
  return NAYIN_GLOSS[name as (typeof NAYIN)[number]] ?? '';
}

export function tenGod(dayStem: number, otherStem: number): TenGod {
  const dayElement = Math.floor(dayStem / 2);
  const otherElement = Math.floor(otherStem / 2);
  const same = dayStem % 2 === otherStem % 2;
  if (otherElement === dayElement) return same ? '比肩' : '劫财';
  if (otherElement === (dayElement + 1) % 5) return same ? '食神' : '伤官';
  if (otherElement === (dayElement + 2) % 5) return same ? '偏财' : '正财';
  if (otherElement === (dayElement + 3) % 5) return same ? '七杀' : '正官';
  return same ? '偏印' : '正印';
}

export function branchSpan(branch: number): string {
  return MONTH_STARTS.find((item) => item.branch === branch)?.span ?? '';
}

export function pillarsOf(iso: string): Pillars {
  const year = baziYear(iso);
  const yearIndex = sexagenaryYearIndex(year);
  const month = monthOf(iso);
  const monthStem = monthStemOf(yearIndex % 10, month.branch);
  const dayIndex = dayIndexOf(iso);
  return {
    yearStem: yearIndex % 10,
    yearBranch: yearIndex % 12,
    monthStem,
    monthBranch: month.branch,
    dayStem: dayIndex % 10,
    dayBranch: dayIndex % 12,
    yearName: pillarName(yearIndex),
    monthName: stemName(monthStem) + branchName(month.branch),
    dayName: pillarName(dayIndex),
    dayNayin: nayinOf(dayIndex),
  };
}

export function flowOf(birthday: string, today: string): { year: number; score: number; plain: string; term: string; pillar: string } {
  const birth = pillarsOf(birthday);
  const year = baziYear(today);
  const flowIndex = sexagenaryYearIndex(year);
  const scored = scoreYear(birth, flowIndex % 10, flowIndex % 12);
  const pillar = pillarName(flowIndex);
  return { year, score: scored.score, plain: scored.plain, term: scored.term ? `${pillar}。${scored.term}` : `${pillar}。`, pillar };
}

export function trialsFor(birthday: string, today: string): Trial[] {
  const birth = pillarsOf(birthday);
  const start = baziYear(today);
  const birthYear = Number(birthday.slice(0, 4));
  const end = Math.max(birthYear + 16, start);
  const trials: Trial[] = [];
  for (let year = start; year <= end; year += 1) {
    const flowIndex = sexagenaryYearIndex(year);
    const scored = scoreYear(birth, flowIndex % 10, flowIndex % 12);
    if (scored.score < 3) continue;
    const age = year - birthYear;
    const late = age >= 12;
    trials.push({
      year,
      late,
      soon: year <= start + 1,
      title: `${year} · ${age <= 0 ? '不满 1 岁' : `满 ${age} 岁`}`,
      body: scored.plain,
      term: `${pillarName(flowIndex)}。${scored.term}`,
    });
  }
  return trials;
}

export function clashMonth(dayBranch: number): { name: string; span: string } {
  const branch = (dayBranch + 6) % 12;
  return { name: branchName(branch), span: branchSpan(branch) };
}

function scoreYear(birth: Pillars, flowStem: number, flowBranch: number): { score: number; plain: string; term: string } {
  const plain: string[] = [];
  const term: string[] = [];
  let score = 0;
  const clashesYear = flowBranch === (birth.yearBranch + 6) % 12;
  const clashesDay = flowBranch === (birth.dayBranch + 6) % 12;
  const yearBranchText = branchName(flowBranch);
  const birthBranchText = branchName(birth.yearBranch);
  const dayBranchText = branchName(birth.dayBranch);

  if (clashesYear && clashesDay) {
    score += 3;
    plain.push('他出生那年留下的体质，和现在这副身子，同一年都被碰动。旧毛病、旧惊吓容易一起再来。换环境、乱作息，反应会比平时大一截。');
    term.push(`年支日支同在${birthBranchText}，流年${yearBranchText}冲开。`);
  } else if (clashesYear) {
    score += 3;
    plain.push('他出生那年留下来的脾气和体质，今年会被碰一下。搬家、换人带、作息大改，他会比别的年份更慌，也更容易生病。');
    term.push(`流年${yearBranchText}冲年支${birthBranchText}。`);
  } else if (clashesDay) {
    score += 3;
    plain.push('这一年的不舒服会直接出现在身子上。走路跛、吃饭少、没精神，都不要拖过两三天。');
    term.push(`流年${yearBranchText}冲日支${dayBranchText}。`);
  }

  if (flowBranch === BLADE[birth.dayStem]) {
    score += 3;
    plain.push('今年容易突然出事，也容易见血、要去医院处理。从高处往下跳、打架、误食，都要提前拦住。');
    term.push('羊刃。');
  }

  const god = tenGod(birth.dayStem, flowStem);
  if (god === '偏印') {
    score += 2;
    const onDay = tenGod(birth.dayStem, MAIN_QI[birth.dayBranch]) === '食神';
    plain.push(onDay ? '他平时靠吃饭和啃东西把日子稳住。今年这股劲会变弱，饭量忽然少、啃家具变凶，都要当成身体在喊，不是单纯闹脾气。' : '吃饭和睡觉这两样缓冲会变少。饿一顿、累一天，恢复得比平时慢，别接着加运动。');
    term.push(onDay ? '偏印克日支食神。' : '偏印克食神。');
  } else if (elementControls(flowStem, foodElement(birth.dayStem))) {
    score += 1;
    plain.push('今年吃饭和牙齿要多留心。饭量忽然变少、口臭、一边嚼、啃家具变勤，先看牙和肚子。');
    term.push(`${elementName(flowStem)}克食神。`);
  }

  if (god === '七杀') {
    score += 2;
    plain.push('外面的压力会压到他身上。生人进门、鞭炮、寄养、长途，他会比平时紧，也比平时容易冲人。');
    term.push('七杀。');
  }

  const fuyin = flowStem === birth.dayStem && flowBranch === birth.dayBranch;
  const punish = flowBranch === birth.dayBranch && SELF_PUNISH.has(flowBranch);
  if (fuyin) {
    score += 3;
    plain.push('和出生那天很像的一套日子又走了一遍。以前好过的病、吓过的事，今年容易再来一次，旧伤不要当成已经过去。');
    term.push('日柱伏吟。');
  }
  if (punish) {
    score += 2;
    plain.push('问题多半不是外来的，是从他自己的身材和每天的习惯里长出来的。该停的跳、该停的啃还在做，小伤就会拖成大伤。');
    term.push(`${yearBranchText}见${yearBranchText}，自刑。`);
  }

  if (HARM.has(`${flowBranch}-${birth.dayBranch}`)) {
    score += 2;
    plain.push('牙、嘴和肠胃这些里面的不舒服要留心。拉稀、呕吐、口臭、不肯吃饭，不要等到他自己好。');
    term.push(`流年${yearBranchText}害日支${dayBranchText}。`);
  }

  const touched = clashesYear || clashesDay || flowBranch === BLADE[birth.dayStem] || fuyin || punish || HARM.has(`${flowBranch}-${birth.dayBranch}`);
  const span = branchSpan(flowBranch);
  if (touched && span) {
    plain.push(`这一年里最要你看着的一段，是${span}。这段日子少搬家、少寄养，玩也少做猛的。`);
    term.push(`${yearBranchText}月。`);
  }
  return { score, plain: plain.join(''), term: term.join('') };
}

function foodElement(dayStem: number): number {
  return (Math.floor(dayStem / 2) + 1) % 5;
}

function elementControls(stem: number, element: number): boolean {
  return (Math.floor(stem / 2) + 2) % 5 === element;
}

function baziYear(iso: string): number {
  const year = Number(iso.slice(0, 4));
  return iso >= solarTermDate(year, 315) ? year : year - 1;
}

function monthOf(iso: string): { branch: number } {
  const year = Number(iso.slice(0, 4));
  const marks: { iso: string; branch: number }[] = [];
  for (const y of [year - 1, year, year + 1]) {
    for (const term of MONTH_STARTS) marks.push({ iso: solarTermDate(y, term.longitude), branch: term.branch });
  }
  marks.sort((a, b) => (a.iso < b.iso ? -1 : 1));
  let current = marks[0];
  for (const mark of marks) {
    if (mark.iso <= iso) current = mark;
  }
  return current;
}

function monthStemOf(yearStem: number, monthBranch: number): number {
  const start = [2, 4, 6, 8, 0][yearStem % 5];
  const index = (monthBranch - 2 + 12) % 12;
  return (start + index) % 10;
}

function sexagenaryYearIndex(year: number): number {
  return ((year - 1984) % 60 + 60) % 60;
}

function dayIndexOf(iso: string): number {
  const [year, month, day] = iso.split('-').map((part) => Number(part));
  return ((julianDay(year, month, day) - DAY_BASE) % 60 + 60) % 60;
}

function pillarName(index: number): string {
  return stemName(index) + branchName(index);
}

function nayinOf(index: number): string {
  return NAYIN[Math.floor((((index % 60) + 60) % 60) / 2)];
}

function julianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function solarTermDate(year: number, longitude: number): string {
  const key = `${year}:${longitude}`;
  const cached = termCache.get(key);
  if (cached) return cached;
  const jd = findLongitude(year, longitude);
  const shifted = new Date((jd - 2440587.5) * 86400000 + 8 * 3600000);
  let iso = cstDate(jd);
  const hour = shifted.getUTCHours();
  const minute = shifted.getUTCMinutes();
  if (hour > 12 || (hour === 12 && minute > 0)) iso = nextDate(iso);
  termCache.set(key, iso);
  return iso;
}

function nextDate(iso: string): string {
  const [year, month, day] = iso.split('-').map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day + 1));
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${nextMonth}-${nextDay}`;
}

function findLongitude(year: number, target: number): number {
  let previous = julianDay(year, 1, 1) - 0.5;
  let previousLongitude = sunLongitude(previous);
  const end = julianDay(year + 1, 1, 20) - 0.5;
  for (let jd = previous; jd < end; jd += 0.5) {
    const longitude = sunLongitude(jd);
    const crossed = (previousLongitude <= target && longitude >= target)
      || (previousLongitude > longitude && (target >= previousLongitude || target <= longitude));
    if (crossed && Math.abs(longitude - previousLongitude) < 30) {
      let low = previous;
      let high = jd;
      for (let step = 0; step < 50; step += 1) {
        const mid = (low + high) / 2;
        const midLongitude = sunLongitude(mid);
        const lowLongitude = sunLongitude(low);
        const forward = normalize(midLongitude - lowLongitude) < normalize(target - lowLongitude);
        if (forward) low = mid;
        else high = mid;
      }
      return (low + high) / 2;
    }
    previous = jd;
    previousLongitude = longitude;
  }
  throw new Error(`节气算不出来 ${year} ${target}`);
}

function sunLongitude(jd: number): number {
  const century = (jd - 2451545) / 36525;
  const mean = 280.46646 + 36000.76983 * century + 0.0003032 * century * century;
  const anomaly = 357.52911 + 35999.05029 * century - 0.0001537 * century * century;
  const radians = (anomaly * Math.PI) / 180;
  const center = (1.914602 - 0.004817 * century - 0.000014 * century * century) * Math.sin(radians)
    + (0.019993 - 0.000101 * century) * Math.sin(2 * radians)
    + 0.000289 * Math.sin(3 * radians);
  const node = 125.04 - 1934.136 * century;
  return normalize(mean + center - 0.00569 - 0.00478 * Math.sin((node * Math.PI) / 180));
}

function normalize(degrees: number): number {
  const value = degrees % 360;
  return value < 0 ? value + 360 : value;
}

function cstDate(jd: number): string {
  const date = new Date((jd - 2440587.5) * 86400000 + 8 * 3600000);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

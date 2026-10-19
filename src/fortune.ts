import { clashMonth, flowOf, nayinGloss, pillarsOf, trialsFor, type Pillars, type Trial } from './bazi.ts';
import { ageLabel, genderLabel, speciesLabel, todayISO, type Gender, type Species } from './domain.ts';
import { hexagramByBits, hexagrams, type Hexagram } from './zhouyi.ts';

export type FortunePet = {
  name: string;
  species: Species;
  breed: string;
  gender: Gender;
  birthday: string;
  adoptedOn: string;
};

export type FortuneSection = {
  heading: string;
  body: string;
  term: string;
};

export type Fortune = {
  symbol: string;
  changedSymbol: string;
  imageName: string;
  who: string;
  lineLabel: string;
  changedName: string;
  bits: string;
  changedBits: string;
  moving: number;
  sections: FortuneSection[];
  trials: Trial[];
  trialEmpty: string;
  note: string;
  method: string;
};

const TRIGRAMS = [
  { name: '乾', nature: '天', bits: '111', outer: '外人先觉得他硬、亮，什么都想自己做主，不爱被按着头走。', inner: '熟了以后也是这股不肯弯的劲。你讲理、给选择，比硬拽有用。' },
  { name: '兑', nature: '泽', bits: '110', outer: '他讨喜，也爱用嘴探索，见人先闻、先舔、先叫两声。', inner: '心里其实是高兴的。委屈了不会闷着，会从叫、从啃、从不吃饭里说出来。' },
  { name: '离', nature: '火', bits: '101', outer: '他看着热，喜欢贴着人，眼睛亮，高兴和烦躁都写在脸上。', inner: '里面也容易燥。热久了、人太久不搭理，他会烦、会喘、会找事。' },
  { name: '震', nature: '雷', bits: '100', outer: '动静大。门一响他就到，高兴和紧张都来得很快。', inner: '看着好像稳，真跑起来收不住，叫停要提前，不要等他已经冲出去。' },
  { name: '巽', nature: '风', bits: '011', outer: '他会顺着你的气味和脚步跟过来，也会缠着不放。', inner: '心里没有那么硬，新规矩进得去，但要重复很多遍，骂一次记不住。' },
  { name: '坎', nature: '水', bits: '010', outer: '同一种险会再来。上次吓着的声音、上次吃坏的东西，下次还可能碰上。', inner: '心里有一处放不下的怕。表面已经没事，角落里、夜里还会想起来。' },
  { name: '艮', nature: '山', bits: '001', outer: '他停得住，也很倔。不想走的时候，拉绳子只会被他坐下去。', inner: '认定的地方就不挪。床、碗、出门的门，尽量别天天换。' },
  { name: '坤', nature: '地', bits: '000', outer: '他能扛，也愿意跟着人。你去哪儿，他觉得家就在哪儿。', inner: '家在哪儿，他就钉在哪儿。搬一次家，他需要比你更长的时间才把新地方当成家。' },
] as const;

const SENTENCE: Record<string, string> = {
  乾: '身子里有一股不肯歇的劲。领头、护主，也容易过满。玩到停不下来的时候，要你先喊停。',
  坤: '厚，稳，能承。跟着人走，把家当成自己的地。',
  屯: '根还在长。环境一变就慌，安顿住了就慢慢壮。',
  蒙: '聪明还没开全，要人一遍遍教。教通了就很灵。',
  需: '他会等。饭点、出门、你回家，都急不得。',
  讼: '嘴里要争。护食、争门口，对生人不肯先让。',
  师: '你走到哪，他跟到哪，像一支只有一个兵的队伍。',
  比: '要贴着人。离久了，心就慌。',
  小畜: '积得不多，天天在积。胃口、习惯、信任，都是小口小口攒的。',
  履: '踩在规矩上才安。路线固定，步子就稳。',
  泰: '里外通。人顺，他就顺。',
  否: '里外暂时堵着。生人多、环境一换，他会把自己关起来。',
  同人: '家里的人他都算自己人。门外的，要重新认。',
  大有: '吃、宠、地盘，一样不落，也容易养过头。',
  谦: '不争先。看着低调，心里有数。',
  豫: '喜悦来得快。听到你的声音，尾巴先到。',
  随: '你是方向，他是脚步。',
  蛊: '旧毛病要收拾。肠胃、皮毛、久了没管的小事，会从这里冒出来。',
  临: '人靠近，他就开。信任要慢慢建，硬赶会关上。',
  观: '先看再动。风吹草动，都要确认一遍。',
  噬嗑: '嘴里总像卡着一件事，啃开、咬开，他才算完。用牙认世界，也用牙护家。桌子腿、拖鞋、门口的鞋，他都可能拿来啃。能啃的给他，不能啃的收走。',
  贲: '皮相招人。毛、脸、步态都好看，里子也要顾。',
  剥: '有东西在一层层掉。牙、毛、精力，别再往上加负担。',
  复: '能回来。吓着了、病过了，还有一股往回长的力。',
  无妄: '不装。高兴和不高兴都写在脸上，福气也从这里来。',
  大畜: '吃进去的、记住的，都存在身子里。蓄过了头，就要疏。',
  颐: '一口饭、一口水。养的方式对不对，直接写在这一卦上。',
  大过: '负担偏重。身子的某一处，承了太大的分量。',
  习坎: '同样的坎会再来一次。走过一次，不算结束。',
  离: '外热。黏人，眼睛亮，也怕过热、过燥。',
  咸: '感应快。你的情绪他收得到，摸得到的地方他最认。',
  恒: '认定了就不改。日子越长，越稳。',
  遁: '压力来了，先退到自己的角落。别追着逼。',
  大壮: '劲太大。冲、跳、顶，力气先于判断。',
  晋: '越来越熟，越来越敢，是往亮处走的。',
  明夷: '光暂时收着。生病、受惊，或者你太忙的时候，他会暗一阵。',
  家人: '家就是全部。家里的秩序在，他的心就在。',
  睽: '有一处长期合不拢。对某个人、某种声音，会一直别扭。',
  蹇: '行走费劲。腿、腰、关节，是这一卦先提醒的地方。',
  解: '结会散。紧过一阵，能松开。最紧的时候，别再加码。',
  损: '要减。食量、负重、折腾，减一点比加一点好。',
  益: '添得进。陪伴和规矩加上去，他接得住。',
  夬: '有一件习惯要断开。拖着，会变成病。',
  姤: '突然的声音、突然的食物、突然的生人，是这一卦的口子。',
  萃: '人聚在一起，他最高兴。人也是他的依靠。',
  升: '慢慢往上。不怕慢。',
  困: '被困住的时候，先从吃和睡上看出来。',
  井: '固定的碗、固定的水、固定的人，就是他的井。',
  革: '换粮、搬家、长大，变的时候要人跟着，别只扔给他。',
  鼎: '养到后面，脾气和身子都会定成一个样子。',
  震: '动静大。吓一跳也恢复得快，耳朵和心脏要省着。',
  艮: '能在一个地方待很久。太久不动的时候，要人带他动。',
  渐: '信任、适应、病后恢复，都是一步一步的。',
  归妹: '他是被接进这个家的。位置一旦定了，就认定这是终点。',
  丰: '精神足的时候很满。满过了，容易伤。',
  旅: '出门、寄养、换地方，心会不宁。',
  巽: '顺着气味和你的脚步钻进来，也缠。',
  兑: '讨喜，也爱用嘴探索。',
  涣: '注意力和精力容易散。收回来，要靠你在场。',
  节: '饭、玩、出门，都要有个度。有节制，这一卦才吉。',
  中孚: '你答应的事他记得。失信，他也记得。',
  小过: '不是大灾，是日常的分寸一次次过线。',
  既济: '眼下是齐的。齐的时候最要守。',
  未济: '还有一件事悬着。悬着的时候，别当它已经结束。',
};

const POSITION = [
  '眼下要看的是步子，和刚养成的习惯。走路突然变了、新规矩还没站稳，都从这里开始。',
  '眼下贴着每天的日子。吃得好不好、睡得踏不踏实、你在不在家，他都记在这上面。',
  '眼下卡在进门出门。外面的事容易被他带回来：鞋上的味道、楼道里的惊吓、公园里捡到的东西。',
  '眼下像站在门口，进也费劲，退也费劲。叫他过来他犹豫，让他留下他又跟着，不要在这个时候逼他马上选。',
  '眼下这件事卡在他最要紧的地方。他会用啃、用顶、用不肯停来处理，处理完才肯算数。你硬夺，他会更紧。',
  '眼下已经到了收尾。耳朵后面的小毛病、玩过了头、一天里最后那点累，都归在这里，别再往上加。',
];

const LINE_POINT = [
  '走路，还有刚养成的习惯',
  '吃饭、睡觉，还有你在不在家',
  '出门，以及从外面带回家的事',
  '站在门口，叫他过来也犹豫，让他留下也跟着',
  '他眼下最要紧、最不肯松口的那件事',
  '一天的收尾，玩过了头就别再加',
];

const PURE: Record<string, string> = {
  乾: '乾为天',
  坤: '坤为地',
  震: '震为雷',
  巽: '巽为风',
  坎: '坎为水',
  离: '离为火',
  艮: '艮为山',
  兑: '兑为泽',
};

// 算卦付费预留。未配置 EXPO_PUBLIC_PAY_API 时下单和查单都返回 unconfigured，不会在客户端记成已付款。
export { createFortuneOrder, queryFortuneOrder } from './pay.ts';
export type { FortunePayReceipt, FortunePayRequest, FortunePayTicket, PayChannel } from './pay.ts';

export function castFortune(pet: FortunePet, today = todayISO()): Fortune | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pet.birthday)) return null;
  const birthSum = dateSum(pet.birthday);
  const hasHome = /^\d{4}-\d{2}-\d{2}$/.test(pet.adoptedOn);
  const homeSum = hasHome ? dateSum(pet.adoptedOn) : monthDaySum(pet.birthday);
  const upper = trigramFromSum(birthSum);
  const lower = trigramFromSum(homeSum);
  const moving = lineFromSum(birthSum + homeSum);
  const hex = hexagramByBits(lower.bits + upper.bits);
  const changed = hexagramByBits(flip(hex.bits, moving));
  const pillars = pillarsOf(pet.birthday);
  const home = hasHome ? pillarsOf(pet.adoptedOn) : null;
  const trials = trialsFor(pet.birthday, today);
  const who = [pet.name, genderLabel[pet.gender] === '未知' ? '' : genderLabel[pet.gender], pet.breed || speciesLabel[pet.species], ageLabel(pet.birthday, today)]
    .filter(Boolean)
    .join(' · ');
  const say = (text: string) => speak(text, pet.gender);
  const counted = castNote(pet.birthday, hasHome ? pet.adoptedOn : '', upper.name, lower.name, moving);
  return {
    symbol: hex.symbol,
    changedSymbol: changed.symbol,
    imageName: fullName(hex),
    who,
    lineLabel: say(`从下往上数，红点是正在变的第 ${moving} 根，说的是${LINE_POINT[moving - 1]}。`),
    changedName: fullName(changed),
    bits: hex.bits,
    changedBits: changed.bits,
    moving,
    sections: [
      section('今年', sayParts(thisYearCopy(pet.birthday, today, pillars.dayBranch), say)),
      section('性格', sayParts(benGua(hex, upper, lower), say)),
      section('相处', sayParts(companyCopy(hex, moving), say)),
      section('身子', sayParts(bodyCares(pet.species, pet.breed, pillars.dayBranch), say)),
      section('吃和嘴', sayParts(mouthCares(pet.species, pet.breed), say)),
      section('以后', sayParts(changedCopy(changed), say)),
      section('生日', sayParts(dayCopy(pillars, home), say)),
    ],
    trials: trials.map((item) => ({ ...item, body: say(item.body), term: say(item.term) })),
    trialEmpty: say(`从现在看到十六岁，没有哪一年是好几件麻烦叠在一起的。每年${clashMonth(pillars.dayBranch).span}前后，少搬家、少寄养，作息尽量照旧。`),
    note: say(counted.plain),
    method: say(counted.term),
  };
}

function section(heading: string, copy: { body: string; term: string }): FortuneSection {
  return { heading, ...copy };
}

function sayParts(copy: { body: string; term: string }, say: (text: string) => string): { body: string; term: string } {
  return { body: say(copy.body), term: say(copy.term) };
}

function speak(text: string, gender: Gender): string {
  if (gender === 'male') return text;
  return text.replace(/他/g, gender === 'female' ? '她' : '它');
}

export function knownHexagramCount(): number {
  return hexagrams.length;
}

export function sentenceFor(name: string): string {
  return SENTENCE[name] ?? '';
}

function benGua(hex: Hexagram, upper: (typeof TRIGRAMS)[number], lower: (typeof TRIGRAMS)[number]): { body: string; term: string } {
  return {
    body: `${SENTENCE[hex.name]}${upper.outer}${lower.inner}你顺着这个脾气安排饭、路和睡觉的地方，比天天纠正他省力。`,
    term: `${fullName(hex)}。外卦${upper.name}，内卦${lower.name}。`,
  };
}

function lineCopy(hex: Hexagram, moving: number): { body: string; term: string } {
  const text = hex.lines[moving - 1];
  return {
    body: `${POSITION[moving - 1]}${lineGloss(text)}`,
    term: `${lineName(hex.bits, moving)}：${text}`,
  };
}

function lineGloss(text: string): string {
  const parts: string[] = [];
  if (text.includes('厉') && text.includes('无咎')) parts.push('这段难是真的，不是吓你。饭照常吃、路照常走、人照常在，难就过去了，不会变成一场灾。');
  else if (text.includes('凶')) parts.push('这段要当真。吃饭、走路、精神有一点不对，就早点看，不要等他自己好。');
  else if (text.includes('无咎')) parts.push('会有惊吓和打乱，落到头上却不是一场灾。你在旁边，他过得去。');
  else if (text.includes('吉')) parts.push('这段日子是顺的。顺的时候把饭点、路线和睡觉的地方固定下来，后面才有得守。');
  if (text.includes('吝') && !text.includes('无咎')) parts.push('会有小别扭，比如忽然不肯走、忽然护食，不至于把日子过垮。');
  if (text.includes('悔') && !text.includes('无悔')) parts.push('中间会有一次回头，比如吓过之后又来找你，你接着就行，不必惩罚那一次。');
  if (text.includes('眚')) parts.push('还要看眼睛。眯眼、流泪、撞到家具，不要只当成没睡醒。');
  return parts.join('');
}

function changedCopy(hex: Hexagram): { body: string; term: string } {
  const extra = hex.judgment.includes('眚') ? '还要看眼睛。路走偏、声音太杂、光线太刺的时候，除了受惊，也看他眯眼、流泪、不敢下台阶。' : '新环境先别要求他立刻适应。给他原来的垫子、原来的碗，比一直哄有用。';
  return {
    body: `${SENTENCE[hex.name]}往后看他的脸就够，高兴、害怕、不舒服，他都不太会藏。${extra}`,
    term: `${fullName(hex)}。卦辞：${hex.judgment}`,
  };
}

function thisYearCopy(birthday: string, today: string, dayBranch: number): { body: string; term: string } {
  const flow = flowOf(birthday, today);
  const span = clashMonth(dayBranch).span;
  if (flow.score >= 3) {
    return {
      body: `今年不是平年，要多看着他。${flow.plain}最需要你上心的那几个月，写在下面「要留心的年份」里。`,
      term: flow.term,
    };
  }
  if (flow.plain) {
    return {
      body: `今年没有碰上那种好几件麻烦叠在一起的年份，日子大体还稳。${flow.plain}另外，每年${span}前后少搬家、少寄养，作息尽量照旧。`,
      term: flow.term,
    };
  }
  return {
    body: `今年比较顺，没有特别要提防的坎。吃饭、走路、脾气照常看就行。每年${span}前后少搬家、少改作息，他会安心一些。`,
    term: `${flow.pillar}。`,
  };
}

function companyCopy(hex: Hexagram, moving: number): { body: string; term: string } {
  const line = lineCopy(hex, moving);
  return {
    body: `${line.body}跟他相处，落到每天就三件事。饭点尽量固定，晚了他会慌，提早他又会讨。出门走他已经熟的路，忽然换公园、换电梯，他会全身发紧。你在家的时候让他靠得着；单独关太久，叫门、拆东西、随地大小便，常常是在找你，不是单纯捣乱。`,
    term: line.term,
  };
}

function dayCopy(birth: Pillars, home: Pillars | null): { body: string; term: string } {
  const body = [`按${home ? '生日和到家日' : '生日'}算的。这里说的是他生下来、进门那天带进来的脾气，不是今年的事。生日这天，${nayinGloss(birth.dayNayin)}`];
  const term = [`${birth.yearName}年、${birth.monthName}月、${birth.dayName}日，纳音${birth.dayNayin}。`];
  if (!home) {
    body.push('到家日还空着。进门那天也会影响这一卦，补上之后会按进门那天重算。现在只说到生日。');
    return { body: body.join(''), term: term.join('') };
  }
  body.push(`到家那天，${nayinGloss(home.dayNayin)}`);
  term.push(`到家${home.dayName}日，纳音${home.dayNayin}。`);
  if (home.dayBranch === birth.dayBranch) body.push(`生日和到家日落在同一类日子上。${branchHint(birth.dayBranch)}`);
  return { body: body.join(''), term: term.join('') };
}

function branchHint(branch: number): string {
  if (branch === 9) return '这类日子和嘴、牙连得紧。啃东西、换牙、口臭，都比别的宠物更要看。';
  if (branch === 6 || branch === 5) return '这类日子和心、暑热连得紧。大热天少拉出去跑，喘起来要马上停。';
  if (branch === 0 || branch === 11) return '这类日子和肾、夜里的安稳连得紧。喝水忽然变多、夜里来回走，不要当成睡相不好。';
  return '';
}

function bodyCares(species: Species, breed: string, dayBranch: number): { body: string; term: string } {
  const month = clashMonth(dayBranch);
  return {
    body: `${bodyLines(species, breed).join('')}每年${month.span}前后，少搬家、少寄养，出门也少去没去过的地方。这段日子他更容易紧张，也更容易闪到。`,
    term: `日支${branchChar(dayBranch)}，冲在${month.name}月。`,
  };
}

function mouthCares(species: Species, breed: string): { body: string; term: string } {
  return { body: mouthLines(species, breed).join(''), term: '' };
}

function branchChar(branch: number): string {
  return '子丑寅卯辰巳午未申酉戌亥'[branch] ?? '';
}

function bodyLines(species: Species, breed: string): string[] {
  if (/柯基/.test(breed)) return ['这副身材最要当心的是腰。沙发、床、车尾箱，不要让他直接往下跳。后腿忽然不听使唤、不肯上下楼梯，常常就是那一下。伏天待在阴凉有风的地方，午后不要拉到柏油路上跑。'];
  if (/腊肠/.test(breed)) return ['身子长、腿短，腰先受力。少从高处跳下来，少拉他上陡坡和楼梯。抱的时候托住整根背，不要只拎前腿。'];
  if (/法斗|法国斗牛|巴哥|英斗|斗牛/.test(breed)) return ['鼻子短，怕热，也怕闷。夏天和剧烈跑跳要早停。喘气变成很响、舌头发紫，马上放到凉快的地方，不要再哄他继续玩。'];
  if (/金毛|拉布拉多/.test(breed)) return ['髋和关节先受力。体重上去之后，下蹲、起跳、爬楼都会变吃力。胖了不要只觉得可爱，关节会跟着疼。'];
  if (/贵宾|泰迪/.test(breed)) return ['膝盖先受力。少做连续的起跳和急停。落地如果只肯用三条腿，先休息，不要接着遛。'];
  if (/折耳/.test(breed)) return ['软骨和关节是这个品种容易出问题的地方。跳柜、跳窗台要少。走路忽然变僵、不肯跳上原来的地方，就是在喊疼。'];
  if (/缅因|布偶/.test(breed)) return ['心脏和髋要先看着。跑两步就喘、后腿发软，不要当成玩累了。胖了这两处会更累。'];
  if (species === 'cat') return ['肾，还有从高处失足，是要每天留心的。喝水忽然变多、从柜上摔下来，都不要等下次再说。'];
  if (species === 'dog') return ['关节先受力。少做猛的起跳和急停。落地后如果只肯用三条腿，先让他歇，不要接着拉去跑。'];
  return ['每天走多少、跳多少，比某一天吉不吉利更要紧。累了就停，不要用零食把他再哄起来。'];
}

function mouthLines(species: Species, breed: string): string[] {
  if (/柯基/.test(breed)) return ['啃是他认识世界的办法，但硬骨头不能当玩具天天给。牙龈出血、口臭、只敢一边嚼、饭量忽然变少，都是牙在不舒服，不是挑食。桌上掉下来的骨头和路边捡的东西，进过嘴就要当回事。'];
  if (/腊肠/.test(breed)) return ['少给需要死啃的东西，牙和脖子会一起受累。饭量忽然变了，先看牙，再看肚子拉不拉、吐不吐。'];
  if (/法斗|法国斗牛|巴哥|英斗|斗牛/.test(breed)) return ['吃太急会喘，甚至噎住。一顿饭分成几次给，吃的时候看着他。碗一空就猛喘，先停食，让他把气顺过来。'];
  if (/金毛|拉布拉多/.test(breed)) return ['饭量一过，关节就跟着受累。碗里剩多少要心里有数，讨吃不要每次都给。忽然不吃，比忽然多吃更要看。'];
  if (/贵宾|泰迪/.test(breed)) return ['牙先出问题。硬零食点到为止，毛结在嘴边也会让他不肯吃。吃饭变慢、口臭，先看牙，不要先换粮。'];
  if (/折耳/.test(breed)) return ['吃饭突然变慢、只舔汤不吃粒，先看嘴。牙疼了他不会叫，只会把饭剩下。'];
  if (/缅因|布偶/.test(breed)) return ['饭量一直往上加，心脏和髋会更累。忽然吃得很多或忽然不吃，都要连着喝水和精神一起看。'];
  if (species === 'cat') return ['嘴是每天要看的。饭量变了，往往比精神变了更早。口臭、流口水、只吃软的，先看牙和口腔，不要只换一个口味。'];
  if (species === 'dog') return ['牙，还有嘴里去过的东西，都算在每天的照看里。乱吃一次袜子、一次骨头，都可能变成第二天的吐和拉。口臭、一边嚼，先看牙。'];
  return ['吃多少、吃得快慢，比某一天吉不吉利更要紧。忽然剩很多，或忽然把不该吃的都吞下去，当天就要看。'];
}

function castNote(birthday: string, adoptedOn: string, upper: string, lower: string, moving: number): { plain: string; term: string } {
  const [year, month, day] = birthday.split('-').map((part) => Number(part));
  const birthSum = year + month + day;
  if (!adoptedOn) {
    const homeSum = month + day;
    return {
      plain: '到家日还空着，补上之后会按进门那天重算。没有记下出生的时辰，这一卦只看到日子。它也不能代替看病，不舒服还是去医院。',
      term: `上卦用生日 ${year}+${month}+${day} = ${birthSum}，除以 8 余 ${remainder(birthSum, 8)}，得${upper}。下卦用月加日 ${month}+${day} = ${homeSum}，得${lower}。动爻在第 ${moving} 爻。`,
    };
  }
  const [homeYear, homeMonth, homeDay] = adoptedOn.split('-').map((part) => Number(part));
  const homeSum = homeYear + homeMonth + homeDay;
  const total = birthSum + homeSum;
  return {
    plain: '没有记下出生的时辰，这一卦只看到日子。它也不能代替看病，不舒服还是去医院。',
    term: `上卦用生日 ${year}+${month}+${day} = ${birthSum}，除以 8 余 ${remainder(birthSum, 8)}，得${upper}。下卦用到家日 ${homeYear}+${homeMonth}+${homeDay} = ${homeSum}，除以 8 余 ${remainder(homeSum, 8)}，得${lower}。${birthSum}+${homeSum} = ${total}，除以 6 余 ${remainder(total, 6)}，动在第 ${moving} 爻。`,
  };
}

function remainder(value: number, base: number): number {
  const rest = value % base;
  return rest === 0 ? base : rest;
}

function dateSum(iso: string): number {
  const [year, month, day] = iso.split('-').map((part) => Number(part));
  return year + month + day;
}

function monthDaySum(iso: string): number {
  const [, month, day] = iso.split('-').map((part) => Number(part));
  return month + day;
}

function trigramFromSum(sum: number) {
  const rest = sum % 8;
  return TRIGRAMS[(rest === 0 ? 8 : rest) - 1];
}

function lineFromSum(sum: number): number {
  const rest = sum % 6;
  return rest === 0 ? 6 : rest;
}

function flip(bits: string, line: number): string {
  const chars = bits.split('');
  const index = line - 1;
  chars[index] = chars[index] === '1' ? '0' : '1';
  return chars.join('');
}

function lineName(bits: string, line: number): string {
  const yang = bits[line - 1] === '1';
  if (line === 1) return yang ? '初九' : '初六';
  if (line === 6) return yang ? '上九' : '上六';
  return `${yang ? '九' : '六'}${['', '', '二', '三', '四', '五'][line]}`;
}

function fullName(hex: Hexagram): string {
  return imageName(trigramName(hex.bits.slice(3)), trigramName(hex.bits.slice(0, 3)), hex.name);
}

function imageName(upper: string, lower: string, name: string): string {
  if (upper === lower) return PURE[upper];
  const upperNature = TRIGRAMS.find((item) => item.name === upper)?.nature ?? '';
  const lowerNature = TRIGRAMS.find((item) => item.name === lower)?.nature ?? '';
  return `${upperNature}${lowerNature}${name === '习坎' ? '坎' : name}`;
}

function trigramName(bits: string): string {
  return TRIGRAMS.find((item) => item.bits === bits)?.name ?? '';
}

export type CoinFace = 'character' | 'back';

export type CoinThrow = {
  faces: [CoinFace, CoinFace, CoinFace];
  value: 6 | 7 | 8 | 9;
};

export type CoinVerdict = 'yes' | 'hold' | 'wait' | 'turn' | 'flip';

export type CoinReading = {
  question: string;
  rolls: CoinThrow[];
  imageName: string;
  changedName: string;
  bits: string;
  changedBits: string;
  moving: number[];
  verdict: CoinVerdict;
  title: string;
  summary: string;
  note: string;
  term: string;
  method: string;
};

export function throwOnce(random: () => number = Math.random): CoinThrow {
  const faces = [0, 1, 2].map(() => (random() < 0.5 ? 'character' : 'back')) as [CoinFace, CoinFace, CoinFace];
  const value = faces.reduce((sum, face) => sum + (face === 'character' ? 2 : 3), 0);
  if (value !== 6 && value !== 7 && value !== 8 && value !== 9) throw new Error('bad coin sum');
  return { faces, value };
}

export function castCoins(question: string, gender: Gender, rolls: CoinThrow[]): CoinReading | null {
  const asked = question.trim();
  if (!asked || rolls.length !== 6) return null;
  const bits = rolls.map((roll) => (roll.value === 7 || roll.value === 9 ? '1' : '0')).join('');
  const moving = rolls.flatMap((roll, index) => (roll.value === 6 || roll.value === 9 ? [index + 1] : []));
  const changedBits = moving.reduce((next, line) => flip(next, line), bits);
  const hex = hexagramByBits(bits);
  const changed = hexagramByBits(changedBits);
  const outcome = coinVerdict(hex, moving);
  return {
    question: asked,
    rolls,
    imageName: fullName(hex),
    changedName: fullName(changed),
    bits,
    changedBits,
    moving,
    verdict: outcome.verdict,
    title: speak(outcome.title, gender),
    summary: speak(outcome.summary, gender),
    note: speak('这一摇只回答这一次，也不能代替看病。', gender),
    term: coinTerm(hex, changed, rolls, moving),
    method: coinMethod(rolls),
  };
}

function coinVerdict(hex: Hexagram, moving: number[]): { verdict: CoinVerdict; title: string; summary: string } {
  if (moving.length === 0) return { verdict: 'hold', title: '先按现在这样', summary: '这件事不会自己变。' };
  if (moving.length === 6) return { verdict: 'flip', title: '会整个翻过来', summary: '眼下这个样子留不住。' };
  const lines = moving.map((line) => hex.lines[line - 1] ?? '');
  const harsh = lines.some((text) => text.includes('凶') && !text.includes('无咎'));
  if (harsh) return { verdict: 'wait', title: '先别', summary: '这件事眼下不顺。' };
  if (lines.some((text) => text.includes('吉'))) return { verdict: 'yes', title: '可以', summary: '这件事往顺的方向走。' };
  if (lines.some((text) => text.includes('无咎') || text.includes('厉') || text.includes('悔'))) {
    return { verdict: 'turn', title: '有波折，能过去', summary: '难是真的，这件事过得去。' };
  }
  if (hex.judgment.includes('凶')) return { verdict: 'wait', title: '先别', summary: '这件事眼下不顺。' };
  if (hex.judgment.includes('吉') || hex.judgment.includes('亨')) return { verdict: 'yes', title: '可以', summary: '这件事往顺的方向走。' };
  return { verdict: 'turn', title: '会变', summary: '这件事还会变。' };
}

function coinTerm(hex: Hexagram, changed: Hexagram, rolls: CoinThrow[], moving: number[]): string {
  if (moving.length === 0) return `${fullName(hex)}。六爻不动。`;
  const names = moving.map((line) => {
    const kind = rolls[line - 1]?.value === 9 ? '老阳' : '老阴';
    return `${lineName(hex.bits, line)}${kind}`;
  }).join('、');
  return `${fullName(hex)}之${fullName(changed)}。${names}。`;
}

function coinMethod(rolls: CoinThrow[]): string {
  const kind: Record<CoinThrow['value'], string> = { 6: '老阴', 7: '少阳', 8: '少阴', 9: '老阳' };
  const detail = rolls.map((roll, index) => {
    const marks = roll.faces.map((face) => (face === 'character' ? '字' : '背')).join('');
    return `第${index + 1}次${marks}=${roll.value}，${kind[roll.value]}`;
  }).join('。');
  return `有字的一面算阴，记 2。背面算阳，记 3。${detail}。`;
}

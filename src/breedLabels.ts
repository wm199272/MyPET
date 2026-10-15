export type BreedHit = { identifier: string; confidence: number };
export type BreedGuess = { breed: string; species: 'cat' | 'dog' };

const rules: { test: RegExp; breed: string; species: 'cat' | 'dog' }[] = [
  { test: /french bulldog/i, breed: '法国斗牛犬', species: 'dog' },
  { test: /bulldog/i, breed: '斗牛犬', species: 'dog' },
  { test: /corgi/i, breed: '柯基', species: 'dog' },
  { test: /golden retriever/i, breed: '金毛', species: 'dog' },
  { test: /labrador/i, breed: '拉布拉多', species: 'dog' },
  { test: /poodle/i, breed: '贵宾', species: 'dog' },
  { test: /pomeranian/i, breed: '博美', species: 'dog' },
  { test: /shiba/i, breed: '柴犬', species: 'dog' },
  { test: /husky/i, breed: '哈士奇', species: 'dog' },
  { test: /beagle/i, breed: '比格', species: 'dog' },
  { test: /chihuahua/i, breed: '吉娃娃', species: 'dog' },
  { test: /yorkshire/i, breed: '约克夏', species: 'dog' },
  { test: /dachshund/i, breed: '腊肠犬', species: 'dog' },
  { test: /samoyed/i, breed: '萨摩耶', species: 'dog' },
  { test: /border collie/i, breed: '边境牧羊犬', species: 'dog' },
  { test: /german shepherd/i, breed: '德国牧羊犬', species: 'dog' },
  { test: /australian shepherd/i, breed: '澳洲牧羊犬', species: 'dog' },
  { test: /shetland/i, breed: '喜乐蒂', species: 'dog' },
  { test: /bichon/i, breed: '比熊', species: 'dog' },
  { test: /maltese/i, breed: '马尔济斯', species: 'dog' },
  { test: /schnauzer/i, breed: '雪纳瑞', species: 'dog' },
  { test: /shih tzu|shihtzu/i, breed: '西施犬', species: 'dog' },
  { test: /cocker spaniel/i, breed: '可卡', species: 'dog' },
  { test: /cavalier/i, breed: '骑士查理王', species: 'dog' },
  { test: /boston terrier/i, breed: '波士顿梗', species: 'dog' },
  { test: /rottweiler/i, breed: '罗威纳', species: 'dog' },
  { test: /doberman/i, breed: '杜宾', species: 'dog' },
  { test: /akita/i, breed: '秋田', species: 'dog' },
  { test: /chow/i, breed: '松狮', species: 'dog' },
  { test: /papillon/i, breed: '蝴蝶犬', species: 'dog' },
  { test: /pug/i, breed: '巴哥', species: 'dog' },
  { test: /boxer/i, breed: '拳师犬', species: 'dog' },
  { test: /great dane/i, breed: '大丹犬', species: 'dog' },
  { test: /british shorthair/i, breed: '英国短毛猫', species: 'cat' },
  { test: /american shorthair/i, breed: '美国短毛猫', species: 'cat' },
  { test: /exotic shorthair/i, breed: '异国短毛猫', species: 'cat' },
  { test: /scottish fold/i, breed: '苏格兰折耳猫', species: 'cat' },
  { test: /maine coon/i, breed: '缅因猫', species: 'cat' },
  { test: /ragdoll/i, breed: '布偶猫', species: 'cat' },
  { test: /siamese/i, breed: '暹罗猫', species: 'cat' },
  { test: /persian/i, breed: '波斯猫', species: 'cat' },
  { test: /sphynx/i, breed: '斯芬克斯猫', species: 'cat' },
  { test: /bengal/i, breed: '孟加拉豹猫', species: 'cat' },
  { test: /russian blue/i, breed: '俄罗斯蓝猫', species: 'cat' },
  { test: /abyssinian/i, breed: '阿比西尼亚猫', species: 'cat' },
  { test: /birman/i, breed: '伯曼猫', species: 'cat' },
  { test: /tabby|tiger cat|egyptian cat/i, breed: '虎斑猫', species: 'cat' },
];

export function breedFromLabels(labels: BreedHit[]): BreedGuess | null {
  const sorted = [...labels].sort((a, b) => b.confidence - a.confidence);
  for (const label of sorted) {
    if (label.confidence < 0.08) continue;
    const name = label.identifier.trim();
    if (/^(cat|dog|domestic cat|domestic dog)$/i.test(name)) continue;
    const rule = rules.find((item) => item.test.test(name));
    if (rule) return { breed: rule.breed, species: rule.species };
  }
  return null;
}

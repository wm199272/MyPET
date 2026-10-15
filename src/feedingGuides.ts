export type FeedPoint = { kg: number; grams: number };

export type FeedGuide = {
  id: string;
  species: 'cat' | 'dog';
  brand: string;
  product: string;
  note: string;
  points: FeedPoint[];
  neuteredPoints?: FeedPoint[];
};

export const feedGuides: FeedGuide[] = [
  {
    id: 'rc-cat-indoor',
    species: 'cat',
    brand: '皇家',
    product: '室内成猫',
    note: '皇家室内成猫包装表，仅干粮、理想体重',
    points: [
      { kg: 3, grams: 45 },
      { kg: 4, grams: 56 },
      { kg: 5, grams: 65 },
      { kg: 6, grams: 74 },
    ],
  },
  {
    id: 'rc-cat-fit',
    species: 'cat',
    brand: '皇家',
    product: '理想体态成猫',
    note: '皇家理想体态成猫包装表，仅干粮',
    points: [
      { kg: 3, grams: 44 },
      { kg: 4, grams: 54 },
      { kg: 5, grams: 63 },
      { kg: 6, grams: 72 },
    ],
  },
  {
    id: 'orijen-cat',
    species: 'cat',
    brand: '渴望',
    product: '原味成猫',
    note: '渴望原味成猫包装表，仅干粮',
    points: [
      { kg: 2, grams: 33 },
      { kg: 3, grams: 43 },
      { kg: 4, grams: 65 },
      { kg: 5, grams: 74 },
      { kg: 6, grams: 86 },
      { kg: 8, grams: 97 },
      { kg: 10, grams: 114 },
    ],
    neuteredPoints: [
      { kg: 2, grams: 26 },
      { kg: 3, grams: 33 },
      { kg: 4, grams: 43 },
      { kg: 5, grams: 52 },
      { kg: 6, grams: 65 },
      { kg: 8, grams: 74 },
      { kg: 10, grams: 86 },
    ],
  },
  {
    id: 'acana-cat-indoor',
    species: 'cat',
    brand: '爱肯拿',
    product: '室内成猫',
    note: '爱肯拿室内成猫包装表，仅干粮',
    points: [
      { kg: 2, grams: 38 },
      { kg: 3, grams: 57 },
      { kg: 4, grams: 71 },
      { kg: 5, grams: 76 },
      { kg: 6, grams: 86 },
      { kg: 7, grams: 100 },
      { kg: 9, grams: 114 },
    ],
    neuteredPoints: [
      { kg: 2, grams: 29 },
      { kg: 3, grams: 38 },
      { kg: 4, grams: 43 },
      { kg: 5, grams: 57 },
      { kg: 6, grams: 76 },
      { kg: 7, grams: 86 },
      { kg: 9, grams: 100 },
    ],
  },
  {
    id: 'rc-dog-mini',
    species: 'dog',
    brand: '皇家',
    product: '小型犬成犬',
    note: '皇家小型犬成犬包装表，仅干粮、中等活动量',
    points: [
      { kg: 2, grams: 47 },
      { kg: 3, grams: 63 },
      { kg: 4, grams: 79 },
      { kg: 5, grams: 93 },
      { kg: 6, grams: 106 },
      { kg: 7, grams: 119 },
      { kg: 8, grams: 132 },
      { kg: 9, grams: 144 },
      { kg: 10, grams: 156 },
    ],
  },
  {
    id: 'rc-dog-medium',
    species: 'dog',
    brand: '皇家',
    product: '中型犬成犬',
    note: '皇家中型犬成犬包装表，仅干粮、中等活动量',
    points: [
      { kg: 11, grams: 173 },
      { kg: 12, grams: 185 },
      { kg: 14, grams: 207 },
      { kg: 16, grams: 229 },
      { kg: 18, grams: 250 },
      { kg: 20, grams: 271 },
      { kg: 22, grams: 291 },
      { kg: 24, grams: 310 },
      { kg: 25, grams: 320 },
    ],
  },
];

export function guidesFor(species: string): FeedGuide[] {
  return feedGuides.filter((guide) => guide.species === species);
}

export function gramsAt(points: FeedPoint[], weightKg: number): { grams: number; clamped: boolean } {
  const sorted = [...points].sort((a, b) => a.kg - b.kg);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (weightKg <= first.kg) return { grams: first.grams, clamped: weightKg < first.kg };
  if (weightKg >= last.kg) return { grams: last.grams, clamped: weightKg > last.kg };
  for (let index = 1; index < sorted.length; index += 1) {
    const right = sorted[index];
    const left = sorted[index - 1];
    if (weightKg <= right.kg) {
      const ratio = (weightKg - left.kg) / (right.kg - left.kg);
      return { grams: Math.round(left.grams + (right.grams - left.grams) * ratio), clamped: false };
    }
  }
  return { grams: last.grams, clamped: true };
}

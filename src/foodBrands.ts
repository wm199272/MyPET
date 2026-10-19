export type FoodBrand = {
  id: string;
  name: string;
  species: ('cat' | 'dog')[];
};

// 只列市面上常见的主粮牌子，不附带用量。用量仍以包装表或自己填写为准。
export const foodBrands: FoodBrand[] = [
  { id: 'royal-canin', name: '皇家', species: ['cat', 'dog'] },
  { id: 'orijen', name: '渴望', species: ['cat', 'dog'] },
  { id: 'acana', name: '爱肯拿', species: ['cat', 'dog'] },
  { id: 'proplan', name: '冠能', species: ['cat', 'dog'] },
  { id: 'hills', name: '希尔思', species: ['cat', 'dog'] },
  { id: 'purich', name: '伯纳天纯', species: ['cat', 'dog'] },
  { id: 'myfoodie', name: '麦富迪', species: ['cat', 'dog'] },
  { id: 'nature-bridge', name: '比瑞吉', species: ['cat', 'dog'] },
  { id: 'netease', name: '网易严选', species: ['cat', 'dog'] },
  { id: 'ziwi', name: '巅峰', species: ['cat', 'dog'] },
  { id: 'nutram', name: '纽顿', species: ['cat', 'dog'] },
  { id: 'instinct', name: '百利', species: ['cat', 'dog'] },
  { id: 'solid-gold', name: '素力高', species: ['cat', 'dog'] },
  { id: 'fish4dogs', name: '海洋之星', species: ['cat', 'dog'] },
  { id: 'farmina', name: '法米纳', species: ['cat', 'dog'] },
  { id: 'nutrience', name: '纽翠斯', species: ['cat', 'dog'] },
  { id: 'go', name: 'Go!', species: ['cat', 'dog'] },
  { id: 'legendsandy', name: '蓝氏', species: ['cat', 'dog'] },
  { id: 'honest', name: '诚实一口', species: ['cat', 'dog'] },
  { id: 'xianlang', name: '鲜朗', species: ['cat', 'dog'] },
  { id: 'partner', name: '帕特', species: ['cat', 'dog'] },
  { id: 'oven-baked', name: '欧恩焙', species: ['cat', 'dog'] },
  { id: 'halo', name: '自然光环', species: ['cat', 'dog'] },
  { id: 'applaws', name: '爱普士', species: ['cat', 'dog'] },
  { id: 'wanpy', name: '顽皮', species: ['cat', 'dog'] },
  { id: 'whiskas', name: '伟嘉', species: ['cat'] },
  { id: 'fancy-feast', name: '珍致', species: ['cat'] },
  { id: 'feringa', name: '弗列加特', species: ['cat'] },
  { id: 'pedigree', name: '宝路', species: ['dog'] },
  { id: 'crazy-dog', name: '疯狂小狗', species: ['dog'] },
  { id: 'care', name: '凯锐思', species: ['dog'] },
  { id: 'bire', name: '比乐', species: ['dog'] },
  { id: 'good-owner', name: '好主人', species: ['dog'] },
];

export function brandsFor(species: string): FoodBrand[] {
  if (species !== 'cat' && species !== 'dog') return foodBrands;
  return foodBrands.filter((item) => item.species.includes(species));
}

import type { Species } from './domain';

export type EarKind = 'erect' | 'floppy' | 'fold' | 'bat';
export type TailKind = 'bob' | 'curl' | 'plume' | 'straight' | 'whip';
export type MaskKind = 'none' | 'points' | 'saddle';

export type Figure = {
  species: 'dog' | 'cat' | 'other';
  title: string;
  length: number;
  height: number;
  chest: number;
  head: number;
  muzzle: number;
  ear: EarKind;
  earSize: number;
  tail: TailKind;
  fluff: number;
  mask: MaskKind;
  stripes: boolean;
  spots: boolean;
  coat: { main: string; dark: string; light: string };
};

const dogBase: Figure = {
  species: 'dog',
  title: '狗',
  length: 1.15,
  height: 0.58,
  chest: 0.42,
  head: 0.32,
  muzzle: 0.2,
  ear: 'floppy',
  earSize: 1,
  tail: 'straight',
  fluff: 0,
  mask: 'none',
  stripes: false,
  spots: false,
  coat: { main: '#C6A37A', dark: '#8A6244', light: '#F4EDE6' },
};

const catBase: Figure = {
  species: 'cat',
  title: '猫',
  length: 0.98,
  height: 0.46,
  chest: 0.32,
  head: 0.28,
  muzzle: 0.08,
  ear: 'erect',
  earSize: 1,
  tail: 'whip',
  fluff: 0.02,
  mask: 'none',
  stripes: false,
  spots: false,
  coat: { main: '#C4A27A', dark: '#6E5138', light: '#F6E7D6' },
};

const otherBase: Figure = {
  species: 'other',
  title: '小动物',
  length: 0.82,
  height: 0.3,
  chest: 0.36,
  head: 0.26,
  muzzle: 0.08,
  ear: 'floppy',
  earSize: 0.75,
  tail: 'bob',
  fluff: 0.08,
  mask: 'none',
  stripes: false,
  spots: false,
  coat: { main: '#C8B4A4', dark: '#8A7368', light: '#F6EFE8' },
};

type Patch = Partial<Omit<Figure, 'coat' | 'title' | 'species'>> & {
  match: string;
  species: 'dog' | 'cat';
  title?: string;
  alias?: boolean;
  coat?: Partial<Figure['coat']>;
};

const presets: Patch[] = [
  { match: '柯基', species: 'dog', length: 1.62, height: 0.22, chest: 0.5, head: 0.28, muzzle: 0.16, ear: 'erect', earSize: 1.35, tail: 'bob', coat: { main: '#C9895A', dark: '#7A4A28', light: '#F7F1E8' } },
  { match: '腊肠', species: 'dog', length: 1.55, height: 0.24, chest: 0.4, head: 0.28, muzzle: 0.2, ear: 'floppy', earSize: 1.2, tail: 'straight', coat: { main: '#8C4E32', dark: '#5C301C', light: '#E7C7A4' } },
  { match: '吉娃娃', species: 'dog', length: 0.72, height: 0.32, chest: 0.26, head: 0.28, muzzle: 0.12, ear: 'erect', earSize: 1.45, tail: 'whip', coat: { main: '#D7B48C', dark: '#A67C52', light: '#F6EFE6' } },
  { match: '博美', species: 'dog', length: 0.7, height: 0.3, chest: 0.34, head: 0.24, muzzle: 0.12, ear: 'erect', earSize: 0.7, tail: 'plume', fluff: 0.22, coat: { main: '#E39A45', dark: '#C47A30', light: '#F8E2C4' } },
  { match: '约克夏', species: 'dog', length: 0.74, height: 0.32, chest: 0.26, head: 0.22, muzzle: 0.12, ear: 'erect', earSize: 0.8, tail: 'straight', fluff: 0.12, coat: { main: '#6E6258', dark: '#3E342E', light: '#C8B49A' } },
  { match: '蝴蝶犬', species: 'dog', length: 0.78, height: 0.36, chest: 0.26, head: 0.24, muzzle: 0.12, ear: 'erect', earSize: 1.6, tail: 'plume', coat: { main: '#F3EFEA', dark: '#C45A4A', light: '#F7F4F0' } },
  { match: '法国斗牛犬', species: 'dog', title: '法国斗牛犬', length: 0.92, height: 0.4, chest: 0.5, head: 0.34, muzzle: 0.04, ear: 'bat', earSize: 1.2, tail: 'bob', coat: { main: '#D7B48A', dark: '#5C4638', light: '#E7D3B8' } },
  { match: '法斗', species: 'dog', alias: true, title: '法国斗牛犬', length: 0.92, height: 0.4, chest: 0.5, head: 0.34, muzzle: 0.04, ear: 'bat', earSize: 1.2, tail: 'bob', coat: { main: '#D7B48A', dark: '#5C4638', light: '#E7D3B8' } },
  { match: '泰迪', species: 'dog', alias: true, title: '贵宾', length: 1.05, height: 0.52, chest: 0.36, head: 0.28, muzzle: 0.18, ear: 'floppy', tail: 'bob', fluff: 0.1, coat: { main: '#E2C2A4', dark: '#C9A484', light: '#F6E6D6' } },
  { match: '边牧', species: 'dog', alias: true, title: '边境牧羊犬', length: 1.18, height: 0.6, chest: 0.4, head: 0.3, muzzle: 0.2, ear: 'erect', earSize: 0.85, tail: 'plume', mask: 'saddle', coat: { main: '#F4F1EC', dark: '#2C2C2C', light: '#F7F5F2' } },
  { match: '斗牛犬', species: 'dog', length: 0.98, height: 0.42, chest: 0.52, head: 0.34, muzzle: 0.05, ear: 'floppy', earSize: 0.7, tail: 'bob', coat: { main: '#C9A07A', dark: '#6B5344', light: '#E6D2BC' } },
  { match: '巴哥', species: 'dog', length: 0.82, height: 0.34, chest: 0.42, head: 0.32, muzzle: 0.03, ear: 'floppy', earSize: 0.55, tail: 'curl', coat: { main: '#E0C4A4', dark: '#3A312C', light: '#F0DCC8' } },
  { match: '波士顿梗', species: 'dog', length: 0.8, height: 0.4, chest: 0.34, head: 0.28, muzzle: 0.05, ear: 'erect', tail: 'bob', coat: { main: '#F4F1EC', dark: '#2C2C2C', light: '#F7F5F2' } },
  { match: '金毛', species: 'dog', length: 1.25, height: 0.64, chest: 0.44, head: 0.32, muzzle: 0.22, ear: 'floppy', earSize: 1.15, tail: 'plume', fluff: 0.06, coat: { main: '#E0B15A', dark: '#C4923E', light: '#F3D7A2' } },
  { match: '拉布拉多', species: 'dog', length: 1.22, height: 0.64, chest: 0.46, head: 0.32, muzzle: 0.2, ear: 'floppy', tail: 'straight', coat: { main: '#D4B06A', dark: '#B4904C', light: '#EAD7B0' } },
  { match: '哈士奇', species: 'dog', length: 1.22, height: 0.64, chest: 0.42, head: 0.32, muzzle: 0.2, ear: 'erect', tail: 'plume', mask: 'saddle', coat: { main: '#E7E6E2', dark: '#7E8B99', light: '#F7F7F6' } },
  { match: '柴犬', species: 'dog', length: 0.98, height: 0.5, chest: 0.4, head: 0.3, muzzle: 0.16, ear: 'erect', tail: 'curl', coat: { main: '#E07B3A', dark: '#F4F0EA', light: '#F7F4EF' } },
  { match: '秋田', species: 'dog', length: 1.2, height: 0.66, chest: 0.48, head: 0.34, muzzle: 0.16, ear: 'erect', tail: 'curl', coat: { main: '#C46A3A', dark: '#F3EFEA', light: '#F6F1EC' } },
  { match: '萨摩耶', species: 'dog', length: 1.15, height: 0.6, chest: 0.46, head: 0.32, muzzle: 0.16, ear: 'erect', tail: 'plume', fluff: 0.16, coat: { main: '#F7F5F2', dark: '#E4E0DA', light: '#FBF9F7' } },
  { match: '松狮', species: 'dog', length: 1.05, height: 0.54, chest: 0.5, head: 0.32, muzzle: 0.08, ear: 'erect', earSize: 0.55, tail: 'curl', fluff: 0.18, coat: { main: '#C45A3A', dark: '#9A4030', light: '#E7C2B0' } },
  { match: '边境牧羊犬', species: 'dog', length: 1.18, height: 0.6, chest: 0.4, head: 0.3, muzzle: 0.2, ear: 'erect', earSize: 0.85, tail: 'plume', mask: 'saddle', coat: { main: '#F4F1EC', dark: '#2C2C2C', light: '#F7F5F2' } },
  { match: '德国牧羊犬', species: 'dog', length: 1.28, height: 0.7, chest: 0.44, head: 0.32, muzzle: 0.24, ear: 'erect', tail: 'straight', mask: 'saddle', coat: { main: '#C48A45', dark: '#2A2A2A', light: '#E2C09A' } },
  { match: '澳洲牧羊犬', species: 'dog', length: 1.12, height: 0.58, chest: 0.42, head: 0.3, muzzle: 0.18, ear: 'floppy', tail: 'bob', coat: { main: '#B7B3AE', dark: '#5C564F', light: '#E6E2DC' } },
  { match: '喜乐蒂', species: 'dog', length: 1.02, height: 0.5, chest: 0.36, head: 0.28, muzzle: 0.18, ear: 'erect', earSize: 0.75, tail: 'plume', fluff: 0.1, coat: { main: '#C9A06A', dark: '#3A3A3A', light: '#F3E6D0' } },
  { match: '罗威纳', species: 'dog', length: 1.25, height: 0.68, chest: 0.5, head: 0.34, muzzle: 0.16, ear: 'floppy', tail: 'bob', coat: { main: '#2B2B2B', dark: '#1A1A1A', light: '#C48A45' } },
  { match: '杜宾', species: 'dog', length: 1.25, height: 0.7, chest: 0.42, head: 0.3, muzzle: 0.18, ear: 'floppy', tail: 'bob', coat: { main: '#2C2C2C', dark: '#1A1A1A', light: '#C48A45' } },
  { match: '拳师犬', species: 'dog', length: 1.12, height: 0.62, chest: 0.46, head: 0.32, muzzle: 0.08, ear: 'floppy', tail: 'bob', coat: { main: '#C48A45', dark: '#3A312C', light: '#E2C4A0' } },
  { match: '大丹犬', species: 'dog', length: 1.45, height: 0.92, chest: 0.48, head: 0.36, muzzle: 0.22, ear: 'floppy', earSize: 1.1, tail: 'whip', coat: { main: '#E0C29A', dark: '#3A312C', light: '#F0DCC4' } },
  { match: '贵宾', species: 'dog', length: 1.05, height: 0.52, chest: 0.36, head: 0.28, muzzle: 0.18, ear: 'floppy', tail: 'bob', fluff: 0.1, coat: { main: '#E2C2A4', dark: '#C9A484', light: '#F6E6D6' } },
  { match: '比熊', species: 'dog', length: 0.78, height: 0.36, chest: 0.34, head: 0.26, muzzle: 0.08, ear: 'floppy', earSize: 0.7, tail: 'plume', fluff: 0.2, coat: { main: '#F7F5F2', dark: '#E7E2DC', light: '#FBF9F7' } },
  { match: '马尔济斯', species: 'dog', length: 0.74, height: 0.32, chest: 0.28, head: 0.24, muzzle: 0.1, ear: 'floppy', tail: 'plume', fluff: 0.16, coat: { main: '#F7F6F4', dark: '#E6E2DC', light: '#FBF9F7' } },
  { match: '西施', species: 'dog', length: 0.76, height: 0.3, chest: 0.32, head: 0.26, muzzle: 0.06, ear: 'floppy', tail: 'plume', fluff: 0.16, coat: { main: '#E7D3B0', dark: '#C4A47A', light: '#F6EADA' } },
  { match: '雪纳瑞', species: 'dog', length: 0.95, height: 0.5, chest: 0.36, head: 0.28, muzzle: 0.16, ear: 'erect', tail: 'straight', coat: { main: '#B7B3AE', dark: '#6E6A64', light: '#E6E2DC' } },
  { match: '可卡', species: 'dog', length: 1.02, height: 0.48, chest: 0.38, head: 0.28, muzzle: 0.16, ear: 'floppy', earSize: 1.35, tail: 'plume', coat: { main: '#C48A45', dark: '#8A5A2C', light: '#E7C8A0' } },
  { match: '骑士查理王', species: 'dog', length: 0.86, height: 0.36, chest: 0.34, head: 0.28, muzzle: 0.08, ear: 'floppy', earSize: 1.25, tail: 'plume', coat: { main: '#F3EFEA', dark: '#8A3A32', light: '#F7F4F0' } },
  { match: '比格', species: 'dog', length: 1.02, height: 0.46, chest: 0.38, head: 0.3, muzzle: 0.18, ear: 'floppy', earSize: 1.2, tail: 'straight', coat: { main: '#F4EFE6', dark: '#6B3A28', light: '#F7F3EC' } },
  { match: '英国短毛猫', species: 'cat', title: '英国短毛猫', length: 0.95, height: 0.42, chest: 0.4, head: 0.32, muzzle: 0.05, ear: 'erect', earSize: 0.7, tail: 'straight', fluff: 0.04, coat: { main: '#8E97A0', dark: '#6E7882', light: '#C5CED6' } },
  { match: '英短', species: 'cat', alias: true, title: '英国短毛猫', length: 0.95, height: 0.42, chest: 0.4, head: 0.32, muzzle: 0.05, ear: 'erect', earSize: 0.7, tail: 'straight', fluff: 0.04, coat: { main: '#8E97A0', dark: '#6E7882', light: '#C5CED6' } },
  { match: '美国短毛猫', species: 'cat', length: 1.02, height: 0.46, chest: 0.34, head: 0.28, muzzle: 0.07, ear: 'erect', tail: 'whip', stripes: true, coat: { main: '#C8B7A4', dark: '#5C5148', light: '#E7DCCE' } },
  { match: '美短', species: 'cat', alias: true, title: '美国短毛猫', length: 1.02, height: 0.46, chest: 0.34, head: 0.28, muzzle: 0.07, ear: 'erect', tail: 'whip', stripes: true, coat: { main: '#C8B7A4', dark: '#5C5148', light: '#E7DCCE' } },
  { match: '异国短毛猫', species: 'cat', length: 0.9, height: 0.4, chest: 0.4, head: 0.32, muzzle: 0.03, ear: 'erect', earSize: 0.65, tail: 'straight', fluff: 0.05, coat: { main: '#E7D3B8', dark: '#C4A484', light: '#F6E6D4' } },
  { match: '苏格兰折耳猫', species: 'cat', length: 0.95, height: 0.4, chest: 0.38, head: 0.32, muzzle: 0.05, ear: 'fold', tail: 'straight', coat: { main: '#C8B7A4', dark: '#8A7B6E', light: '#E7DCCE' } },
  { match: '折耳', species: 'cat', alias: true, title: '苏格兰折耳猫', length: 0.95, height: 0.4, chest: 0.38, head: 0.32, muzzle: 0.05, ear: 'fold', tail: 'straight', coat: { main: '#C8B7A4', dark: '#8A7B6E', light: '#E7DCCE' } },
  { match: '缅因猫', species: 'cat', length: 1.25, height: 0.58, chest: 0.4, head: 0.32, muzzle: 0.1, ear: 'erect', earSize: 1.15, tail: 'plume', fluff: 0.08, coat: { main: '#8A6A48', dark: '#5C4634', light: '#E7D3B8' } },
  { match: '布偶猫', species: 'cat', length: 1.15, height: 0.5, chest: 0.4, head: 0.3, muzzle: 0.08, ear: 'erect', earSize: 0.85, tail: 'plume', fluff: 0.12, mask: 'points', coat: { main: '#F3EFEA', dark: '#7E8CA4', light: '#F7F5F2' } },
  { match: '布偶', species: 'cat', alias: true, title: '布偶猫', length: 1.15, height: 0.5, chest: 0.4, head: 0.3, muzzle: 0.08, ear: 'erect', earSize: 0.85, tail: 'plume', fluff: 0.12, mask: 'points', coat: { main: '#F3EFEA', dark: '#7E8CA4', light: '#F7F5F2' } },
  { match: '暹罗猫', species: 'cat', length: 1.05, height: 0.5, chest: 0.28, head: 0.26, muzzle: 0.08, ear: 'erect', earSize: 1.2, tail: 'whip', mask: 'points', coat: { main: '#F3E6D4', dark: '#6E5348', light: '#F7EFE4' } },
  { match: '暹罗', species: 'cat', alias: true, title: '暹罗猫', length: 1.05, height: 0.5, chest: 0.28, head: 0.26, muzzle: 0.08, ear: 'erect', earSize: 1.2, tail: 'whip', mask: 'points', coat: { main: '#F3E6D4', dark: '#6E5348', light: '#F7EFE4' } },
  { match: '波斯猫', species: 'cat', length: 0.92, height: 0.38, chest: 0.42, head: 0.34, muzzle: 0.03, ear: 'erect', earSize: 0.55, tail: 'plume', fluff: 0.16, coat: { main: '#F3EFEA', dark: '#E4DDD6', light: '#F7F5F2' } },
  { match: '波斯', species: 'cat', alias: true, title: '波斯猫', length: 0.92, height: 0.38, chest: 0.42, head: 0.34, muzzle: 0.03, ear: 'erect', earSize: 0.55, tail: 'plume', fluff: 0.16, coat: { main: '#F3EFEA', dark: '#E4DDD6', light: '#F7F5F2' } },
  { match: '斯芬克斯猫', species: 'cat', length: 0.95, height: 0.46, chest: 0.3, head: 0.28, muzzle: 0.06, ear: 'bat', earSize: 1.35, tail: 'whip', coat: { main: '#E7B7A4', dark: '#C48A78', light: '#F0C8B8' } },
  { match: '斯芬克斯', species: 'cat', alias: true, title: '斯芬克斯猫', length: 0.95, height: 0.46, chest: 0.3, head: 0.28, muzzle: 0.06, ear: 'bat', earSize: 1.35, tail: 'whip', coat: { main: '#E7B7A4', dark: '#C48A78', light: '#F0C8B8' } },
  { match: '孟加拉豹猫', species: 'cat', length: 1.12, height: 0.5, chest: 0.32, head: 0.26, muzzle: 0.08, ear: 'erect', tail: 'whip', spots: true, coat: { main: '#D7B15A', dark: '#5C4630', light: '#E7D7A4' } },
  { match: '孟加拉', species: 'cat', alias: true, title: '孟加拉豹猫', length: 1.12, height: 0.5, chest: 0.32, head: 0.26, muzzle: 0.08, ear: 'erect', tail: 'whip', spots: true, coat: { main: '#D7B15A', dark: '#5C4630', light: '#E7D7A4' } },
  { match: '俄罗斯蓝猫', species: 'cat', length: 1.02, height: 0.48, chest: 0.28, head: 0.26, muzzle: 0.07, ear: 'erect', tail: 'whip', coat: { main: '#8A97A4', dark: '#667480', light: '#C5D0D8' } },
  { match: '阿比西尼亚猫', species: 'cat', length: 1.0, height: 0.48, chest: 0.28, head: 0.26, muzzle: 0.07, ear: 'erect', earSize: 1.15, tail: 'whip', coat: { main: '#C47A45', dark: '#8A5430', light: '#E7C09A' } },
  { match: '阿比西尼亚', species: 'cat', alias: true, title: '阿比西尼亚猫', length: 1.0, height: 0.48, chest: 0.28, head: 0.26, muzzle: 0.07, ear: 'erect', earSize: 1.15, tail: 'whip', coat: { main: '#C47A45', dark: '#8A5430', light: '#E7C09A' } },
  { match: '伯曼猫', species: 'cat', length: 1.05, height: 0.46, chest: 0.36, head: 0.28, muzzle: 0.07, ear: 'erect', tail: 'plume', fluff: 0.08, mask: 'points', coat: { main: '#F3EFEA', dark: '#6E5348', light: '#F7F5F2' } },
  { match: '虎斑猫', species: 'cat', length: 1.0, height: 0.46, chest: 0.32, head: 0.28, muzzle: 0.07, ear: 'erect', tail: 'whip', stripes: true, coat: { main: '#C9956A', dark: '#5C4030', light: '#E7D3B4' } },
  { match: '虎斑', species: 'cat', alias: true, title: '虎斑猫', length: 1.0, height: 0.46, chest: 0.32, head: 0.28, muzzle: 0.07, ear: 'erect', tail: 'whip', stripes: true, coat: { main: '#C9956A', dark: '#5C4030', light: '#E7D3B4' } },
  { match: '橘猫', species: 'cat', length: 1.02, height: 0.44, chest: 0.36, head: 0.3, muzzle: 0.07, ear: 'erect', tail: 'whip', stripes: true, coat: { main: '#E08A3A', dark: '#C45A28', light: '#F6D2A8' } },
  { match: '奶牛猫', species: 'cat', length: 1.0, height: 0.44, chest: 0.34, head: 0.28, muzzle: 0.07, ear: 'erect', tail: 'whip', mask: 'saddle', coat: { main: '#F7F5F2', dark: '#2C2C2C', light: '#FBF9F7' } },
  { match: '狸花猫', species: 'cat', length: 1.08, height: 0.46, chest: 0.32, head: 0.27, muzzle: 0.08, ear: 'erect', tail: 'whip', stripes: true, coat: { main: '#B7A48A', dark: '#4A3A2C', light: '#E4D4BE' } },
  { match: '挪威森林猫', species: 'cat', length: 1.22, height: 0.56, chest: 0.4, head: 0.3, muzzle: 0.1, ear: 'erect', earSize: 1.05, tail: 'plume', fluff: 0.14, coat: { main: '#C4B49A', dark: '#8A7A64', light: '#F0E6D6' } },
  { match: '金吉拉', species: 'cat', length: 0.92, height: 0.38, chest: 0.4, head: 0.32, muzzle: 0.03, ear: 'erect', earSize: 0.6, tail: 'plume', fluff: 0.14, coat: { main: '#F7F5F2', dark: '#D9D3CC', light: '#FBF9F7' } },
  { match: '曼基康', species: 'cat', length: 0.9, height: 0.24, chest: 0.36, head: 0.28, muzzle: 0.06, ear: 'erect', tail: 'straight', coat: { main: '#C9956A', dark: '#8A6244', light: '#F3E6D4' } },
  { match: '英国长毛猫', species: 'cat', length: 0.98, height: 0.42, chest: 0.42, head: 0.32, muzzle: 0.05, ear: 'erect', earSize: 0.65, tail: 'plume', fluff: 0.16, coat: { main: '#8E97A0', dark: '#6E7882', light: '#D5DEE6' } },
  { match: '东方短毛猫', species: 'cat', length: 1.08, height: 0.5, chest: 0.26, head: 0.24, muzzle: 0.08, ear: 'erect', earSize: 1.35, tail: 'whip', coat: { main: '#F3E6D4', dark: '#6E5348', light: '#F7EFE4' } },
  { match: '索马里猫', species: 'cat', length: 1.05, height: 0.48, chest: 0.3, head: 0.26, muzzle: 0.08, ear: 'erect', earSize: 1.1, tail: 'plume', fluff: 0.1, coat: { main: '#C47A45', dark: '#8A5430', light: '#E7C09A' } },
  { match: '德文卷毛猫', species: 'cat', length: 0.92, height: 0.44, chest: 0.28, head: 0.26, muzzle: 0.06, ear: 'bat', earSize: 1.25, tail: 'whip', coat: { main: '#C4B49A', dark: '#8A7A64', light: '#E7DCCE' } },
];

export function breedNames(species: 'cat' | 'dog'): string[] {
  return presets.filter((item) => item.species === species && !item.alias).map((item) => item.title || item.match);
}

export function figureFor(species: Species, breed: string): Figure {
  const text = breed.trim();
  const hit = presets
    .filter((item) => text.includes(item.match))
    .sort((a, b) => b.match.length - a.match.length)[0];
  const base = hit?.species === 'cat' ? catBase : hit?.species === 'dog' ? dogBase : species === 'cat' ? catBase : species === 'other' ? otherBase : dogBase;
  if (!hit) return { ...base, coat: { ...base.coat }, title: text || base.title };
  const { match: _match, title, coat, species: patchSpecies, ...body } = hit;
  return {
    ...base,
    ...body,
    species: patchSpecies,
    title: title || hit.match,
    coat: { ...base.coat, ...coat },
  };
}

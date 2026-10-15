type DewormKind = 'internal' | 'external' | 'both';

export type DewormMedicine = {
  id: string;
  name: string;
  species: ('cat' | 'dog')[];
  type: DewormKind;
  days: number;
  note: string;
};

// 天数是包装上的下次用药间隔，不是药品保质期。
export const dewormMedicines: DewormMedicine[] = [
  { id: 'revolution', name: '大宠爱', species: ['cat', 'dog'], type: 'both', days: 30, note: '每月一次' },
  { id: 'advocate', name: '爱沃克', species: ['cat', 'dog'], type: 'both', days: 30, note: '每月一次' },
  { id: 'frontline', name: '福来恩', species: ['cat', 'dog'], type: 'external', days: 30, note: '每月一次，体外' },
  { id: 'broadline', name: '博来恩', species: ['cat'], type: 'both', days: 30, note: '猫咪每月一次' },
  { id: 'bravecto', name: '贝卫多', species: ['cat', 'dog'], type: 'external', days: 84, note: '12 周一次，体外' },
  { id: 'nexgard', name: '尼可信', species: ['dog'], type: 'external', days: 30, note: '狗狗每月一次，体外' },
  { id: 'spectra', name: '超可信', species: ['dog'], type: 'both', days: 30, note: '狗狗每月一次' },
  { id: 'credelio', name: '可立奥', species: ['cat', 'dog'], type: 'external', days: 30, note: '每月一次，体外' },
  { id: 'drontal', name: '拜宠清', species: ['cat', 'dog'], type: 'internal', days: 90, note: '常见内驱间隔 3 个月' },
];

export function medicinesFor(species: string): DewormMedicine[] {
  if (species !== 'cat' && species !== 'dog') return dewormMedicines;
  return dewormMedicines.filter((item) => item.species.includes(species));
}

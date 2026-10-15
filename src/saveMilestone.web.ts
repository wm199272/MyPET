import { Milestone } from './domain';
import { milestoneSvg } from './milestoneSvg';

export async function saveMilestone(_ref: unknown, petName: string, item: Milestone): Promise<string> {
  const svg = milestoneSvg(petName, item);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('image'));
  });
  image.src = url;
  await loaded;
  const canvas = document.createElement('canvas');
  canvas.width = 750;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.drawImage(image, 0, 0);
  URL.revokeObjectURL(url);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${petName}-里程碑.png`;
  link.click();
  return '已下载图片';
}

import { Milestone, formatFullDate, todayISO } from './domain';

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === '&') return '&amp;';
    if (char === '<') return '&lt;';
    if (char === '>') return '&gt;';
    if (char === '"') return '&quot;';
    return '&apos;';
  });
}

export function milestoneSvg(petName: string, item: Milestone, today = todayISO()): string {
  const detail = item.detail
    ? `<text x="72" y="560" fill="#FBF7F4" font-size="36" font-family="Microsoft YaHei, PingFang SC, sans-serif">${escapeXml(item.detail)}</text>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="750" height="1000" viewBox="0 0 750 1000">
  <rect width="750" height="1000" rx="48" fill="#C9898F"/>
  <text x="72" y="150" fill="#F6E8E8" font-size="28" font-family="Microsoft YaHei, PingFang SC, sans-serif">MyPET</text>
  <text x="72" y="280" fill="#FFFFFF" font-size="64" font-family="Microsoft YaHei, PingFang SC, sans-serif">${escapeXml(petName)}</text>
  <text x="72" y="430" fill="#FFFFFF" font-size="72" font-family="Microsoft YaHei, PingFang SC, sans-serif">${escapeXml(item.title)}</text>
  ${detail}
  <text x="72" y="820" fill="#F6E8E8" font-size="28" font-family="Microsoft YaHei, PingFang SC, sans-serif">${escapeXml(item.basis)}</text>
  <text x="72" y="880" fill="#F6E8E8" font-size="28" font-family="Microsoft YaHei, PingFang SC, sans-serif">${escapeXml(formatFullDate(today))}</text>
</svg>`;
}

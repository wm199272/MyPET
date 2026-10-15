import { ColorValue } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export type LineIconName =
  | 'home'
  | 'records'
  | 'stats'
  | 'person'
  | 'paw'
  | 'cat'
  | 'dog'
  | 'scale'
  | 'bath'
  | 'bug'
  | 'wallet'
  | 'check';

const stroke = {
  fill: 'none' as const,
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function LineIcon({ name, size = 24, color }: { name: LineIconName; size?: number; color: ColorValue }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {paths(name, color)}
    </Svg>
  );
}

function paths(name: LineIconName, color: ColorValue) {
  const pen = { ...stroke, stroke: color };
  if (name === 'home') return <Path {...pen} d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />;
  if (name === 'records') return <Path {...pen} d="M7 3.5h8l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1zM15 3.8V8h4.1M9 12h6M9 16h6" />;
  if (name === 'stats') return <Path {...pen} d="M5 19V10M12 19V5M19 19v-7" />;
  if (name === 'person') return <Path {...pen} d="M12 12a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM5.5 19.2c1.2-2.4 3.5-3.6 6.5-3.6s5.3 1.2 6.5 3.6" />;
  if (name === 'paw') {
    return (
      <>
        <Circle {...pen} cx="8" cy="8" r="1.4" />
        <Circle {...pen} cx="12" cy="6.2" r="1.4" />
        <Circle {...pen} cx="16" cy="8" r="1.4" />
        <Path {...pen} d="M8.2 14.2c.8-1.6 2.2-2.4 3.8-2.4s3 .8 3.8 2.4c.6 1.2.2 3.2-1.2 4.1-1 .6-1.8.4-2.6.4s-1.6.2-2.6-.4c-1.4-.9-1.8-2.9-1.2-4.1z" />
      </>
    );
  }
  if (name === 'cat') {
    return (
      <>
        <Path {...pen} d="M8 9.2 6.2 4.8 11 7.6" />
        <Path {...pen} d="M16 9.2 17.8 4.8 13 7.6" />
        <Path {...pen} d="M7.2 11.2a4.8 4.8 0 0 0 9.6 0 4.6 4.6 0 0 0-9.6 0z" />
        <Path {...pen} d="M4.5 12.5h2.2M17.3 12.5H19.5M9.6 13.2h.01M14.4 13.2h.01M12 14.2v1.1" />
      </>
    );
  }
  if (name === 'dog') {
    return (
      <>
        <Path {...pen} d="M6 9.5c0-2.8 2.2-4 4.2-3.2" />
        <Path {...pen} d="M8.2 10.2a5 5 0 1 0 8.8 2.2" />
        <Path {...pen} d="M15.2 8.6c1.8-.4 3.6.6 4 2.4.3 1.4-.2 2.6-1.2 3.2" />
        <Path {...pen} d="M10.2 13.2h.01M13.4 13.4c.6.5 1 .5 1.6 0" />
      </>
    );
  }
  if (name === 'scale') return <Path {...pen} d="M12 4v16M8 20h8M7 8h10M7 8 5 13a2.2 2.2 0 0 0 4 0zM17 8l-2 5a2.2 2.2 0 0 0 4 0z" />;
  if (name === 'bath') return <Path {...pen} d="M5 12h14v2.5A4.5 4.5 0 0 1 14.5 19h-5A4.5 4.5 0 0 1 5 14.5zM8 12V8.5A2.5 2.5 0 0 1 10.5 6H12M8 6.5c.6-.8 1.6-.8 2.2 0" />;
  if (name === 'bug') return <Path {...pen} d="M9 8.5a3 3 0 0 1 6 0V14a3 3 0 0 1-6 0zM12 5.5V8M5.5 10.5 8 12M18.5 10.5 16 12M6 16.5 8.2 15M18 16.5 15.8 15M9 18.5v2M15 18.5v2" />;
  if (name === 'wallet') return <Path {...pen} d="M4.5 7.5h13A1.5 1.5 0 0 1 19 9v8.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 3 17.5v-8A1.5 1.5 0 0 1 4.5 8zM3 10.5h16M15.5 14h.01" />;
  return <Path {...pen} d="M5 12.5 9.2 17 19 7" />;
}

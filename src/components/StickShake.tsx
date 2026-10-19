import { createElement, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

const SHAKE = [
  { rotate: 0, y: 0, stick: 0 },
  { rotate: -15, y: -6, stick: 8 },
  { rotate: 16, y: -8, stick: -10 },
  { rotate: -13, y: -3, stick: 7 },
  { rotate: 14, y: -7, stick: -8 },
  { rotate: -5, y: -1, stick: 3 },
];

export function StickShake() {
  if (Platform.OS === 'web') return <WebStickShake />;
  return <NativeStickShake />;
}

function WebStickShake() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((value) => value + 1), 90);
    return () => clearInterval(id);
  }, []);

  const pose = SHAKE[frame % SHAKE.length] ?? SHAKE[0];
  return createElement(
    'div',
    {
      'data-testid': 'stick-shake',
      role: 'img',
      'aria-label': '小狗正在摇签筒',
      style: { width: 220, height: 210, display: 'flex', justifyContent: 'center' },
    },
    createElement(
      'div',
      {
        'data-testid': 'stick-puppy',
        style: {
          position: 'relative',
          width: 220,
          height: 200,
          transform: `rotate(${pose.rotate}deg) translateY(${pose.y}px)`,
          transformOrigin: '50% 86%',
        },
      },
      <Puppy />,
      createElement(
        'div',
        {
          'data-testid': 'stick-sticks',
          style: { position: 'absolute', top: 78, left: 75, transform: `translateY(${pose.stick}px)` },
        },
        <Sticks />,
      ),
      createElement('div', { style: { position: 'absolute', top: 108, left: 71 } }, <Tube />),
      createElement('div', { style: { position: 'absolute', top: 128, left: 56 } }, <Paws />),
    ),
  );
}

function NativeStickShake() {
  const tilt = useRef(new Animated.Value(0)).current;
  const hop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shake = Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, { toValue: -1, duration: 90, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(tilt, { toValue: 1, duration: 100, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(tilt, { toValue: -0.75, duration: 80, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(tilt, { toValue: 0.85, duration: 90, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(tilt, { toValue: -0.35, duration: 80, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(tilt, { toValue: 0, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.delay(220),
      ]),
    );
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(hop, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(hop, { toValue: 0, duration: 180, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    );
    shake.start();
    bounce.start();
    return () => {
      shake.stop();
      bounce.stop();
    };
  }, [hop, tilt]);

  const rotate = tilt.interpolate({ inputRange: [-1, 1], outputRange: ['-16deg', '16deg'] });
  const stickY = tilt.interpolate({ inputRange: [-1, 1], outputRange: [7, -9] });
  const bodyY = hop.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });

  return (
    <View accessibilityRole="image" accessibilityLabel="小狗正在摇签筒" testID="stick-shake" style={styles.stage}>
      <Animated.View style={{ transform: [{ translateY: bodyY }, { rotate }] }}>
        <Puppy />
        <Animated.View style={[styles.sticks, { transform: [{ translateY: stickY }] }]}>
          <Sticks />
        </Animated.View>
        <View style={styles.tube}>
          <Tube />
        </View>
        <View style={styles.paws}>
          <Paws />
        </View>
      </Animated.View>
    </View>
  );
}

function Puppy() {
  return (
    <Svg width={220} height={168} viewBox="0 0 220 168">
      <Ellipse cx="54" cy="58" rx="18" ry="26" fill="#E2A878" transform="rotate(-28 54 58)" />
      <Ellipse cx="166" cy="58" rx="18" ry="26" fill="#E2A878" transform="rotate(28 166 58)" />
      <Ellipse cx="54" cy="62" rx="10" ry="16" fill="#F6D3B4" transform="rotate(-28 54 62)" />
      <Ellipse cx="166" cy="62" rx="10" ry="16" fill="#F6D3B4" transform="rotate(28 166 62)" />
      <Circle cx="110" cy="72" r="40" fill="#F3C49A" />
      <Ellipse cx="110" cy="60" rx="14" ry="10" fill="#FFF6EF" />
      <Circle cx="96" cy="70" r="4.2" fill="#3D3335" />
      <Circle cx="124" cy="70" r="4.2" fill="#3D3335" />
      <Circle cx="97.4" cy="68.6" r="1.5" fill="#FFFFFF" />
      <Circle cx="125.4" cy="68.6" r="1.5" fill="#FFFFFF" />
      <Ellipse cx="84" cy="82" rx="8" ry="4.5" fill="#E7A8AE" opacity={0.85} />
      <Ellipse cx="136" cy="82" rx="8" ry="4.5" fill="#E7A8AE" opacity={0.85} />
      <Ellipse cx="110" cy="84" rx="5" ry="3.4" fill="#3D3335" />
      <Path d="M102 92 Q110 99 118 92" stroke="#3D3335" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Ellipse cx="110" cy="132" rx="46" ry="30" fill="#F3C49A" />
      <Ellipse cx="110" cy="138" rx="24" ry="16" fill="#FFF6EF" />
      <Path d="M150 128 Q176 118 168 146" stroke="#E2A878" strokeWidth={8} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function Sticks() {
  return (
    <Svg width={70} height={46} viewBox="0 0 70 46">
      <Rect x="16" y="14" width="6" height="30" rx="3" fill="#F8EFE4" />
      <Rect x="16" y="14" width="6" height="8" rx="2" fill="#B85C57" />
      <Rect x="30" y="4" width="6" height="40" rx="3" fill="#F8EFE4" />
      <Rect x="30" y="4" width="6" height="8" rx="2" fill="#C9898F" />
      <Rect x="44" y="16" width="6" height="28" rx="3" fill="#F8EFE4" />
      <Rect x="44" y="16" width="6" height="8" rx="2" fill="#B85C57" />
    </Svg>
  );
}

function Tube() {
  return (
    <Svg width={78} height={62} viewBox="0 0 78 62">
      <Rect x="12" y="8" width="54" height="50" rx="14" fill="#C9898F" />
      <Ellipse cx="39" cy="10" rx="27" ry="9" fill="#D9A3A8" />
      <Ellipse cx="39" cy="10" rx="18" ry="5" fill="#F6E8E8" />
    </Svg>
  );
}

function Paws() {
  return (
    <Svg width={108} height={28} viewBox="0 0 108 28">
      <Ellipse cx="22" cy="14" rx="16" ry="10" fill="#F3C49A" />
      <Ellipse cx="86" cy="14" rx="16" ry="10" fill="#F3C49A" />
      <Ellipse cx="18" cy="16" rx="3" ry="2" fill="#E2A878" />
      <Ellipse cx="26" cy="16" rx="3" ry="2" fill="#E2A878" />
      <Ellipse cx="82" cy="16" rx="3" ry="2" fill="#E2A878" />
      <Ellipse cx="90" cy="16" rx="3" ry="2" fill="#E2A878" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  stage: { width: 220, height: 210, alignItems: 'center' },
  sticks: { position: 'absolute', top: 78, left: 75 },
  tube: { position: 'absolute', top: 108, left: 71 },
  paws: { position: 'absolute', top: 128, left: 56 },
});

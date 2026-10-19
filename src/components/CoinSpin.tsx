import { createElement, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors, shadow } from '@/src/theme';

export function CoinSpin() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((value) => value + 1), 50);
    return () => clearInterval(id);
  }, []);

  if (Platform.OS === 'web') return <WebCoins tick={tick} />;
  return <NativeCoins tick={tick} />;
}

function WebCoins({ tick }: { tick: number }) {
  return createElement(
    'div',
    {
      'data-testid': 'coin-spin',
      role: 'img',
      'aria-label': '铜钱还在转',
      style: { display: 'flex', justifyContent: 'center', gap: 16, height: 96, alignItems: 'center', marginBottom: 12 },
    },
    [0, 1, 2].map((index) => createElement(WebCoin, { key: index, tick, index })),
  );
}

function WebCoin({ tick, index }: { tick: number; index: number }) {
  const turn = tick * 0.45 + index * 1.2;
  const face = Math.cos(turn) >= 0 ? '字' : '背';
  const slim = Math.max(0.08, Math.abs(Math.cos(turn)));
  return createElement(
    'div',
    {
      'data-testid': 'spinning-coin',
      style: {
        width: 72,
        height: 72,
        borderRadius: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: face === '字' ? colors.primarySoft : colors.sageSoft,
        color: face === '字' ? colors.primary : colors.sage,
        fontSize: 22,
        fontWeight: 600,
        transform: `scaleY(${slim})`,
      },
    },
    face,
  );
}

function NativeCoins({ tick }: { tick: number }) {
  return (
    <View accessibilityRole="image" accessibilityLabel="铜钱还在转" testID="coin-spin" style={styles.row}>
      {[0, 1, 2].map((index) => <NativeCoin key={index} tick={tick} index={index} />)}
    </View>
  );
}

function NativeCoin({ tick, index }: { tick: number; index: number }) {
  const turn = tick * 0.45 + index * 1.2;
  const face = Math.cos(turn) >= 0 ? '字' : '背';
  const scaleY = Math.max(0.08, Math.abs(Math.cos(turn)));

  return (
    <View style={[styles.coin, face === '背' ? styles.back : styles.front, shadow, { transform: [{ scaleY }] }]}>
      <Text style={[styles.face, face === '背' ? styles.faceBack : styles.faceFront]}>{face}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, height: 96, marginBottom: 12 },
  coin: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  front: { backgroundColor: colors.primarySoft },
  back: { backgroundColor: colors.sageSoft },
  face: { fontSize: 22, fontWeight: '600' },
  faceFront: { color: colors.primary },
  faceBack: { color: colors.sage },
});

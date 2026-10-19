import { Stack } from 'expo-router';

import { colors } from '@/src/theme';

export default function FortuneLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        headerBackTitle: '返回',
        contentStyle: { backgroundColor: colors.bg },
      }}>
      <Stack.Screen name="index" options={{ title: '算一卦' }} />
      <Stack.Screen name="result" options={{ title: '这一卦' }} />
      <Stack.Screen name="coins" options={{ title: '摇铜钱' }} />
    </Stack>
  );
}

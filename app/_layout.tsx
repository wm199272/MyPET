import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, shadow } from '@/src/theme';
import { StoreProvider, useArchive } from '@/src/store';
import '@/src/webAlert';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: '600' },
          headerBackTitle: '返回',
          contentStyle: { backgroundColor: colors.bg },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pet/new" options={{ title: '添加宠物' }} />
        <Stack.Screen name="pet/[id]" options={{ title: '宠物档案' }} />
        <Stack.Screen name="record/[type]" options={{ title: '记一笔' }} />
      </Stack>
      <Toast />
    </StoreProvider>
  );
}

function Toast() {
  const { toast } = useArchive();
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={[styles.toastWrap, { top: insets.top + 8 }]}>
      <View style={styles.toast}>
        <Text style={styles.toastText}>{toast}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toastWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 20 },
  toast: {
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  toastText: { color: colors.primary, fontSize: 14 },
});

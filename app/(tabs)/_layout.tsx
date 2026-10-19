import { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';

import { LineIcon, LineIconName } from '@/src/components/LineIcon';
import { RecordTabBar } from '@/src/components/RecordTabBar';
import { colors } from '@/src/theme';

function TabIcon({ name, color }: { name: LineIconName; color: ColorValue }) {
  return <LineIcon name={name} size={22} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <RecordTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.text, fontWeight: '500', fontSize: 18 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
          height: 62,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11 },
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'MyPET',
          tabBarLabel: '首页',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: '记录',
          tabBarIcon: ({ color }) => <TabIcon name="records" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '统计',
          tabBarIcon: ({ color }) => <TabIcon name="stats" color={color} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => <TabIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}

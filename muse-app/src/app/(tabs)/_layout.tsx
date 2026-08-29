import { Tabs } from 'expo-router';

import { TabBar } from '@/components/tab-bar';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="wardrobe" options={{ title: 'Szafa' }} />
      <Tabs.Screen name="outfits" options={{ title: 'Outfity' }} />
      <Tabs.Screen name="inspirations" options={{ title: 'Inspiracje' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

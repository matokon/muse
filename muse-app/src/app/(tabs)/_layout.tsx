import { Redirect, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { TabBar } from '@/components/tab-bar';
import { getToken } from '@/lib/token-storage';

export default function TabsLayout() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    let active = true;

    getToken()
      .then((token) => {
        if (active) setHasToken(Boolean(token));
      })
      .catch((error) => {
        console.error('[tabs] session check', error);
        if (active) setHasToken(false);
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (checkingSession) {
    return <View className="flex-1 bg-surface" />;
  }

  if (!hasToken) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="wardrobe" options={{ title: 'Szafa' }} />
      <Tabs.Screen name="outfits" options={{ title: 'Outfity' }} />
      <Tabs.Screen name="inspirations" options={{ title: 'Inspiracje' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

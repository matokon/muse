import { Tabs } from "expo-router";

export default function TabsLayout() {
   return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="wardrobe" options={{ title: 'Szafa' }} />
      {/* <Tabs.Screen name="outfits" options={{ title: 'Outfity' }} />
      <Tabs.Screen name="looks" options={{ title: 'Looki' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} /> */}
    </Tabs>
  ); 
}
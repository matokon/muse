import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChunkyButton } from '@/components/chunky-button';
import { INK, MUTED } from '@/constants/theme';

const ADD_ROUTE = 'add-item';

const ICONS: Record<string, SFSymbol> = {
  wardrobe: 'hanger',
  outfits: 'square.grid.2x2',
  inspirations: 'sparkles',
  profile: 'person.crop.circle',
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  function renderTab(route: BottomTabBarProps['state']['routes'][number], index: number) {
    const { options } = descriptors[route.key];
    const focused = state.index === index;
    const label = options.title ?? route.name;

    function onPress() {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    }

    return (
      <Pressable key={route.key} className="flex-1 items-center gap-1 py-1" onPress={onPress}>
        <SymbolView
          name={ICONS[route.name]}
          size={24}
          tintColor={focused ? INK : MUTED}
          weight={focused ? 'semibold' : 'regular'}
          style={{ width: 24, height: 24 }}
        />
        <Text className={`text-[12px] ${focused ? 'font-bold text-ink' : 'text-muted'}`}>
          {label}
        </Text>
      </Pressable>
    );
  }

  const tabs = state.routes
    .map((route, index) => ({ route, index }))
    .filter(({ route }) => route.name !== ADD_ROUTE);
  const middle = Math.ceil(tabs.length / 2);

  return (
    <View
      className="flex-row items-center border-t-[2.5px] border-ink bg-lavender px-2 pt-2"
      style={{ paddingBottom: insets.bottom + 6 }}>
      {tabs.slice(0, middle).map(({ route, index }) => renderTab(route, index))}

      <View className="mx-2">
        <ChunkyButton square offset={3} onPress={() => navigation.navigate(ADD_ROUTE)}>
          <SymbolView
            name="plus"
            size={26}
            tintColor={INK}
            weight="semibold"
            style={{ width: 26, height: 26 }}
          />
        </ChunkyButton>
      </View>

      {tabs.slice(middle).map(({ route, index }) => renderTab(route, index))}
    </View>
  );
}

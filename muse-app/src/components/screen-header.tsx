import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { INK } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function HeaderButton({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-ink bg-white">
      {children}
    </Pressable>
  );
}

export function ScreenHeader({ title, subtitle, onBack, right }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-b-[2.5px] border-ink bg-header-pink px-6 pb-5"
      style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center gap-3">
        {onBack && (
          <HeaderButton onPress={onBack}>
            <SymbolView
              name="arrow.backward"
              size={18}
              tintColor={INK}
              weight="semibold"
              style={{ width: 18, height: 18 }}
            />
          </HeaderButton>
        )}

        <View className="min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className="text-[22px] font-extrabold tracking-tight text-ink">
            {title}
          </Text>
          {!!subtitle && (
            <Text numberOfLines={1} className="mt-1 text-[11px] text-plum">
              {subtitle}
            </Text>
          )}
        </View>

        {right}
      </View>
    </View>
  );
}

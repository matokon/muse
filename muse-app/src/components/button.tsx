import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

export function Button({ children, onPress, disabled = false }: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => (pressed || disabled ? { opacity: 0.6 } : null)}>
      <View className="min-h-[54px] items-center justify-center rounded-[15px] border-[2.5px] border-ink bg-white px-5">
        {typeof children === 'string' ? (
          <Text className="text-base font-medium text-ink">{children}</Text>
        ) : (
          children
        )}
      </View>
    </Pressable>
  );
}

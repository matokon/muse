import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const INK = '#14121A';
const RADIUS = 15;

const PRESS_IN_MS = 60;
const PRESS_OUT_MS = 100;

type Variant = 'primary' | 'secondary';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  variant?: Variant;
  offset?: number;
  disabled?: boolean;
};

const faceColor: Record<Variant, string> = {
  primary: '#F2C8DB',
  secondary: '#FFFFFF',
};

export function ChunkyButton({
  children,
  onPress,
  variant = 'primary',
  offset = 4,
  disabled = false,
}: Props) {
  const press = useSharedValue(0);
  const travel = offset - 1;

  const face = useAnimatedStyle(() => ({
    transform: [
      { translateX: press.value * travel },
      { translateY: press.value * travel },
    ],
  }));

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
        press.value = withTiming(1, { duration: PRESS_IN_MS });
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      onPressOut={() => {
        press.value = withTiming(0, { duration: PRESS_OUT_MS });
      }}
      onPress={onPress}
      style={disabled && { opacity: 0.5 }}>
      <View>
        <View
          style={{
            position: 'absolute',
            left: offset,
            top: offset,
            right: -offset,
            bottom: -offset,
            backgroundColor: INK,
            borderRadius: RADIUS,
          }}
        />
        <Animated.View
          style={[
            {
              minHeight: 54,
              borderRadius: RADIUS,
              borderWidth: 2.5,
              borderColor: INK,
              backgroundColor: faceColor[variant],
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 20,
            },
            face,
          ]}>
          {typeof children === 'string' ? (
            <Text className="text-base font-bold text-ink">{children}</Text>
          ) : (
            children
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
}

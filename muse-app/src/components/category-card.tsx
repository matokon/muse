import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { INK } from '@/constants/theme';

const RADIUS = 16;
const PRESS_IN_MS = 60;
const PRESS_OUT_MS = 100;

type Props = {
  children: ReactNode;
  onPress?: () => void;
  offset?: number;
};

export function CategoryCard({ children, onPress, offset = 4 }: Props) {
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
      onPressIn={() => {
        press.value = withTiming(1, { duration: PRESS_IN_MS });
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      onPressOut={() => {
        press.value = withTiming(0, { duration: PRESS_OUT_MS });
      }}
      onPress={onPress}>
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
              borderRadius: RADIUS,
              borderWidth: 2.5,
              borderColor: INK,
              backgroundColor: '#FFFFFF',
            },
            face,
          ]}>
          {children}
        </Animated.View>
      </View>
    </Pressable>
  );
}
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { INK } from '@/constants/theme';

const RADIUS = 15;
const PRESS_IN_MS = 60;
const PRESS_OUT_MS = 100;
const CHECK_COLOR = '#F2C8DB';

type Variant = 'primary' | 'secondary' | 'accent' | 'sadaccent';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  variant?: Variant;
  offset?: number;
  disabled?: boolean;
  selected?: boolean;
};

const faceColor: Record<Variant, string> = {
  primary: '#F2C8DB',
  secondary: '#FFFFFF',
  accent: '#D5C4FA',
  sadaccent: '#B6ABC9',
};

export function PhotoButton({
  children,
  onPress,
  variant = 'secondary',
  offset = 4,
  disabled = false,
  selected = false,
}: Props) {
  const press = useSharedValue(0);
  const travel = offset - 1;

  const face = useAnimatedStyle(() => ({
    transform: [
      { translateX: press.value * travel },
      { translateY: press.value * travel },
    ],
  }));

  if (!selected) {
    return (
      <Pressable onPress={onPress} disabled={disabled} style={disabled && { opacity: 0.5 }}>
        <View
          style={{
            minHeight: 54,
            borderRadius: RADIUS,
            borderWidth: 2.5,
            borderColor: INK,
            backgroundColor: faceColor[variant],
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}>
          {children}
        </View>
      </Pressable>
    );
  }

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
          {children}
        </Animated.View>

        <View
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            height: 24,
            width: 24,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 999,
            borderWidth: 2.5,
            borderColor: INK,
            backgroundColor: CHECK_COLOR,
          }}>
          <Ionicons name="checkmark" size={14} color={INK} />
        </View>
      </View>
    </Pressable>
  );
}
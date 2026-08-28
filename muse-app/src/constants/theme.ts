import type { ViewStyle } from 'react-native';

export const INK = '#14121A';

export function hardShadow(offset = 4): ViewStyle {
  return {
    shadowColor: INK,
    shadowOffset: { width: offset, height: offset },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: offset,
  };
}

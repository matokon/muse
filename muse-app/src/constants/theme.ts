import type { ViewStyle } from 'react-native';

export function hardShadow(offset = 4): ViewStyle {
  return {
    shadowColor: '#141414',
    shadowOffset: { width: offset, height: offset },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: offset,
  };
}

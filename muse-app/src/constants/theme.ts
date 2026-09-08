import type { ViewStyle } from 'react-native';

export const INK = '#14121A';
export const MUTED = '#5B5B6B';
export const PLUM = '#5B4A7E';
export const PINK = '#F9D3E4';
export const ACCENT = '#F7B8D4';

export function hardShadow(offset = 4): ViewStyle {
  return {
    shadowColor: INK,
    shadowOffset: { width: offset, height: offset },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: offset,
  };
}

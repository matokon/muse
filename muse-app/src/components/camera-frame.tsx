import type { ReactNode } from 'react';
import { View } from 'react-native';

import { hardShadow } from '@/constants/theme';

const CORNERS = [
  'left-4 top-4 rounded-tl-lg border-l-[3px] border-t-[3px]',
  'right-4 top-4 rounded-tr-lg border-r-[3px] border-t-[3px]',
  'bottom-4 left-4 rounded-bl-lg border-b-[3px] border-l-[3px]',
  'bottom-4 right-4 rounded-br-lg border-b-[3px] border-r-[3px]',
];

export function CameraFrame({ children }: { children?: ReactNode }) {
  return (
    <View
      className="flex-1 overflow-hidden rounded-3xl border-[2.5px] border-ink bg-lavender"
      style={hardShadow(5)}>
      {children}

      {CORNERS.map((corner) => (
        <View key={corner} className={`absolute h-9 w-9 border-ink ${corner}`} />
      ))}
    </View>
  );
}

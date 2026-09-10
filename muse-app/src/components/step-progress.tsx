import { View } from 'react-native';

type Props = {
  step: number;
  totalSteps: number;
};

export function StepProgress({ step, totalSteps }: Props) {
  return (
    <View className="flex-row gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          className={`h-3.5 flex-1 rounded border-[2px] border-ink ${
            index < step ? 'bg-accent' : 'bg-white'
          }`}
        />
      ))}
    </View>
  );
}

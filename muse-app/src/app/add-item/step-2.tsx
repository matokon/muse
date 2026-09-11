import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/button';
import { CameraFrame } from '@/components/camera-frame';
import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { StepProgress } from '@/components/step-progress';
import { hardShadow } from '@/constants/theme';

type Status = 'idle' | 'cutting' | 'done';

export default function Step2Screen() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status !== 'cutting') return;

    const id = setInterval(() => setProgress((value) => Math.min(value + 4, 100)), 60);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status === 'cutting' && progress >= 100) {
      setStatus('done');
    }
  }, [status, progress]);

  function goBack() {
    return router.canGoBack() ? router.back() : router.replace('/add-item/step-1');
  }

  function cutBackground() {
    if (!uri || status === 'cutting') return;

    setProgress(0);
    setStatus('cutting');
  }

  function goToStep3() {
    if (!uri) return;

    router.push({ pathname: '/add-item/step-3', params: { uri } });
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Wycinam tło" subtitle="krok 2 z 3" onBack={goBack} />

      <View className="flex-1 px-6 pt-5">
        <StepProgress step={2} totalSteps={3} />

        <View className="my-5 flex-1">
          <CameraFrame>
            {uri ? (
              <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" />
            ) : (
              <View className="flex-1 items-center justify-center px-8">
                <Text className="text-center text-[15px] font-semibold text-plum">
                  Brak zdjęcia.
                </Text>
                <Text
                  onPress={() => router.replace('/add-item/step-1')}
                  className="mt-2 text-[14px] underline text-ink">
                  Wróć i zrób zdjęcie
                </Text>
              </View>
            )}
          </CameraFrame>
        </View>

        <View
          className={`mt-5 justify-center rounded-2xl border-[2.5px] border-ink px-4 py-3.5 ${
            status === 'cutting' ? 'bg-lavender' : 'bg-white'
          }`}
          style={[hardShadow(4), { minHeight: 88 }]}>
          {status === 'cutting' ? (
            <View>
              <View className="flex-row items-center justify-between">
                <Text className="text-[15px] font-bold text-ink">segmentacja AI</Text>
                <Text className="text-[15px] font-bold text-ink">{progress}%</Text>
              </View>
              <View className="mt-2.5 h-5 overflow-hidden rounded border-[2px] border-ink bg-white">
                <View className="h-full bg-accent" style={{ width: `${progress}%` }} />
              </View>
            </View>
          ) : (
            <View>
              <Text className="text-[16px] font-extrabold text-ink">
                {status === 'done' ? 'Tło wycięte' : 'Sprawdź, czy ubranie jest całe w kadrze'}
              </Text>
              <Text className="mt-1 text-[14px] leading-5 text-muted">
                {status === 'done'
                  ? 'Nie pasuje? Wytnij ponownie albo idź dalej z tym, co widzisz.'
                  : 'Możesz wyciąć tło albo przejść dalej z oryginalnym zdjęciem.'}
              </Text>
            </View>
          )}
        </View>

        <View className="mt-5 mb-5 gap-4 pb-6">
          <Button onPress={cutBackground} disabled={!uri || status === 'cutting'}>
            {status === 'done' ? 'Wytnij tło ponownie' : 'Wytnij tło'}
          </Button>
          <ChunkyButton disabled={!uri} onPress={goToStep3}>
            <Text className="text-xl font-bold text-ink">Wygląda dobrze</Text>
          </ChunkyButton>
        </View>
      </View>
    </View>
  );
}

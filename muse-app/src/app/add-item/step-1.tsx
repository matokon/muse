import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect } from 'react';
import { AppState, Linking, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { CameraFrame } from '@/components/camera-frame';
import { StepProgress } from '@/components/step-progress';
import { hardShadow } from '@/constants/theme';

export default function AddItemScreen() {
  const [permission, requestPermission, getPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        getPermission();
      }
    });

    return () => sub.remove();
  }, [getPermission]);

  function goBack() {
    return router.canGoBack() ? router.back() : router.replace('/wardrobe');
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Dodaj ubranie"
        subtitle="krok 1 z 3"
        onBack={goBack}
      />

      <View className="flex-1 px-6 pt-5">
        <StepProgress step={1} totalSteps={3} />

        <View className="my-5 flex-1">
          <CameraFrame>
            {permission?.granted ? <CameraView style={{ flex: 1 }} facing="back"/> : (
              <View className="flex-1 items-center justify-center px-8">
                <Text className="text-center text-[15px] font-semibold text-plum">
                  {permission && !permission.canAskAgain
                    ? 'Dostęp do aparatu jest zablokowany.'
                    : 'Potrzebujemy dostępu do aparatu.'}
                </Text>
                {permission && !permission.canAskAgain && (
                  <Text
                    onPress={() => Linking.openSettings()}
                    className="mt-2 text-[14px] underline text-ink">
                    Otwórz ustawienia
                  </Text>
                )}
              </View>
            )}
          </CameraFrame>
        </View>

        <View
          className="mt-5 rounded-2xl border-[2.5px] border-ink bg-white px-4 py-3.5"
          style={hardShadow(4)}>
          <Text className="text-[16px] font-extrabold text-ink">
            Połóż ubranie na płaskiej powierzchni
          </Text>
          <Text className="mt-1 text-[14px] leading-5 text-muted">
            Jasne tło i rozprostowane rękawy — wycięcie wyjdzie czysto.
          </Text>
        </View>

        <View className="mt-5 mb-5 gap-4 pb-6">
          <ChunkyButton>
            <Text className="text-xl font-bold text-ink">Zrób zdjęcie</Text>
          </ChunkyButton>
          <Button>Wybierz z galerii</Button>
        </View>
      </View>
    </View>
  );
}

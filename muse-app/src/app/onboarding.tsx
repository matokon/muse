import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChunkyButton } from '@/components/chunky-button';
import { hardShadow } from '@/constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface">
      <View
        className="border-b-[2.5px] border-ink bg-header-pink px-6 pb-5"
        style={{ paddingTop: insets.top + 8 }}>
        <Text className="text-[34px] font-extrabold tracking-tight text-ink">Muse</Text>
        <Text className="mt-0.5 font-mono text-[13px] text-ink">twoja szafa, cyfrowo</Text>
      </View>

      <View className="flex-1 px-6 pt-6" style={{ paddingBottom: insets.bottom }}>
        <View
          className="min-h-[180px] flex-1 rounded-2xl border-[2.5px] border-ink bg-lavender p-2.5"
          style={hardShadow(5)}>
          <View className="flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-muted">
            <Ionicons name="image-outline" size={34} color="#5B5B6B" />
            <Text className="text-[15px] font-semibold text-muted">Przeciągnij swoje zdjęcie</Text>
            <Text className="text-[13px] text-muted">
              or <Text className="underline">browse files</Text>
            </Text>
          </View>
        </View>

        <Text className="mt-6 text-[26px] font-extrabold leading-8 text-ink">
          Zbuduj szafę raz, ubieraj się w niej codziennie
        </Text>
        <Text className="mt-2.5 text-[15px] leading-[22px] text-muted">
          Dodaj zdjęcia ubrań, składaj outfity i sprawdź, jak leżą na tobie.
        </Text>

        <View className="mt-auto gap-4 pb-3 pt-6">
          <ChunkyButton onPress={() => router.push('/auth')}>Zacznij budować szafę</ChunkyButton>
          <Pressable
            className="items-center rounded-[14px] border-[2.5px] border-ink bg-white py-4 active:translate-x-0.5 active:translate-y-0.5"
            onPress={() => router.push({ pathname: '/auth', params: { mode: 'login' } })}>
            <Text className="text-base font-bold text-ink">Mam już konto</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

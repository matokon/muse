import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';

export default function AddOutfitScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Nowy outfit"
        subtitle={categoryName}
        onBack={() => router.back()}
      />
      <Text className="px-6 pt-6 text-ink">Tu będzie dodawanie outfitu</Text>
    </View>
  );
}
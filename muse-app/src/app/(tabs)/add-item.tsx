import { router } from 'expo-router';
import { View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';

export default function AddItemScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader
        title="Dodaj ubranie"
        subtitle="zdjęcie i opis"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/wardrobe'))}
      />
    </View>
  );
}

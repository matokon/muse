import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image as RNImage,
  Text,
  View,
} from 'react-native';

import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { INK } from '@/constants/theme';
import { getToken } from '@/lib/token-storage';

const HAMSTER = require('../../../assets/images/hamster.png');

type Outfit = {
  id: number;
  name: string;
  category: { id: number; name: string } | null;
  created_at: string;
};

function outfitsLabel(count: number) {
  if (count === 1) return '1 outfit';

  const tens = count % 100;
  const ones = count % 10;
  const few = ones >= 2 && ones <= 4 && (tens < 12 || tens > 14);

  return `${count} ${few ? 'outfity' : 'outfitów'}`;
}

export default function CategoryIdScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();

  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/outfits?category_id=${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.[0] ?? 'Nie udało się wczytać outfitów');
        return;
      }

      setOutfits(data.outfits);
    } catch (err) {
      console.error('[category] load', err);
      setError('Brak połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title={categoryName ?? 'Kategoria'}
        subtitle={outfitsLabel(outfits.length)}
        onBack={() => router.back()}
      />

      <FlatList
        data={outfits}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 12, paddingTop: 16, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View className="mx-6 rounded-2xl border-[2.5px] border-ink bg-white px-4 py-5">
            <Text className="text-[15px] font-bold text-ink">{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View className="items-center pt-10">
              <ActivityIndicator color={INK} />
            </View>
          ) : (
            <View className="items-center px-8 pt-10">
              <Text className="text-center text-[15px] font-semibold text-plum">
                {error ?? 'Nie masz żadnych outfitów w tej kategorii myszeczko.'}
              </Text>
              {!error && (
                <RNImage
                  source={HAMSTER}
                  style={{ width: 20, height: 21, transform: [{ translateY: 3 }] }}
                />
              )}
            </View>
          )
        }
      />

      <View style={{ position: 'absolute', bottom: 44, right: 34 }}>
        <ChunkyButton
          onPress={() =>
            router.push({
              pathname: '/add-outfit/step-1',
              params: { categoryId, categoryName },
            })
          }>
          <Text className="text-base font-bold text-ink">+ Nowy outfit</Text>
        </ChunkyButton>
      </View>
    </View>
  );
}

import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image as RNImage,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { hardShadow, INK } from '@/constants/theme';
import { getToken } from '@/lib/token-storage';

const HAMSTER = require('../../../assets/images/hamster.png');

type Outfit = {
  id: number;
  category: { id: number; name: string } | null;
  created_at: string;
  photo_urls: string[];
  clothing_items_count: number;
};

function imageUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

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
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48 - 12) / 2;

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
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <View
              className="overflow-hidden rounded-2xl border-[2.5px] border-ink bg-white"
              style={hardShadow(4)}>
              <View className="aspect-square bg-lavender">
                {item.photo_urls[0] ? (
                  <Image
                    source={{ uri: imageUrl(item.photo_urls[0]) }}
                    style={{ flex: 1 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <View>
                      <Ionicons name="camera-outline" size={55} color="#5B4A7E" />
                      <View
                        className="absolute -left-2 -right-2 top-[26px]"
                        style={{
                          height: 3,
                          backgroundColor: '#5B4A7E',
                          transform: [{ rotate: '-40deg' }],
                        }}
                      />
                    </View>
                  </View>
                )}
              </View>

              <View className="border-t-[2.5px] border-ink px-3 py-2">
                <Text className="text-[13px] font-semibold text-plum">
                  {item.clothing_items_count}{' '}
                  {item.clothing_items_count === 1 ? 'przedmiot' : 'przedmiotów'}
                </Text>
              </View>
            </View>
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
              pathname: '/add-outfit',
              params: { categoryId, categoryName },
            })
          }>
          <Text className="text-base font-bold text-ink">+ Nowy outfit</Text>
        </ChunkyButton>
      </View>
    </View>
  );
}
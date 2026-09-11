import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { GROUPS, groupOf } from '@/constants/categories';
import { hardShadow, INK } from '@/constants/theme';
import { getToken } from '@/lib/token-storage';

const ACCENT = '#F7B8D4';
const CHIP_ON_INK = '#F7F2FE';

const ALL = 'Wszystko';
const FAVOURITES = 'Ulubione';

type Item = {
  id: number;
  name: string;
  category: string | null;
  note: string | null;
  is_favourite: boolean;
  photo_url: string | null;
};

function itemsLabel(count: number) {
  if (count === 1) return '1 przedmiot';

  const tens = count % 100;
  const ones = count % 10;
  const few = ones >= 2 && ones <= 4 && (tens < 12 || tens > 14);

  return `${count} ${few ? 'przedmioty' : 'przedmiotów'}`;
}

export default function WardrobeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<string>(ALL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/clothing_items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.[0] ?? 'Nie udało się wczytać szafy');
        return;
      }

      setItems(data.items);
    } catch (err) {
      console.error('[wardrobe] load', err);
      setError('Brak połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const visible = items.filter((item) => {
    if (filter === ALL) return true;
    if (filter === FAVOURITES) return item.is_favourite;

    return item.category ? groupOf(item.category)?.label === filter : false;
  });

  const grid: (Item | null)[] = visible.length % 2 === 1 ? [...visible, null] : visible;

  function toggleFavourite(id: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, is_favourite: !item.is_favourite } : item,
      ),
    );
  }

  const filters = (
    <View className="pb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 24, alignItems: 'center' }}>
        {[ALL, FAVOURITES, ...GROUPS.map((group) => group.label)].map((label) => {
          const selected = label === filter;

          return (
            <Pressable
              key={label}
              onPress={() => setFilter(label)}
              style={{
                flexShrink: 0,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderWidth: 2.5,
                borderColor: INK,
                borderRadius: 999,
                backgroundColor: selected ? INK : '#FFFFFF',
              }}>
              {label === FAVOURITES && (
                <SymbolView
                  name="heart.fill"
                  size={13}
                  tintColor={selected ? CHIP_ON_INK : INK}
                  style={{ width: 13, height: 13 }}
                />
              )}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: selected ? CHIP_ON_INK : INK,
                }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Moja szafa" subtitle={itemsLabel(items.length)} />

      <FlatList
        data={grid}
        keyExtractor={(item, index) => (item ? String(item.id) : `spacer-${index}`)}
        numColumns={2}
        columnWrapperStyle={{ gap: 14, paddingHorizontal: 24 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24, gap: 14 }}
        ListHeaderComponent={filters}
        ListEmptyComponent={
          loading ? (
            <View className="items-center pt-10">
              <ActivityIndicator color={INK} />
            </View>
          ) : (
            <View className="items-center px-8 pt-10">
              <Text className="text-center text-[15px] font-semibold text-plum">
                {error ??
                  (filter === ALL
                    ? 'Twoja szafa jest pusta myszeczko. 🥺'
                    : 'Nic nie ma w tym filtrze myszeczko. 😢')}
              </Text>
              {filter === ALL && !error && (
                <Text className="mt-2 text-center font-semibold text-[14px] leading-5 text-muted">
                  Dodaj pierwsze ubranie przyciskiem + na dole.
                </Text>
              )}
            </View>
          )
        }
        renderItem={({ item }) =>
          item === null ? (
            <View className="flex-1" />
          ) : (
            <View
              className="flex-1 overflow-hidden rounded-2xl border-[2.5px] border-ink bg-white"
              style={hardShadow(4)}>
              <View className="aspect-square bg-lavender">
                {item.photo_url && (
                  <Image source={{ uri: item.photo_url }} style={{ flex: 1 }} contentFit="cover" />
                )}

                <Pressable
                  onPress={() => toggleFavourite(item.id)}
                  hitSlop={6}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    height: 34,
                    width: 34,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2.5,
                    borderColor: INK,
                    borderRadius: 10,
                    backgroundColor: item.is_favourite ? ACCENT : '#FFFFFF',
                  }}>
                  <SymbolView
                    name={item.is_favourite ? 'heart.fill' : 'heart'}
                    size={16}
                    tintColor={INK}
                    style={{ width: 16, height: 16 }}
                  />
                </Pressable>
              </View>

              <View className="flex-row items-center gap-2 border-t-[2.5px] border-ink px-3 py-2.5">
                <View className="h-3 w-3 rounded-full border-[2px] border-ink bg-accent" />
                <Text numberOfLines={1} className="flex-1 text-[14px] text-ink">
                  {item.name}
                </Text>
              </View>
            </View>
          )
        }
      />
    </View>
  );
}

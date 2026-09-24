import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { hardShadow, INK } from '@/constants/theme';
import { getToken } from '@/lib/token-storage';
import { Modal } from 'react-native';

type Item = {
  id: number;
  name: string;
  category: string | null;
  is_favourite: boolean;
  created_at: string;
  photo_url: string | null;
};

type PhotoOption = 'none' | 'gallery' | 'camera';

const PHOTO_OPTIONS: {
  key: PhotoOption;
  title: string;
  subtitle: string;
  variant: 'primary' | 'secondary' | 'accent' | 'sadaccent';
}[] = [
  { key: 'none', title: 'Bez zdjęcia', subtitle: 'sam zestaw', variant: 'sadaccent' },
  { key: 'gallery', title: 'Własne zdjęcie', subtitle: 'wybierz z galerii', variant: 'accent' },
  { key: 'camera', title: 'Własne zdjęcie', subtitle: 'zrób foto', variant: 'primary' },
];

export default function AddOutfitScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [photoOption, setPhotoOption] = useState<PhotoOption>('none');

  const visibleItems = selectedType
    ? items.filter((item) => item.category === selectedType)
    : items;

  const usedCategories = [
    ...new Set(
      items
        .map((item) => item.category)
        .filter((c): c is string => !!c),
    ),
  ];

  const saveLabel =
    photoOption === 'camera'
      ? 'Zapisz i zrób zdjęcie'
      : photoOption === 'gallery'
        ? 'Zapisz i wybierz zdjęcie'
        : 'Zapisz outfit';

  const load = useCallback(async () => {
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/clothing_items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.[0] ?? 'Nie udało się wczytać ubrań');
        return;
      }

      setItems(data.items);
    } catch (err) {
      console.error('[add-outfit] load', err);
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

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Nowy outfit"
        subtitle={categoryName}
        onBack={() => router.back()}
      />

      <View
        className="mx-6 mt-5 rounded-3xl border-[2.5px] border-ink bg-lavender"
        style={[hardShadow(5), { height: 235 }]}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 24, paddingTop: 15 }}>
        {usedCategories.map((type) => {
          const selected = type === selectedType;

          return (
            <Pressable
              key={type}
              onPress={() => setSelectedType(type)}
              className="rounded-full border-[2.5px] border-ink px-4 py-2"
              style={{ backgroundColor: selected ? INK : '#FFFFFF' }}>
              <Text
                className="text-[13px] font-bold"
                style={{ color: selected ? '#FFFFFF' : INK }}>
                {type}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 24, paddingTop: 15 }}>
        {visibleItems.map((item) => (
          <Pressable
            key={item.id}
            onLongPress={() => item.photo_url && setPreviewPhoto(item.photo_url)}
            delayLongPress={300}
            className="overflow-hidden rounded-2xl border-[2.5px] border-ink bg-lavender"
            style={{ width: 120, height: 120 }}>
            {item.photo_url && (
              <Image source={{ uri: item.photo_url }} style={{ flex: 1 }} contentFit="cover" />
            )}
          </Pressable>
        ))}
      </ScrollView>

      <Text className="mt-6 px-6 text-[15px] font-semibold text-ink">
        Zdjęcie zestawu
      </Text>

      <View className="mt-3 flex-row gap-3 px-6">
        {PHOTO_OPTIONS.map((opt) => {
          const selected = opt.key === photoOption;

          return (
            <View key={opt.key} className="flex-1">
              <ChunkyButton
                variant={selected ? opt.variant : 'secondary'}
                onPress={() => setPhotoOption(opt.key)}>
                <View className="min-h-[76px] items-center justify-center">
                  <Text className="text-center text-[14px] font-bold text-ink">{opt.title}</Text>
                  <Text className="mt-1 text-center text-[11px] text-muted">{opt.subtitle}</Text>
                </View>
              </ChunkyButton>
            </View>
          );
        })}
      </View>

      <View className="mt-24 px-6">
        <ChunkyButton onPress={() => {}}>
          <Text className="text-lg font-bold text-ink">{saveLabel}</Text>
        </ChunkyButton>
      </View>
      <Modal
        visible={previewPhoto !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPreviewPhoto(null)}>
        <Pressable
          onPress={() => setPreviewPhoto(null)}
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(20, 18, 26, 0.9)' }}>
          {previewPhoto && (
            <View
              className="items-center justify-center overflow-hidden rounded-3xl border-[2.5px] border-white bg-black/40"
              style={{ width: '85%', height: '80%' }}>
              <Image
                source={{ uri: previewPhoto }}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
              />
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}
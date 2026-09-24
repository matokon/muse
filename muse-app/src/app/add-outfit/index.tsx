import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { hardShadow, INK } from '@/constants/theme';
import { getToken } from '@/lib/token-storage';

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
  variant: 'primary' | 'secondary' | 'accent';
}[] = [
  { key: 'none', title: 'Bez zdjęcia', subtitle: 'sam zestaw', variant: 'primary' },
  { key: 'gallery', title: 'Własne zdjęcie', subtitle: 'wybierz z galerii', variant: 'accent' },
  { key: 'camera', title: 'Własne zdjęcie', subtitle: 'zrób foto', variant: 'primary' },
];

const MODAL_TILE = 96;
const PREVIEW_SLOTS = 4;

export default function AddOutfitScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [photoOption, setPhotoOption] = useState<PhotoOption>('none');
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

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

  const over = Math.max(0, selectedItems.length - (PREVIEW_SLOTS - 1));
  const preview = selectedItems.slice(0, PREVIEW_SLOTS - 1);

  const remainder = selectedItems.length % 3;
  const modalItems: (Item | null)[] =
    remainder === 0
      ? selectedItems
      : [...selectedItems, ...Array(3 - remainder).fill(null)];

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

  function toggleItem(item: Item) {
    setSelectedItems((current) => {
      const exists = current.some((i) => i.id === item.id);
      return exists
        ? current.filter((i) => i.id !== item.id)
        : [...current, item];
    });
  }

  function isSelected(item: Item) {
    return selectedItems.some((i) => i.id === item.id);
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Nowy outfit"
        subtitle={categoryName}
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled">

        <View
          className="mx-6 mt-5 rounded-3xl border-[2.5px] border-ink bg-white p-3"
          style={hardShadow(5)}>
          <View className="flex-row gap-3">
            <PreviewSlot item={preview[0]} onRemove={toggleItem} />
            <PreviewSlot item={preview[1]} onRemove={toggleItem} />
          </View>
          <View className="mt-3 flex-row gap-3">
            <PreviewSlot item={preview[2]} onRemove={toggleItem} />
            {over > 0 ? (
              <Pressable
                onPress={() => setShowAll(true)}
                className="aspect-square flex-1 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-accent">
                <Text className="text-[20px] font-bold text-ink">+{over}</Text>
              </Pressable>
            ) : (
              <PreviewSlot item={preview[3]} onRemove={toggleItem} />
            )}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 24, paddingTop: 15 }}>
          <Pressable
            onPress={() => setSelectedType(null)}
            className="rounded-full border-[2.5px] border-ink px-4 py-2"
            style={{ backgroundColor: selectedType === null ? INK : '#FFFFFF' }}>
            <Text
              className="text-[13px] font-bold"
              style={{ color: selectedType === null ? '#FFFFFF' : INK }}>
              Wszystko
            </Text>
          </Pressable>

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
          {visibleItems.map((item) => {
            const selected = isSelected(item);
            return (
              <Pressable
                key={item.id}
                onPress={() => toggleItem(item)}
                onLongPress={() => item.photo_url && setPreviewPhoto(item.photo_url)}
                delayLongPress={300}
                className={`overflow-hidden rounded-2xl border-[2.5px] bg-lavender ${
                  selected ? 'border-accent' : 'border-ink'
                }`}
                style={{ width: 120, height: 120 }}>
                {item.photo_url && (
                  <Image
                    source={{ uri: item.photo_url }}
                    style={{ flex: 1 }}
                    contentFit="cover"
                  />
                )}
              </Pressable>
            );
          })}
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
                    <Text className="text-center text-[14px] font-bold text-ink">
                      {opt.title}
                    </Text>
                    <Text className="mt-1 text-center text-[11px] text-muted">
                      {opt.subtitle}
                    </Text>
                  </View>
                </ChunkyButton>
              </View>
            );
          })}
        </View>

        <View className="mt-8 px-6 pb-6">
          <ChunkyButton onPress={() => {}}>
            <Text className="text-lg font-bold text-ink">{saveLabel}</Text>
          </ChunkyButton>
        </View>
      </ScrollView>

      <Modal
        visible={showAll}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowAll(false)}>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(20, 18, 26, 0.55)' }}>
          <View className="mx-4 mb-4 max-h-[70%] rounded-[28px] border-[2.5px] border-ink bg-surface px-6 pb-10 pt-7">
            <View className="flex-row items-center justify-between">
              <Text className="text-[22px] font-extrabold text-ink">
                Wszystkie przedmioty
              </Text>
              <Pressable
                onPress={() => setShowAll(false)}
                className="h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-ink bg-white">
                <Text
                  className="text-[18px] font-bold text-ink"
                  style={{ lineHeight: 20 }}>
                  ×
                </Text>
              </Pressable>
            </View>

            <FlatList
              data={modalItems}
              keyExtractor={(item, index) =>
                item ? String(item.id) : `spacer-${index}`
              }
              numColumns={3}
              columnWrapperStyle={{
                gap: 10,
                justifyContent: 'center',
              }}
              contentContainerStyle={{ gap: 10, paddingTop: 16 }}
              renderItem={({ item }) =>
                item === null ? (
                  <View style={{ width: MODAL_TILE }} />
                ) : (
                  <Pressable
                    onPress={() => toggleItem(item)}
                    className="overflow-hidden rounded-2xl border-[2.5px] border-ink bg-lavender"
                    style={{ width: MODAL_TILE, height: MODAL_TILE }}>
                    {item.photo_url && (
                      <Image
                        source={{ uri: item.photo_url }}
                        style={{ flex: 1 }}
                        contentFit="cover"
                      />
                    )}
                  </Pressable>
                )
              }
              ListEmptyComponent={
                <Text className="pt-6 text-center text-muted">Brak przedmiotów</Text>
              }
            />
          </View>
        </View>
      </Modal>

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
              className="overflow-hidden rounded-3xl border-[2.5px] border-white"
              style={{ width: '85%', height: '80%' }}>
              <Image
                source={{ uri: previewPhoto }}
                style={{ flex: 1 }}
                contentFit="contain"
              />
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

function PreviewSlot({
  item,
  onRemove,
}: {
  item?: Item;
  onRemove: (item: Item) => void;
}) {
  if (item) {
    return (
      <Pressable
        onPress={() => onRemove(item)}
        className="aspect-square flex-1 overflow-hidden rounded-2xl border-[2.5px] border-ink bg-lavender">
        {item.photo_url && (
          <Image
            source={{ uri: item.photo_url }}
            style={{ flex: 1 }}
            contentFit="cover"
          />
        )}
      </Pressable>
    );
  }

  return (
    <View className="aspect-square flex-1 rounded-2xl border-[2.5px] border-dashed border-ink bg-white" />
  );
}
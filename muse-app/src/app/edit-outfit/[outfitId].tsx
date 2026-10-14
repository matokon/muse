import { File } from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { ChunkyButton } from '@/components/chunky-button';
import { PhotoButton } from '@/components/photo-button';
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

type OutfitPhoto = {
  id: number;
  url: string;
};

type PhotoOption = 'none' | 'gallery' | 'camera';

const PHOTO_OPTIONS: {
  key: PhotoOption;
  title: string;
  variant: 'primary' | 'secondary' | 'accent';
}[] = [
  { key: 'none', title: 'Bez nowych zdjęć', variant: 'primary' },
  { key: 'gallery', title: 'Wybierz zdjęcie z galerii', variant: 'accent' },
  { key: 'camera', title: 'Zrób zdjęcie', variant: 'primary' },
];

const MODAL_TILE = 96;
const PREVIEW_SLOTS = 4;
const MAX_PHOTOS = 5;
const PHOTO_PREVIEW_WIDTH = 88;
const PHOTO_PREVIEW_HEIGHT = 110;

function imageUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function EditOutfitScreen() {
  const { outfitId } = useLocalSearchParams<{ outfitId: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<OutfitPhoto[]>([]);
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [categoryName, setCategoryName] = useState<string | undefined>();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [photoOption, setPhotoOption] = useState<PhotoOption>('none');
  const [showAll, setShowAll] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleItems = selectedType
    ? items.filter((item) => item.category === selectedType)
    : items;

  const usedCategories = [
    ...new Set(
      items
        .map((item) => item.category)
        .filter((category): category is string => !!category),
    ),
  ];

  const over = Math.max(0, selectedItems.length - (PREVIEW_SLOTS - 1));
  const preview = selectedItems.slice(0, PREVIEW_SLOTS - 1);
  const photosCount = existingPhotos.length + newPhotos.length;
  const remainingPhotoSlots = MAX_PHOTOS - photosCount;

  const remainder = selectedItems.length % 3;
  const modalItems: (Item | null)[] =
    remainder === 0
      ? selectedItems
      : [...selectedItems, ...Array(3 - remainder).fill(null)];

  useEffect(() => {
    let active = true;

    async function load() {
      setError(null);

      try {
        const token = await getToken();
        const [outfitRes, itemsRes] = await Promise.all([
          fetch(`${API_URL}/outfits/${outfitId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/clothing_items`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const [outfitData, itemsData] = await Promise.all([
          outfitRes.json(),
          itemsRes.json(),
        ]);

        if (!active) return;

        if (!outfitRes.ok) {
          setError(outfitData.errors?.[0] ?? 'Nie udało się wczytać outfitu');
          return;
        }

        if (!itemsRes.ok) {
          setError(itemsData.errors?.[0] ?? 'Nie udało się wczytać ubrań');
          return;
        }

        const allItems: Item[] = itemsData.items ?? [];
        const selectedIds = new Set<number>(
          (outfitData.clothing_items ?? []).map((item: Item) => item.id),
        );

        setItems(allItems);
        setSelectedItems(allItems.filter((item) => selectedIds.has(item.id)));
        setExistingPhotos(outfitData.outfit.photos ?? []);
        setCategoryName(outfitData.outfit.category?.name);
        setReady(true);
      } catch (err) {
        console.error('[edit-outfit] load', err);
        if (active) setError('Brak połączenia z serwerem');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [outfitId]);

  function toggleItem(item: Item) {
    setSelectedItems((current) => {
      const exists = current.some((selectedItem) => selectedItem.id === item.id);
      return exists
        ? current.filter((selectedItem) => selectedItem.id !== item.id)
        : [...current, item];
    });
  }

  function isSelected(item: Item) {
    return selectedItems.some((selectedItem) => selectedItem.id === item.id);
  }

  function ensurePhotoSlot() {
    if (remainingPhotoSlots > 0) return true;

    setError(`Outfit może mieć maksymalnie ${MAX_PHOTOS} zdjęć`);
    return false;
  }

  async function pickFromGallery() {
    if (!ensurePhotoSlot()) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: remainingPhotoSlots,
    });

    if (!result.canceled) {
      setNewPhotos((current) => [
        ...current,
        ...result.assets.map((asset) => asset.uri),
      ].slice(0, MAX_PHOTOS - existingPhotos.length));
      setPhotoOption('gallery');
      setError(null);
    }
  }

  async function takePhoto() {
    if (!ensurePhotoSlot()) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setNewPhotos((current) => [...current, result.assets[0].uri]);
      setPhotoOption('camera');
      setError(null);
    }
  }

  function handlePhotoOption(key: PhotoOption) {
    if (key === 'none') {
      setNewPhotos([]);
      setPhotoOption('none');
      setError(null);
      return;
    }

    if (key === 'gallery') {
      pickFromGallery();
      return;
    }

    takePhoto();
  }

  function removeNewPhoto(uri: string) {
    setNewPhotos((current) => {
      const next = current.filter((photoUri) => photoUri !== uri);
      if (next.length === 0) setPhotoOption('none');
      return next;
    });
  }

  async function save() {
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const token = await getToken();
      const form = new FormData();

      if (selectedItems.length === 0) {
        form.append('outfit[clothing_item_ids][]', '');
      } else {
        selectedItems.forEach((item) => {
          form.append('outfit[clothing_item_ids][]', String(item.id));
        });
      }

      newPhotos.forEach((uri) => {
        form.append('outfit[photos][]', new File(uri));
      });

      const res = await fetch(`${API_URL}/outfits/${outfitId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.[0] ?? 'Nie udało się zapisać outfitu');
        return;
      }

      router.back();
    } catch (err) {
      console.error('[edit-outfit] save', err);
      setError('Brak połączenia z serwerem');
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-surface">
        <ScreenHeader title="Edytuj outfit" onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={INK} />
        </View>
      </View>
    );
  }

  if (!ready) {
    return (
      <View className="flex-1 bg-surface">
        <ScreenHeader title="Edytuj outfit" onBack={() => router.back()} />
        <Text className="px-8 pt-10 text-center text-[15px] font-semibold text-plum">
          {error ?? 'Nie udało się wczytać outfitu.'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Edytuj outfit"
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
                  <Image source={{ uri: item.photo_url }} style={{ flex: 1 }} contentFit="cover" />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="mt-6 flex-row items-center justify-between px-6">
          <Text className="text-[15px] font-semibold text-ink">Zdjęcie zestawu</Text>
          <Text className="text-[13px] font-semibold text-plum">
            {photosCount}/{MAX_PHOTOS}
          </Text>
        </View>

        <View className="mt-3 flex-row gap-3 px-6">
          {PHOTO_OPTIONS.map((option) => {
            const selected =
              option.key === photoOption &&
              (option.key === 'none' || newPhotos.length > 0);
            return (
              <View key={option.key} className="flex-1">
                <PhotoButton
                  variant={option.variant}
                  selected={selected}
                  onPress={() => handlePhotoOption(option.key)}>
                  <View className="min-h-[76px] items-center justify-center">
                    <Text className="text-center text-[13px] font-bold text-ink">
                      {option.title}
                    </Text>
                  </View>
                </PhotoButton>
              </View>
            );
          })}
        </View>

        {photosCount > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ gap: 10, paddingHorizontal: 24, paddingTop: 16 }}>
            {existingPhotos.map((photo) => (
              <View
                key={photo.id}
                className="overflow-hidden rounded-2xl border-[2.5px] border-ink bg-lavender"
                style={{ width: PHOTO_PREVIEW_WIDTH, height: PHOTO_PREVIEW_HEIGHT }}>
                <Image
                  source={{ uri: imageUrl(photo.url) }}
                  style={{ flex: 1 }}
                  contentFit="cover"
                />
              </View>
            ))}
            {newPhotos.map((uri, index) => (
              <Pressable
                key={`${uri}-${index}`}
                onPress={() => removeNewPhoto(uri)}
                className="overflow-hidden rounded-2xl border-[2.5px] border-accent bg-lavender"
                style={{ width: PHOTO_PREVIEW_WIDTH, height: PHOTO_PREVIEW_HEIGHT }}>
                <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" />
                <View className="absolute right-1.5 top-1.5 h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-white">
                  <Text className="text-[16px] font-bold text-ink" style={{ lineHeight: 18 }}>
                    ×
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {error && (
          <Text className="mt-4 px-6 text-center text-[14px] font-semibold text-plum">
            {error}
          </Text>
        )}

        <View className="mt-8 px-6 pb-6">
          <ChunkyButton onPress={save} disabled={isSaving}>
            <Text className="text-lg font-bold text-ink">
              {isSaving ? 'Zapisuję…' : 'Zapisz zmiany'}
            </Text>
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
              <Text className="text-[22px] font-extrabold text-ink">Wszystkie przedmioty</Text>
              <Pressable
                onPress={() => setShowAll(false)}
                className="h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-ink bg-white">
                <Text className="text-[18px] font-bold text-ink" style={{ lineHeight: 20 }}>
                  ×
                </Text>
              </Pressable>
            </View>

            <FlatList
              data={modalItems}
              keyExtractor={(item, index) => item ? String(item.id) : `spacer-${index}`}
              numColumns={3}
              columnWrapperStyle={{ gap: 10, justifyContent: 'center' }}
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
              <Image source={{ uri: previewPhoto }} style={{ flex: 1 }} contentFit="contain" />
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
          <Image source={{ uri: item.photo_url }} style={{ flex: 1 }} contentFit="cover" />
        )}
      </Pressable>
    );
  }

  return (
    <View className="aspect-square flex-1 rounded-2xl border-[2.5px] border-dashed border-ink bg-white" />
  );
}

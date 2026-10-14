import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { INK } from '@/constants/theme';
import { getToken } from '@/lib/token-storage';

type OutfitPhoto = {
  id: number;
  url: string;
};

type Outfit = {
  id: number;
  created_at: string;
  photos: OutfitPhoto[];
  photo_urls: string[];
  clothing_items_count: number;
};

type ClothingItem = {
  id: number;
  name: string;
  photo_url: string | null;
};

const PREVIEW_SLOTS = 4;
const OUTFIT_PHOTO_WIDTH = 105;
const OUTFIT_PHOTO_HEIGHT = 135;

function imageUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function OutfitScreen() {
  const { outfitId } = useLocalSearchParams<{ outfitId: string }>();
  const insets = useSafeAreaInsets();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<OutfitPhoto | null>(null);
  const [confirmingPhotoDelete, setConfirmingPhotoDelete] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [photoDeleteError, setPhotoDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/outfits/${outfitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.[0] ?? 'Nie udało się wczytać outfitu');
        return;
      }

      setOutfit(data.outfit);
      setClothingItems(data.clothing_items ?? []);
    } catch (err) {
      console.error('[outfit] load', err);
      setError('Brak połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  }, [outfitId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function goBack() {
    return router.canGoBack() ? router.back() : router.replace('/outfits');
  }

  function closePhotoModal() {
    if (deletingPhoto) return;

    if (confirmingPhotoDelete) {
      setConfirmingPhotoDelete(false);
      setPhotoDeleteError(null);
      return;
    }

    setSelectedPhoto(null);
  }

  function askToRemoveSelectedPhoto() {
    setPhotoDeleteError(null);
    setConfirmingPhotoDelete(true);
  }

  async function removeSelectedPhoto() {
    if (!selectedPhoto || deletingPhoto) return;

    setDeletingPhoto(true);
    setPhotoDeleteError(null);

    try {
      const token = await getToken();
      const res = await fetch(
        `${API_URL}/outfits/${outfitId}/photos/${selectedPhoto.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setPhotoDeleteError(data?.errors?.[0] ?? 'Nie udało się usunąć zdjęcia');
        return;
      }

      const deletedPhoto = selectedPhoto;
      setOutfit((current) =>
        current
          ? {
              ...current,
              photos: current.photos.filter((photo) => photo.id !== deletedPhoto.id),
              photo_urls: current.photo_urls.filter((url) => url !== deletedPhoto.url),
            }
          : current,
      );
      setConfirmingPhotoDelete(false);
      setSelectedPhoto(null);
    } catch (err) {
      console.error('[outfit] remove photo', err);
      setPhotoDeleteError('Brak połączenia z serwerem');
    } finally {
      setDeletingPhoto(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-surface">
        <ScreenHeader title="Outfit" onBack={goBack} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={INK} />
        </View>
      </View>
    );
  }

  if (!outfit) {
    return (
      <View className="flex-1 bg-surface">
        <ScreenHeader title="Outfit" onBack={goBack} />
        <View className="items-center px-8 pt-10">
          <Text className="text-center text-[15px] font-semibold text-plum">
            {error ?? 'Nie znaleziono outfitu.'}
          </Text>
        </View>
      </View>
    );
  }

  const clothingItemsLabel = `${outfit.clothing_items_count} ${
    outfit.clothing_items_count === 1 ? 'przedmiot' : 'przedmiotów'
  }`;
  const outfitPhotosCount = outfit.photos.length;
  const outfitPhotosLabel =
    outfitPhotosCount === 1 ? 'Zdjęcie w tym zestawie' : 'Zdjęcia w tym zestawie';

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Outfit"
        subtitle={clothingItemsLabel}
        onBack={goBack}
      />

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-8 pt-5">
        <View className="mx-0 rounded-3xl border-[2.5px] border-ink bg-white p-3">
          <View className="flex-row gap-3">
            <ReadOnlyPreviewSlot item={clothingItems[0]} />
            <ReadOnlyPreviewSlot item={clothingItems[1]} />
          </View>
          <View className="mt-3 flex-row gap-3">
            <ReadOnlyPreviewSlot item={clothingItems[2]} />
            {clothingItems.length > PREVIEW_SLOTS - 1 ? (
              <Pressable
                onPress={() => setShowAll(true)}
                className="aspect-square flex-1 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-accent">
                <Text className="text-[20px] font-bold text-ink">
                  +{clothingItems.length - (PREVIEW_SLOTS - 1)}
                </Text>
              </Pressable>
            ) : (
              <ReadOnlyPreviewSlot item={clothingItems[3]} />
            )}
          </View>
        </View>

        <View className="mb-3 mt-6 flex-row items-center justify-between">
          <Text className="text-[15px] font-extrabold text-ink">{outfitPhotosLabel}</Text>
          <Text className="text-[13px] font-semibold text-plum">{outfitPhotosCount}</Text>
        </View>

        <View>
          {outfitPhotosCount > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}>
              {outfit.photos.map((photo) => (
                <Pressable
                  onPress={() => setSelectedPhoto(photo)}
                  key={photo.id}
                  className="overflow-hidden rounded-2xl border-[2.5px] border-ink bg-lavender"
                  style={{ width: OUTFIT_PHOTO_WIDTH, height: OUTFIT_PHOTO_HEIGHT }}>
                  <Image
                    source={{ uri: imageUrl(photo.url) }}
                    style={{ flex: 1 }}
                    contentFit="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View
              className="items-center justify-center rounded-2xl border-[2.5px] border-dashed border-ink bg-lavender"
              style={{ height: OUTFIT_PHOTO_HEIGHT }}>
              <Text className="text-[13px] font-semibold text-plum">Brak zdjęć</Text>
            </View>
          )}
        </View>

        {!!error && (
          <Text className="mt-4 text-center text-[14px] font-semibold text-plum">{error}</Text>
        )}
      </ScrollView>

      <View className="px-6 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <ChunkyButton onPress={() => router.push(`/edit-outfit/${outfit.id}`)}>
          <Text className="text-xl font-bold text-ink">Edytuj outfit</Text>
        </ChunkyButton>
      </View>

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
                <Text className="text-[18px] font-bold text-ink" style={{ lineHeight: 20 }}>
                  ×
                </Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerClassName="flex-row flex-wrap justify-center gap-3 pt-5"
              style={{ maxHeight: 420 }}>
              {clothingItems.map((item) => (
                <View
                  key={item.id}
                  className="w-[96px] overflow-hidden rounded-2xl border-[2.5px] border-ink bg-lavender">
                  <View className="aspect-square">
                    {item.photo_url && (
                      <Image
                        source={{ uri: imageUrl(item.photo_url) }}
                        style={{ flex: 1 }}
                        contentFit="cover"
                      />
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={selectedPhoto !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closePhotoModal}>
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(20, 18, 26, 0.92)' }}>
          {selectedPhoto && (
            <Pressable
              onPress={closePhotoModal}
              className="overflow-hidden rounded-3xl border-[2.5px] border-white bg-ink"
              style={{ width: '90%', height: '70%' }}>
              <Image
                source={{ uri: imageUrl(selectedPhoto.url) }}
                style={{ flex: 1 }}
                contentFit="contain"
              />
            </Pressable>
          )}
          <View className="mt-6 w-[90%]">
            <Button onPress={askToRemoveSelectedPhoto}>Usuń zdjęcie</Button>
          </View>

          {selectedPhoto && confirmingPhotoDelete && (
            <View
              className="absolute bottom-0 left-0 right-0 top-0 justify-end"
              style={{ backgroundColor: 'rgba(20, 18, 26, 0.55)' }}>
              <View className="w-full rounded-t-[28px] border-[2.5px] border-ink bg-surface px-6 pb-10 pt-7">
                <Text className="text-[22px] font-extrabold tracking-tight text-ink">
                  Usunąć zdjęcie?
                </Text>
                <Text className="mt-3 text-[15px] leading-6 text-muted">
                  Zdjęcie zostanie trwale usunięte z tego outfitu. Tego nie da się cofnąć.
                </Text>
                {!!photoDeleteError && (
                  <Text className="mt-3 text-[14px] font-semibold text-plum">
                    {photoDeleteError}
                  </Text>
                )}

                <View className="mt-7 flex-row gap-4">
                  <View className="flex-1">
                    <Button
                      onPress={() => {
                        setConfirmingPhotoDelete(false);
                        setPhotoDeleteError(null);
                      }}
                      disabled={deletingPhoto}>
                      Zostaw
                    </Button>
                  </View>
                  <View className="flex-1">
                    <ChunkyButton onPress={removeSelectedPhoto} disabled={deletingPhoto}>
                      <Text className="text-base font-bold text-ink">
                        {deletingPhoto ? 'Usuwam…' : 'Usuń'}
                      </Text>
                    </ChunkyButton>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

function ReadOnlyPreviewSlot({ item }: { item?: ClothingItem }) {
  return (
    <View className="aspect-square flex-1 overflow-hidden rounded-2xl border-[2.5px] border-ink bg-lavender">
      {item?.photo_url && (
        <Image
          source={{ uri: imageUrl(item.photo_url) }}
          style={{ flex: 1 }}
          contentFit="cover"
        />
      )}
    </View>
  );
}

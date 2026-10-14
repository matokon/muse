import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { hardShadow, INK } from '@/constants/theme';
import { getToken } from '@/lib/token-storage';

type Inspiration = {
  id: number;
  caption: string;
  image_url: string;
  created_at: string;
};

function inspirationsLabel(count: number) {
  if (count === 1) return '1 inspiracja';

  const tens = count % 100;
  const ones = count % 10;
  const few = ones >= 2 && ones <= 4 && (tens < 12 || tens > 14);

  return `${count} ${few ? 'inspiracje' : 'inspiracji'}`;
}

function imageUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function InspirationsScreen() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInspiration, setSelectedInspiration] = useState<Inspiration | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/inspirations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.[0] ?? 'Nie udało się wczytać inspiracji');
        return;
      }

      setInspirations(data.inspirations ?? []);
    } catch (err) {
      console.error('[inspirations] load', err);
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

  function openInspiration(inspiration: Inspiration) {
    setDeleteError(null);
    setSelectedInspiration(inspiration);
  }

  function closeInspiration() {
    if (deleting) return;

    if (confirmingDelete) {
      setConfirmingDelete(false);
      setDeleteError(null);
      return;
    }

    setSelectedInspiration(null);
    setDeleteError(null);
  }

  async function removeInspiration() {
    if (!selectedInspiration || deleting) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/inspirations/${selectedInspiration.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setDeleteError(data?.errors?.[0] ?? 'Nie udało się usunąć inspiracji');
        return;
      }

      const deletedId = selectedInspiration.id;
      setInspirations((current) => current.filter((item) => item.id !== deletedId));
      setConfirmingDelete(false);
      setSelectedInspiration(null);
    } catch (err) {
      console.error('[inspirations] remove', err);
      setDeleteError('Brak połączenia z serwerem');
    } finally {
      setDeleting(false);
    }
  }

  const grid: (Inspiration | null)[] =
    inspirations.length % 2 === 1 ? [...inspirations, null] : inspirations;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Inspiracje"
        subtitle={inspirationsLabel(inspirations.length)}
      />

      <FlatList
        data={grid}
        keyExtractor={(item, index) => item ? String(item.id) : `spacer-${index}`}
        numColumns={2}
        columnWrapperStyle={{ gap: 14, paddingHorizontal: 24 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 120, gap: 14 }}
        ListEmptyComponent={
          loading ? (
            <View className="items-center pt-10">
              <ActivityIndicator color={INK} />
            </View>
          ) : (
            <View className="items-center px-8 pt-10">
              <Text className="text-center text-[15px] font-semibold text-plum">
                {error ?? 'Nie masz jeszcze żadnych inspiracji.'}
              </Text>
              {!error && (
                <Text className="mt-2 text-center text-[14px] font-semibold leading-5 text-muted">
                  Dodaj pierwszą inspirację przyciskiem poniżej.
                </Text>
              )}
            </View>
          )
        }
        renderItem={({ item }) =>
          item === null ? (
            <View className="flex-1" />
          ) : (
            <Pressable
              onPress={() => openInspiration(item)}
              className="flex-1 overflow-hidden rounded-2xl border-[2.5px] border-ink bg-white"
              style={hardShadow(4)}>
              <View className="aspect-square bg-lavender">
                <Image
                  source={{ uri: imageUrl(item.image_url) }}
                  style={{ flex: 1 }}
                  contentFit="cover"
                />
              </View>
              <View className="min-h-[48px] flex-row items-center gap-2 border-t-[2.5px] border-ink px-3 py-2.5">
                <View className="h-3 w-3 rounded-full border-[2px] border-ink bg-accent" />
                <Text numberOfLines={2} className="flex-1 text-[14px] text-ink">
                  {item.caption}
                </Text>
              </View>
            </Pressable>
          )
        }
      />

      <View style={{ position: 'absolute', bottom: 24, right: 24 }}>
        <ChunkyButton onPress={() => router.push('/add-inspiration')}>
          <Text className="text-base font-bold text-ink">+ Dodaj inspirację</Text>
        </ChunkyButton>
      </View>

      <Modal
        visible={selectedInspiration !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeInspiration}>
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(20, 18, 26, 0.92)' }}>
          {selectedInspiration && (
            <Pressable
              onPress={closeInspiration}
              className="overflow-hidden rounded-3xl border-[2.5px] border-white bg-ink"
              style={{ width: '90%', height: '70%' }}>
              <Image
                source={{ uri: imageUrl(selectedInspiration.image_url) }}
                style={{ flex: 1 }}
                contentFit="contain"
              />
            </Pressable>
          )}
          <View className="mt-6 w-[90%]">
            <Button onPress={() => setConfirmingDelete(true)} disabled={deleting}>
              Usuń inspirację
            </Button>
          </View>

          {selectedInspiration && confirmingDelete && (
            <View
              className="absolute bottom-0 left-0 right-0 top-0 justify-end"
              style={{ backgroundColor: 'rgba(20, 18, 26, 0.55)' }}>
              <View className="w-full rounded-t-[28px] border-[2.5px] border-ink bg-surface px-6 pb-10 pt-7">
                <Text className="text-[22px] font-extrabold tracking-tight text-ink">
                  Usunąć inspirację?
                </Text>
                <Text className="mt-3 text-[15px] leading-6 text-muted">
                  Zdjęcie i podpis zostaną trwale usunięte. Tego nie da się cofnąć.
                </Text>
                {!!deleteError && (
                  <Text className="mt-3 text-[14px] font-semibold text-plum">
                    {deleteError}
                  </Text>
                )}

                <View className="mt-7 flex-row gap-4">
                  <View className="flex-1">
                    <Button
                      onPress={() => {
                        setConfirmingDelete(false);
                        setDeleteError(null);
                      }}
                      disabled={deleting}>
                      Zostaw
                    </Button>
                  </View>
                  <View className="flex-1">
                    <ChunkyButton onPress={removeInspiration} disabled={deleting}>
                      <Text className="text-base font-bold text-ink">
                        {deleting ? 'Usuwam…' : 'Usuń'}
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

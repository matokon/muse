import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image as RNImage,
  Modal,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { unusedInOutfits } from '@/constants/categories';
import { hardShadow, INK } from '@/constants/theme';
import { getToken } from '@/lib/token-storage';

const MONTHS = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
];

const HAMSTER = require('../../../../assets/images/hamster.png');

type Item = {
  id: number;
  name: string;
  category: string | null;
  is_favourite: boolean;
  created_at: string;
  photo_url: string | null;
};

function subtitleFor(item: Item) {
  const date = new Date(item.created_at);
  const added = `dodano ${date.getDate()} ${MONTHS[date.getMonth()]}`;

  return item.category ? `${item.category.toLowerCase()} · ${added}` : added;
}

export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/clothing_items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.[0] ?? 'Nie udało się wczytać przedmiotu');
        return;
      }

      setItem(data.item);
    } catch (err) {
      console.error('[item] load', err);
      setError('Brak połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function goBack() {
    return router.canGoBack() ? router.back() : router.replace('/wardrobe');
  }

  async function remove() {
    setDeleting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/clothing_items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setError('Nie udało się usunąć przedmiotu');
        return;
      }

      router.replace('/wardrobe');
    } catch (err) {
      console.error('[item] remove', err);
      setError('Brak połączenia z serwerem');
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }


  if (loading) {
    return (
      <View className="flex-1 bg-surface">
        <ScreenHeader title="Przedmiot" onBack={goBack} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={INK} />
        </View>
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 bg-surface">
        <ScreenHeader title="Przedmiot" onBack={goBack} />
        <View className="items-center px-8 pt-10">
          <Text className="text-center text-[15px] font-semibold text-plum">
            {error ?? 'Nie znaleziono przedmiotu.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title={item.name} subtitle={subtitleFor(item)} onBack={goBack} />

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-6 pt-5">
        <View
          className="aspect-square overflow-hidden rounded-3xl border-[2.5px] border-ink bg-lavender"
          style={hardShadow(5)}>
          {item.photo_url && (
            <Image source={{ uri: item.photo_url }} style={{ flex: 1 }} contentFit="cover" />
          )}
        </View>


        <View
          className="mt-5 rounded-2xl border-[2.5px] border-ink bg-white px-4 py-3.5"
          style={hardShadow(4)}>
          <Text className="text-[16px] font-extrabold leading-6 text-ink">
            {unusedInOutfits(item.category)}{' '}
            <RNImage
              source={HAMSTER}
              style={{ width: 20, height: 21, transform: [{ translateY: 3 }] }}
            />
          </Text>
          <Text className="mt-1 text-[14px] leading-5 text-muted">
            Gdy dodasz outfity, pojawią się tutaj.
          </Text>
        </View>

        {!!error && (
          <Text className="mt-4 text-center text-[14px] font-semibold text-plum">{error}</Text>
        )}
      </ScrollView>

      <View className="gap-4 px-6 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <ChunkyButton onPress={() => router.push(`/item/${item.id}/edit`)}>
          <Text className="text-xl font-bold text-ink">Edytuj przedmiot</Text>
        </ChunkyButton>
        <Button onPress={() => setConfirming(true)} disabled={deleting}>
          Usuń przedmiot
        </Button>
      </View>

      <Modal
        visible={confirming}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setConfirming(false)}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(20, 18, 26, 0.55)' }}>
          <View className="rounded-t-[28px] border-t-[2.5px] border-ink bg-surface px-6 pb-10 pt-7">
            <Text className="text-[22px] font-extrabold tracking-tight text-ink">
              Usunąć z szafy?
            </Text>
            <Text className="mt-3 text-[15px] leading-6 text-muted">
              Przedmiot zniknie też z outfitów, w których go użyłaś. Tego nie da się cofnąć.
            </Text>

            <View className="mt-7 flex-row gap-4">
              <View className="flex-1">
                <Button onPress={() => setConfirming(false)} disabled={deleting}>
                  Zostaw
                </Button>
              </View>
              <View className="flex-1">
                <ChunkyButton onPress={remove} disabled={deleting}>
                  <Text className="text-base font-bold text-ink">
                    {deleting ? 'Usuwam…' : 'Usuń'}
                  </Text>
                </ChunkyButton>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

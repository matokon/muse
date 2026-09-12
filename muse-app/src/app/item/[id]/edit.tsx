import { File } from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { GROUPS, type Group, groupOf } from '@/constants/categories';
import { hardShadow, INK } from '@/constants/theme';
import { getToken } from '@/lib/token-storage';

const CHIP_ON_INK = '#F7F2FE';
const ACCENT = '#F7B8D4';

type Item = {
  id: number;
  name: string;
  category: string | null;
  is_favourite: boolean;
  photo_url: string | null;
};

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [group, setGroup] = useState<Group>(GROUPS[0]);
  const [type, setType] = useState<string>(GROUPS[0].types[0]);
  const [favourite, setFavourite] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/clothing_items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors ?? ['Nie udało się wczytać przedmiotu']);
        return;
      }

      const item: Item = data.item;
      setName(item.name);
      setFavourite(item.is_favourite);
      setPhotoUrl(item.photo_url);

      if (item.category) {
        setType(item.category);
        setGroup(groupOf(item.category) ?? GROUPS[0]);
      }
    } catch (error) {
      console.error('[item/edit] load', error);
      setErrors(['Brak połączenia z serwerem']);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function selectGroup(item: Group) {
    setGroup(item);
    setType(item.types[0]);
  }

  function goBack() {
    return router.canGoBack() ? router.back() : router.replace(`/item/${id}`);
  }

  async function pickPhoto() {
    if (saving) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      const picked = result.canceled ? undefined : result.assets[0];

      if (picked?.uri) setNewPhotoUri(picked.uri);
    } catch (error) {
      console.warn('[item/edit] launchImageLibraryAsync failed', error);
    }
  }

  async function save() {
    if (!name.trim() || saving) return;

    setSaving(true);
    setErrors([]);
    try {
      const token = await getToken();

      let body: FormData | string;
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

      if (newPhotoUri) {
        const form = new FormData();
        form.append('name', name.trim());
        form.append('category', type);
        form.append('is_favourite', String(favourite));
        form.append('photo', new File(newPhotoUri));
        body = form;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ name: name.trim(), category: type, is_favourite: favourite });
      }

      const res = await fetch(`${API_URL}/clothing_items/${id}`, { method: 'PATCH', headers, body });
      const data = await res.json();

      if (!res.ok) {
        console.warn('[item/edit] blad z API', res.status, data);
        setErrors(data.errors ?? ['Nie udało się zapisać zmian']);
        return;
      }

      goBack();
    } catch (error) {
      console.error('[item/edit] save', error);
      setErrors(['Brak połączenia z serwerem']);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-surface">
        <ScreenHeader title="Edytuj przedmiot" onBack={goBack} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={INK} />
        </View>
      </View>
    );
  }

  const preview = newPhotoUri ?? photoUrl;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Edytuj przedmiot" onBack={goBack} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8 pt-5"
        keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center gap-4 px-6">
          <View
            className="h-[92px] w-[92px] overflow-hidden rounded-2xl border-[2.5px] border-ink bg-lavender"
            style={hardShadow(4)}>
            {preview && <Image source={{ uri: preview }} style={{ flex: 1 }} contentFit="cover" />}
          </View>

          <View className="flex-1">
            <Button onPress={pickPhoto} disabled={saving}>
              {newPhotoUri ? 'Zmieniono zdjęcie' : 'Zmień zdjęcie'}
            </Button>
          </View>
        </View>

        <Text className="mt-5 px-6 text-[15px] font-semibold text-ink">Nazwa</Text>
        <TextInput
          className="mx-6 mt-2 rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-4 text-[16px] text-ink"
          placeholder="np. lniana koszula oversize"
          placeholderTextColor="#9A9AAA"
          value={name}
          onChangeText={setName}
          autoCapitalize="sentences"
        />

        <Text className="mt-5 px-6 text-[15px] font-semibold text-ink">Kategoria</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2"
          contentContainerStyle={{ gap: 8, paddingHorizontal: 24, alignItems: 'center' }}>
          {GROUPS.map((item) => {
            const selected = item === group;

            return (
              <Pressable
                key={item.label}
                onPress={() => selectGroup(item)}
                style={{
                  flexShrink: 0,
                  paddingVertical: 9,
                  paddingHorizontal: 13,
                  borderWidth: 2.5,
                  borderColor: INK,
                  borderRadius: 999,
                  backgroundColor: selected ? INK : '#FFFFFF',
                }}>
                <Text
                  style={{ fontSize: 11, fontWeight: '700', color: selected ? CHIP_ON_INK : INK }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2.5"
          contentContainerStyle={{ gap: 8, paddingHorizontal: 24, alignItems: 'center' }}>
          {group.types.map((item) => {
            const selected = item === type;

            return (
              <Pressable
                key={item}
                onPress={() => setType(item)}
                style={{
                  flexShrink: 0,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 2.5,
                  borderColor: INK,
                  borderRadius: 999,
                  backgroundColor: selected ? ACCENT : '#FFFFFF',
                }}>
                <Text style={{ fontSize: 11, fontWeight: '500', color: INK }}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View
          className="mx-6 mt-6 flex-row items-center justify-between rounded-2xl border-[2.5px] border-ink bg-lavender px-4 py-4"
          style={hardShadow(4)}>
          <Text className="text-[16px] text-ink">Ulubiony przedmiot</Text>

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: favourite }}
            hitSlop={8}
            onPress={() => setFavourite((value) => !value)}
            className={`h-9 w-16 justify-center rounded-full border-[2.5px] border-ink px-1 ${
              favourite ? 'items-end bg-accent' : 'items-start bg-white'
            }`}>
            <View className="h-6 w-6 rounded-full bg-ink" />
          </Pressable>
        </View>

        {errors.length > 0 && (
          <View
            className="mx-6 mt-5 rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-3"
            style={hardShadow(4)}>
            {errors.map((message) => (
              <Text key={message} className="text-[14px] leading-5 text-ink">
                {message}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      <View className="gap-4 px-6 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <ChunkyButton onPress={save} disabled={!name.trim() || saving}>
          <Text className="text-xl font-bold text-ink">
            {saving ? 'Zapisuję…' : 'Zapisz zmiany'}
          </Text>
        </ChunkyButton>
        <Button onPress={goBack} disabled={saving}>
          Anuluj
        </Button>
      </View>
    </View>
  );
}

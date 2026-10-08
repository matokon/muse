import { File } from 'expo-file-system';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { GROUPS, type Group } from '@/constants/categories';
import { hardShadow } from '@/constants/theme';
import { getToken } from '@/lib/token-storage';

const INK = '#14121A';
const CHIP_ON_INK = '#F7F2FE';
const ACCENT = '#F7B8D4';
const PLACEHOLDER = '#5B4A7E';

export default function AddItemStep3Screen() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [group, setGroup] = useState<Group>(GROUPS[0]);
  const [type, setType] = useState<string>(GROUPS[0].types[0]);
  const [favourite, setFavourite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function selectGroup(item: Group) {
    setGroup(item);
    setType(item.types[0]);
  }

  async function save() {
    if (!uri || !name.trim() || isSaving) return;

    setIsSaving(true);
    setErrors([]);
    try {
      const form = new FormData();
      form.append('name', name.trim());
      form.append('category', type);
      form.append('is_favourite', String(favourite));
      form.append('photo', new File(uri));

      const token = await getToken();
      const res = await fetch(`${API_URL}/clothing_items`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        console.warn('[add-item] blad z API', res.status, data);
        setErrors(data.errors ?? ['Nie udało się zapisać przedmiotu']);
        return;
      }

      router.replace('/wardrobe');
    } catch (error) {
      console.error('[add-item] save', error);
      setErrors(['Brak połączenia z serwerem']);
    } finally {
      setIsSaving(false);
    }
  }

  function goBack() {
    return router.canGoBack() ? router.back() : router.replace('/add-item/step-1');
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Opisz przedmiot" subtitle="krok 3 z 3" onBack={goBack} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8 pt-5"
        keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center gap-4 px-6">
          <View
            className="h-[110px] w-[110px] overflow-hidden rounded-2xl border-[2.5px] border-ink bg-lavender"
            style={hardShadow(4)}>
            {uri && <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" />}
          </View>

          <View className="min-w-0 flex-1">
            <Text className="font-mono text-[14px] text-plum">tło usunięte</Text>
            <Text className="mt-1 font-mono text-[14px] text-plum">gotowe do zapisu</Text>
          </View>
        </View>

        <Text className="mt-6 px-6 text-[15px] font-semibold text-ink">Nazwa</Text>
        <TextInput
          className="mx-6 mt-2 rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-4 text-[16px] text-ink"
          placeholder="np. czarny top"
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
          contentContainerStyle={{ gap: 8, paddingHorizontal: 24 }}>
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
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: selected ? CHIP_ON_INK : INK,
                  }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="mt-2.5 flex-row flex-wrap gap-2 px-6">
          {group.types.map((item) => {
            const selected = item === type;

            return (
              <Pressable
                key={item}
                onPress={() => setType(item)}
                style={{
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
        </View>

        <View
          className="mx-6 mt-6 flex-row items-center justify-between rounded-2xl border-[2.5px] border-ink bg-lavender px-4 py-4"
          style={hardShadow(4)}>
          <Text className="text-[16px] text-ink">Dodaj do ulubionych</Text>

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
          <View className="mx-6 mt-5 rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-3">
            {errors.map((message) => (
              <Text key={message} className="text-[14px] leading-5 text-ink">
                {message}
              </Text>
            ))}
          </View>
        )}

      </ScrollView>

      <View className="px-6 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <ChunkyButton onPress={save} disabled={!uri || !name.trim() || !type || isSaving}>
          <Text className="text-xl font-bold text-ink">
            {isSaving ? 'Zapisuję…' : 'Zapisz do szafy'}
          </Text>
        </ChunkyButton>
      </View>
    </View>
  );
}

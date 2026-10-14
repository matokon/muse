import { File } from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { hardShadow } from '@/constants/theme';
import { getToken } from '@/lib/token-storage';

export default function AddInspirationScreen() {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setErrors([]);
    }
  }

  async function save() {
    if (!imageUri || !caption.trim() || isSaving) return;

    setIsSaving(true);
    setErrors([]);

    try {
      const form = new FormData();
      form.append('caption', caption.trim());
      form.append('image', new File(imageUri));

      const token = await getToken();
      const res = await fetch(`${API_URL}/inspirations`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors ?? ['Nie udało się zapisać inspiracji']);
        return;
      }

      router.replace('/inspirations');
    } catch (err) {
      console.error('[add-inspiration] save', err);
      setErrors(['Brak połączenia z serwerem']);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Dodaj inspirację" onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-8 pt-5"
        keyboardShouldPersistTaps="handled">
        <View
          className="aspect-square overflow-hidden rounded-3xl border-[2.5px] border-ink bg-lavender"
          style={hardShadow(5)}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ flex: 1 }} contentFit="cover" />
          ) : (
            <View className="flex-1 items-center justify-center px-8">
              <Text className="text-center text-[15px] font-semibold text-plum">
                Dodaj zdjęcie inspiracji
              </Text>
            </View>
          )}
        </View>

        <View className="mt-5">
          <ChunkyButton variant="accent" onPress={pickFromGallery} disabled={isSaving}>
            <Text className="text-lg font-bold text-ink">
              {imageUri ? 'Zmień zdjęcie' : 'Wybierz z galerii'}
            </Text>
          </ChunkyButton>
        </View>

        <Text className="mt-6 text-[15px] font-semibold text-ink">Podpis</Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Dodaj krótki podpis..."
          placeholderTextColor="#9A9AAA"
          multiline
          textAlignVertical="top"
          className="mt-2 min-h-[112px] rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-4 text-[16px] text-ink"
        />

        {errors.length > 0 && (
          <View className="mt-5 rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-3">
            {errors.map((message) => (
              <Text key={message} className="text-[14px] leading-5 text-ink">
                {message}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      <View className="px-6 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <ChunkyButton
          onPress={save}
          disabled={!imageUri || !caption.trim() || isSaving}>
          <Text className="text-xl font-bold text-ink">
            {isSaving ? 'Zapisuję…' : 'Zapisz inspirację'}
          </Text>
        </ChunkyButton>
      </View>
    </View>
  );
}

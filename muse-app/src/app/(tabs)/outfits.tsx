import { CategoryCard } from '@/components/category-card';
import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { getToken } from '@/lib/token-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

type OutfitCategory = {
  id: number;
  name: string;
  outfits_count: number;
};

function outfitsLabel(count: number) {
  if (count === 1) return '1 outfit';

  const tens = count % 100;
  const ones = count % 10;
  const few = ones >= 2 && ones <= 4 && (tens < 12 || tens > 14);

  return `${count} ${few ? 'outfity' : 'outfitów'}`;
}

function categoriesLabel(count: number) {
  if (count === 1) return '1 kategorii';

  return `${count} kategoriach`;
}

export default function OutfitsScreen() {
  const [categories, setCategories] = useState<OutfitCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.[0] ?? 'Nie udało się wczytać kategorii');
        return;
      }

      setCategories(data);
    } catch (err) {
      console.error('[outfits] load', err);
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

  async function create(name:string) {
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: { name } }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.[0] ?? 'Nie udało się utworzyć kategorii');
        return;
      }

      setConfirming(false);
      setCategoryName('');
      load();
    } catch (err) {
      console.error('[outfits] create', err);
      setError('Brak połączenia z serwerem');
    }
  }

  const totalOutfits = categories.reduce((sum, c) => sum + c.outfits_count, 0);
  const totalCategories = categories.length;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Moje outfity"
        subtitle={`${outfitsLabel(totalOutfits)} w ${categoriesLabel(totalCategories)}`}
      />

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 12, paddingTop: 16, paddingBottom: 24 }}
        ListFooterComponent={
          <View className="mx-6 mt-3">
            <Pressable
              onPress={() => setConfirming(true)}
              className="items-center justify-center rounded-2xl border-[2.5px] border-dashed border-ink bg-pink py-5">
              <Text className="text-[15px] font-bold text-ink">+ Nowa kategoria</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mx-6">
            <CategoryCard>
              <View className="flex-row items-center gap-3 px-4 py-7">
                <View className="h-12 w-12 rounded-lg border-[2.5px] border-ink bg-lavender" />
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-ink">{item.name}</Text>
                  <Text className="text-[13px] text-muted">
                    {outfitsLabel(item.outfits_count)}
                  </Text>
                </View>
                <Text className="text-[18px] text-ink">→</Text>
              </View>
            </CategoryCard>
          </View>
        )}
      />

      <Modal
        visible={confirming}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setConfirming(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(20, 18, 26, 0.55)' }}>
          <View className="rounded-t-[28px] border-[2.5px] border-ink bg-surface px-6 pb-10 pt-7">
            <View className="flex-row items-center justify-between">
              <Text className="text-[22px] font-extrabold tracking-tight text-ink">
                Nowa kategoria
              </Text>
              <Pressable
                onPress={() => {
                  setConfirming(false);
                  setCategoryName('');
                }}
                className="h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-ink bg-white">
                <Text
                  className="text-[18px] font-bold text-ink"
                  style={{ lineHeight: 20 }}>
                  ×
                </Text>
              </Pressable>
            </View>

            <TextInput
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="np. Girls night"
              placeholderTextColor="#999"
              className="mt-5 rounded-2xl border-[2.5px] border-ink bg-white px-4 py-3 text-[15px] text-ink"
            />

            <View className="mt-5">
              <ChunkyButton variant="accent" onPress={() => create(categoryName)}>
                <Text className="text-base font-bold text-ink">Utwórz kategorię</Text>
              </ChunkyButton>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
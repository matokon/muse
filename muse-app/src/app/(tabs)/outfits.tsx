import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { getToken } from '@/lib/token-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View, FlatList } from 'react-native';

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

  return `${count} ${'kategoriach'}`;
}

export default function OutfitsScreen() {
  const [categories, setCategories] = useState<OutfitCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log('[outfits] data:', data);
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
    }, [load])
  );
  
  const totalOutfits = categories.reduce((sum, c) => sum + c.outfits_count, 0);
  const totalCategories = categories.length;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Moje outfity" subtitle={`${outfitsLabel(totalOutfits)} w ${categoriesLabel(totalCategories)}`} />
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Text>{item.name} – {item.outfits_count}</Text>
        )}
        ListEmptyComponent={<Text>Nie masz jeszcze żadnych kategorii</Text>}
      />

    </View>
  );
}
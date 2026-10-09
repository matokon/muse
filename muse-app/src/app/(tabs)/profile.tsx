import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { deleteToken, getToken } from '@/lib/token-storage';

type User = {
  name: string | null;
  email: string;
};

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const loadProfile = useCallback(async () => {
    setError(null);

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.errors?.[0] ?? 'Nie udało się wczytać profilu');
        return;
      }

      setUser(data);
    } catch (err) {
      console.error('[profile] load', err);
      setError('Brak połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  async function signOut() {
    setSigningOut(true);

    try {
      await deleteToken();
      setUser(null);
      router.replace('/auth');
    } catch (err) {
      console.error('[profile] sign out', err);
      setError('Nie udało się wylogować');
      setSigningOut(false);
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title={user?.name ?? 'Mój profil'} subtitle={user?.email ?? ''} />

      <View className="gap-4 px-6 pt-6">
        <Button onPress={signOut} disabled={signingOut}>
          {signingOut ? 'Wylogowywanie…' : 'Wyloguj się'}
        </Button>
        {!!error && (
          <Text className="text-center text-[14px] font-semibold text-plum">{error}</Text>
        )}
      </View>
    </View>
  );
}
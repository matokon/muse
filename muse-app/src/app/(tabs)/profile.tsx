import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/button';
import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';
import { hardShadow, INK } from '@/constants/theme';
import { deleteToken, getToken } from '@/lib/token-storage';

type User = {
  name: string | null;
  email: string;
};

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    setError(null);

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

  async function removeAccount() {
    if (deletingAccount) return;

    setDeletingAccount(true);
    setDeleteError(null);

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setDeleteError(data?.errors?.[0] ?? 'Nie udało się usunąć konta');
        return;
      }

      await deleteToken();
      setUser(null);
      setConfirmingDelete(false);
      router.replace('/auth');
    } catch (err) {
      console.error('[profile] remove account', err);
      setDeleteError('Brak połączenia z serwerem');
    } finally {
      setDeletingAccount(false);
    }
  }

  const displayName = user?.name?.trim() || 'Użytkownik Muse';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Mój profil" subtitle="Konto i ustawienia" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-8 pt-6"
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator color={INK} />
          </View>
        ) : (
          <>
            <View
              className="flex-row items-center gap-4 rounded-3xl border-[2.5px] border-ink bg-white p-5"
              style={hardShadow(5)}>
              <View className="h-16 w-16 items-center justify-center rounded-full border-[2.5px] border-ink bg-accent">
                <Text className="text-[28px] font-extrabold text-ink">{initial}</Text>
              </View>
              <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="text-[20px] font-extrabold text-ink">
                  {displayName}
                </Text>
                <Text numberOfLines={1} className="mt-1 text-[14px] text-muted">
                  {user?.email ?? 'Nie udało się wczytać adresu e-mail'}
                </Text>
              </View>
            </View>

            <Text className="mb-3 mt-8 text-[13px] font-bold uppercase tracking-wider text-plum">
              Informacje
            </Text>
            <View className="overflow-hidden rounded-2xl border-[2.5px] border-ink bg-white">
              <ProfileRow
                icon="hand.raised.fill"
                title="Polityka prywatności"
                subtitle="Jak przechowujemy Twoje dane"
                onPress={() => router.push('/privacy-policy')}
              />
              <View className="h-[2.5px] bg-ink" />
              <ProfileRow
                icon="questionmark.circle.fill"
                title="Pomoc i kontakt"
                subtitle="Odpowiedzi i dane kontaktowe"
                onPress={() => router.push('/support')}
              />
              <View className="h-[2.5px] bg-ink" />
              <ProfileRow
                icon="info.circle.fill"
                title="Wersja aplikacji"
                subtitle={APP_VERSION}
              />
            </View>

            {!!error && (
              <Text className="mt-5 text-center text-[14px] font-semibold text-plum">
                {error}
              </Text>
            )}

            <View className="mt-8 gap-4">
              <Button
                onPress={signOut}
                disabled={signingOut || deletingAccount}
                color="bg-white">
                {signingOut ? 'Wylogowywanie…' : 'Wyloguj się'}
              </Button>
              <Button
                onPress={() => {
                  setDeleteError(null);
                  setConfirmingDelete(true);
                }}
                disabled={signingOut || deletingAccount}>
                Usuń konto
              </Button>
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={confirmingDelete}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!deletingAccount) setConfirmingDelete(false);
        }}>
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(20, 18, 26, 0.55)' }}>
          <View className="rounded-t-[28px] border-[2.5px] border-ink bg-surface px-6 pb-10 pt-7">
            <Text className="text-[22px] font-extrabold tracking-tight text-ink">
              Usunąć konto?
            </Text>
            <Text className="mt-3 text-[15px] leading-6 text-muted">
              Twoje ubrania, outfity, inspiracje i zdjęcia zostaną trwale usunięte. Tego nie da
              się cofnąć.
            </Text>
            {!!deleteError && (
              <Text className="mt-3 text-[14px] font-semibold text-plum">{deleteError}</Text>
            )}

            <View className="mt-7 flex-row gap-4">
              <View className="flex-1">
                <Button
                  onPress={() => {
                    setConfirmingDelete(false);
                    setDeleteError(null);
                  }}
                  disabled={deletingAccount}
                  color="bg-white">
                  Zostaw
                </Button>
              </View>
              <View className="flex-1">
                <ChunkyButton onPress={removeAccount} disabled={deletingAccount}>
                  <Text className="text-base font-bold text-ink">
                    {deletingAccount ? 'Usuwam…' : 'Usuń'}
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

type ProfileRowProps = {
  icon: SFSymbol;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

function ProfileRow({ icon, title, subtitle, onPress }: ProfileRowProps) {
  const content = (
    <View className="min-h-[72px] flex-row items-center gap-4 px-4 py-3">
      <View className="h-10 w-10 items-center justify-center rounded-xl border-[2px] border-ink bg-lavender">
        <SymbolView
          name={icon}
          size={19}
          tintColor={INK}
          weight="semibold"
          style={{ width: 19, height: 19 }}
        />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[15px] font-bold text-ink">{title}</Text>
        <Text className="mt-0.5 text-[12px] text-muted">{subtitle}</Text>
      </View>
      {onPress && (
        <SymbolView
          name="chevron.right"
          size={15}
          tintColor={INK}
          weight="semibold"
          style={{ width: 15, height: 15 }}
        />
      )}
    </View>
  );

  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

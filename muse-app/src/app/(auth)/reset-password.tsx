import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError('');

    if (!email) {
      setError('Najpierw podaj adres e-mail');
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError('Kod musi mieć 6 cyfr');
      return;
    }

    if (password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Hasła nie są takie same');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/password_resets`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.errors?.[0] ?? 'Nie udało się zmienić hasła');
        return;
      }

      setUpdated(true);
    } catch (requestError) {
      console.error('[reset-password] request', requestError);
      setError('Brak połączenia z serwerem');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Ustaw nowe hasło" onBack={router.back} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-6 pb-10 pt-6"
        keyboardShouldPersistTaps="handled"
        style={{ paddingBottom: insets.bottom }}>
        {updated ? (
          <>
            <View className="gap-2 rounded-[14px] border-[2.5px] border-ink bg-lavender p-4">
              <Text className="text-[15px] font-bold text-ink">Hasło zostało zmienione</Text>
              <Text className="text-[13px] leading-5 text-ink">
                Możesz teraz zalogować się przy użyciu nowego hasła.
              </Text>
            </View>
            <ChunkyButton
              onPress={() => router.replace({ pathname: '/auth', params: { mode: 'login' } })}>
              Przejdź do logowania
            </ChunkyButton>
          </>
        ) : (
          <>
            <Text className="text-[15px] leading-[22px] text-ink">
              Wpisz 6-cyfrowy kod wysłany na {email ?? 'Twój adres e-mail'}.
            </Text>
            <View className="gap-2">
              <Text className="text-[13px] text-ink">Kod</Text>
              <TextInput
                className="rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-4 text-center text-[24px] tracking-[8px] text-ink"
                value={code}
                onChangeText={setCode}
                placeholder="000000"
                placeholderTextColor="#9A9AAA"
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </View>
            <PasswordField label="Nowe hasło" value={password} onChangeText={setPassword} />
            <PasswordField
              label="Powtórz nowe hasło"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
            />

            {error ? (
              <View className="rounded-[14px] border-[2.5px] border-ink bg-header-pink p-4">
                <Text className="text-[13px] text-ink">{error}</Text>
              </View>
            ) : null}

            <ChunkyButton onPress={handleSubmit} disabled={submitting}>
              Zmień hasło
            </ChunkyButton>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function PasswordField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View className="gap-2">
      <Text className="text-[13px] text-ink">{label}</Text>
      <TextInput
        className="rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-4 text-[15px] text-ink"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

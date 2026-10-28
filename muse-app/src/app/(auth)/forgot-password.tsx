import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChunkyButton } from '@/components/chunky-button';
import { ScreenHeader } from '@/components/screen-header';
import { API_URL } from '@/config';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError('');

    if (!email.trim()) {
      setError('Podaj adres e-mail');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/password_resets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.errors?.[0] ?? 'Nie udało się wysłać wiadomości');
        return;
      }

      router.push({
        pathname: '/reset-password',
        params: { email: email.trim().toLowerCase() },
      });
    } catch (requestError) {
      console.error('[forgot-password] request', requestError);
      setError('Brak połączenia z serwerem');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Nie pamiętam hasła" onBack={router.back} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-6 pb-10 pt-6"
        keyboardShouldPersistTaps="handled"
        style={{ paddingBottom: insets.bottom }}>
        <Text className="text-[15px] leading-[22px] text-ink">
          Podaj adres e-mail przypisany do konta. Wyślemy Ci 6-cyfrowy kod zmiany hasła.
        </Text>

        <View className="gap-2">
          <Text className="text-[13px] text-ink">E-mail</Text>
          <TextInput
            className="rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-4 text-[15px] text-ink"
            placeholder="anna.kowalska@mail.com"
            placeholderTextColor="#9A9AAA"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {error ? (
          <View className="rounded-[14px] border-[2.5px] border-ink bg-header-pink p-4">
            <Text className="text-[13px] text-ink">{error}</Text>
          </View>
        ) : null}

        <ChunkyButton onPress={handleSubmit} disabled={submitting}>
          Wyślij kod
        </ChunkyButton>
      </ScrollView>
    </View>
  );
}

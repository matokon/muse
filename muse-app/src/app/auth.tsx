import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChunkyButton } from '@/components/chunky-button';
import { API_URL } from '@/config';
import { INK } from '@/constants/theme';
import { saveToken } from '@/lib/token-storage';

type Mode = 'login' | 'signup';

const BENEFITS = [
  'Szafa z automatycznie wyciętymi ubraniami',
  'Outfity składane w kilka sekund',
  '5 przymiarek AI dziennie za darmo',
];

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { mode: initialMode } = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<Mode>(initialMode === 'login' ? 'login' : 'signup');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const isLogin = mode === 'login';

  async function handleSubmit() {
    setSubmitting(true);
    setErrors([]);

    try {
      const path = isLogin ? '/login' : '/signup';
      const body = isLogin
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, name: form.name };

      const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors ?? ['Coś poszło nie tak']);
        return;
      }

      await saveToken(data.token);
      router.replace('/');
    } catch {
      setErrors(['Brak połączenia z serwerem']);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <View
        className="border-b-[2.5px] border-ink bg-header-pink px-6 pb-5"
        style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center gap-3">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-ink bg-white"
            onPress={router.back}>
            <SymbolView
              name="arrow.backward"
              size={18}
              tintColor={INK}
              weight="semibold"
              style={{ width: 18, height: 18 }}
            />
          </Pressable>
          <Text className="text-[22px] font-extrabold tracking-tight text-ink">
            {isLogin ? 'Zaloguj się' : 'Załóż konto'}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-6 pb-10 pt-6"
        keyboardShouldPersistTaps="handled"
        style={{ paddingBottom: insets.bottom }}>
        <View className="flex-row rounded-[14px] border-[2.5px] border-ink bg-lavender p-1">
          <SegmentTab label="Logowanie" active={isLogin} onPress={() => setMode('login')} />
          <SegmentTab label="Rejestracja" active={!isLogin} onPress={() => setMode('signup')} />
        </View>

        {isLogin ? (
          <LoginFields
            name={form.name}
            email={form.email}
            password={form.password}
            onNameChange={(value) => setForm({ ...form, name: value })}
            onEmailChange={(value) => setForm({ ...form, email: value })}
            onPasswordChange={(value) => setForm({ ...form, password: value })}
          />
        ) : (
          <SignupFields
            name={form.name}
            email={form.email}
            password={form.password}
            onNameChange={(value) => setForm({ ...form, name: value })}
            onEmailChange={(value) => setForm({ ...form, email: value })}
            onPasswordChange={(value) => setForm({ ...form, password: value })}
          />
        )}

        <View className="gap-3 rounded-[14px] border-[2.5px] border-ink bg-lavender p-4">
          <Text className="text-[15px] font-bold text-ink">Co dostajesz w Muse</Text>
          {BENEFITS.map((benefit) => (
            <View key={benefit} className="flex-row items-center gap-3">
              <View className="h-6 w-6 rounded-[6px] border-[2px] border-ink bg-button-pink" />
              <Text className="flex-1 text-[13px] text-ink">{benefit}</Text>
            </View>
          ))}
        </View>

        {errors.length > 0 ? (
          <View className="gap-1 rounded-[14px] border-[2.5px] border-ink bg-header-pink p-4">
            {errors.map((error) => (
              <Text key={error} className="text-[13px] text-ink">
                {error}
              </Text>
            ))}
          </View>
        ) : null}

        <ChunkyButton onPress={handleSubmit} disabled={submitting}>
          {isLogin ? 'Zaloguj się' : 'Utwórz konto'}
        </ChunkyButton>
      </ScrollView>
    </View>
  );
}

function LoginFields({ email, password, onEmailChange, onPasswordChange }: AuthFieldsProps) {
  return (
    <View className="gap-4">
      <Field
        label="E-mail"
        placeholder="anna.kowalska@mail.com"
        keyboardType="email-address"
        value={email}
        onChangeText={onEmailChange}
      />
      <Field label="Hasło" secure value={password} onChangeText={onPasswordChange} />
      <Pressable>
        <Text className="self-start font-mono text-[13px] underline text-ink">
          nie pamiętam hasła
        </Text>
      </Pressable>
    </View>
  );
}

function SignupFields({
  name,
  email,
  password,
  onNameChange,
  onEmailChange,
  onPasswordChange,
}: AuthFieldsProps) {
  return (
    <View className="gap-4">
      <Field
        label="Imię"
        placeholder="Anna"
        autoCapitalize="words"
        value={name}
        onChangeText={onNameChange}
      />
      <Field
        label="E-mail"
        placeholder="anna.kowalska@mail.com"
        keyboardType="email-address"
        value={email}
        onChangeText={onEmailChange}
      />
      <Field label="Hasło" secure value={password} onChangeText={onPasswordChange} />
    </View>
  );
}

type AuthFieldsProps = {
  name: string;
  email: string;
  password: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

function PasswordToggle({ visible, onPressIn, onPressOut }: PasswordToggleProps) {
  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} hitSlop={12}>
      <SymbolView
        name={visible ? 'eye' : 'eye.slash'}
        size={18}
        tintColor={INK}
        weight="semibold"
        style={{ width: 18, height: 18 }}
      />
    </Pressable>
  );
}

type PasswordToggleProps = {
  visible: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secure?: boolean;
  trailing?: ReactNode;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
};

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  secure = false,
  trailing,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: FieldProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <View className="gap-2">
      <Text className="text-[13px] text-ink">{label}</Text>
      <View className="justify-center">
        <TextInput
          className="rounded-[14px] border-[2.5px] border-ink bg-white px-4 py-4 text-[15px] text-ink"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#9A9AAA"
          secureTextEntry={secure && !revealed}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        <View className="absolute right-4">
          {secure ? (
            <PasswordToggle
              visible={revealed}
              onPressIn={() => setRevealed(true)}
              onPressOut={() => setRevealed(false)}
            />
          ) : (
            trailing
          )}
        </View>
      </View>
    </View>
  );
}

type SegmentTabProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function SegmentTab({ label, active, onPress }: SegmentTabProps) {
  return (
    <Pressable
      disabled={active}
      className={`flex-1 items-center justify-center rounded-[10px] border-[2.5px] py-3 ${
        active ? 'border-ink bg-white' : 'border-transparent'
      }`}
      onPress={onPress}>
      <Text className={`text-[15px] ${active ? 'font-bold text-ink' : 'text-muted'}`}>{label}</Text>
    </Pressable>
  );
}

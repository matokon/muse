import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';

export default function PrivacyPolicyScreen() {
  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Polityka prywatności" onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-6 pb-10 pt-6"
        showsVerticalScrollIndicator={false}>

        <PolicySection title="Jakie dane przechowujemy">
          Muse przechowuje dane konta, takie jak imię i adres e-mail, oraz treści dodane przez
          użytkownika: zdjęcia ubrań, outfity, inspiracje i ich podpisy.
        </PolicySection>

        <PolicySection title="W jakim celu">
          Dane służą wyłącznie do obsługi konta i udostępniania funkcji aplikacji. Muse nie
          sprzedaje danych użytkowników ani nie wykorzystuje ich do śledzenia reklamowego.
        </PolicySection>

        <PolicySection title="Zdjęcia i aparat">
          Dostęp do galerii i aparatu jest używany tylko wtedy, gdy wybierasz lub wykonujesz
          zdjęcie. Do konta przesyłane są wyłącznie zdjęcia wybrane przez Ciebie.
        </PolicySection>

        <PolicySection title="Usuwanie danych">
          Konto wraz z przypisanymi ubraniami, outfitami, inspiracjami i zdjęciami możesz trwale
          usunąć na ekranie profilu.
        </PolicySection>
      </ScrollView>
    </View>
  );
}

function PolicySection({ title, children }: { title: string; children: string }) {
  return (
    <View className="rounded-2xl border-[2.5px] border-ink bg-white px-5 py-4">
      <Text className="text-[17px] font-extrabold text-ink">{title}</Text>
      <Text className="mt-2 text-[14px] leading-6 text-muted">{children}</Text>
    </View>
  );
}

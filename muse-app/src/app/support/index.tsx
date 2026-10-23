import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/screen-header';

export default function SupportScreen() {
  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Pomoc i kontakt" onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-6 pb-10 pt-6"
        showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl border-[2.5px] border-ink bg-accent px-5 py-4">
          <Text className="text-[17px] font-extrabold text-ink">Potrzebujesz pomocy?</Text>
          <Text className="mt-2 text-[14px] leading-6 text-muted">
            Napisz do nas: mateusz.okon04@gmail.com
          </Text>
        </View>

        <HelpItem title="Jak dodać ubranie?">
          Użyj przycisku „+” na dolnym pasku, zrób zdjęcie lub wybierz je z galerii, a następnie
          uzupełnij dane ubrania.
        </HelpItem>

        <HelpItem title="Jak stworzyć outfit?">
          Przejdź do zakładki Outfity, wybierz kategorię i użyj przycisku dodawania outfitu.
        </HelpItem>

        <HelpItem title="Jak działają inspiracje?">
          W zakładce Inspiracje możesz zapisywać zdjęcia z galerii wraz z krótkim podpisem. Kliknij
          inspirację, aby zobaczyć ją z bliska lub ją usunąć.
        </HelpItem>

        <HelpItem title="Jak usunąć konto?">
          Na ekranie profilu wybierz „Usuń konto” i potwierdź decyzję. Wszystkie dane konta
          zostaną trwale usunięte.
        </HelpItem>
      </ScrollView>
    </View>
  );
}

function HelpItem({ title, children }: { title: string; children: string }) {
  return (
    <View className="rounded-2xl border-[2.5px] border-ink bg-white px-5 py-4">
      <Text className="text-[16px] font-extrabold text-ink">{title}</Text>
      <Text className="mt-2 text-[14px] leading-6 text-muted">{children}</Text>
    </View>
  );
}

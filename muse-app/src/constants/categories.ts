export const GROUPS = [
  { label: 'Góra', types: ['Koszulki', 'Topy', 'Bluzki', 'Koszule', 'Swetry', 'Bluzy', 'Kardigany', 'Marynarki'] },
  { label: 'Dół', types: ['Jeansy', 'Spodnie', 'Spódnice', 'Szorty', 'Spodenki', 'Legginsy', 'Sukienki'] },
  { label: 'Okrycia', types: ['Kurtki', 'Płaszcze', 'Kamizelki', 'Futra'] },
  { label: 'Buty', types: ['Sneakersy', 'Baletki', 'Czółenka', 'Botki', 'Kozaki', 'Sandały', 'Klapki'] },
  { label: 'Dodatki', types: ['Torebki', 'Szale', 'Czapki', 'Pasy', 'Biżuteria', 'Rękawiczki', 'Okulary', 'Rajstopy'] },
] as const;

export type Group = (typeof GROUPS)[number];

export function groupOf(type: string) {
  return GROUPS.find((group) => (group.types as readonly string[]).includes(type));
}

type Gender = 'm' | 'f' | 'n' | 'pl';

const FORMS: Record<string, { one: string; gender: Gender }> = {
  Koszulki: { one: 'koszulka', gender: 'f' },
  Topy: { one: 'top', gender: 'm' },
  Bluzki: { one: 'bluzka', gender: 'f' },
  Koszule: { one: 'koszula', gender: 'f' },
  Swetry: { one: 'sweter', gender: 'm' },
  Bluzy: { one: 'bluza', gender: 'f' },
  Kardigany: { one: 'kardigan', gender: 'm' },
  Marynarki: { one: 'marynarka', gender: 'f' },

  Jeansy: { one: 'jeansy', gender: 'pl' },
  Spodnie: { one: 'spodnie', gender: 'pl' },
  Spódnice: { one: 'spódnica', gender: 'f' },
  Szorty: { one: 'szorty', gender: 'pl' },
  Spodenki: { one: 'spodenki', gender: 'pl' },
  Legginsy: { one: 'legginsy', gender: 'pl' },
  Sukienki: { one: 'sukienka', gender: 'f' },

  Kurtki: { one: 'kurtka', gender: 'f' },
  Płaszcze: { one: 'płaszcz', gender: 'm' },
  Kamizelki: { one: 'kamizelka', gender: 'f' },
  Futra: { one: 'futro', gender: 'n' },

  Sneakersy: { one: 'sneakersy', gender: 'pl' },
  Baletki: { one: 'baletki', gender: 'pl' },
  Czółenka: { one: 'czółenka', gender: 'pl' },
  Botki: { one: 'botki', gender: 'pl' },
  Kozaki: { one: 'kozaki', gender: 'pl' },
  Sandały: { one: 'sandały', gender: 'pl' },
  Klapki: { one: 'klapki', gender: 'pl' },

  Torebki: { one: 'torebka', gender: 'f' },
  Szale: { one: 'szal', gender: 'm' },
  Czapki: { one: 'czapka', gender: 'f' },
  Pasy: { one: 'pasek', gender: 'm' },
  Biżuteria: { one: 'biżuteria', gender: 'f' },
  Rękawiczki: { one: 'rękawiczki', gender: 'pl' },
  Okulary: { one: 'okulary', gender: 'pl' },
  Rajstopy: { one: 'rajstopy', gender: 'pl' },
};

const THIS: Record<Gender, string> = { m: 'ten', f: 'ta', n: 'to', pl: 'te' };
const UNUSED: Record<Gender, string> = {
  m: 'nie jest używany',
  f: 'nie jest używana',
  n: 'nie jest używane',
  pl: 'nie są używane',
};

export function unusedInOutfits(type: string | null) {
  const form = type ? FORMS[type] : undefined;

  if (!form) return 'Ten przedmiot nie jest używany w żadnym outficie myszeczko';

  const sentence = `${THIS[form.gender]} ${form.one} ${UNUSED[form.gender]} w żadnym outficie myszeczko`;

  return sentence[0].toUpperCase() + sentence.slice(1);
}

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

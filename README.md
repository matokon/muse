# Muse

**Muse** to autorska aplikacja mobilna, która rozwiązuje problem „nie mam co na siebie włożyć”. Pozwala tworzyć wirtualne przedmioty ze zdjęć własnych ubrań, a następnie komponować z nich gotowe outfity. W dniu, w którym brakuje inspiracji, wystarczy zajrzeć do zapisanych stylizacji i wybrać coś dla siebie.

Projekt zorganizowany jest jako **monorepo** — backend i aplikacja mobilna żyją w jednym repozytorium:

| Katalog | Opis |
|---|---|
| [`muse-api`](./muse-api) | Backend — Ruby on Rails (API-only) |
| [`muse-app`](./muse-app) | Aplikacja mobilna — React Native / Expo |

---

## Spis treści

- [Funkcje](#funkcje)
- [Tech Stack](#tech-stack)
- [Struktura repozytorium](#struktura-repozytorium)
- [Instalacja](#instalacja)
- [Konfiguracja](#konfiguracja)
- [Uruchomienie](#uruchomienie)
- [Testowanie](#testowanie)

---

## Funkcje

- **Dodawanie ubrań** – zrób zdjęcie lub wybierz z galerii, a aplikacja stworzy wirtualny przedmiot.
- **Kategoryzacja garderoby** – przypisz ubrania do kategorii.
- **Tworzenie outfitów** – łącz wirtualne przedmioty w pełne stylizacje.
- **Zapisywanie ulubionych stylizacji** – buduj własną bibliotekę gotowych zestawów.
- **Inspiracje na dziś** – przeglądaj zapisane outfity i wybierz coś na siebie.

---

## Tech Stack

| Warstwa | Technologia |
|---|---|
| Mobile | React Native, Expo, TypeScript, Expo Router, NativeWind |
| Backend | Ruby on Rails (API-only) |
| Baza danych | PostgreSQL |
| Autoryzacja | Własna implementacja |
| Storage | Active Storage (zdjęcia ubrań) |

---

## Struktura repozytorium

```
muse/
├── muse-api/                # Ruby on Rails API
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── serializers/
│   │   └── services/
│   ├── config/
│   ├── db/
│   └── spec/                # RSpec
├── muse-app/                # React Native (Expo)
│   └── src/
│       ├── app/             # Expo Router – ekrany
│       │   ├── (auth)/
│       │   ├── (tabs)/
│       │   ├── add-item/
│       │   ├── add-outfit/
│       │   ├── category/
│       │   ├── item/
│       │   └── _layout.tsx
│       ├── components/
│       ├── lib/
│       ├── constants/
│       ├── config.ts
│       └── global.css
└── README.md
```

---

## Instalacja

### Backend (`muse-api`)

```bash
cd muse-api
bundle install
```

### Frontend (`muse-app`)

```bash
cd muse-app
npm install
# lub
yarn install
```

---

## Konfiguracja

### Backend — `muse-api`

1. Utwórz plik `.env` na podstawie `.env.example`:

```bash
cd muse-api
cp .env.example .env
```

2. Uzupełnij dane bazy danych w `.env`.

3. Utwórz i zainicjuj bazę danych:

```bash
rails db:create
rails db:migrate
rails db:seed   # opcjonalnie — dane startowe
```

### Frontend — `muse-app`

1. Utwórz plik `.env`:

```bash
cd muse-app
cp .env.example .env
```

2. Ustaw adres API:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## Uruchomienie lokalne

### Backend

```bash
cd muse-api
rails server -p 3000
```

Serwer dostępny pod `http://localhost:3000`.

### Frontend

```bash
cd muse-app
npx expo start
```

Następnie:

- **iOS** – naciśnij `i` (wymaga Xcode)
- **Android** – naciśnij `a` (wymaga Android Studio)
- **Expo Go** – zeskanuj kod QR w aplikacji Expo Go na telefonie

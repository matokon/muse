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
- [Wymagania wstępne](#wymagania-wstępne)
- [Instalacja](#instalacja)
- [Konfiguracja](#konfiguracja)
- [Uruchomienie](#uruchomienie)
- [API](#api)
- [Testowanie](#testowanie)
- [Wdrażanie](#wdrażanie)
- [Wkład](#wkład)
- [Licencja](#licencja)
- [Kontakt](#kontakt)

---

## Funkcje

- **Dodawanie ubrań** – zrób zdjęcie lub wybierz z galerii, a aplikacja stworzy wirtualny przedmiot.
- **Kategoryzacja garderoby** – przypisz ubrania do kategorii (typ, kolor, okazja, pogoda).
- **Tworzenie outfitów** – łącz wirtualne przedmioty w pełne stylizacje.
- **Zapisywanie ulubionych stylizacji** – buduj własną bibliotekę gotowych zestawów.
- **Inspiracje na dziś** – przeglądaj zapisane outfity i wybierz coś na siebie.
- **Filtrowanie i wyszukiwanie** – szybko znajdź konkretny element garderoby.

---

## Tech Stack

| Warstwa | Technologia |
|---|---|
| Mobile | React Native, Expo, TypeScript, Expo Router, NativeWind |
| Backend | Ruby on Rails (API-only) |
| Baza danych | PostgreSQL |
| Autoryzacja | JWT / Devise |
| Storage | Active Storage (zdjęcia ubrań) |
| Narzędzia | Git, GitHub, ESLint, Prettier, RuboCop |

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
│       ├── components/      # Komponenty wielokrotnego użytku
│       ├── lib/             # Klient API, helpery
│       ├── constants/
│       ├── config.ts
│       └── global.css
└── README.md
```

---

## Wymagania wstępne

- **Node.js** (v18+) – [pobierz](https://nodejs.org/)
- **npm** lub **yarn**
- **Expo CLI** – `npm install -g expo-cli`
- **Ruby** (v3.0+) – [pobierz](https://www.ruby-lang.org/)
- **Rails** (v7.0+) – `gem install rails`
- **PostgreSQL** – [pobierz](https://www.postgresql.org/)
- **Watchman** (macOS) – `brew install watchman`
- **Xcode** (iOS) lub **Android Studio** (Android)

---

## Instalacja

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/matokon/muse.git
cd muse
```

### 2. Backend (`muse-api`)

```bash
cd muse-api
bundle install
```

### 3. Frontend (`muse-app`)

```bash
cd ../muse-app
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

2. Przykładowa zawartość `.env`:

```env
DATABASE_HOST=localhost
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=muse_development
JWT_SECRET=your_jwt_secret
RAILS_ENV=development
```

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

## Uruchomienie

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

### Tryb produkcyjny (frontend)

```bash
cd muse-app
npx expo start --no-dev --minify
```

---

## API

### Endpointy

| Metoda | Endpoint | Opis |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Rejestracja użytkownika |
| `POST` | `/api/v1/auth/login` | Logowanie |
| `GET` | `/api/v1/items` | Lista ubrań |
| `POST` | `/api/v1/items` | Dodanie ubrania |
| `GET` | `/api/v1/items/:id` | Szczegóły ubrania |
| `PUT` | `/api/v1/items/:id` | Aktualizacja ubrania |
| `DELETE` | `/api/v1/items/:id` | Usunięcie ubrania |
| `GET` | `/api/v1/outfits` | Lista outfitów |
| `POST` | `/api/v1/outfits` | Utworzenie outfit |
| `GET` | `/api/v1/outfits/:id` | Szczegóły outfit |

### Przykład żądania

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

---

## Testowanie

### Backend (RSpec)

```bash
cd muse-api
bundle exec rspec
```

### Frontend (Jest + React Native Testing Library)

```bash
cd muse-app
npm test
```

### Linting

```bash
# Backend
cd muse-api && bundle exec rubocop

# Frontend
cd muse-app && npm run lint
```

---

## Wdrażanie

### Backend (Railway / Render / Heroku)

1. Utwórz aplikację na wybranej platformie.
2. Dodaj zmienne środowiskowe (jak w `.env`).
3. Wdróż:

```bash
git push heroku main
```

### Frontend (EAS Build)

```bash
cd muse-app
npx eas build --platform all
```

Następnie opublikuj w App Store / Google Play za pomocą `eas submit`.

---

## Wkład

1. Zrób fork repozytorium.
2. Utwórz branch (`git checkout -b feature/nowa-funkcja`).
3. Commituj zmiany (`git commit -m 'Dodaj nową funkcję'`).
4. Wypchnij branch (`git push origin feature/nowa-funkcja`).
5. Otwórz Pull Request.

---

## Licencja

Projekt na licencji MIT. Szczegóły w pliku [LICENSE](./LICENSE).

---

## Kontakt

**Mateusz** – [GitHub](https://github.com/matokon)

Link do projektu: [https://github.com/matokon/muse](https://github.com/matokon/muse)
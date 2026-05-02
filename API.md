# Bring Shopping API i Struktura CLI

## Zakres Analizy

Analiza dotyczy paczki `bring-shopping@2.0.1`, używanej w tym repo jako wrapper
Node.js dla nieoficjalnego API Bring!. Paczka eksportuje jedną klasę `Bring`,
która po zalogowaniu udostępnia operacje na listach zakupowych, elementach,
użytkownikach, ustawieniach, katalogu produktów i zaproszeniach.

## Inicjalizacja Klienta

```ts
import Bring from 'bring-shopping'

const bring = new Bring({mail, password, url?, uuid?})
await bring.login()
```

`login()` ustawia wewnętrznie `uuid`, token Bearer i nagłówki wymagane przez
kolejne requesty. Paczka nie wystawia publicznego API do trwałego przechowywania
sesji, więc komendy CLI powinny zakładać logowanie przy każdym uruchomieniu,
chyba że dodamy własną warstwę cache/session.

## Dostępne Operacje API

- `loadLists()` zwraca listy zakupowe: `listUuid`, `name`, `theme`.
- `getItems(listUuid)` zwraca elementy listy w sekcjach `purchase` i `recently`.
- `getItemsDetails(listUuid)` zwraca szczegóły itemów, m.in. `uuid`, `itemId`,
  `assignedTo` i `imageUrl`.
- `saveItem(listUuid, itemName, specification)` dodaje lub aktualizuje element.
- `removeItem(listUuid, itemName)` usuwa element z listy zakupów.
- `moveToRecentList(listUuid, itemName)` przenosi element do ostatnich/kupionych.
- `saveItemImage(itemUuid, {imageData})` zapisuje obrazek dla elementu.
- `removeItemImage(itemUuid)` usuwa obrazek elementu.
- `getAllUsersFromList(listUuid)` zwraca użytkowników przypisanych do listy.
- `getUserSettings()` zwraca ustawienia użytkownika i ustawienia per lista.
- `loadTranslations(locale)` pobiera tłumaczenia, np. `de-DE`.
- `loadCatalog(locale)` pobiera katalog produktów dla locale.
- `getPendingInvitations()` zwraca oczekujące zaproszenia.

## Proponowana Struktura Komend

Rekomendowana struktura jest noun-first i dobrze pasuje do nested commands oclif:

```txt
bring auth login
bring auth whoami

bring lists
bring lists users <list>
bring lists use <list>

bring items <list>
bring items add <list> <name> [--spec "..."]
bring items remove <list> <name>
bring items done <list> <name>
bring items details <list>
bring items image set <item-uuid> <file>
bring items image remove <item-uuid>

bring catalog <locale>
bring translations <locale>
bring settings
bring invitations
```

`<list>` powinno akceptować zarówno UUID, jak i nazwę listy. W przypadku nazwy
CLI może pobrać `loadLists()` i rozwiązać ją do `listUuid`.

## Proponowana Architektura

```txt
src/lib/client.ts        # tworzy Bring, robi login, mapuje błędy
src/lib/config.ts        # email/password/defaultList z env, flag lub configu
src/lib/output.ts        # formatowanie json/table/plain
src/lib/list-resolver.ts # UUID albo nazwa listy
src/commands/...         # cienkie komendy oclif
```

Komendy powinny być cienkie: parsują argumenty i flagi, wywołują warstwę `lib`,
a następnie renderują wynik. Dzięki temu auth, obsługa błędów i formatowanie nie
będą duplikowane w każdym commandzie.

## Credentials i Konfiguracja

Najbezpieczniejszy MVP to obsługa credentials przez zmienne środowiskowe oraz
flagi:

```txt
BRING_EMAIL=user@example.com
BRING_PASSWORD=secret
bring lists

bring lists --email user@example.com --password secret
```

Zapisywanie hasła w plaintext configu nie powinno być domyślnym mechanizmem.
Jeśli CLI ma mieć trwałe logowanie, lepszym kierunkiem jest systemowy keychain
albo osobny mechanizm sesji/cache, o ile API Bring! pozwoli go stabilnie używać.

## Rekomendowany MVP

Pierwszy zakres powinien pokryć główną wartość list zakupowych:

```txt
bring lists
bring items <list>
bring items add <list> <name> --spec <text>
bring items remove <list> <name>
bring items done <list> <name>
```

Ten zakres wymusza zbudowanie podstaw: logowania, wyboru listy po nazwie lub
UUID, obsługi błędów i renderowania wyników. Dopiero po tym warto dodać katalog,
tłumaczenia, użytkowników, zaproszenia i obrazki itemów.

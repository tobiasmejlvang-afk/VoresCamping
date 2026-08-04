# Guide: openrouteservice API-nøgle til Vores Camping 11

Vores Camping kan vise kortet uden en API-nøgle. Nøglen bruges til at gøre **søgning efter campingpladser** og **beregning af cykelruter** bedre.

Appen bruger:

- **OpenFreeMap + MapLibre** til det flotte kort
- **openrouteservice / HeiGIT** til søgning og cykelruter
- **Google Maps-links** til ruter, der allerede er oprettet og delt fra Google Maps

## 1. Opret en gratis konto

1. Åbn openrouteservice-webstedet.
2. Vælg **Log in / Sign up**.
3. Opret en konto og bekræft e-mailen.
4. Log ind igen.

## 2. Kopiér API-nøglen

I den nuværende konto-visning ligger nøglen normalt under fanen **API Key**.

1. Find **Basic Key**.
2. Tryk **Copy**.
3. Gem den midlertidigt i udklipsholderen – ikke i en offentlig fil.

Nye nøgler kan ligne en lang JWT-streng, som begynder med `eyJ`. Det er stadig en almindelig HeiGIT/openrouteservice API-nøgle.

## 3. Indsæt nøglen i appen

1. Åbn **Vores Camping**.
2. Gå til **Indstillinger**.
3. Find boksen **Kort: OpenFreeMap & openrouteservice**.
4. Vælg kortmotoren **OpenFreeMap + openrouteservice**.
5. Indsæt nøglen i feltet **openrouteservice API-nøgle**.
6. Vælg ønsket kortstil:
   - **Liberty** – grøn og tydelig
   - **Bright** – mere farverig
   - **Positron** – lys og rolig
   - **Fiord** – kølig naturstil
7. Tryk **Gem og test korttjenesten**.

Hvis alt er i orden, viser appen beskeden:

> openrouteservice-nøglen virker

## 4. Test campingpladssøgningen

1. Åbn **Oversigtskort**.
2. Skriv eksempelvis `Camping Bella Italia` eller `camping Holstebro`.
3. Tryk **Søg campingplads online**.
4. Vælg **Tilføj besøgt** eller **Tilføj ønske**.
5. Kontrollér, at markøren vises på både forsiden og oversigtskortet.

## 5. Test en cykelrute

1. Åbn en campingplads eller opret en ny.
2. Find afsnittet **Cykelruter**.
3. Skriv start, slut og eventuelle stop.
4. Tryk **Beregn rute**.
5. Ruten bør blive tegnet som en rigtig linje på kortet med afstand og forventet varighed.

Du kan stadig indsætte et delt Google Maps-link i ruten. Det kræver ikke en Google API-nøgle.

## Vigtigt om sikkerhed

- Læg **aldrig nøglen direkte i `app.js`, `maps.js`, README eller GitHub-repositoryet**.
- Appen gemmer nøglen lokalt i browserens `localStorage` på den enhed, hvor den indtastes.
- Nøglen fjernes automatisk fra appens JSON-sikkerhedskopier.
- En personlig nøgle kan stadig ses i browserens netværksværktøjer, når den bruges. Det er normalt for denne personlige app.
- Hvis appen senere skal bruges offentligt af mange personer med samme nøgle, bør API-kaldene flyttes til en server-side proxy. GitHub Pages kan ikke skjule en fælles hemmelig nøgle.

## Nye API-adresser

HeiGIT har flyttet tjenesterne til nye adresser. Version 11 bruger allerede:

- `api.heigit.org/pelias/v1` til søgning
- `api.heigit.org/openrouteservice/v2` til ruter

Den gamle adresse `api.openrouteservice.org` er udfaset og planlagt lukket den 24. august 2026.

## Fejlfinding

### 401 eller 403

- Kontrollér, at hele nøglen er kopieret.
- Fjern mellemrum før eller efter nøglen.
- Log ind på kontoen og kontrollér, at **Basic Key** stadig er aktiv.

### 429 – for mange forespørgsler

Du har ramt en minut- eller dagsgrænse. Vent lidt, og prøv igen. Kontoen viser normalt forbrug og resterende kvote.

### Kortet vises, men søgning eller rute virker ikke

Kortet kræver ikke openrouteservice-nøglen. Derfor kan kortet godt virke, selv om nøglen er forkert. Brug knappen **Gem og test korttjenesten** for at teste selve nøglen.

### Kortet er gråt eller langsomt

- Genindlæs med `Ctrl + F5`.
- Åbn `repair.html` én gang.
- Kontrollér internetforbindelsen.
- Appen falder automatisk tilbage til det indbyggede reservekort, hvis MapLibre eller OpenFreeMap ikke kan hentes.

## Google Maps er valgfrit

Google Maps API-nøglen er kun nødvendig, hvis du vil bruge Google som selve kortmotoren inde i appen. OpenFreeMap-løsningen er standarden og kræver ingen kortnøgle.

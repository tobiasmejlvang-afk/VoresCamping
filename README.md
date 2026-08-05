# Vores Camping – version 12

En statisk, dansk campingdagbog bygget til GitHub Pages. Appen kræver ingen npm-installation, database, server eller GitHub Action.

## Udgiv direkte fra `/docs`

1. Kopiér hele mappen `docs` til roden af dit GitHub-repository.
2. Commit og push filerne til `main`.
3. Åbn repositoryets **Settings → Pages**.
4. Vælg **Deploy from a branch**.
5. Vælg branch **main** og mappe **/docs**.
6. Gem. GitHub viser adressen, når siden er udgivet.

Hash-navigationen (`#/overblik`, `#/kort` osv.) gør, at undersider virker uden 404-fejl på GitHub Pages.

## Kort og API-nøgler

### OpenFreeMap / MapLibre

Appens primære kort virker uden konto og API-nøgle. Kortstilen kan vælges under **Indstillinger → Kort og API-nøgler**.

### Openrouteservice

Openrouteservice bruges til udvidet campingpladssøgning, geokodning og beregning af cykelruter.

1. Opret en konto hos openrouteservice.
2. Opret en API-nøgle i deres dashboard.
3. Åbn appens **Indstillinger**.
4. Indsæt nøglen i feltet **Openrouteservice API-nøgle**.
5. Tryk **Test forbindelse** og derefter **Gem indstillinger**.

Nøglen gemmes kun lokalt i den pågældende browser og fjernes automatisk fra eksporterede backupfiler. En nøgle i en ren frontend-app kan teknisk ses af brugeren i browseren; brug derfor forbrugsgrænser og domænebegrænsning, når tjenesten tilbyder det.

### Google Maps

Google Maps bruges primært via almindelige links, som ikke kræver en nøgle. En Google Maps JavaScript-nøgle kan tilføjes som valgfri reservekortmotor under **Indstillinger**. Vær opmærksom på Googles egne fakturerings- og kvoteregler.

## Data og backup

- Data gemmes i browserens `localStorage`.
- Billeder komprimeres automatisk før lagring.
- Brug **Indstillinger → Sikkerhedskopi → Eksportér** jævnligt.
- Import erstatter de nuværende campingdata, men beholder API-nøglerne på enheden.
- Sletning af browserdata sletter også appens lokale campingdata, medmindre de er eksporteret.

## Centrale filer

- `docs/index.html` – appens skal og navigation
- `docs/styles.css` – responsivt campingdesign
- `docs/app.js` – data, sider, formularer, backup og navigation
- `docs/maps.js` – MapLibre, OpenFreeMap, Google Maps-reserve, geokodning og ruter
- `docs/manifest.webmanifest` – PWA-oplysninger og appikoner
- `docs/assets/` – logo, cover, illustrationer og eksempelbilleder

## Test lokalt

Browserens sikkerhedsregler kan blokere kort og filer, hvis `index.html` åbnes direkte som en fil. Start i stedet en lille lokal webserver i projektmappen:

```bash
python -m http.server 8000
```

Åbn derefter `http://localhost:8000/docs/`.

# Vores Camping – version 14

En statisk, dansk campingdagbog til Windows-computer og Samsung-tablet. Appen kan udgives direkte fra `main`-branchens `/docs`-mappe uden npm, build-trin eller GitHub Actions.

## Hvad version 14 indeholder

- Ny finpudset, lys campingforside med personligt cover, logo og kompakt dashboard.
- Sisis nedtællingsur er fastgjort i hjørnet, opdateres hvert sekund og kan minimeres.
- OpenFreeMap/MapLibre-kort med flere udseender, reservekort og små statusmarkører.
- Kortfiltrering, lokal søgning, online søgning, automatisk zoom og enhedens placering.
- Manuel flytning af campingpladsens markør direkte på kortet.
- Ny avanceret cykelruteeditor med klikbare og flytbare punkter.
- Openrouteservice/HeiGIT-funktioner til geokodning, ruteberegning, snap, isokroner, POI-søgning og højdedata.
- Automatisk migrering af data fra tidligere appversioner.
- API-nøgler gemmes separat fra campingdata og fjernes fra backupfiler.
- Automatisk billedkomprimering før lagring i browseren.
- Fejlvisning i stedet for en tom hvid skærm.

## Installation på GitHub Pages

1. Pak `Vores-Camping-v14.zip` ud.
2. Kopiér hele `docs`-mappen til roden af dit GitHub-repository.
3. Commit filerne til `main`-branchen.
4. Gå til **Settings → Pages** i GitHub.
5. Vælg **Deploy from a branch**.
6. Vælg branchen **main** og mappen **/docs**.
7. Gem opsætningen.

Appen bruger hash-navigation, så sider som `#map`, `#settings` og `#route-edit/r1` virker uden 404-fejl på GitHub Pages.

## Opsætning af Openrouteservice

1. Opret en API-nøgle hos Openrouteservice.
2. Åbn appens side **Indstillinger**.
3. Find boksen **Kort og API-nøgler**.
4. Indsæt nøglen i feltet **Openrouteservice API-nøgle**.
5. Tryk **Test Openrouteservice**.
6. Når forbindelsen virker, tryk **Gem kort og nøgler**.

Nøglen bliver kun gemt lokalt på den aktuelle enhed. Den medtages ikke i eksporterede sikkerhedskopier.

Version 14 bruger de nye `api.heigit.org`-adresser som primær forbindelse. Den gamle `api.openrouteservice.org`-adresse bruges kun som midlertidig reserve ved netværks- eller serverfejl, fordi den gamle adresse er varslet lukket den 24. august 2026.

## Centrale filer

- `docs/index.html` – appens grundstruktur og scriptindlæsning.
- `docs/styles.css` – layout, tema, responsivt design og komponenter.
- `docs/app.js` – data, navigation, sider, formularer, backup og automatiske funktioner.
- `docs/maps.js` – MapLibre, kortstile, markører, pop-ups, rutelinjer og korteditorer.
- `docs/ors.js` – samlet HeiGIT/Openrouteservice-klient med nye tjenesteadresser, midlertidig reserve, fejl- og timeout-håndtering.
- `docs/manifest.webmanifest` – installation som webapp.
- `docs/assets/` – logoer, illustrationer, coverbilleder og appikoner.
- `openrouteservice.zip` – de vedhæftede ORS-eksempler bevaret som reference.

## Lokal lagring og backup

Campingpladser, vurderinger, ruter og indstillinger gemmes i browserens lokale lager. Billeder komprimeres automatisk, men mange store billeder kan stadig fylde browserens lager. Eksportér derfor jævnligt en JSON-backup fra **Indstillinger**.

## Test

Se [TEST-RAPPORT.md](TEST-RAPPORT.md) for den gennemførte fil-, side-, responsivitets- og funktionstest.

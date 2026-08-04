# Vores Camping 11.0

En personlig dansk campingdagbog og scrapbog, klar til direkte udgivelse fra **`main`-branchens `/docs`-mappe** på GitHub Pages.

Der er ingen npm, ingen buildkommando og ingen egen GitHub Action. Upload filerne, vælg `/docs`, og så kan campingvognen rulle.

## Nyt i version 11

- Ekstra finpudset, lyst og kompakt campinglayout.
- Ny personlig forside med velkomst efter tidspunktet på dagen.
- Vedhæftede illustrationer er flettet ind i logo, cover, familie-kort, sidepanel og scrapbogssektion.
- Stort oversigtskort er fortsat appens vigtigste element.
- Flottere vektorkort med **MapLibre og OpenFreeMap**.
- Fire kortstile: Liberty, Bright, Positron og Fiord.
- Tydelige markører for besøgt og vil besøge.
- Automatisk reservekort, hvis MapLibre/OpenFreeMap ikke kan indlæses.
- openrouteservice/HeiGIT til campingpladssøgning og beregnede cykelruter.
- Appen bruger de nye `api.heigit.org`-adresser.
- Nedtælling til næste campingtur.
- Mere personlig familie-boks og illustreret scrapbogsstribe.
- Gamle data migreres automatisk fra tidligere versioner.

## Download og upload

ZIP-filen er pakket, så indholdet kan uploades direkte til roden af repositoryets `main`-branch:

```text
README.md
START-HER.txt
API-GUIDE.md
docs/
  index.html
  app.js
  maps.js
  styles.css
  assets/
```

## Udgiv fra `/docs`

1. Pak ZIP-filen ud.
2. Upload alt indhold til roden af `main`.
3. Kontrollér, at `docs/index.html` findes.
4. Åbn **Settings → Pages**.
5. Vælg **Deploy from a branch**.
6. Vælg **main** og **/docs**.
7. Tryk **Save**.

## API-nøgle

Læs den separate guide:

**`API-GUIDE.md`**

Appen virker uden nøgle, men openrouteservice-nøglen giver bedre søgning og rigtige beregnede cykelruter.

## Sider

- Overblik
- Besøgte campingpladser
- Oversigtskort – Europa og verden
- Bedst bedømte campingpladser
- Campingpladser vi vil besøge
- Indstillinger

## Funktioner

- Opret, redigér og slet campingpladser
- Søg campingpladser online
- Besøg og ønskebesøg med separate kortmarkører
- Billeder og beskrivelser
- Flere besøgsdatoer
- Seværdigheder omkring campingpladsen
- Stjernevurderinger og egne kategorier
- Cykelruter med kort, afstand og varighed
- Delte Google Maps-ruter
- Personligt cover og forsidetekster
- Nedtælling til næste tur
- Temaer og farver
- Import og eksport af sikkerhedskopi

## Data

Data og API-nøgler gemmes kun lokalt i browseren på den enkelte enhed. API-nøgler medtages ikke i sikkerhedskopier.

## Gammel cache

Åbn én gang efter upload, hvis browseren stadig viser en ældre version:

```text
https://DIT-BRUGERNAVN.github.io/DIT-REPOSITORY/repair.html
```

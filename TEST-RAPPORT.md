# Testrapport – Vores Camping v21.1

## Fejl fundet

Den oprindelige v21-fil gav denne opstartsfejl:

```text
TypeError: state.settings.menuOrder is not iterable
at orderedNavItemsV21
at renderNav
at init
```

Fejlen skyldtes forkert rækkefølge i initialiseringen.

## Udførte kontroller

- JavaScript-syntaks:
  - `docs/app.js` bestået
  - `docs/maps.js` bestået
  - `docs/ors.js` bestået
- Manifest JSON valideret.
- Alle lokale `assets/...`-referencer kontrolleret: 0 manglende filer.
- Statiske HTML-id'er kontrolleret: 0 dubletter.
- Manifestikoner kontrolleret og fundet.
- Openrouteservice-ZIP testet uden komprimeringsfejl.
- Opstart testet med:
  - helt ny lokal tilstand
  - ældre/minimal lokal tilstand uden v21-indstillinger
- Følgende visninger blev kørt gennem en isoleret JavaScript-test:
  - Overblik
  - Besøgte
  - Kort
  - Bedst bedømte
  - Ønsker
  - Ferie Album
  - Ferie Vagten
  - Søgning
  - Ruteeditor
  - Campingpladsdetalje
  - Cykelrutedetalje
  - alle 23 undersider under Indstillinger

## Begrænsning

Det isolerede Chromium-miljø kunne ikke gennemføre en stabil grafisk rendering af lokale sider. Live kort, vejr, geolokation og Openrouteservice bør derfor slutkontrolleres efter upload til GitHub Pages.

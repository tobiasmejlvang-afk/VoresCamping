# Test- og fejlfindingsrapport – Vores Camping v14

Testdato: 5. august 2026

## Samlet resultat

Version 14 er gennemgået fil for fil og side for side. JavaScript-filerne består syntakskontrol, alle testede sider kan gengives uden JavaScript-fejl, og de testede desktop- og tabletvisninger giver ikke vandret overløb eller dublerede HTML-id'er.

Live-kortfliser og rigtige Openrouteservice-kald kunne ikke køres direkte i testbrowserens afskærmede netværksmiljø. Integrationslogikken er derfor testet med kontrollerede MapLibre- og ORS-svar. En personlig ORS-nøgle skal stadig testes i den udgivne app med knappen **Test Openrouteservice**.

## Filgennemgang

### `docs/index.html`

- Kontrolleret dansk sprog, viewport og webmanifest.
- Script-rækkefølge rettet til `ors.js`, `maps.js`, `app.js`.
- MapLibre opdateret til version 5-serien.
- Tilføjet korrekte 192×192 og 512×512 appikoner.
- Hash-navigation bevares til GitHub Pages.

### `docs/app.js`

- Syntakskontrol gennemført med Node.js.
- Dataversion hævet til 14.
- Migrering fra v13, v12 og ældre lagernøgler testet.
- API-nøgler flyttet til separat lokalt lager.
- Fejlhåndtering ved fyldt eller utilgængeligt browserlager tilføjet.
- Nedtællingen opdaterer nu kun talfelterne hvert sekund; indstillingssiden genopbygges ikke længere hvert sekund.
- Fejl i den selvstændige campingpladssøgning rettet.
- Lokal kortsøgning og online søgeresultater rettet.
- Manuel markørplacering til campingpladser tilføjet.
- Avanceret ruteeditor tilføjet.
- URL'er valideres før de bruges som klikbare links.
- Billeder komprimeres til maksimalt 1280 px med reduceret JPEG-kvalitet.

### `docs/maps.js`

- Syntakskontrol gennemført med Node.js.
- Gamle rasterstile og den ustabile toner-adresse erstattet.
- OpenFreeMap-stile og reservekort samlet ét sted.
- Gamle kortinstanser fjernes ved navigation for at undgå WebGL-læk.
- Pop-ups bygges med DOM-elementer i stedet for rå HTML.
- Små grønne og gule markører kontrolleret.
- Markører med samme koordinater spredes automatisk.
- Punktvælger og ruteeditor understøtter klik, træk og fjernelse.
- Fejl med gammel rutelinje efter fjernelse af punkter rettet.
- Klik på et rutepunkt udløser ikke længere et ekstra kortpunkt.

### `docs/ors.js`

- Syntakskontrol gennemført med Node.js.
- Fælles timeout- og fejlbehandling.
- Primær forbindelse flyttet til de nye `api.heigit.org`-tjenesteadresser.
- Midlertidig reserve til den gamle `api.openrouteservice.org`-adresse bruges kun ved netværksfejl, timeout, 404/405 eller serverfejl.
- Afstande fra directions fortolkes nu korrekt som meter og omregnes til kilometer i brugerfladen.
- POI-søgeradius er begrænset til højst 2 km.
- Implementerede klientfunktioner:
  - søgning og autocomplete
  - reverse geokodning
  - cykelruter
  - snap til vejnet
  - isokroner
  - afstands-/tidsmatrix
  - højdedata for punkt og linje
  - POI-søgning
  - optimering
- Manglende API-nøgle giver en forståelig dansk besked.

### `docs/styles.css`

- Indlæst og gengivet i browsertesten uden sidefejl.
- Nyt kompakt dashboard, kortarbejdsområde og ruteeditorlayout.
- Responsiv sidemenu/bundnavigation kontrolleret.
- Nedtællingsuret kan minimeres og bliver mindre på kort- og ruteeditorsider.

### `docs/manifest.webmanifest`

- JSON-validering bestået.
- Ikonstørrelser matcher nu de faktiske filer.

### `docs/assets/`

- Alle 13 refererede asset-filer findes.
- Ingen manglende billedreferencer i kildekoden.

## Side-for-side smoke-test

Følgende hash-ruter blev gengivet og kontrolleret:

| Side | Resultat |
|---|---|
| `#overview` | Bestået |
| `#visited` | Bestået |
| `#map` | Bestået |
| `#top` | Bestået |
| `#wishlist` | Bestået |
| `#settings` | Bestået |
| `#search` | Bestået |
| `#detail/site1` | Bestået |
| `#edit/site1` | Bestået |
| `#route/r1` | Bestået |
| `#route-edit/r1` | Bestået |
| `#route-edit/new?siteId=site1` | Bestået |

Resultat: 12 af 12 sider blev gengivet uden registrerede JavaScript-fejl eller fejlbanner.

## Funktionstest

- Fokus i indstillingsfelter blev bevaret, mens nedtællingen kørte.
- Lokal campingpladssøgning gav det forventede resultat.
- Lokal filtrering af kortmarkører gav korrekt resultatantal.
- Mock-test af Openrouteservice-forbindelsen lykkedes.
- Test af nyt HeiGIT-endpoint samt automatisk reserve til det gamle endpoint lykkedes.
- Online geokodningsresultat blev vist og kunne overføres til formularen.
- Cykelrute blev beregnet til 12,3 km og 60 minutter fra testsvar.
- POI-søgning viste et resultat.
- Højdeprofil viste laveste, højeste og samlet højdeforskel.
- Redigeret cykelrute blev gemt og åbnet i detaljevisning.
- Redigeret campingplads blev gemt og åbnet i detaljevisning.
- Sisis ur kunne minimeres og udvides.
- Migrering fra en v13-testfil til v14 lykkedes, herunder flytning af API-nøglen ud af campingdata.

## Responsiv test

Testede viewports:

- 1600×1000 – Windows/desktop
- 1024×768 – tablet liggende
- 800×1280 – tablet stående

Testede sider i hver viewport:

- Overblik
- Besøgte
- Kort
- Indstillinger
- Rediger campingplads
- Ruteeditor

Samlet 18 responsive testcases:

- Vandret overløb: 0
- Dublerede HTML-id'er: 0
- JavaScript-fejl: 0

## Rettede hovedfejl fra v13

1. Ugyldig JavaScript omkring seværdighedsfeltets linjeskift.
2. Kort-pop-up knapper lyttede på en MapLibre-event, der ikke fandtes.
3. Pop-ups brugte usikker rå HTML.
4. Indstillingssiden blev genopbygget hvert sekund af nedtællingen.
5. Selvstændig online søgning skrev resultater til et element på en anden side.
6. Ruteudregningen sendte kun ét koordinat til ORS.
7. Kortstile brugte en død/ustabil toner-adresse og var ikke baseret på OpenFreeMap.
8. Gemte-kortets søgefelt havde ingen funktion.
9. Kortinstanser blev ikke fjernet ved navigation.
10. API-nøgler lå sammen med de almindelige appdata.
11. Forsidesektionernes vis/skjul-indstillinger blev ikke anvendt.
12. Campingpladsens markør kunne ikke flyttes på et kort.
13. Der manglede en rigtig interaktiv ruteeditor.
14. Manifestets angivne ikonstørrelser matchede ikke billedfilerne.
15. Rutelinjen kunne blive hængende efter fjernelse af rutepunkter.
16. Openrouteservice-klienten brugte den udfasede API-vært som primær adresse.
17. Ruteafstand kunne blive tolket som kilometer, selv om standardsvaret er meter.
18. POI-søgningen brugte en radius over tjenestens nuværende maksimum.

## Kendte forhold

- Den første indlæsning kræver internet til MapLibre-biblioteket og kortfliserne.
- Udvidede ORS-funktioner kræver brugerens egen gyldige API-nøgle og er underlagt tjenestens begrænsninger. Appen bruger `api.heigit.org` som primær vært.
- Data er lokale for den enkelte browser. Brug backup/import til at flytte data mellem computer og tablet.
- Mange billeder kan fylde browserens lokale lager, selv om de komprimeres.

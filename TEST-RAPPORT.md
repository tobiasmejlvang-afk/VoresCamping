# Test- og fejlfindingsrapport – Vores Camping v18

Test udført den 5. august 2026.

## Resultat

Den gennemførte statiske fil-, syntaks- og strukturtest bestod **40 af 40 kontroller**.

## Beståede kontroller

- `docs/app.js`: JavaScript-syntaks godkendt med Node.js.
- `docs/maps.js`: JavaScript-syntaks godkendt med Node.js.
- `docs/ors.js`: JavaScript-syntaks godkendt med Node.js.
- `manifest.webmanifest`: gyldig JSON.
- Alle centrale filer findes.
- `.nojekyll` findes i `/docs`.
- Ingen dublerede statiske id’er i `index.html`.
- Alle fundne asset-referencer peger på eksisterende filer.
- Alle seks hurtighandlinger findes i appens kode.
- Alle seks nye v18-SVG-ikoner findes.
- Stener, Vibeke/Vibse og Sisis personlige oplysninger findes i standarddataene.
- Den flydende Sisi-ursektion er fjernet fra HTML.
- De tre Sisi-ur-assets er fjernet.
- Nedtællingen findes fortsat i sidemenuen.
- Forsidekortet indeholder klokkeslæt, dato og vejrvisning.
- Forecast-endpointet til vejrvisningen er indbygget.
- CSS-klammer er balancerede.
- Der blev ikke fundet en hardkodet Openrouteservice-nøgle.

## Funktioner gennemgået i koden

- Automatisk personlig hilsen efter tidspunkt på dagen.
- Fast brugerdefineret hilsen som valgfri erstatning.
- Visning af kælenavnet Vibse.
- Beregning af alder for Stener og Vibeke.
- Sisi vises med fødselsår frem for en falsk præcis fødselsdag.
- Aktiv markering i bundens hurtighandlingsdock.
- Vejrikon baseret på WMO-vejrkode.
- Reserveposition fra en gemt campingplads, hvis enhedens placering ikke kan hentes.
- Migrering fra tidligere versioner til version 18.

## Begrænsning

Det isolerede browsermiljø i denne session blokerede lokal sideindlæsning og kunne derfor ikke bruges til en ny automatisk skærmbilledetest. Jeg har derfor ikke påstået, at version 18 er browsertestet. Syntaks-, fil- og strukturkontrollerne er gennemført, men den endelige visuelle kontrol bør udføres ved at åbne `docs/index.html` gennem GitHub Pages eller en normal lokal webserver.

Live kortfliser, geoplacering, vejr og Openrouteservice afhænger desuden af netværk, browserens placeringstilladelse og brugerens egen ORS-nøgle.

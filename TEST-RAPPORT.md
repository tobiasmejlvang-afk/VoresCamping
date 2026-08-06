# Test- og fejlfindingsrapport – Vores Camping v19

Test udført den 6. august 2026.

## Resultat

**47 af 47 statiske kontroller bestået.**

## Kontrolleret

- JavaScript-syntaks i `app.js`, `maps.js` og `ors.js`.
- Gyldigt webmanifest.
- Ingen dublerede statiske HTML-id’er.
- Alle asset-referencer findes.
- Alle ti indstillingsundersider er til stede.
- Cykelruter har dato, elcykelprofil, flere cykler, deltagere, start-/slutrækkevidde, rutebilleder og stopbilleder.
- Fast bunddock indeholder nedtælling og hurtighandlinger.
- Hovedindholdet har bundafstand, så docken ikke overlapper siden.
- Openrouteservice-klienten indeholder struktureret søgning, directions GET/POST, snap JSON/GeoJSON, elcykel-rækkevidde, matrix, POI, elevation og optimering.
- `openrouteservice.zip` indeholder de oprindelige eksempler samt v19 README, request-skabeloner og profilguide.
- CSS-klammer er balancerede.

## Begrænsning

Det isolerede Chromium-miljø afsluttede ikke en fuld visuel browsertest. Derfor er fil-, syntaks-, struktur- og funktionskontroller gennemført, men den endelige visuelle kontrol bør udføres via GitHub Pages eller en normal lokal webserver.

Live Openrouteservice-kald kræver brugerens egen API-nøgle.

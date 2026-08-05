# Test- og fejlfindingsrapport – Vores Camping v16

Test gennemført den 5. august 2026.

## Resultat

Version 16 bestod den gennemførte syntaks-, side-, funktions- og responsivitetstest uden registrerede JavaScript-fejl i testforløbet.

## JavaScript og filer

- `docs/app.js`: syntaks godkendt med Node.js.
- `docs/maps.js`: syntaks godkendt med Node.js.
- `docs/ors.js`: syntaks godkendt med Node.js.
- `manifest.webmanifest`: gyldig JSON.
- Alle centrale filer er til stede.
- `.nojekyll` findes i `/docs`.
- Alle registrerede asset-referencer peger på eksisterende filer.
- Ingen hardkodet API-nøgle blev fundet.
- CSS-klammer er balancerede.
- Ingen dublerede statiske id'er i `index.html`.

## Sidetest

Følgende 11 app-ruter blev åbnet i en isoleret browsertest:

1. Overblik
2. Besøgte campingpladser
3. Oversigtskort
4. Bedst bedømte
5. Vil besøge
6. Indstillinger
7. Campingpladssøgning
8. Tilføj campingplads
9. Campingpladsens detaljevisning
10. Cykelrutens detaljevisning
11. Avanceret cykelruteeditor

Resultat:

- Korrekt sidetitel på alle 11 ruter.
- Fejlbanner forblev skjult på alle ruter.
- Ingen `pageerror`-hændelser.
- Ingen fejlmeddelelser i browserens konsol.

## Knapper og handlinger

Alle seks hurtig-handlinger blev aktiveret og kontrolleret:

- Find campingplads
- Tilføj besøg
- Tilføj ønske
- Åbn stort kort
- Ny cykelrute
- Indstillinger

Yderligere kontrolleret:

- Sisi-widgeten vises på Overblik.
- Sisi-widgeten skjules på Indstillinger, når “Kun på forsiden” er aktiv.
- Lås/op­lås-knappen ændrer widgetens låsetilstand.
- Klik på Sisi udløser jubelanimationen.
- Animationsvalg og hastighed gemmes i version 16-dataformatet.
- Duplikering af cykelrute opretter en ny kopi.
- GPX-eksport udløser en `.gpx`-fil.
- Linket til GitHub-guiden findes på Indstillinger.

## Responsivitet

Overblik, Indstillinger og Cykelruteeditor blev testet ved:

- 1440 px bredde
- 900 px bredde
- 700 px bredde

Resultat: **ingen vandret overflydning** i de ni kombinationer.

## Sisi og nedtællingen

Kontrolleret i koden og browsertesten:

- Dage, timer, minutter og sekunder er separate dynamiske felter.
- Tallene opdateres hvert sekund.
- Uret og Sisi bruger separate billedlag.
- Widgeten kan placeres i fire hjørner.
- Størrelse, afstand, gennemsigtighed og animation kan justeres.
- Automatisk mere ivrig animation tæt på måldatoen.
- `prefers-reduced-motion` respekteres.

## Cykelruter

Kontrollerede udvidelser:

- Ruteprofil
- Rutetype
- Underlag
- Pausetid
- Naturskøn prioritering
- Forsøg på at undgå trafik
- Højdepunkter og stop
- Ekstra noter
- GPX-eksport
- Ruteduplikering
- Eksisterende ORS-værktøjer til ruteberegning, snap, isokroner, POI og højdedata

## Begrænsninger i testen

Live kortfliser og rigtige Openrouteservice-svar blev ikke testet med brugerens personlige API-nøgle. Kort- og rutegrænsefladen blev browsertestet med en lokal MapLibre-erstatning, mens ORS-klientens JavaScript blev syntakskontrolleret. Den endelige live-kontrol udføres med knappen **Test Openrouteservice** efter udgivelse.

Billederne i `PREVIEW` er layoutforhåndsvisninger. Kortfeltet bruger en test-erstatning og viser derfor ikke levende kortfliser i forhåndsvisningen.

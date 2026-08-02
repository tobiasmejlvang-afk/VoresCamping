# Vores Camping 8.0 – kortet er nu appens centrum

En personlig dansk campingdagbog og scrapbog, klar til direkte udgivelse fra **`main`-branchens `/docs`-mappe** på GitHub Pages.

Der er ingen brugeroprettet GitHub Action, ingen npm, intet build-trin og ingen service worker.

## Det vigtigste i version 8

- Oversigtskortet er nu det første og største element på forsiden.
- Besøgte pladser og ønskebesøg har hver sin tydelige markør og tæller.
- Filtrene **Alle**, **Besøgte** og **Vil besøge** opdaterer både kort og liste.
- Kortet tilpasser automatisk zoom og centrum, så alle relevante markører kommer med.
- Flere pladser på samme koordinat bliver spredt visuelt, så ingen markør skjuler en anden.
- Gamle data migreres fra flere tidligere dataformater, danske statusnavne og koordinatfelter.
- Manglende koordinater kan findes samlet fra navn og adresse.
- Nye campingpladser forsøges placeret automatisk på kortet ved gemning.
- Kortfejl lukker ikke resten af appen; det gratis kort er altid reserve.

## Udgiv direkte fra `/docs`

1. Upload `README.md`, `START-HER.txt` og hele mappen `docs` til roden af repositoryets `main`-branch.
2. Kontrollér, at `docs/index.html`, `docs/app.js`, `docs/maps.js` og `docs/styles.css` findes.
3. Åbn **Settings → Pages** på GitHub.
4. Vælg **Deploy from a branch**.
5. Vælg **main** og **/docs**.
6. Tryk **Save**.

Siden ligger derefter normalt på:

`https://DIT-BRUGERNAVN.github.io/DIT-REPOSITORY/`

## Kort og placeringer

Det indbyggede OpenStreetMap-kort virker uden API-nøgle og understøtter:

- Interaktivt Europa- og verdenskort
- Separate markører for besøgte pladser og ønsker
- Automatisk visning af alle punkter
- Zoom, panorering og brugerens placering
- Klik på kortet for præcis placering
- Adresseopslag
- Kort på campingpladsens detaljeside
- Cykelruter som punkter eller rutelinje

Google Maps er valgfrit under **Indstillinger → Kort og Google Maps**. Uden Google-nøgle kan appen stadig åbne campingpladser og delte cykelruter i Google Maps via almindelige Maps-links.

## Cykelruter og delte Google Maps-ruter

Under en campingplads kan du:

- Oprette rute med start, slut og stop
- Beregne og vise ruten i appen
- Indsætte et link fra **Google Maps → Del → Kopiér link**
- Åbne og dele den gemte rute
- Gemme afstand, sværhedsgrad og beskrivelse

Google Maps-links bruger den officielle webadresseform og kræver ikke API-nøgle. En API-nøgle er kun nødvendig, når selve Google-kortmotoren eller Googles præcise ruteberegning skal bruges inde i appen.

## Sider

- Overblik med kortet i fokus
- Besøgte campingpladser
- Oversigtskort – Europa eller verden
- Bedst bedømte campingpladser
- Campingpladser vi vil besøge
- Indstillinger

## Øvrige funktioner

- Opret, redigér og slet campingpladser
- Besøgt eller ønskebesøg
- Flere besøgsdatoer
- Beskrivelse, private noter og tags
- Billeder med automatisk komprimering
- Stjernevurdering i standardkategorier og egne kategorier
- Fuld visning med billeder, vurderinger, datoer, kort og ruter
- Temaer, egne farver, forsidetekst og coverbillede
- Tilpasning af forsidens sektioner
- Eksport og import af JSON-sikkerhedskopi

## Data og sikkerhedskopi

Data gemmes lokalt i browseren på den enkelte enhed. Brug **Indstillinger → Hent sikkerhedskopi** for at flytte data mellem Windows-computer og Samsung-tablet.

Google Maps API-nøglen udelades fra sikkerhedskopier.

## Gammel cache

Åbn denne side én gang efter udskiftning af en gammel version:

`https://DIT-BRUGERNAVN.github.io/DIT-REPOSITORY/repair.html`

Den fjerner gamle cachefiler og service workers, men beholder campingdata i browserens lokale lager.

## Gennemført test

Version 8 er testet i Chromium i computer- og mobilstørrelse med:

- 3 besøgte og 2 ønskebesøg på samme kort
- Filtrering af begge statustyper
- Tilføjelse og lagring af en ny plads med koordinater
- Detaljeside og redigeringsside med kort
- Migration fra ældre danske datafelter og kommatal
- To forskellige statusser på præcis samme koordinat
- Alle hovedsider uden JavaScript-fejl

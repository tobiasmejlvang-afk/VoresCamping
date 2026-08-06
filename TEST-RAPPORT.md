# Testrapport – Vores Camping v21

## Beståede kontroller

- `docs/app.js`: JavaScript-syntaks godkendt med Node.
- `docs/maps.js`: JavaScript-syntaks godkendt med Node.
- `docs/ors.js`: JavaScript-syntaks godkendt med Node.
- `docs/manifest.webmanifest`: gyldig JSON.
- Nye logo- og ikonfiler findes.
- Logoets alfakanal indeholder gennemsigtighed.
- Nye stjerne-, kort- og ruteikoner findes.
- Openrouteservice-pakken er inkluderet.
- Indeksfilen bruger versionsnummer 21 på CSS og JavaScript.
- Manifestet peger på v21-appikonerne.
- ZIP-strukturen kan udlæses uden fejl.

## Funktioner kontrolleret statisk

- Selvstændige ruter til Ferie Album og Ferie Vagten.
- Ferieknap på forside og i venstremenu.
- Automatisk tilknytning af campingplads-, rute- og stopbilleder til aktiv ferie.
- Redigering af personer og dyr.
- Upload af hurtig-handlingsikoner, stjerneikon, kortmarkører og ruteikoner.
- Cykelrutedato, flere cykler, elcykelvalg, fem-minutters rækkevidde og billeder.
- Alle 23 ønskede indstillingsfaner er oprettet.

## Begrænsning

Det tilgængelige Chromium-program afsluttede ikke stabilt i det isolerede miljø, selv på en tom testside. Derfor er der ikke vedlagt en påstået visuel browsertest. Live kort, lokation, vejr og Openrouteservice bør slutkontrolleres efter upload til GitHub Pages.

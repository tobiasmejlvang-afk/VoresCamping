# Vores Camping 4.0 – GitHub Pages fra `/docs`

En personlig dansk campingdagbog og scrapbog med besøgte campingpladser, ønskeliste, billeder, stjernevurderinger, oversigtskort og cykelruter med Google Maps.

## Klar til GitHub Pages uden egen GitHub Action

Projektet er en ren statisk app. Der er ingen npm, ingen build-kommando, ingen backend og ingen brugeroprettet workflow-fil.

1. Upload `README.md`, `START-HER.txt` og hele mappen `docs` til roden af repositoryets `main`-branch.
2. Kontrollér, at filen `docs/index.html` findes på GitHub.
3. Åbn **Settings → Pages**.
4. Vælg **Deploy from a branch**.
5. Vælg branch **main** og mappe **/docs**.
6. Tryk **Save** og vent et par minutter.

GitHub kan vise en automatisk Pages-udgivelse under fanen Actions. Det er GitHubs egen interne udgivelse; projektet indeholder ikke en workflow-fil, som du skal vedligeholde.

## Sider

- Overblik
- Besøgte campingpladser
- Oversigtskort med Europa- og verdenskort
- Bedst bedømte campingpladser
- Campingpladser vi vil besøge
- Indstillinger

## Funktioner

- Opret, redigér og slet campingpladser og ønskebesøg
- Flere besøgsdatoer pr. campingplads
- Billeder med automatisk komprimering
- Beskrivelse, private noter og tags
- Stjerner i standardkategorier og egne kategorier
- Fuld campingpladsvisning med billeder, vurderinger, datoer og ruter
- Temaer, egne farver, forsidetekster, coverbillede og rækkefølge på forsiden
- Lokal automatisk lagring
- JSON-sikkerhedskopi til flytning mellem Windows og Samsung-tablet

## Google Maps og cykelruter

Appen virker uden Google Maps API-nøgle:

- Gem et direkte Google Maps-link til campingpladsen.
- Åbn og del campingpladsen direkte fra appen.
- Byg et cykellink ud fra start, slut og stop.
- Eller opret/gem ruten i Google Maps, vælg **Del → Kopiér link**, og indsæt linket i appen.
- Et gemt rutelink kan åbnes og deles fra campingpladsens fulde visning.

Google Maps-kortene kræver internetforbindelse. Resten af appen og de gemte data ligger lokalt i browseren.

## Data

Data gemmes i browserens lokale lager på den enkelte enhed. Det er derfor vigtigt at hente en sikkerhedskopi under **Indstillinger**, især før browserdata ryddes.

## Gammel cache eller tidligere service worker

Åbn én gang:

`https://DIT-BRUGERNAVN.github.io/DIT-REPOSITORY/repair.html`

Reparationssiden fjerner kun web-cache og tidligere service workers. Den sletter ikke campingdata i appens lokale lager.

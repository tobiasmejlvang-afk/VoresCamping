# Vores Camping – personlig campingdagbog

En færdig, statisk dansk webapp til campingpladser, vurderinger, billeder, ønskeliste og cykelruter.

Projektet er lavet til direkte udgivelse fra **`main`-branchens `/docs`-mappe** på GitHub Pages.

## Udgiv på GitHub Pages

1. Upload `README.md`, `START-HER.txt` og hele mappen `docs` til roden af repositoryets `main`-branch.
2. Kontrollér, at filen `docs/index.html` kan ses på GitHub.
3. Åbn **Settings → Pages**.
4. Vælg **Deploy from a branch**.
5. Vælg branch **main** og mappe **/docs**.
6. Tryk **Save** og vent nogle minutter.

Der bruges **ingen brugeroprettet GitHub Action**, ingen npm, intet build-trin og ingen service worker.

## Sider

- Overblik
- Besøgte campingpladser
- Oversigtskort med Europa- og verdensvisning via Google Maps
- Bedst bedømte campingpladser
- Campingpladser vi vil besøge
- Indstillinger

## Funktioner

- Opret, redigér og slet campingpladser og ønskebesøg
- Flere besøgsdatoer på samme campingplads
- Beskrivelser, private noter og tags
- Billeder med automatisk komprimering
- Stjernevurdering i standardkategorier og egne kategorier
- Fuld visning med billeder, vurderinger, datoer og cykelruter
- Cykelruter med start, slut og stop vist på Google Maps
- Indsæt et delt link til en rute, der allerede er lavet og gemt i Google Maps
- Del en gemt rute med telefonens/computerens delingsmenu eller kopiér linket
- Skift tema, farver, forsidecover, forsidetekst og rækkefølge på sektioner
- Vælg luftig eller kompakt forside
- Eksportér og importér en JSON-sikkerhedskopi

## Google Maps-ruter

Der er to måder at gemme en cykelrute på:

1. Angiv startsted, slutsted og eventuelle stop. Appen bygger et Google Maps-link med cykeltransport.
2. Lav ruten i Google Maps, vælg **Del → Kopiér link**, og indsæt linket i feltet **Delt Google Maps-link**.

Appen kræver ikke en Google Maps API-nøgle. Et delt Google Maps-link åbnes i browseren eller Google Maps-appen.

## Data

Data gemmes lokalt i browseren på den enkelte enhed. Brug **Indstillinger → Hent sikkerhedskopi** for at flytte data mellem computer og tablet.

Opdateringen bruger samme lokale lagernøgle som den forrige `/docs`-version, så eksisterende data bliver migreret i stedet for overskrevet.

## Gammel cache eller tidligere service worker

Åbn denne side én gang:

`https://DIT-BRUGERNAVN.github.io/DIT-REPOSITORY/repair.html`

Reparationssiden fjerner gamle cachefiler og service workers, men bevarer campingdata i browserens lokale lager.

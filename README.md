# Vores Camping 6.0 – kort og ruter integreret i appen

En statisk dansk campingdagbog og scrapbog, bygget til direkte udgivelse fra **`main`-branchens `/docs`-mappe** på GitHub Pages.

Der bruges ingen brugeroprettet GitHub Action, ingen npm, intet build-trin og ingen service worker.

## Udgiv direkte fra `/docs`

1. Upload `README.md`, `START-HER.txt` og hele mappen `docs` til roden af repositoryets `main`-branch.
2. Kontrollér på GitHub, at `docs/index.html`, `docs/app.js`, `docs/maps.js` og `docs/styles.css` findes.
3. Åbn **Settings → Pages**.
4. Under **Build and deployment** vælges **Deploy from a branch**.
5. Vælg **main** og **/docs**.
6. Tryk **Save** og vent nogle minutter.

Siden vil normalt ligge på:

`https://DIT-BRUGERNAVN.github.io/DIT-REPOSITORY/`

## Kortet virker i to niveauer

### 1. OpenStreetMap – klar med det samme

Appen åbner med et integreret og interaktivt kort uden API-nøgle. Det understøtter:

- Europa- og verdensvisning
- Markører for besøgte pladser og ønskelisten
- Zoom, panorering og tilpasning til alle markører
- Visning af brugerens aktuelle placering
- Klik på kortet for at placere en campingplads præcist
- Adresseopslag, når brugeren trykker **Find ud fra adresse**
- Cykelruter som linjer mellem gemte punkter

OpenStreetMap-navngivning vises direkte på kortet. Adresseopslag foretages kun efter et aktivt klik og er begrænset til højst ét opslag i sekundet.

### 2. Google Maps – valgfri præcis integration

Google Maps kan aktiveres under **Indstillinger → Kort og Google Maps**.

1. Opret eller vælg et projekt i Google Cloud.
2. Tilknyt fakturering til projektet.
3. Aktivér **Maps JavaScript API** og **Routes API**.
4. Opret en browser-API-nøgle.
5. Begræns nøglen til jeres GitHub Pages-adresse, for eksempel:
   `https://DIT-BRUGERNAVN.github.io/*`
6. Indsæt nøglen i appens indstillinger og tryk **Gem og test Google Maps**.

Når nøglen er godkendt, skifter appen automatisk til Google Maps og kan beregne den egentlige cykelrute langs veje og cykelstier. Uden nøgle falder appen automatisk tilbage til OpenStreetMap i stedet for at give en hvid skærm.

API-nøglen gemmes kun i browserens lokale lager og udelades automatisk fra JSON-sikkerhedskopier. Begræns altid nøglen til den rigtige webadresse og de nødvendige API'er.

## Integrerede kortfunktioner

- Hver campingplads kan gemmes med breddegrad og længdegrad.
- Placeringen kan findes fra adressen, vælges fra enhedens position eller sættes med klik på kortet.
- Oversigtskortet har filtre for **Alle**, **Besøgte** og **Vil besøge**.
- Markører åbner campingpladsen direkte i appen.
- Detaljesiden viser campingpladsens placering på et integreret kort.
- Gemte cykelruter vises på campingpladsens detaljeside.
- En eksisterende rute kan beregnes fra detaljesiden, hvis den har start og slut, men endnu ingen kortlinje.
- Ruter kan åbnes og deles som Google Maps-links.
- Et link fra **Google Maps → Del → Kopiér link** kan gemmes på ruten.

Google Maps-links til søgning og rutevejledning virker også uden en API-nøgle.

## Appens sider

- Overblik
- Besøgte campingpladser
- Oversigtskort – Europa eller verden
- Bedst bedømte campingpladser
- Campingpladser vi vil besøge
- Indstillinger

## Øvrige funktioner

- Opret, redigér og slet campingpladser og ønskebesøg
- Flere besøgsdatoer
- Beskrivelser, private noter og tags
- Billeder med automatisk komprimering
- Stjernevurdering i standardkategorier og egne kategorier
- Fuld visning med billeder, vurderinger, datoer, kort og cykelruter
- Tilpas tema, farver, coverbillede, forsidetekst og sektionsrækkefølge
- Luftig eller kompakt forside
- Eksport og import af JSON-sikkerhedskopi

## Lokale data

Campingpladser, billeder, vurderinger og indstillinger gemmes lokalt i browseren. Brug **Indstillinger → Hent sikkerhedskopi** for at flytte data mellem computer og tablet.

Versionen bruger samme lagernøgle som de tidligere `/docs`-udgaver, så eksisterende data migreres automatisk. Tomme koordinater bliver ikke længere fejlagtigt behandlet som punktet `0, 0`.

## Gammel cache eller hvid skærm

Åbn følgende side én gang:

`https://DIT-BRUGERNAVN.github.io/DIT-REPOSITORY/repair.html`

Reparationssiden fjerner gamle cachefiler og tidligere service workers, men bevarer campingdata i browserens lokale lager.

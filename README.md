# Vores Camping 9.0

En personlig dansk campingdagbog og scrapbog, bygget som en ren statisk webapp og klar til direkte udgivelse fra **`main`-branchens `/docs`-mappe** på GitHub Pages.

Der er ingen npm, intet build-trin, ingen database og ingen brugeroprettet GitHub Action. Appen kan derfor uploades direkte til GitHub og udgives fra `/docs`.

## Det vigtigste i version 9

- Nyt lyst og kompakt campingdesign med kortet som appens centrum.
- Hurtige handlinger øverst på forsiden: find og tilføj, nyt besøg, nyt ønske, stort kort og indstillinger.
- Stort oversigtskort på forsiden med alle besøgte campingpladser og ønskebesøg.
- Tydelige, separate markører og filtre for **Alle**, **Besøgte** og **Vil besøge**.
- Søgning efter gemte campingpladser direkte på kortet.
- Manuel online-søgning efter campingpladsens navn med udfyldning af navn, adresse, by, land og koordinater.
- Seværdigheder omkring hver campingplads med beskrivelse og valgfrit Google Maps-link.
- Billeder, besøgsdatoer, beskrivelser, vurderinger, cykelruter og fuld detaljevisning.
- Gamle data fra tidligere versioner migreres automatisk.

## Udgiv direkte fra `/docs`

1. Pak ZIP-filen ud.
2. Upload `README.md`, `START-HER.txt` og hele mappen `docs` til roden af repositoryets `main`-branch.
3. Kontrollér, at filen `docs/index.html` ligger direkte i `docs`-mappen.
4. Åbn **Settings → Pages** på GitHub.
5. Under **Build and deployment** vælger du **Deploy from a branch**.
6. Vælg **Branch: main** og **Folder: /docs**.
7. Tryk **Save**.

Siden bliver normalt tilgængelig på:

`https://DIT-BRUGERNAVN.github.io/DIT-REPOSITORY/`

## Sider

- **Overblik** – hurtige handlinger, stort kort, seneste besøg, ønsker og statistik.
- **Besøgte campingpladser** – søgning, sortering og kompakt oversigt over alle besøg.
- **Oversigtskort** – Europa- eller verdenskort med filtrering, søgning og online fund af campingpladser.
- **Bedst bedømte campingpladser** – rangliste baseret på gennemsnittet af vurderingerne.
- **Campingpladser vi vil besøge** – ønskeliste med planlagt dato og redigering.
- **Indstillinger** – tema, farver, kortudbyder, forside, cover, kategorier og sikkerhedskopi.

## Campingpladser

En campingplads kan indeholde:

- Navn, adresse, by, region og land
- Præcis placering på kortet
- Status som besøgt eller ønskebesøg
- En eller flere besøgsdatoer
- Planlagt besøgsdato
- Beskrivelse, private noter og tags
- Flere billeder med automatisk komprimering
- Seværdigheder i området
- Hjemmeside og telefonnummer
- Stjernevurderinger
- Cykelruter og delte Google Maps-links

Alle oprettelser kan efterfølgende redigeres eller slettes.

## Søg efter en campingplads

På siden **Tilføj campingplads** kan du søge efter campingpladsens navn. Vælg et søgeresultat, og appen udfylder de tilgængelige oplysninger og kortplaceringen. Oplysningerne kan altid rettes manuelt før gemning.

På **Oversigtskort** kan du:

- Filtrere allerede gemte pladser efter navn, by eller land
- Søge online efter nye campingpladser
- Tilføje et fund direkte som besøgt eller som ønskebesøg
- Skifte mellem Europa og verden
- Vise alle relevante punkter på én gang
- Bruge enhedens aktuelle placering

Online-søgning kræver internet. Den starter kun, når du trykker på søgeknappen; appen laver ikke løbende autocomplete-kald.

## Kort

Det indbyggede kort virker uden API-nøgle og bruger OpenStreetMap-kortfliser. Kortet understøtter:

- Zoom og panorering
- Automatisk tilpasning til de viste punkter
- Separate markører for besøgte og ønsker
- Punkter på samme koordinat, som spredes visuelt, så begge kan vælges
- Klik på markører for at åbne campingpladsen
- Klik på kortet ved redigering for at vælge en præcis placering
- Kort på detaljesider
- Cykelruter som punkter eller rutelinjer

Google Maps kan vælges under **Indstillinger → Kort og Google Maps**. En Google Maps API-nøgle er kun nødvendig, når selve Google-kortmotoren eller Googles præcise ruteberegning skal køre inde i appen. Almindelige Google Maps-links kan åbnes uden API-nøgle.

## Cykelruter

Under en campingplads kan du:

- Oprette en cykelrute med start, slut og mellempunkter
- Vise rutens punkter eller beregnede linje på kortet
- Gemme afstand, sværhedsgrad og beskrivelse
- Indsætte et link fra en rute, der allerede er lavet i Google Maps
- Åbne og dele det gemte Google Maps-link

Sådan gemmer du en eksisterende Google Maps-rute:

1. Opret ruten i Google Maps.
2. Vælg **Del**.
3. Vælg **Kopiér link**.
4. Indsæt linket i cykelruten i Vores Camping.

## Vurderinger

Standardkategorierne er:

- Beliggenhed
- Pris & kvalitet
- Renlighed
- Service
- Faciliteter
- Hundevenlig
- Cykelmuligheder

Under **Indstillinger** kan kategorier omdøbes, flyttes, slettes og suppleres med egne kategorier.

## Tilpasning

Under **Indstillinger** kan du blandt andet ændre:

- Appnavn og forsidetekster
- Lyst tema og accentfarver
- Kompakt eller luftig forside
- Coverbillede
- Synlige sektioner og deres rækkefølge
- Kortudbyder
- Vurderingskategorier

## Data og sikkerhedskopi

Campingdata gemmes lokalt i browseren på den enkelte enhed. Brug **Indstillinger → Hent sikkerhedskopi** og **Indlæs sikkerhedskopi** for at flytte data mellem eksempelvis Windows-computer og Samsung-tablet.

Google Maps API-nøglen bliver ikke inkluderet i sikkerhedskopien.

## Opgradering fra en ældre version

Appen forsøger automatisk at migrere tidligere campingpladser, ønsker, danske statusnavne, koordinater med dansk decimalkomma og ældre feltnavne.

Efter upload kan denne adresse åbnes én gang, hvis browseren stadig viser en gammel udgave:

`https://DIT-BRUGERNAVN.github.io/DIT-REPOSITORY/repair.html`

Reparationssiden fjerner gamle cachefiler og tidligere service workers, men beholder campingdata i browserens lokale lager.

## Gennemført kontrol

Version 9 er kontrolleret med blandt andet:

- Opstart uden JavaScript-fejl
- 3 besøgte og 2 ønskebesøg samtidigt på kortet
- Filtrering til kun besøgte, kun ønsker og alle punkter
- Søgning blandt gemte campingpladser
- Online søgeresultat med automatisk udfyldning af oplysninger og koordinater
- Oprettelse af campingplads med seværdighed og delt Google Maps-cykelrute
- Fuld detaljevisning efter lagring
- Migration af ældre data og danske koordinater
- Besøgt og ønskebesøg på nøjagtig samme koordinat
- Computer- og mobilvisning
- JavaScript-syntakskontrol af `app.js` og `maps.js`

# Vores Camping v22 – ren nybygning

Denne udgave er bygget fra bunden som en ny statisk webapp.

## Vigtigt

- Ingen kode fra de tidligere appversioner er videreført.
- Ingen automatisk migrering af gamle data.
- Appen bruger sin egen nye localStorage-nøgle: `voresCamping_clean_v22`.
- Gamle appdata bliver derfor ikke indlæst eller overtaget.
- Kun de personlige billedaktiver og Openrouteservice-referencepakken er genbrugt.

## Udgivelse på GitHub Pages

1. Pak ZIP-filen ud.
2. Upload projektets indhold til repositoryets `main`-branch.
3. Sørg for at mappen `docs/` ligger i roden.
4. Gå til **Settings → Pages**.
5. Vælg **Deploy from a branch**.
6. Vælg **main** og **/docs**.
7. Gem.

Der er ingen npm-installation, intet build-trin og ingen brugeroprettet GitHub Action.

## Første opstart

Appen starter tom for campingpladser, ruter, ferier og billeder. Personprofilerne for Stener, Vibeke/Vibse og Sisi er oprettet som personlige standarder, men kan redigeres under **Indstillinger → Elementer**.

## Openrouteservice

Indsæt API-nøglen under **Indstillinger → Ruteplanlægning**. Den separate `openrouteservice.zip` med referenceudvidelser ligger i projektets rod.

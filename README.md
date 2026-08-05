# Vores Camping – version 18

En personlig dansk campingdagbog til Stener, Vibse og Sisi. Appen er en statisk webapp til Windows-computer og Samsung-tablet og kan udgives direkte fra `main`-branchens `/docs`-mappe.

## Nyt i version 18

- En flottere og mere personlig forside med dynamisk hilsen efter tidspunktet på dagen.
- Et familieafsnit med Stener Sørensen, Vibeke “Vibse” Mejlvang og Sisi.
- Personligt campingmotto, navnevisning og fødselsoplysninger kan ændres under Indstillinger.
- Forsidekortet viser almindeligt klokkeslæt, dato og vejr ved den aktuelle placering.
- Nedtællingen er bevaret i sidemenuen og vises ikke længere over coverbilledet.
- Sisis tidligere flydende ur-widget og tilhørende ur-assets er fjernet.
- Seks globale hurtighandlinger er samlet i en fast bunddock uden dubletter.
- Hurtighandlingerne har fået seks nye, ensartede SVG-ikoner med hver sin rolige accentfarve.
- Bundmenu, kort, statistik og personlige informationskort har fået mere harmoniske farver og afstande.
- Logoet bruger en version med transparent baggrund i stedet for sort baggrund.

## Personlige standardoplysninger

- Stener Sørensen – 11. november 1952
- Vibeke Mejlvang, kaldet Vibse – 20. marts 1960
- Sisi – født i 2020

Oplysningerne kan redigeres under **Indstillinger → Familie og personligt præg**.

## Vejr

Forsiden forsøger at bruge enhedens aktuelle placering. Hvis placering ikke er tilgængelig, bruges en gemt campingplads som reserveposition. Vejrvisningen kan slås fra under Indstillinger.

## Teknisk opbygning

- Ingen database eller server.
- Ingen npm-installation.
- Intet build-trin.
- Ingen brugeroprettet GitHub Action.
- Data gemmes lokalt i browseren.
- API-nøgler gemmes separat og udelades fra backupfiler.
- Hash-navigation forebygger 404-fejl ved navigation i appen.
- Tidligere appdata forsøges automatisk migreret til version 18.

## Centrale filer

- `docs/index.html` – appens indgangspunkt.
- `docs/app.js` – sider, data, navigation, personlige tekster, ur og vejr.
- `docs/maps.js` – MapLibre, markører, kort og ruteeditor.
- `docs/ors.js` – Openrouteservice/HeiGIT-integration.
- `docs/styles.css` – layout, farver og responsivitet.
- `docs/manifest.webmanifest` – installation som webapp.
- `docs/assets/` – logo, ikoner og illustrationer.
- `docs/github-guide.html` – GitHub Pages-guide i appen.

## Udgivelse

1. Kopiér projektets `docs`-mappe til roden af GitHub-repositoryet.
2. Gem ændringerne på `main`-branchen.
3. Åbn **Settings → Pages**.
4. Vælg **Deploy from a branch**.
5. Vælg **main** og **/docs**.
6. Tryk **Save**.

Se også [GITHUB-GUIDE.md](GITHUB-GUIDE.md).

## Openrouteservice

Indsæt din egen nøgle under **Indstillinger → Kort og API-nøgler**. Nøglen gemmes kun lokalt på enheden.

## Backup

Eksportér jævnligt en JSON-sikkerhedskopi fra Indstillinger. API-nøgler medtages ikke i backupfilen.

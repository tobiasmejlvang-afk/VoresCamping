# Vores Camping – version 16

En personlig dansk campingdagbog til Windows-computer og Samsung-tablet. Appen er en statisk webapp, som kan udgives direkte fra `main`-branchens `/docs`-mappe.

## Nyheder i version 16

- Finpudset og mere personligt forside-layout med en kompakt **Campingpuls**.
- Nyt hovedlogo og nye visuelle hurtig-handlingsknapper.
- Sisis ur vises som standard kun på forsiden.
- Sisi og uret kan låses, låses op, flyttes og placeres i alle fire hjørner.
- Størrelse, afstand fra kanter, gennemsigtighed, taleboble og turtekst kan tilpasses.
- Sisi har rolige, glade og ekstra utålmodige animationer.
- Animationen kan automatisk blive mere ivrig, når campingturen nærmer sig.
- Klik på Sisi kan udløse et lille jubelhop.
- Udvidet cykelruteeditor med rutetype, profil, underlag, pausetid, højdepunkter og ekstra noter.
- GPX-eksport, ruteduplikering, deling, højdedata, isokroner og POI-søgning.
- Flere indstillinger til kort, layout, billeder, ruter og forside-widget.
- Indbygget trin-for-trin guide til GitHub Pages.

## Teknisk opbygning

- Ingen database eller server.
- Ingen npm-installation.
- Intet build-trin.
- Ingen brugeroprettet GitHub Action.
- Data gemmes lokalt i browseren.
- API-nøgler gemmes separat og udelades fra backupfiler.
- Hash-navigation forebygger 404-fejl ved navigation i appen.
- Tidligere appdata forsøges automatisk migreret til version 16.

## Centrale filer

- `docs/index.html` – appens indgangspunkt.
- `docs/app.js` – sider, data, navigation, formularer og funktioner.
- `docs/maps.js` – MapLibre, markører, kort og ruteeditor.
- `docs/ors.js` – Openrouteservice/HeiGIT-integration.
- `docs/styles.css` – layout, tema, responsivitet og Sisi-animationer.
- `docs/manifest.webmanifest` – installation som webapp.
- `docs/assets/` – logo, ur, Sisi, ikoner og illustrationer.
- `docs/github-guide.html` – guide, der også kan åbnes fra Indstillinger.
- `GITHUB-GUIDE.md` – samme guide i tekstformat.

## Udgivelse

Læs [GITHUB-GUIDE.md](GITHUB-GUIDE.md). Den korte opskrift er:

1. Læg projektets `docs`-mappe i roden af repositoryet.
2. Gem ændringerne på `main`-branchen.
3. Åbn **Settings → Pages**.
4. Vælg **Deploy from a branch**.
5. Vælg **main** og **/docs**.
6. Tryk **Save**.

## Openrouteservice

Indsæt din egen nøgle under **Indstillinger → Kort og API-nøgler**. Test forbindelsen med knappen **Test Openrouteservice**. Nøglen gemmes kun lokalt på den enhed, hvor den indtastes.

## Backup

Eksportér jævnligt en JSON-sikkerhedskopi fra Indstillinger. Billeder komprimeres automatisk, men browserens lokale lager er ikke uendeligt – den campingvogn kan også blive overpakket.

## Test

Se [TEST-RAPPORT.md](TEST-RAPPORT.md) for den gennemførte fil- og funktionstest.

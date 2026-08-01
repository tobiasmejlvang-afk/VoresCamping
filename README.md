# Vores Camping – GitHub Pages fra `/docs`

Dette projekt er en statisk dansk campingapp, som kan udgives direkte fra `main`-branchens `/docs`-mappe.

## Udgivelse på GitHub

1. Opret eller åbn dit GitHub-repository.
2. Upload **README.md**, **START-HER.txt** og hele mappen **docs** til roden af `main`.
3. Åbn **Settings → Pages**.
4. Under **Build and deployment** vælger du:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/docs**
5. Tryk **Save** og vent et par minutter.

Der bruges ingen brugeroprettet GitHub Action, ingen npm, ingen build-kommando og ingen service worker.

## Vigtigt om filer

`docs/index.html` skal ligge præcis i `/docs` på `main`. Upload ikke kun filerne inde i mappen til repository-roden, hvis Pages er sat til `/docs`.

## Google Maps

Appen bruger Google Maps-links og indlejrede kort uden en API-nøgle. Campingpladser findes ud fra navn/adresse, og cykelruter åbnes med `travelmode=bicycling` i Google Maps.

## Data og billeder

Data gemmes lokalt i browseren på den enkelte enhed. Billeder komprimeres automatisk. Brug **Indstillinger → Hent sikkerhedskopi** for at flytte data mellem Windows og Samsung-tablet.

## Hvis en gammel version sidder fast

Åbn én gang:

`https://DIT-BRUGERNAVN.github.io/DIT-REPOSITORY/repair.html`

Siden fjerner gamle cachefiler og service workers, men bevarer appens lokale data.

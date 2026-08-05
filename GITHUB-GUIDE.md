# Udgiv Vores Camping v16 på GitHub Pages

Denne guide bruger GitHub Pages med `main`-branchens `/docs`-mappe. Der skal ikke oprettes en GitHub Action.

## A. Opdatér et eksisterende repository

1. Pak `Vores-Camping-v16.zip` ud på computeren.
2. Åbn dit eksisterende repository på GitHub.
3. Gå ind i repositoryets nuværende `docs`-mappe.
4. Fjern de gamle appfiler i `docs`, hvis de skal erstattes helt.
5. Upload **indholdet** af den nye `docs`-mappe, så strukturen bliver:

```text
docs/
├── index.html
├── app.js
├── maps.js
├── ors.js
├── styles.css
├── manifest.webmanifest
├── github-guide.html
├── .nojekyll
└── assets/
```

6. Vælg **Commit directly to the main branch**.
7. Skriv eksempelvis commit-beskeden `Opdater Vores Camping til version 16`.
8. Tryk **Commit changes**.

## B. Aktivér GitHub Pages

1. Åbn repositoryets **Settings**.
2. Vælg **Pages** i menuen til venstre.
3. Find **Build and deployment**.
4. Vælg **Deploy from a branch** under **Source**.
5. Vælg branchen **main**.
6. Vælg mappen **/docs**.
7. Tryk **Save**.
8. Vent, mens GitHub udgiver siden. GitHub oplyser, at en ændring kan bruge op til cirka 10 minutter på at blive synlig.
9. Åbn adressen, som GitHub viser øverst på Pages-siden.

## C. Første kontrol efter udgivelse

Kontrollér følgende:

- Forsiden åbner uden hvid skærm.
- Logoet vises i venstre menu.
- Sisi og uret vises kun på forsiden.
- Hurtigknapperne åbner de rigtige sider.
- Kortet indlæses.
- Du kan åbne Indstillinger.
- Eksport af backup virker.

## D. Indsæt Openrouteservice-nøglen

1. Åbn den udgivne app.
2. Gå til **Indstillinger**.
3. Find **Kort og API-nøgler**.
4. Indsæt Openrouteservice-nøglen.
5. Tryk **Test Openrouteservice**.
6. Tryk **Gem kort og nøgler**.

Nøglen skal ikke skrives direkte ind i `app.js`, `ors.js` eller andre filer i repositoryet. Den gemmes lokalt i browseren og følger ikke med backupfilen.

## E. Når appen opdateres senere

1. Tag en backup fra den gamle app først.
2. Erstat filerne i `docs` med filerne fra den nye version.
3. Commit til `main`.
4. GitHub Pages udgiver automatisk ændringen fra den valgte `/docs`-mappe.
5. Genindlæs appen med `Ctrl + F5`, hvis browseren viser en gammel version.

## Fejlfinding

### GitHub viser 404

Kontrollér, at:

- Pages-kilden er **main /docs**.
- Filen ligger som `docs/index.html` og ikke som `docs/docs/index.html`.
- `docs`-mappen ikke er blevet slettet eller omdøbt.
- ændringerne faktisk er committed til `main`.

### Appen viser en gammel version

- Brug `Ctrl + F5`.
- Luk appen helt og åbn den igen.
- Kontrollér committen i GitHub.
- Vent nogle minutter og prøv igen.

### Kort eller ruter virker ikke

- Kontrollér internetforbindelsen.
- Kontrollér Openrouteservice-nøglen i Indstillinger.
- Tryk **Test Openrouteservice**.
- Appens almindelige kort kan stadig fungere uden ORS-nøgle, men online søgning og udvidet ruteberegning kræver nøglen.

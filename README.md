# Vores Camping v21

En personlig dansk campingdagbog til Stener, Vibeke og Sisi. Appen er en statisk webapp, som kan udgives direkte fra `main`-branchens `/docs`-mappe på GitHub Pages.

## Centrale funktioner

- Campingpladser, besøg, ønsker og ranglister
- MapLibre/OpenFreeMap-kort
- Openrouteservice-ruteplanlægning
- Cykelruter med flere cykler, elcykler og batterirækkevidde
- Ferie Vagten
- Ferie Album med automatisk organisering
- Personer, gæster, campister, dyr og ejere
- Lokale billeder og sikkerhedskopier
- Omfattende indstillingscenter

## Udgivelse på GitHub Pages

1. Pak ZIP-filen ud.
2. Upload indholdet af projektmappen til dit repository.
3. Sørg for, at `docs/index.html` ligger i `main`-branchens `/docs`-mappe.
4. Åbn **Settings → Pages** på GitHub.
5. Vælg **Deploy from a branch**, `main` og `/docs`.
6. Gem og vent på udgivelsen.

Der kræves ingen npm-installation, intet build-trin og ingen brugeroprettet GitHub Action.

## Nyt app-ikon på tablet

Hvis appen allerede er installeret på tabletten, kan det gamle ikon være gemt i enhedens cache. Fjern den installerede genvej/app og installer den igen fra GitHub Pages, så `icon-192-v21.png` og `icon-512-v21.png` bliver brugt.

## API-nøgle

Openrouteservice-nøglen indtastes under **Indstillinger → Ruteplanlægning**. Nøglen gemmes kun lokalt og fjernes fra eksporterede sikkerhedskopier.

# Vores Camping v19

En personlig dansk campingdagbog til Windows og Samsung-tablet. Appen er statisk og kan udgives direkte fra `main`-branchens `/docs`-mappe uden npm, build-trin eller GitHub Actions.

## Nyt i version 19

- Fast bundmenu med alle hurtighandlinger og nedtælling uden at overlappe hovedindholdet.
- Samlet indstillingscenter med 10 undersider.
- Personer og dyr kan oprettes som campister, familie, gæster, andre campister, kæledyr og kæledyrsejere.
- Cykler kan oprettes med type og ejer.
- Cykelruter understøtter dato, flere deltagere, flere cykler og elcykler.
- Elcykel-rækkevidde ved start og slut vælges i intervaller på fem minutter for hver valgt elcykel.
- Billeder kan tilføjes til hele ruten og til hvert enkelt stop.
- Sektioner kan flyttes, og stemningsbilleders placering kan vælges pr. side.
- Openrouteservice-klienten er udvidet med struktureret søgning, elcykelprofil, matrix, isokroner, snap, højdedata, POI og optimering.

## Udgivelse

1. Upload indholdet af `docs/` til repositoryets `docs/`-mappe.
2. Vælg **Settings → Pages → Deploy from a branch**.
3. Vælg `main` og `/docs`.
4. Gem og genindlæs siden med `Ctrl + F5` efter udgivelse.

## Openrouteservice

Indsæt din egen nøgle under:

**Indstillinger → Ruteplanlægning & Kort**

Nøglen gemmes lokalt og udelades fra backupfiler. `openrouteservice.zip` indeholder de oprindelige svar-eksempler samt nye v19-skabeloner og profilguide.

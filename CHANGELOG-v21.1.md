# Ændringslog – Vores Camping v21.1

## Kritisk fejlrettelse

Version 21 startede appen, før de nye v21-indstillinger og menuer var initialiseret. Den nye menu forsøgte derfor at bruge `state.settings.menuOrder`, mens værdien stadig manglede. Resultatet var en JavaScript-fejl og en tom eller delvist indlæst hovedside.

## Rettet

- Appens opstart er flyttet til slutningen af `app.js`, efter alle v21-udvidelser er initialiseret.
- For tidlige kald til `renderRoute()` og `applyThemeVars()` er fjernet.
- `hashchange`- og klik-events registreres nu først, når den endelige v21-router er klar.
- Import og migrering af ældre sikkerhedskopier opretter nu automatisk manglende v21-indstillinger:
  - menurækkefølge
  - skjulte menupunkter
  - UI- og panelindstillinger
  - coverindstillinger
  - Ferie Vagten
  - Ferie Album
  - kort-, rute- og vurderingsikoner
- CSS- og JavaScript-referencer har fået versionsnummer `21.1`, så GitHub Pages og browseren ikke genbruger den defekte cache.
- PWA-/tabletikonet har fået nye filnavne med `v21.1` for at bryde gammel ikoncache.
- Gamle ændringslogfiler er ryddet ud af ZIP-mappens rod.

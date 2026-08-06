# Sådan retter du GitHub Pages

GitHub Pages-status i repositoryet stod som `errored / Page build failed`.

1. Slet den nuværende `docs/`-mappe i repositoryet.
2. Upload hele `docs/`-mappen fra denne ZIP.
3. Kontrollér særskilt, at filen `docs/.nojekyll` findes på GitHub.
4. Vent mindst 10 minutter uden flere uploads.
5. Åbn `https://tobiasmejlvang-afk.github.io/VoresCamping/status.html`.
6. Når statussiden virker, åbn hovedappen.

Hvis GitHub-webupload ikke viser `.nojekyll`, opret filen manuelt med **Add file → Create new file** og skriv filnavnet `docs/.nojekyll`. Filen må være tom.

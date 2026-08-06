# TEST-RAPPORT – Vores Camping v20.1

## Beståede kontroller

- JavaScript-syntaks kontrolleret med Node.js.
- Manifest valideret som gyldig JSON.
- Alle lokale filer i `index.html` findes.
- Openrouteservice-ZIP testet uden komprimeringsfejl.
- Ferie-Vagt, albumfiltre, favoritter, billedtekster, lightbox og albumeksport findes i koden.
- Versionsstyret cache-reference opdateret til v20.1.
- Tidligere browserdata fra v20, v19 og ældre forsøges automatisk indlæst.

## Begrænsning

Det isolerede Chromium-miljø afsluttede ikke en stabil visuel renderingstest. Live kort, geoplacering, vejret og Openrouteservice skal derfor slutkontrolleres efter upload til GitHub Pages. JavaScript-syntaks og filstrukturen er kontrolleret lokalt.

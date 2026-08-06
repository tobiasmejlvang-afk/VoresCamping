# Testrapport – Vores Camping v22

## Kontroller udført

- `docs/app.js`: JavaScript-syntaks godkendt med Node.
- `docs/maps.js`: JavaScript-syntaks godkendt med Node.
- `docs/ors.js`: JavaScript-syntaks godkendt med Node.
- `manifest.webmanifest`: gyldig JSON.
- Alle statiske lokale asset-referencer kontrolleret.
- ZIP-struktur kontrolleret.
- Ingen henvisninger til gamle localStorage-nøgler.
- Ingen migrationskode fra ældre versioner.
- Ingen hardkodet Openrouteservice API-nøgle.

## Browserbemærkning

Det isolerede Chromium-miljø i arbejdscontaineren kunne ikke afslutte en stabil headless rendering og hang på miljøets D-Bus/zygote-lag. Derfor er der ikke vedlagt en falsk visuel browsergodkendelse. Den endelige livekontrol af kort, geolocation, vejr og Openrouteservice bør foretages efter upload til GitHub Pages.

# Google-anmeldelser – oppsett

Forsiden har nå et grensesnitt for inntil tre ekte Google-anmeldelser i høyre kolonne for hver av de ti byene. Den henter fra `/api/reviews?clinic=...&city=...` og viser en ærlig fallback hvis endepunktet ikke finnes.

**Ikke aktivert:** Det finnes foreløpig ingen API-nøkkel eller publisert backend i denne endringen.

`google-reviews-worker.js` er et Cloudflare Worker-utgangspunkt som må kobles til nettstedets faktiske Worker-ruting, ikke bare legges som en statisk JS-fil. Opprett en Google Cloud-prosjekt med fakturering og Places API (New). Lag en API-nøkkel med API-begrensning og lagre den som Cloudflare Worker-secret `GOOGLE_PLACES_API_KEY`. Aldri legg den i GitHub eller HTML. Konfigurer ruten `/api/reviews` og test på publisert domene. Se også etter at Worker ikke overskriver nettstedets øvrige statiske ruter.

**Før produksjon:** Verifiser korrekt Place ID for hver klinikk. Eksempel-Worker gjør et forsiktig navne- og bysøk og returnerer ingen anmeldelser ved tvetydig treff. For produksjon anbefales en eksplisitt Place ID-liste. Sjekk Googles Places API-vilkår, attribusjon, visning av originale anmeldelser, cache- og lagringsregler, kvoter og kostnader. Sett budsjettgrenser og rate limiting. Places API (New) gir maks fem anmeldelser sortert etter **relevans**, ikke garantert de nyeste. Grensesnittet viser maksimalt tre av disse og krediterer anmelder samt lenker til originalen.

Kilder:
- https://developers.google.com/maps/documentation/places/web-service/place-details
- https://developers.google.com/maps/documentation/places/web-service/policies

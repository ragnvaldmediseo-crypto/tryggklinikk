# Tryggklinikk – prototype

Statisk forside og forum med Supabase Auth/Postgres.

## Publisering
Last opp **innholdet** i denne mappen til roten av GitHub-repositoryet, slik at `index.html` og `forum.html` ligger øverst. Koble GitHub til Cloudflare Pages, med tom build command og `/` som output directory.

## Aktiver forumet
1. Opprett et Supabase-prosjekt på https://supabase.com/dashboard.
2. Kjør `supabase.sql` i SQL Editor (kun i et nytt prosjekt).
3. Under Authentication → Providers → Email: aktiver e-postregistrering og e-postbekreftelse. Konfigurer SMTP for produksjon.
4. Under Authentication → URL Configuration: sett Site URL til den publiserte adressen, og legg til tillatte Redirect URLs.
5. Kopier Project URL og **publishable/anon** key til `config.js` (ALDRI secret/service_role key).
6. Publiser endringene. Test registrering, e-postbekreftelse, innlogging, tråd og svar.

Brukernavn må være unike. Hvis registrering feiler på opptatt brukernavn eller ugyldig navn, vises Supabase-feil. Ingen reelle klinikkvurderinger eller aktive tilbud er verifisert i prototypen.

## Før offentlig lansering
Forumet mangler modereringspanel, rapporteringsfunksjon, antispam/rate limiting, kontosletting, GDPR-prosesser og rutiner for helsedata. Hold forumet i lukket test frem til dette er implementert. Ikke bruk reelle pasientopplysninger i test.

# Guida al Deploy su Vercel

Hai un'applicazione React moderna, protetta da password e pronta per il cloud. Ecco come metterla online.

## 1. Carica su GitHub
Hai già inizializzato il repository locale. Ora devi inviarlo a GitHub.

1.  Crea un **Nuovo Repository** su GitHub (chiamalo `cosmonet-optimizer`).
2.  Esegui questi comandi nel terminale (sostituisci `TUO_UTENTE` con il tuo username):

```bash
git remote add origin https://github.com/TUO_UTENTE/cosmonet-optimizer.git
git branch -M main
git push -u origin main
```

## 2. Collega a Vercel
1.  Vai su [Vercel Dashboard](https://vercel.com/dashboard).
2.  Clicca **"Add New..."** -> **"Project"**.
3.  Seleziona il repository `cosmonet-optimizer` che hai appena creato.

## 3. Configura le Variabili d'Ambiente (IMPORTANTE)
Nella schermata di configurazione di Vercel, trova la sezione **Environment Variables** e aggiungi queste chiavi (le stesse che trovi nel tuo file `.env.local` che non viene caricato su git per sicurezza):

| Nome Variabile | Valore |
| :--- | :--- |
| `VITE_APP_PASSWORD` | La password che vuoi usare per accedere (es. `cosmo2026`) |
| `GEMINI_API_KEY` | La tua chiave API di Google Gemini |
| `VITE_SUPABASE_URL` | L'URL del tuo progetto Supabase (opzionale se non lo usi subito) |
| `VITE_SUPABASE_ANON_KEY` | La chiave anonima di Supabase (opzionale se non lo usi subito) |

## 4. Deploy
Clicca su **Deploy**. Vercel costruirà il sito e ti darà un link pubblico in pochi secondi.

---

### Database (Opzionale per ora)
Il codice è già pronto per Supabase. Se vuoi attivarlo:
1. Crea un progetto su [Supabase](https://supabase.com).
2. Esegui questo comando SQL nell'Editor SQL di Supabase per creare la tabella:

```sql
create table articles (
  id text primary key,
  title text,
  original_text text,
  full_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```
3. Copia URL e ANON KEY nelle variabili d'ambiente di Vercel come spiegato sopra.

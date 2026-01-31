# Nebula SEO - AI Content Optimizer

![Nebula SEO Login Screen](https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop)

**Nebula SEO** è un'applicazione avanzata basata su IA per ottimizzare, arricchire e formattare articoli per il web. Utilizza Google Gemini 2.5 Flash per analizzare i testi, correggere errori SEO, generare metadati e cercare fonti autorevoli in tempo reale.

## ✨ Funzionalità Principali

*   **Ottimizzazione SEO Automatica**: Corregge la struttura, i tag HTML (H2, H3), e migliora la leggibilità.
*   **Arricchimento Intelligente**: Cerca sul web fonti reali e inserisce link contestuali pertinenti.
*   **Gestione in Batch**: Elabora code di articoli (fino a 4 in parallelo).
*   **Archivio Cloud**: Salva i tuoi articoli su Supabase per accedervi da ovunque.
*   **Analisi SEO**: Checklist automatica per verificare title, meta description, slug e altro.
*   **Login Sicuro**: Accesso protetto da password.

## 🚀 Tecnologie

*   **Frontend**: React 19, Vite, TailwindCSS
*   **AI Engine**: Google Gemini 2.5 Flash (via `google-genai` SDK)
*   **Database**: Supabase
*   **Deploy**: Vercel

## 🛠️ Installazione Locale

1.  Clona il repository:
    ```bash
    git clone https://github.com/CosmoNetinfo/Nebula-SEO.git
    cd Nebula-SEO
    ```

2.  Installa le dipendenze:
    ```bash
    npm install
    ```

3.  Crea un file `.env.local` nella root del progetto e aggiungi le tue chiavi:
    ```env
    GEMINI_API_KEY=tua_chiave_gemini
    VITE_APP_PASSWORD=tua_password_accesso
    VITE_SUPABASE_URL=tuo_url_supabase
    VITE_SUPABASE_ANON_KEY=tua_chiave_anon_supabase
    ```

4.  Avvia il server di sviluppo:
    ```bash
    npm run dev
    ```

## 🌐 Deploy

Questo progetto è ottimizzato per **Vercel**.

1.  Collega il repository a Vercel.
2.  Imposta `Output Directory` su `build_output`.
3.  Aggiungi le variabili d'ambiente nelle impostazioni di Vercel.

---

**CosmoNet** © 2026 - *Ad Astra Per Aspera*

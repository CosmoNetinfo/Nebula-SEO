# 📋 PROJECT HISTORY - Nebula SEO

## 🎯 Obiettivo del Progetto
**Nebula SEO** è un'applicazione web AI-powered per ottimizzare articoli per il web, generare metadati SEO, e arricchire contenuti con fonti autorevoli in tempo reale.

---

## 🛠️ Stack Tecnologico

### Frontend
- **React 19** - UI Framework
- **Vite 6** - Build Tool & Dev Server
- **Tailwind CSS v3** - Styling (Monochrome OLED Theme)
- **TypeScript** - Type Safety

### AI Engines (Multi-Model Support)
- **Google Gemini 1.5 Flash** - Primario per l'Ultra-Espansione (Zero-Loss)
- **OpenAI GPT-4o** - Supporto alternativo via User API Key
- **Anthropic Claude 3.5 Sonnet** - Supporto alternativo via User API Key
- **Groq (Llama 3.3 70B)** - Fallback ultra-veloce

### Backend & Services
- **Supabase** - Database PostgreSQL per persistenza articoli e sincronizzazione chiavi API (Cloud Sync)
- **Vercel** - Hosting & Deploy automatico

---

## 🚀 Funzionalità Implementate

### 1. **Ultra-Espansione SEO (Proprietary Prompts)**
- **Zero-Loss Integrity**: Ordine tassativo di non riassumere mai.
- **Target 125%+: Multi-step expansion** per trasformare bozze brevi in articoli approfonditi (1800+ parole).
- **HTML Semantico**: Struttura professionale (H2, H3, liste, strong).
- **Readability Core**: Ottimizzazione per punteggio leggibilità >95% (Italiano).

### 2. **Gestione Chiavi API (BYOK - Bring Your Own Key)**
- **Settings Modal (⚙️)**: Gli utenti inseriscono le proprie chiavi Gemini/OpenAI/Claude nell'app.
- **Dimentica Vercel**: Non è più necessario aggiungere variabili d'ambiente manualmente per ogni chiave AI.
- **Preferenza Engine**: Selezione del modello AI preferito salvata nel profilo.

### 3. **Account-Based Cloud Sync**
- **User Association**: Articoli e impostazioni sono legati all'ID utente (derivato dal login).
- **Cloud Sync (Supabase)**: Le chiavi e le preferenze vengono salvate nel database e ricaricate automaticamente su ogni dispositivo.

### 4. **Gestione Batch & SEO Analysis**
- Elabora fino a 4 articoli in parallelo.
- **Efficiency Tracker**: Analisi visiva della crescita del contenuto (originale vs ottimizzato).
- **SEO Checklist & Metadati**: Generazione automatica di Title, Meta, Slug, Tag e Post Social.

---

## 🐛 Problemi Risolti Recentemente

### 1. **Content Shortening**
**Problema:** I modelli AI (specialmente Groq) tendevano a riassumere invece di espandere.
**Soluzione:** Passaggio a Gemini 1.5 Flash (temperature 0.9) con prompt di sistema "Ultra-Expander" ultra-aggressivi.

### 2. **Configurazione Variabili Vercel**
**Problema:** Difficoltà per l'utente finale nel gestire le chiavi API via Vercel Dashboard.
**Soluzione:** Spostato il controllo nell'app tramite `SettingsModal` e sincronizzazione Supabase.

### 3. **Sincronizzazione Multi-Dispositivo**
**Problema:** Le chiavi salvate in localStorage andavano perse cambiando browser.
**Soluzione:** Implementata la tabella `user_settings` su Supabase per il backup cloud automatico legato all'account.

---

## 📊 Database Schema (Supabase - Aggiornato v3.0)

### Tabella: `articles`
```sql
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT,
  original_text TEXT,
  full_json JSONB,
  user_id TEXT, -- Nuovo: Associazione all'utente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Tabella: `user_settings`
```sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY,
  settings JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 📝 Changelog

- **v3.0.0 (1 Febbraio 2026)** - **Multi-AI & Personal Key Control**:
  - Supporto per **Gemini 1.5 Flash**, **OpenAI GPT-4o**, **Claude 3.5 Sonnet**.
  - introdotto il pannello **⚙️ IMPOSTAZIONI API**.
  - Sincronizzazione Cloud delle chiavi e preferenze via Supabase.
  - Associazione automatica articoli/impostazioni all'account utente.
  - Rafforzamento dei prompt per l'espansione testo (>125% lunghezza).

- **v2.5.0** - **Groq Engine Integration**: Migrazione a Groq (Llama 3.3). Ridenominazione service in `aiService.ts`.

- **v2.1.0** - **Monochrome UI**: Introduzione del tema OLED Black e supporto Light/Dark Mode.

---

## 👤 Autore & Contatti
**Progetto:** Nebula SEO  
**Sviluppato per:** CosmoNet (https://www.cosmonet.info/)  
**Versione:** 3.0.0 (Expansion Engine Edition - 1 Febbraio 2026)

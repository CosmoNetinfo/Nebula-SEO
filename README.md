# ✨ Nebula SEO - AI Content Optimizer
> **L'Architetto Cosmico per i tuoi Contenuti Web**

![Nebula SEO Banner](https://img.shields.io/badge/Status-Stable_v2.0-blueviolet?style=for-the-badge&logo=rocket)
![Tech Stack](https://img.shields.io/badge/Stack-React_19_•_Gemini_2.0_•_Supabase-indigo?style=for-the-badge)
![License](https://img.shields.io/badge/License-Proprietary-slate?style=for-the-badge)

**Nebula SEO** è una piattaforma avanzata per l'ottimizzazione editoriale che combina la potenza di **Google Gemini 2.0 Flash** con un'interfaccia **Glassmorphism** di ultima generazione. Progettata per content creator, SEO specialist e redazioni digitali, trasforma bozze grezze (generate da AI come Perplexity o scritte a mano) in articoli perfettamente formattati, ottimizzati per i motori di ricerca e arricchiti con fonti autorevoli.

---

## 🌌 Perché Nebula SEO?

Il web writing moderno richiede velocità e precisione. Nebula SEO risolve tre problemi critici:
1.  **Il "Muro di Testo"**: Le AI generiche producono testi piatti. Nebula ristruttura automaticamente inserendo H2, H3, liste puntate e grassetti strategici.
2.  **L'Allucinazione delle Fonti**: A differenza di altri tool, Nebula verifica e inserisce link contestuali reali tramite Google Search Grounding.
3.  **Il Collo di Bottiglia**: La coda di elaborazione batch permette di lavorare su 4 articoli simultaneamente, quadruplicando la produttività.

---

## 🚀 Funzionalità Stellari

### 1. ⚡ Ottimizzazione Intelligente (Smart Rewriting)
Il cuore del sistema. L'IA analizza il testo in entrata e applica oltre **20 regole editoriali** in tempo reale:
*   **Correzione Ripetizioni**: Elimina l'inizio di frase ripetitivo (es. evitare 3 frasi di fila che iniziano con "Inoltre").
*   **HTML Semantico**: Genera automaticamente una struttura gerarchica (`<h2>`, `<h3>`, `<ul>`, `<strong>`).
*   **Tone of Voice**: Adatta lo stile rendendolo professionale ma coinvolgente ("Human-like").
*   **Metadati Completi**: Genera automaticamente Title Tag (60 caratteri), Meta Description (160 caratteri), Slug URL, Focus Keyword e Tag CSV.

### 2. 🔗 Arricchimento Fonti (Source Grounding)
Non solo forma, ma sostanza. La funzione **"Aumenta Profondità"**:
*   Esegue ricerche live su Google per trovare fonti autorevoli correlate.
*   Inserisce link esterni contestuali naturali nel testo.
*   Aggiunge una sezione "Fonti e Approfondimenti" a fine articolo.

### 3. 📦 Coda Batch Parallela (Multi-Threading)
Nebula SEO non ti fa aspettare.
*   **Capacità**: Carica fino a 50 articoli in coda.
*   **Concorrenza**: Elabora **4 articoli contemporaneamente**.
*   **Status Tracking**: Monitora visivamente lo stato (In Coda ➔ Elaborazione ⚡ ➔ Completato ✓).

### 4. ☁️ Archivio Cosmico (Supabase Integration)
Un database cloud persistente per i tuoi lavori.
*   **Salvataggio Automatico**: Mai più lavoro perso.
*   **Capacità**: Gestisce oltre 50.000 articoli.
*   **Sincronizzazione**: Accedi ai tuoi articoli da qualsiasi dispositivo.

### 5. 🎨 Interfaccia "Deep Space" v2.0
Un'esperienza utente immersiva progettata per lunghe sessioni di lavoro.
*   **Glassmorphism Premium**: Pannelli semitrasparenti con blur e shadow multi-livello.
*   **Animazioni Micro-Interattive**: Feedback visivo su ogni click, hover e caricamento.
*   **Focus Mode**: Layout ultra-compatto per massimizzare lo spazio di scrittura su una singola schermata.

---

## 📖 Guida all'Utilizzo Passo-Passo

### Passo 1: Inserimento del Contenuto
1.  Nel pannello di sinistra **"NUOVO ARTICOLO"**, incolla il testo grezzo.
2.  Può essere un output di ChatGPT/Perplexity o una tua bozza. Non preoccuparti della formattazione.
3.  Clicca sul pulsante gradient **"AGGIUNGI ALLA CODA BATCH"**.

### Passo 2: Elaborazione
1.  L'articolo appare immediatamente nel pannello destro **"CODA DI ELABORAZIONE"**.
2.  Premi **"OTTIMIZZA TUTTI"** se hai più articoli, o attendi l'auto-start della coda.
3.  L'IA Gemini elaborerà il testo (tempo medio: 15-20 secondi per articolo di 2000 parole).

### Passo 3: Review e Arricchimento
1.  Clicca sull'articolo completato nella coda (contrassegnato dalla spunta verde ✓).
2.  Al centro apparirà l'editor con due tab: **Preview** (visuale) e **Source Code** (HTML).
3.  Se vuoi aggiungere fonti, clicca sul pulsante **"✨ Aumenta Profondità"**. L'IA cercherà link pertinenti e li integrerà.

### Passo 4: Export e Pubblicazione
1.  Controlla i metadati generati nella colonna di destra (Titolo SEO, Slug, Description).
2.  Usa il pulsante **"Copia HTML"** per incollare direttamente nell'editor "Testo" di WordPress.
3.  Oppure clicca **"Salva nel Database"** per archiviarlo su Nebula per dopo.

---

## 🛠️ Specifiche Tecniche per Sviluppatori

Se stai scrivendo un articolo tecnico, ecco cosa c'è "sotto il cofano":

| Componente | Tecnologia | Descrizione |
|------------|------------|-------------|
| **Frontend** | React 19 + Vite | Rendering ultra-veloce e State management ottimizzato. |
| **Styling** | Tailwind CSS v3 | Design System custom con variabili CSS per effetti Glass/Neon. |
| **AI Core** | Google Gemini 2.0 Flash | Modello multimodale a bassa latenza, ideale per task testuali rapidi. |
| **Database** | Supabase (PostgreSQL) | Backend-as-a-Service per persistenza dati, RLS policies e auth. |
| **Deploy** | Vercel | Edge Network global deployment per latenza zero. |

---

## 🌟 Roadmap Futura

*   🔌 **WordPress Direct Connect**: Pubblicazione diretta tramite API XML-RPC/REST.
*   🖼️ **AI Image Generation**: Creazione automatica copertine articolo (Midjourney/DALL-E).
*   📊 **SEO Score**: Analisi keyword density e leggibilità in tempo reale.
*   🌍 **Multi-language**: Traduzione e adattamento culturale automatico.

---

> *"Ad Astra Per Aspera" - Verso le stelle attraverso le difficoltà.*
>
> **Sviluppato da:** CosmoNet Labs  
> **Versione Corrente:** 2.0.0 (UI Ultra-Compact)

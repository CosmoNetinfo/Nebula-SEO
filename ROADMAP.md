# 🚀 ROADMAP - Nebula SEO

## Versione Attuale: 1.0.0 ✅

### Funzionalità Implementate
- ✅ Ottimizzazione SEO automatica con Gemini 2.5 Flash
- ✅ Arricchimento articoli con Google Search
- ✅ Gestione batch (4 articoli paralleli)
- ✅ Database cloud (Supabase)
- ✅ Autenticazione client-side
- ✅ UI/UX premium con tema spaziale
- ✅ Deploy su Vercel
- ✅ Tailwind CSS production-ready

---

## 📅 Versione 1.1.0 - WordPress Integration (Priorità: ALTA)

### Obiettivo
Pubblicare articoli direttamente su WordPress dal pannello Nebula SEO.

### Task
1. [ ] Creare `services/wordpressService.ts`
2. [ ] Aggiungere variabili ambiente:
   - `VITE_WORDPRESS_URL`
   - `VITE_WORDPRESS_APP_PASSWORD`
3. [ ] Implementare funzione `publishToWordPress(article, status)`
   - Parametri: `draft` o `publish`
   - Endpoint: `/wp-json/wp/v2/posts`
4. [ ] Aggiungere pulsante "Pubblica su CosmoNet" in `SeoOutput.tsx`
5. [ ] Gestire upload immagini featured (opzionale)
6. [ ] Testare pubblicazione con categorie e tag

### Stima Tempo: 3-4 ore

---

## 📅 Versione 1.2.0 - AI Image Prompts (Priorità: MEDIA)

### Obiettivo
Generare prompt professionali per Midjourney/DALL-E/Ideogram.

### Task
1. [ ] Aggiungere funzione `generateImagePrompts()` in `geminiService.ts`
2. [ ] Creare tab "Immagini" in `SeoOutput.tsx`
3. [ ] Visualizzare 3-4 prompt generati
4. [ ] Aggiungere pulsante "Copia Prompt" per ogni suggerimento
5. [ ] Opzionale: Integrazione diretta con API DALL-E

### Prompt Esempio per Gemini:
```
Analizza questo articolo e genera 3 prompt per immagini di copertina:
- Stile: cinematografico, professionale
- Formato: 16:9
- Mood: [da inferire dall'articolo]
- Elementi chiave: [da inferire]
```

### Stima Tempo: 2-3 ore

---

## 📅 Versione 1.3.0 - Nebula Trends (Priorità: ALTA)

### Obiettivo
Suggerire argomenti virali basati su ricerche in tempo reale.

### Task
1. [ ] Creare componente `TrendsTab.tsx`
2. [ ] Input: keyword principale (es. "AI", "Tech", "Salute")
3. [ ] Usare `googleSearch` per cercare:
   - Ultime notizie (ultimi 7 giorni)
   - Trend su Google Trends (se possibile)
4. [ ] Gemini analizza risultati e propone 5 titoli virali
5. [ ] Click su titolo → genera articolo completo automaticamente
6. [ ] Salvare keyword cercate in Supabase per analytics

### Prompt Esempio per Gemini:
```
Cerca su Google le ultime novità su [keyword].
Analizza i risultati e proponi 5 titoli di articoli:
- Non ancora trattati da blog italiani
- Potenziale virale alto
- SEO-friendly
- Lunghezza: 60-70 caratteri
```

### Stima Tempo: 4-5 ore

---

## 📅 Versione 1.4.0 - Analytics Dashboard (Priorità: BASSA)

### Obiettivo
Visualizzare statistiche sugli articoli salvati.

### Task
1. [ ] Installare `recharts` per grafici
2. [ ] Creare componente `Analytics.tsx`
3. [ ] Query Supabase:
   - Articoli per mese
   - Categorie più usate
   - Parole medie per articolo
   - Tag più frequenti
4. [ ] Grafici:
   - Linea: articoli nel tempo
   - Torta: distribuzione categorie
   - Barra: lunghezza media articoli
5. [ ] Aggiungere tab "Analytics" nel menu principale

### Stima Tempo: 3-4 ore

---

## 📅 Versione 1.5.0 - Multi-Lingua (Priorità: MEDIA)

### Obiettivo
Tradurre articoli in altre lingue mantenendo SEO.

### Task
1. [ ] Aggiungere dropdown "Traduci in:" in `SeoOutput.tsx`
2. [ ] Lingue supportate: EN, ES, FR, DE
3. [ ] Creare funzione `translateArticle(article, targetLang)` in `geminiService.ts`
4. [ ] Salvare traduzioni come varianti in Supabase:
   ```sql
   ALTER TABLE articles ADD COLUMN language TEXT DEFAULT 'it';
   ALTER TABLE articles ADD COLUMN parent_id TEXT;
   ```
5. [ ] Visualizzare traduzioni disponibili nell'archivio

### Prompt Esempio per Gemini:
```
Traduci questo articolo in [lingua].
Mantieni:
- Struttura HTML
- SEO keywords (traducile)
- Lunghezza simile
- Tono professionale
```

### Stima Tempo: 3-4 ore

---

## 📅 Versione 2.0.0 - Advanced Features (Futuro)

### Idee in Esplorazione
- [ ] **Editor WYSIWYG integrato** (TinyMCE o Lexical)
- [ ] **Pianificazione pubblicazioni** (calendario editoriale)
- [ ] **A/B Testing titoli** (genera 3 varianti, testa CTR)
- [ ] **SEO Competitor Analysis** (confronta con articoli concorrenti)
- [ ] **Voice-to-Article** (registra audio, trascrivi, ottimizza)
- [ ] **Integrazione Unsplash/Pexels** (cerca immagini stock automaticamente)
- [ ] **Export PDF/DOCX** (per clienti esterni)
- [ ] **Multi-User con Ruoli** (admin, editor, viewer)

---

## 🐛 Bug Noti da Risolvere

### Priorità Alta
- [ ] Nessuno al momento

### Priorità Media
- [ ] Migliorare gestione errori di rete (retry automatico)
- [ ] Aggiungere loading skeleton invece di spinner generico

### Priorità Bassa
- [ ] Ottimizzare performance con React.memo su componenti pesanti
- [ ] Aggiungere dark/light mode toggle (attualmente solo dark)

---

## 📊 Metriche di Successo

### KPI da Monitorare
- **Articoli ottimizzati/mese:** Target 50+
- **Tempo medio ottimizzazione:** < 30 secondi
- **Tasso di successo API:** > 95%
- **Uptime Vercel:** > 99.9%

---

## 🔄 Processo di Sviluppo

### Workflow Consigliato
1. **Sviluppo Locale:**
   ```bash
   git checkout -b feature/nome-feature
   npm run dev
   # Sviluppa e testa
   ```

2. **Test:**
   - Testare manualmente tutte le funzionalità
   - Verificare build: `npm run build`

3. **Deploy:**
   ```bash
   git add .
   git commit -m "feat: descrizione feature"
   git push origin feature/nome-feature
   ```

4. **Merge:**
   - Creare Pull Request su GitHub
   - Merge su `main` → Deploy automatico Vercel

---

## 📝 Note per lo Sviluppatore Futuro

### Prima di Iniziare una Nuova Feature:
1. Leggere `PROJECT_HISTORY.md` per contesto completo
2. Verificare che le variabili ambiente siano aggiornate
3. Controllare che Supabase sia operativo
4. Testare che la chiave Gemini funzioni

### Convenzioni Codice:
- **Componenti:** PascalCase (es. `SeoOutput.tsx`)
- **Funzioni:** camelCase (es. `optimizeArticle()`)
- **Costanti:** UPPER_SNAKE_CASE (es. `API_KEY`)
- **File CSS:** kebab-case (es. `index.css`)

### Commit Messages:
- `feat:` Nuova funzionalità
- `fix:` Bug fix
- `docs:` Documentazione
- `style:` Formattazione codice
- `refactor:` Refactoring senza nuove feature
- `test:` Aggiunta test

---

**Ultimo Aggiornamento:** 31 Gennaio 2026  
**Prossima Revisione:** Quando si inizia sviluppo v1.1.0

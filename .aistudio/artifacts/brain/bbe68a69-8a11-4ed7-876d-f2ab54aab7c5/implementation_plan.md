# Piano di Implementazione: Filtri Avanzati Job Hunter AI e Correzione Errori dell'App

Questo piano formalizza l'espansione dei parametri di ricerca nel radar offerte di **Job Hunter AI** e definisce la risoluzione dettagliata dei bug riscontrati nell'applicazione (errori durante la generazione AI, salvataggio/caricamento candidature e anomalie nei tab e nel tracker).

---

## 1. Analisi dei Requisiti & Diagnosi Bug

### A. Nuovi Parametri di Ricerca Dettagliati (Job Hunter AI)
In base alle tue preferenze, il modulo Job Hunter permetterà di affinare la scansione intelligente con controlli dedicati:
1. **Lingua dell'annuncio o del team**:
   - Opzioni: Qualsiasi lingua, Italiano, Inglese, Bilingue (IT/EN), Tedesco, Francese, Spagnolo.
2. **Range Salariale Minimo Desiderato (RAL)**:
   - Opzioni: Qualsiasi, > €30.000, > €40.000, > €50.000, > €60.000, > €80.000, > €100.000 (o valuta equivalente).
3. **Settore / Industria Specifica**:
   - Opzioni: Tutti i settori, SaaS / Software, FinTech & Banking, E-commerce & Retail, Consulenza & System Integration, AI & Machine Learning / DeepTech, HealthTech & Pharma, Media & Entertainment.
4. **Dimensione Aziendale / Tipologia**:
   - Opzioni: Tutte le dimensioni, Startup (< 50 dipendenti), Scaleup / PMI innovativa (50-250), Grande Impresa / Enterprise (250+ dipendenti).
5. **Data di Pubblicazione / Freschezza**:
   - Opzioni: Ultime 24 ore (Recentissime), Ultimi 7 giorni (Fresche), Ultimi 30 giorni (Mese in corso), Qualsiasi data.
6. **Livello di Seniority (Parametro di valore aggiunto)**:
   - Opzioni: Tutti i livelli, Junior / Entry-level, Mid-level, Senior, Lead / Manager.

Questi parametri verranno:
- Integrati nel tipo TypeScript `JobHunterPreferences`.
- Passati nel payload della richiesta `/api/job-hunter/discover` a Gemini 3.8 Flash e al Google Search Grounding per raffinare sia le query di ricerca sul web sia i criteri di estrazione e matching con il CV.
- Visualizzati con un pannello comprimibile intuitivo ("Filtri Avanzati di Ricerca") con badge e selettori veloci nel modulo Job Hunter.

---

### B. Diagnosi e Correzione dei Bug dell'App

#### Errore 1: Blocchi e fallimenti durante la generazione AI (`alert()` e rate limits)
- **Causa individuata**:
  - In `CoverLetterStudio.tsx`, `JobHunterModule.tsx`, `InterviewCoachModal.tsx` e `VoiceCommandModal.tsx` sono presenti chiamate native a `alert(...)` (es. `alert("Errore nella generazione con l'AI...")`). All'interno dell'iFrame della piattaforma o in molti browser moderni, `alert()` viene silenziato, bloccato dalle policy di sandbox o congela l'esecuzione JS.
  - Se Gemini restituisce un errore temporaneo di quota (429) o uno schema non valido con il tool Search Grounding, alcuni endpoint non fornivano un fallback fluido e trasparente con messaggi informativi.
- **Soluzione**:
  - Rimozione completa di tutti i `window.alert()` / `alert()` nel codice sorgente e sostituzione con banner di stato e notifiche toast non bloccanti integrate nella UI.
  - Nel backend (`server.ts`), irrobustire la catena di fallback di `callGeminiWithRetry` e `/api/job-hunter/discover`: se l'API di grounding o la quota è momentaneamente congestionata, l'app passa in automatico al fallback di generazione strutturata locale senza crash e segnala con un badge di avviso non invasivo lo stato del servizio.

#### Errore 2: Problemi con il salvataggio o caricamento delle candidature
- **Causa individuata**:
  - In `AppContext.tsx`, la funzione di pulizia iniziale `isLegacyMockApp` conteneva controlli stringenti come `(app.company === "GitLab" && app.title.toLowerCase().includes("frontend"))` o `app.id === "app-1"`. Se un utente aggiungeva una vera candidatura per GitLab, Shopify o Bending Spoons, al ricaricamento della pagina veniva erroneamente rimossa da `localStorage`.
  - Mancanza di gestione della quota per `localStorage.setItem` in caso di descrizioni di lavoro voluminose o allegati CV memorizzati in base64.
  - In `JobImportModal.tsx` e `ApplicationDetailModal.tsx`, alcuni campi di compatibilità del CV (`cvMatchDetails`, `sourcePlatform`, `responsibilities`) non venivano sincronizzati bidirezionalmente quando si modificava una candidatura esistente.
- **Soluzione**:
  - Rimuovere la logica aggressiva di cancellazione da `AppContext.tsx`, proteggendo e conservando integralmente tutte le candidature create dall'utente.
  - Implementare un helper di memorizzazione sicuro con compressione dei testi lunghi e gestione degli errori di quota.
  - Assicurare che ogni creazione e aggiornamento (da Job Hunter, Job Import o Kanban) aggiorni istantaneamente lo stato `applications` e la scheda attiva.

#### Errore 3: Anomalie nei tab e nel tracker
- **Causa individuata**:
  - In `AutoApplyModal.tsx`, l'apertura del link di candidatura utilizzava `window.open(...)`, che viene spesso bloccato dal browser all'interno di un iFrame.
  - Nel Kanban Board, la creazione di una nuova candidatura da una colonna specifica (`handleCreateInStage`) impostava l'applicazione senza ID, ma in alcuni casi non reimpostava lo stato pulito del form in `ApplicationDetailModal`, mostrando residui della precedente candidatura aperta.
- **Soluzione**:
  - Sostituire le azioni di reindirizzamento con link sicuri `target="_blank" rel="noopener noreferrer"`.
  - Resettare correttamente lo stato in `ApplicationDetailModal` quando si apre una nuova candidatura da zero, garantendo il passaggio fluido tra Kanban, Job Hunter, Studio Lettera e Coach Colloqui.

---

## 2. File Modificati e Architettura

1. **`src/types/index.ts`**:
   - Espansione dell'interfaccia `JobHunterPreferences` con `languageFilter`, `minSalary`, `industrySector`, `companySize`, `publishFreshness`, `seniorityLevel`.
   - Aggiunta di questi campi e dei relativi metadati nelle offerte scoperte `DiscoveredJobOffer`.

2. **`server.ts`**:
   - Aggiornamento dell'endpoint `/api/job-hunter/discover` per integrare i filtri avanzati nel prompt, nelle query di Google Search Grounding e nello schema di risposta.
   - Irrobustimento del meccanismo di retry e fallback per eliminare errori non gestiti (429/400/500).

3. **`src/context/AppContext.tsx`**:
   - Correzione della logica di persistenza per evitare la perdita di candidature al refresh della pagina.
   - Aggiunta di un sistema di notifiche toast globale (success/error/info) accessibile tramite hook per sostituire tutti gli `alert()`.

4. **`src/components/JobHunterModule.tsx`**:
   - Nuovo pannello comprimibile "Filtri Avanzati di Ricerca" con selettori eleganti per Lingua, RAL minima, Settore, Dimensione azienda, Freschezza e Seniority.
   - Sostituzione di ogni `alert()` con notifiche visive contestuali.
   - Aggiornamento dei badge e delle schede annuncio per mostrare lingua, settore e range salariale stimato.

5. **`src/components/ApplicationDetailModal.tsx` & `src/components/KanbanBoard.tsx`**:
   - Correzione del reset form e salvataggio delle nuove candidature create da colonne del Kanban.
   - Verifica della coerenza di tutti i campi salvati.

6. **`src/components/CoverLetterStudio.tsx`, `AutoApplyModal.tsx`, `InterviewCoachModal.tsx`**:
   - Rimozione di `window.alert()` e `window.open()` per piena compatibilità con l'ambiente sandbox/iFrame.
   - Integrazione delle notifiche toast e gestione trasparente degli errori AI.

---

## 3. Piano di Verifica e Collaudo

1. **Collaudo Ricerca Avanzata**:
   - Testare la ricerca con filtri specifici (es. Lingua "Italiano" + RAL "> €40.000" + Settore "SaaS").
   - Verificare che i risultati e le fonti web riflettano i vincoli impostati.
2. **Collaudo Salvataggio & Persistenza**:
   - Creare una candidatura sia da Job Hunter sia dal pulsante "+ Nuova Candidatura" del Kanban.
   - Ricaricare la pagina o navigare tra i tab e verificare che i dati persistano intatti al 100%.
3. **Collaudo UI e Nessun Blocco**:
   - Eseguire azioni che prima potevano scatenare errori (generazione cover letter senza connessione, salvataggio documento) e verificare l'assenza di `alert()` nativi, con messaggi toast chiari e pulsanti di retry.
4. **Verifica Build**:
   - Esecuzione di `lint_applet` e `compile_applet` per assicurare zero errori di compilazione e TypeScript.

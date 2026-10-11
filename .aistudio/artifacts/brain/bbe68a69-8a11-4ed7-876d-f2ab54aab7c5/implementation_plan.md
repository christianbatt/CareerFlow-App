# Job Hunter AI Deep Radar & Career Copilot Unificato

Espansione ad alta profondità del motore di ricerca posizioni (scansione multi-portale estesa e pagine "Lavora con noi" / ATS aziendali diretti come Greenhouse, Lever, Workday) e integrazione di un assistente conversazionale Gemini Career Copilot unificato, con schede offerta interattive in chat e azioni istantanee per Kanban e CV tailoring.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisioni Chiave Confermate nella Fase di Chiarimento**:
> - **Interfaccia Copilot Unificata**: Assistente flottante / drawer intelligente con selettore di contesto ("Job Hunter Conversazionale", "Consulente Candidature & CV", "Simulatore Colloqui", "Guida App").
> - **Radar Multi-Portale & ATS Diretti**: Ricerca potenziata su portali aggregatori (LinkedIn, Indeed, Glassdoor, Wellfound, Monster) e interrogazione profonda di pagine Careers aziendali ufficiali e sistemi ATS (Greenhouse, Lever, Workday, SmartRecruiters, Google Jobs Grounding).
> - **Schede Interattive in Chat**: Le posizioni individuate durante la conversazione con Gemini appaiono con card interattive dotate di badge di matching, URL diretto verificato e pulsanti 1-click: *"Salva in Kanban"*, *"Adatta CV"*, *"Genera Lettera"*, *"Apri Offerta"*.

---

## 1. Overview & Core Concept

### Cos'è
Un potenziamento a doppio livello di CareerFlow AI:
1. **Motore di Ricerca Profondo per Job Hunter**: Supera la scansione standard unendo Google Search Grounding su query mirate di assunzione, aggregazione di board specializzate e interrogazione dei percorsi Careers ufficiali delle aziende (con identificazione di portali ATS reali come Greenhouse, Lever, Workday, SmartRecruiters, BambooHR).
2. **Gemini Career Copilot**: Una chat intelligente integrata e persistente accessibile da qualunque schermata (con pulsante dock / scorciatoia dedicata) che comprende il contesto attuale dell'utente e il suo profilo. Permette di:
   - Specificare requisiti in linguaggio naturale (es. *"Cercami ruoli da Senior Full-Stack o Tech Lead a Milano o full remote, sopra i 55k, in aziende prodotto SaaS o fintech"*).
   - Ricevere offerte con schede interattive direttamente nello stream della chat.
   - Chiedere consigli strategici su come valorizzare il CV per una specifica offerta.
   - Ricevere risposte mirate sullo stato delle proprie candidature nel Kanban.

### Valore per il Candidato
Elimina la fatica di navigare decine di schede browser: l'AI scandaglia sia i grandi portali che i siti aziendali primari, filtra in base al CV reale e consente di gestire tutto (dalla scoperta all'invio) in una conversazione fluida.

---

## 2. User Experience & Visual Design

### Flussi Utente Principali

1. **Flusso Ricerca Conversazionale (Job Hunter Copilot)**:
   - L'utente apre il Copilot o si trova nel tab *Job Hunter*.
   - Scrive in chat: *"Trovami posizioni aperte per Product Designer o Design System Lead in Francia o Monaco, con focus luxury o tech"*.
   - Il Copilot elabora la richiesta, attiva la ricerca multi-fonte e restituisce un'analisi qualitativa accompagnata da una griglia/lista di **schede offerta interattive**.
   - Da ogni scheda in chat, l'utente può cliccare:
     - 📌 **Aggiungi a Kanban**: crea subito una candidatura nello stage "Desiderate / Da Inviare".
     - ⚡ **Adatta CV**: pre-compila lo strumento Documents Vault per quella posizione.
     - ✉️ **Crea Lettera**: apre lo Studio Cover Letter con la descrizione del lavoro già iniettata.
     - 🔗 **Apri Annuncio**: apre l'URL ufficiale verificato in una nuova scheda.

2. **Flusso Copilot Globale Contestuale**:
   - Se l'utente si trova nel tab *Kanban*, il Copilot offre suggerimenti sulle scadenze dei follow-up e sullo stato delle trattative.
   - Se si trova in *Documents Vault*, analizza il tasso di ATS match del CV e suggerisce integrazioni di competenze.
   - Se si trova in *Coach Colloqui*, prepara a domande situazionali e simulazioni STAR.

### Identità Visiva & Design System (SaaS Dashboard & Executive Dock)
- **Posizionamento Dock**: Pulsante flottante elegante in basso a destra (con icona Sparkles / Chat e scorciatoia rapida `Cmd/Ctrl + K`), espandibile in un drawer laterale pulito da 420px (o modal responsive su mobile).
- **Gerarchia Tipografica**: Titoli in display sans contemporaneo (`Plus Jakarta Sans` / `Outfit`), corpo compatto a 13px-14px, e cifre salariali con numeri tabulari (`font-mono tabular-nums`).
- **Disciplina Anti-Slop**:
  - Nessuna pillola statica colorata non necessaria o decorazioni fittizie: metadata discreti separati da interpunzioni (`·`).
  - Card di offerta in chat con contorno hairline (`border border-stone-200 dark:border-stone-800`), contrasto WCAG AA e pulsanti d'azione chiari con verbi espliciti.
  - Indicatore di digitazione sobrio con skeleton loader realistico durante la ricerca web o la generazione.

---

## 3. Decisioni di Prodotto & Scelte Architetturali

### Decisione 1: Architettura di Scansione ATS & Pagine Careers
- **Approccio Scelto**: Combinare nel backend (`/api/job-hunter/deep-scan` e `/api/copilot/chat`) query intelligenti con Google Search Grounding specializzate su domini ATS noti (`site:boards.greenhouse.io`, `site:jobs.lever.co`, `site:myworkdayjobs.com`, `site:smartrecruiters.com`, oltre a portali ufficiali) e scraping strutturato.
- **Perché**: Gli aggregatori spesso contengono annunci scaduti o ripubblicati da terzi; puntare direttamente sui sistemi ATS garantisce che l'offerta sia autentica e attiva.

### Decisione 2: Gestione dello Stato e Azioni Dirette dalla Chat
- **Approccio Scelto**: Risposta strutturata JSON dal server per le offerte trovate con fallback markdown, e rendering dei componenti React `InteractiveJobCard` direttamente dentro il feed messaggi. I bottoni d'azione interagiscono direttamente con `AppContext` (`addApplication`, `setSelectedApplicationId`, `setActiveTab`).
- **Perché**: Consente un'esperienza fluida a zero attrito: l'utente non deve copiare e incollare testo dalla chat ad altre sezioni dell'app.

### Decisione 3: Prompt Engineering e Memoria della Sessione
- **Approccio Scelto**: Mantenimento della cronologia conversazione sul client con invio contestuale a Gemini 3.8 Flash (`contents: [...]`) e iniezione nel system instruction del profilo candidato (`userProfile`), del CV e delle candidature correnti.
- **Perché**: Permette al Copilot di ricordare chi è il candidato, quali competenze possiede e quali candidature ha già salvato, evitando duplicati.

---

## 4. Architettura Tecnica & Diagramma di Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT REACT APP                                │
├───────────────────────────────────────┬─────────────────────────────────────┤
│             Main Views                │         Career Copilot Dock         │
│  • Kanban Board                       │  • Modalità Job Hunter              │
│  • Job Hunter Radar                   │  • Modalità CV & Applicazioni       │
│  • Documents Vault (CV Tailor)        │  • Modalità Coach & Strategia       │
│  • Cover Letter Studio                │  • Rich Chat Feed con Interactive   │
│  • Interview Coach                    │    Job Cards (1-Click Actions)      │
└───────────────────▲───────────────────┴──────────────────▲──────────────────┘
                    │                                      │
                    │         AppContext (Global State)    │
                    │   applications, profile, documents   │
                    └───────────────────┬──────────────────┘
                                        │
                                        ▼ API Calls
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVER EXPRESS API                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  POST /api/copilot/chat                                                     │
│   • Riceve cronologia messaggi, query dell'utente e contesto app            │
│   • Se la richiesta è di ricerca lavoro: esegue Google Search Grounding     │
│     su aggregatori e ATS aziendali (Greenhouse, Lever, Workday)             │
│   • Estrae oggetti offerta verificati con matching CV                       │
│                                                                             │
│  POST /api/job-hunter/discover (Deep Radar Mode)                            │
│   • Integrazione filtri avanzati + query mirate "Careers / Lavora con noi"  │
│   • Ritorna array arricchito di offerte verificate                          │
│                                                                             │
│  Gemini SDK: @google/genai (Modello: gemini-3.8-flash)                      │
│   • Function Calling / Structured Schema output per schede lavoro           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flusso Dati & Mappatura Componenti
1. `CareerCopilotDrawer.tsx`: Componente flottante comprimibile/espandibile, con pillole di prompt rapido ("Trova lavori affini al mio CV", "Cerca aziende con Greenhouse/Lever", "Consigli per il colloquio").
2. `InteractiveJobCard.tsx`: Card dedicata resa inline nei messaggi del bot, con titolo, azienda, location, badge match score calcolato, stipendio stimato, link verified e bottoni operativi collegati ad `AppContext`.
3. `server.ts`: Nuovo endpoint `/api/copilot/chat` con `gemini-3.8-flash`, tool `googleSearch` abilitato quando l'intento è la ricerca di offerte di lavoro, e schema per restituire sia il testo di risposta sia la lista di `jobs` strutturati.

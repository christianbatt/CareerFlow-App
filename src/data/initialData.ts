import { JobApplication, UserProfile, CoverLetterTemplate, SavedDocument } from "../types";

export const initialUserProfile: UserProfile = {
  name: "Christian Battistoni",
  title: "",
  email: "christianbattistoni85@gmail.com",
  phone: "",
  location: "",
  linkedIn: "",
  portfolio: "",
  experienceSummary: "",
  skills: [],
  targetRoles: [],
  achievements: "",
};

export const initialApplications: JobApplication[] = [];

export const initialDocuments: SavedDocument[] = [];

export const initialTemplates: CoverLetterTemplate[] = [
  {
    id: "tmpl-standard-it",
    title: "Candidatura Standard & Motivazione (Italiano)",
    language: "it",
    tags: ["Standard", "Motivazionale", "Universale"],
    content: `# {{candidateName}}
{{candidateEmail}} · {{candidatePhone}} · {{candidateLocation}}

Gentile Team di Selezione di {{company}},

Vi scrivo con vivo interesse per sottoporre la mia candidatura per la posizione di **{{jobTitle}}**. Seguo con ammirazione i risultati e la reputazione di {{company}} nel settore e sono fortemente motivato a contribuire alla vostra missione.

Nel corso del mio percorso professionale, ho maturato competenze solide e comprovate, focalizzandomi in particolare su:
- **Competenze & Metodo**: Applicazione quotidiana di {{requiredSkills}}, con approccio orientato ai risultati e alla qualità del lavoro.
- **Collaborazione & Risoluzione dei Problemi**: Capacità di cooperare efficacemente in team, comunicare con trasparenza e gestire le priorità con flessibilità.
- **Impatto & Risultati**: {{achievements}}

Credo fermamente che il mio profilo e la mia attitudine all'apprendimento continuo possano rappresentare un valore aggiunto immediato per il team di {{company}}.

Sarei lieto di approfondire la mia candidatura e le opportunità di collaborazione durante un colloquio conoscitivo.

Ringraziandovi per il tempo e l'attenzione dedicatimi, porgo i miei più cordiali saluti.

**{{candidateName}}**`,
    updatedAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "tmpl-senior-it",
    title: "Candidatura per Ruolo Senior / Responsabile (Italiano)",
    language: "it",
    tags: ["Senior", "Leadership", "Impatto Strategico"],
    content: `# {{candidateName}}
{{candidateEmail}} · {{candidatePhone}} · {{candidateLocation}}

Alla cortese attenzione del Responsabile delle Selezioni, {{company}}

Oggetto: Candidatura per la posizione di **{{jobTitle}}**

Gentile Team,

Desidero sottoporre la mia candidatura per il ruolo di **{{jobTitle}}** presso {{company}}. La vostra visione strategica e la continua spinta all'innovazione rappresentano per me l'ambiente ideale in cui mettere a frutto la mia esperienza consolidata.

Nel corso della mia carriera, ho sviluppato una visione a 360 gradi che combina competenza tecnica e leadership operativa:
- **Eccellenza Operativa**: Padronanza dei processi chiave e dei requisiti fondamentali ({{requiredSkills}}).
- **Guida & Coordinamento**: Gestione efficace di progetti e priorità complesse, allineando gli sforzi operativi agli obiettivi strategici aziendali.
- **Traguardi Conseguiti**: {{achievements}}

Sono entusiasta all'idea di portare in {{company}} dedizione, rigore metodologico e capacità di generare valore tangibile fin dal primo giorno.

Resto a vostra completa disposizione per un incontro in cui illustrare nel dettaglio come il mio percorso possa allinearsi ai vostri piani di sviluppo.

Cordiali saluti,

**{{candidateName}}**`,
    updatedAt: "2026-10-02T12:00:00Z",
  },
  {
    id: "tmpl-professional-en",
    title: "Professional Application Letter (English)",
    language: "en",
    tags: ["English", "International", "Professional"],
    content: `# {{candidateName}}
{{candidateEmail}} · {{candidatePhone}} · {{candidateLocation}}

Dear Hiring Team at {{company}},

I am writing to express my strong interest in the **{{jobTitle}}** position at {{company}}. Having closely followed your achievements and industry impact, I am truly inspired by your vision and workplace culture.

Throughout my career, I have cultivated a dependable track record characterized by:
- **Core Competencies**: Extensive hands-on experience in {{requiredSkills}}, ensuring high standards of execution and proactive problem-solving.
- **Cross-Functional Collaboration**: Fostering clear communication, autonomy, and strong alignment across diverse stakeholders.
- **Proven Track Record**: {{achievements}}

I am eager to contribute my energy, accountability, and expertise to help {{company}} achieve its strategic milestones.

Thank you for your time and consideration. I would welcome the opportunity to discuss my application further in an interview.

Warm regards,

**{{candidateName}}**`,
    updatedAt: "2026-10-03T15:00:00Z",
  },
];

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Link2,
  FileText,
  Check,
  AlertCircle,
  Building2,
  MapPin,
  Coins,
  BrainCircuit,
  MessageSquare,
  ShieldCheck,
  Upload,
  Loader2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { WorkplaceType } from "../types";
import { parseDocumentFile } from "../utils/documentParser";
import { formatSalaryDisplay } from "../utils/salaryUtils";

export const JobImportModal: React.FC = () => {
  const {
    t,
    userProfile,
    language,
    activeModal,
    setActiveModal,
    addApplication,
    openCoverLetterForApp,
    showToast,
  } = useApp();

  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [fileLoadedName, setFileLoadedName] = useState<string | null>(null);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsFileLoading(true);
    setError(null);
    try {
      const res = await parseDocumentFile(file);
      setRawText(res.markdown || res.rawText);
      setFileLoadedName(file.name);
    } catch (err: any) {
      setError(err.message || "Errore durante l'estrazione del file.");
    } finally {
      setIsFileLoading(false);
      e.target.value = "";
    }
  };

  // Extracted result state
  const [extractedData, setExtractedData] = useState<{
    company: string;
    title: string;
    location: string;
    workplaceType: WorkplaceType;
    salary: string;
    deadline?: string;
    source?: string;
    summary?: string;
    requiredSkills: string[];
    softSkills?: string[];
    responsibilities?: string[];
    talkingPoints: string[];
    companyCulture?: string;
    matchScore: number;
  } | null>(null);

  if (activeModal !== "import") return null;

  const handleExtract = async () => {
    if (!url.trim() && !rawText.trim()) {
      setError("Inserisci un link dell'offerta oppure incolla il testo dell'annuncio.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/extract-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          rawText: rawText.trim(),
          userProfile,
          lang: language,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Errore nella chiamata di estrazione");
      }

      const data = await response.json();
      setExtractedData(data);
    } catch (err: any) {
      console.error("Job extraction error:", err);
      setError(
        err.message ||
          "Impossibile analizzare l'annuncio. Assicurati che il testo contenga i dettagli dell'offerta."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToKanban = (andGenerateLetter = false) => {
    if (!extractedData) return;

    // Detect platform from URL if not given
    let platform = extractedData.source || "Web";
    if (url.includes("linkedin")) platform = "LinkedIn";
    else if (url.includes("indeed")) platform = "Indeed";
    else if (url.includes("remoteok")) platform = "RemoteOK";
    else if (url.includes("welcometothejungle")) platform = "Welcome to the Jungle";
    else if (url.includes("glassdoor")) platform = "Glassdoor";
    else if (url.includes("infojobs")) platform = "InfoJobs";

    const newApp = addApplication({
      company: extractedData.company || "Azienda",
      title: extractedData.title || "Ruolo Aperto",
      stage: "wishlist",
      location: extractedData.location || "Remoto / Ibrido",
      workplaceType: extractedData.workplaceType || "Remote",
      salary: extractedData.salary !== "Non specificato" ? extractedData.salary : undefined,
      sourceUrl: url || undefined,
      sourcePlatform: platform,
      deadline: extractedData.deadline || undefined,
      jobDescription: rawText || extractedData.summary || "",
      requiredSkills: extractedData.requiredSkills || [],
      softSkills: extractedData.softSkills || [],
      responsibilities: extractedData.responsibilities || [],
      talkingPoints: extractedData.talkingPoints || [],
      companyCulture: extractedData.companyCulture || undefined,
      matchScore: extractedData.matchScore || 80,
      priority: (extractedData.matchScore || 80) >= 85 ? "high" : "medium",
      interviews: [],
    });

    setActiveModal(null);
    showToast(`Candidatura per ${newApp.company} importata in bacheca!`, "success");

    if (andGenerateLetter) {
      openCoverLetterForApp(newApp);
    }
  };

  // Sample quick test buttons for quick demo
  const loadSampleJob = (type: "linkedin" | "remoteok" | "jungle") => {
    if (type === "linkedin") {
      setUrl("https://www.linkedin.com/jobs/view/brand-marketing-manager-italy");
      setRawText(`Lavazza è alla ricerca di un Brand & Marketing Strategist per potenziare i mercati consumer europei.
Sede: Milano / Ibrido. Retribuzione: €45.000 - €58.000 + MBO.
Requisiti: 4+ anni in brand strategy, pianificazione campagne omnichannel, analisi ROI e metriche di mercato.
Cultura: innovazione della tradizione, sostenibilità, passione per l'eccellenza e lavoro di squadra.
Responsabilità: Definire il posizionamento strategico dei prodotti, coordinare le agenzie creative e monitorare le performance di vendita.`);
    } else if (type === "remoteok") {
      setUrl("https://remoteok.com/remote-jobs/international-project-manager");
      setRawText(`International Operations & Project Manager at Global Partners.
100% Worldwide Remote. Salary: $65,000 - $85,000 + benefits.
Key skills needed: Project planning, cross-functional stakeholder management, agile delivery, budget control, English fluency.
Values: Asynchronous communication, autonomy, transparency, and continuous improvement.`);
    } else {
      setUrl("https://www.welcometothejungle.com/it/companies/nexi/jobs/senior-account-executive");
      setRawText(`Nexi ricerca Senior Account Executive & Business Development a Milano o Remoto flessibile.
Retribuzione: €50.000 - €70.000 + piano commissioni e welfare.
Requisiti: comprovata esperienza in vendite B2B complesse, negoziazione contrattuale, CRM management e sviluppo partnership commerciali.
Cultura: orientamento al cliente, velocità di esecuzione, inclusione e crescita meritocratica.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {t.importModalTitle}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t.importModalDesc}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 scrollbar-thin">
          {!extractedData ? (
            <>
              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-stone-500 dark:text-stone-400">
                <span>Esempi rapidi per testare:</span>
                <button
                  type="button"
                  onClick={() => loadSampleJob("linkedin")}
                  className="px-2 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded text-stone-700 dark:text-stone-300 font-medium"
                >
                  LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleJob("remoteok")}
                  className="px-2 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded text-stone-700 dark:text-stone-300 font-medium"
                >
                  RemoteOK
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleJob("jungle")}
                  className="px-2 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded text-stone-700 dark:text-stone-300 font-medium"
                >
                  Welcome to the Jungle
                </button>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  {t.jobUrlLabel}
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={t.jobUrlPlaceholder}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  💡 Inserisci il link: l'AI analizzerà la struttura dell'offerta, azienda e meta-dati. Se il portale richiede login privato (es. LinkedIn, Indeed), puoi anche incollare il testo o caricare il file sotto per un'estrazione perfetta.
                </p>
              </div>

              {/* Text Description Paste Option */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {t.pasteTextOption}
                  </label>
                  <label className={`cursor-pointer text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                    isFileLoading
                      ? "text-stone-400 cursor-not-allowed"
                      : "text-indigo-600 dark:text-indigo-400 hover:underline"
                  }`}>
                    {isFileLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isFileLoading ? "Conversione..." : "Carica File Annuncio (PDF, DOCX, TXT)"}</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.md"
                      onChange={handleFileImport}
                      disabled={isFileLoading}
                      className="hidden"
                    />
                  </label>
                </div>

                {fileLoadedName && (
                  <div className="mb-2 p-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                    <span>File estratto: <strong>{fileLoadedName}</strong></span>
                    <button
                      type="button"
                      onClick={() => setFileLoadedName(null)}
                      className="hover:text-rose-500"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={t.pasteTextPlaceholder}
                    className="w-full p-3 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
          ) : (
            /* Result Review View */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">{t.extractedSuccess}</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-sm">
                  <span>Match: {extractedData.matchScore}%</span>
                </div>
              </div>

              {/* Company & Role Details - Editable for maximum user control */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800">
                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-stone-400 mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-1">
                      {t.companyLabel} *
                    </label>
                    <input
                      type="text"
                      value={extractedData.company}
                      onChange={(e) => setExtractedData({ ...extractedData, company: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Nome Azienda"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-stone-400 mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-1">
                      {t.roleLabel} *
                    </label>
                    <input
                      type="text"
                      value={extractedData.title}
                      onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Titolo Posizione"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-stone-400 mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-1">
                      {t.locationLabel} / Modalità
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={extractedData.location}
                        onChange={(e) => setExtractedData({ ...extractedData, location: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Sede"
                      />
                      <select
                        value={extractedData.workplaceType}
                        onChange={(e) => setExtractedData({ ...extractedData, workplaceType: e.target.value as WorkplaceType })}
                        className="w-full px-2 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Coins className="w-4 h-4 text-stone-400 mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-1">
                      {t.salaryLabel}
                    </label>
                    <input
                      type="text"
                      value={formatSalaryDisplay(extractedData.salary)}
                      onChange={(e) => setExtractedData({ ...extractedData, salary: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="es. €45.000 - €55.000 o Non specificato"
                    />
                  </div>
                </div>
              </div>

              {/* Extracted Key Skills */}
              <div>
                <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mb-2">
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t.keyCompetencies}</span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {extractedData.requiredSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 px-2.5 py-1 rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strategic Talking Points */}
              {extractedData.talkingPoints && extractedData.talkingPoints.length > 0 && (
                <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-800">
                  <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t.strategicTalkingPoints}</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300 list-disc list-inside">
                    {extractedData.talkingPoints.map((point, i) => (
                      <li key={i} className="leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Company Culture Insights */}
              {extractedData.companyCulture && (
                <div className="text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/30 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="font-semibold text-stone-800 dark:text-stone-200 block mb-1">
                    {t.companyCultureLabel}:
                  </span>
                  <p>{extractedData.companyCulture}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex items-center justify-between">
          {!extractedData ? (
            <>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 rounded-lg"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleExtract}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? t.extracting : t.extractBtn}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setExtractedData(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 rounded-lg"
              >
                ← Estrai un'altra
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveToKanban(false)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Salva in Bacheca</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveToKanban(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Salva e Scrivi Cover Letter</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

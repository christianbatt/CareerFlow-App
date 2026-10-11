import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Building2,
  MapPin,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Bot,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Wand2,
  CheckSquare,
  Bookmark,
  Zap,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  DiscoveredJobOffer,
  JobCvComparisonResult,
  MissingSkillItem,
  MatchedSkillItem,
} from "../types";

interface JobCvComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: DiscoveredJobOffer | null;
  activeCvText: string;
  onOpenTailorCv?: (job: DiscoveredJobOffer) => void;
  onImportToTracker?: (job: DiscoveredJobOffer) => void;
  isJobAlreadyImported?: boolean;
}

export const JobCvComparisonModal: React.FC<JobCvComparisonModalProps> = ({
  isOpen,
  onClose,
  job,
  activeCvText,
  onOpenTailorCv,
  onImportToTracker,
  isJobAlreadyImported = false,
}) => {
  const { documents, userProfile, language, showToast, openCopilot } = useApp();

  // CV Documents available for switching
  const cvDocuments = documents.filter(
    (d) => d.type === "cv" && d.content && d.content.trim().length > 0
  );

  const [selectedCvDocId, setSelectedCvDocId] = useState<string>("active_editor");
  const [currentCvText, setCurrentCvText] = useState<string>(activeCvText);
  const [comparison, setComparison] = useState<JobCvComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active filter tab in comparison
  const [activeTab, setActiveTab] = useState<"missing" | "matched" | "requirements" | "advice">("missing");
  const [missingFilter, setMissingFilter] = useState<"all" | "critical" | "high">("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Update CV text when selection changes
  useEffect(() => {
    if (selectedCvDocId === "active_editor") {
      setCurrentCvText(activeCvText);
    } else {
      const doc = cvDocuments.find((d) => d.id === selectedCvDocId);
      if (doc && doc.content) {
        setCurrentCvText(doc.content);
      }
    }
  }, [selectedCvDocId, activeCvText, cvDocuments]);

  // Run analysis when modal opens or selected job changes
  useEffect(() => {
    if (isOpen && job) {
      runCvComparison(currentCvText, job);
    } else {
      setComparison(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, job?.id]);

  const runCvComparison = async (cv: string, targetJob: DiscoveredJobOffer) => {
    if (!targetJob) return;
    setIsLoading(true);
    setError(null);

    const effectiveCv =
      cv.trim() ||
      (userProfile.experienceSummary
        ? `${userProfile.name}\n${userProfile.title}\n${userProfile.experienceSummary}\nCompetenze: ${(userProfile.skills || []).join(", ")}`
        : "");

    try {
      const res = await fetch("/api/job-hunter/compare-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: effectiveCv,
          job: targetJob,
          language: language || "it",
        }),
      });

      if (!res.ok) {
        throw new Error(`Errore HTTP ${res.status}`);
      }

      const data = await res.json();
      setComparison(data);
    } catch (err: any) {
      console.error("Errore durante la comparazione CV vs Job:", err);
      setError(
        "Impossibile completare la comparazione in tempo reale. Verrà utilizzata l'analisi semantica di riserva."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySingleKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    setCopiedKey(keyword);
    showToast(`Keyword "${keyword}" copiata!`, "info");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAllMissingKeywords = () => {
    if (!comparison) return;
    const allKeywords = [
      ...comparison.missingKeywords,
      ...comparison.missingSkills.map((s) => s.skill),
    ];
    const unique = Array.from(new Set(allKeywords)).join(", ");
    navigator.clipboard.writeText(unique);
    setCopiedAll(true);
    showToast(`${unique.split(",").length} parole chiave mancanti copiate negli appunti!`, "success");
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleAskCopilot = () => {
    if (!job || !comparison) return;
    const missingSample = comparison.missingSkills.slice(0, 4).map((s) => s.skill).join(", ");
    const prompt = `Sto valutando la posizione di "${job.title}" presso "${job.company}". Il sistema rileva che il mio CV ha questi gap principali di parole chiave e requisiti: ${missingSample || "alcune hard skills specifiche"}. Come posso valorizzare le mie esperienze reali pregresse e i miei progetti per colmare questi gap e superare con successo i filtri ATS e il colloquio?`;
    onClose();
    openCopilot("job-hunter", prompt);
  };

  if (!isOpen || !job) return null;

  const filteredMissingSkills = (comparison?.missingSkills || []).filter((item) => {
    if (missingFilter === "critical") return item.importance === "critical";
    if (missingFilter === "high") return item.importance === "critical" || item.importance === "high";
    return true;
  });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700";
    if (score >= 70) return "text-blue-700 bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700";
    if (score >= 55) return "text-amber-700 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700";
    return "text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700";
  };

  const getImportanceBadge = (importance: MissingSkillItem["importance"]) => {
    switch (importance) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-2xs">
            <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>Cruciale per ATS</span>
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Alta Priorità</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <span>Consigliato</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-start justify-between gap-4 bg-stone-50/70 dark:bg-stone-950/40">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Analisi Requisiti & Gap ATS</span>
              </span>
              <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {job.portal}
              </span>
              {job.workplaceType && (
                <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  {job.workplaceType === "Remote"
                    ? "🏠 Remoto"
                    : job.workplaceType === "Hybrid"
                    ? "🔀 Ibrido"
                    : "🏢 In Sede"}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 leading-snug truncate">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 dark:text-stone-400">
              <span className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                {job.company}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {job.location}
              </span>
              {job.salary && (
                <>
                  <span>·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <DollarSign className="w-3 h-3" />
                    {job.salary}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors shrink-0"
            title="Chiudi modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CV Switcher & Source Selector */}
        <div className="px-5 sm:px-6 py-3 bg-stone-100/70 dark:bg-stone-800/40 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-bold text-stone-800 dark:text-stone-200">
              Curriculum di confronto:
            </span>
            <select
              value={selectedCvDocId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedCvDocId(newId);
                let textToUse = activeCvText;
                if (newId !== "active_editor") {
                  const doc = cvDocuments.find((d) => d.id === newId);
                  if (doc?.content) textToUse = doc.content;
                }
                runCvComparison(textToUse, job);
              }}
              className="px-2.5 py-1 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="active_editor">
                📄 CV Attivo in Job Hunter ({currentCvText.split(/\s+/).filter(Boolean).length} parole)
              </option>
              {cvDocuments.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  📁 {doc.name} {doc.fileSize ? `(${doc.fileSize})` : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => runCvComparison(currentCvText, job)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors disabled:opacity-50"
            title="Ricalcola la comparazione tra questo CV e l'offerta"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Analisi in corso..." : "Ricalcola Analisi"}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-700 flex items-center justify-center animate-bounce">
                  <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Confronto semantico tra il tuo CV e i requisiti di {job.company}...
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md">
                Gemini AI sta estraendo requisiti, parole chiave ATS, competenze tecniche ed esperienze per identificare con precisione cosa c'è e cosa manca.
              </p>
            </div>
          )}

          {!isLoading && comparison && (
            <>
              {/* Score Dashboard Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800">
                {/* Score Dial */}
                <div className="flex flex-col items-center justify-center text-center md:border-r md:border-stone-200 dark:md:border-stone-800 pr-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Affinità Complessiva
                  </span>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-2xl font-black border ${getScoreBadgeColor(
                      comparison.matchScore
                    )}`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>{comparison.matchScore}%</span>
                  </div>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-1">
                    {comparison.matchLevel}
                  </span>
                </div>

                {/* ATS Pass Probability */}
                <div className="flex flex-col justify-center space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Filtro ATS Probabile
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${
                        comparison.atsPassProbability === "Alta"
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                          : comparison.atsPassProbability === "Media"
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700"
                          : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700"
                      }`}
                    >
                      {comparison.atsPassProbability === "Alta"
                        ? "✅ Probabilità Alta"
                        : comparison.atsPassProbability === "Media"
                        ? "⚠️ Probabilità Media"
                        : "🚨 Rischio Scarto ATS"}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Basato su densità keyword e allineamento titolo
                  </span>
                </div>

                {/* Counts Summary */}
                <div className="flex flex-col justify-center space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Riepilogo Competenze
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{comparison.matchedSkills.length} Presenti</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{comparison.missingSkills.length} Mancanti</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    {comparison.missingKeywords.length} parole chiave ATS non riscontrate
                  </span>
                </div>

                {/* Quick Copy Action */}
                <div className="flex flex-col justify-center">
                  <button
                    type="button"
                    onClick={handleCopyAllMissingKeywords}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 hover:border-indigo-500 text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                    title="Copia tutte le parole chiave e competenze mancanti per incollarla nel CV"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 font-black">Copiate!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Copia Keyword Mancanti</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-stone-400 text-center mt-1">
                    Ideale per arricchire il CV in 1-click
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-stone-800 dark:text-stone-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300 text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Verdetto dell'AI sul Tuo Profilo</span>
                </div>
                <p className="leading-relaxed text-stone-700 dark:text-stone-300">
                  {comparison.summary}
                </p>
              </div>

              {/* Missing ATS Keywords Cloud Spotlight */}
              {comparison.missingKeywords && comparison.missingKeywords.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-black text-xs">
                      <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Parole Chiave Critiche ATS Assenti nel Tuo CV ({comparison.missingKeywords.length})</span>
                    </div>
                    <span className="text-[10px] text-rose-700 dark:text-rose-400 font-medium">
                      Clicca su una keyword per copiarla
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {comparison.missingKeywords.map((kw, idx) => {
                      const isCopied = copiedKey === kw;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleCopySingleKeyword(kw)}
                          className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-stone-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80 hover:border-rose-500 shadow-2xs hover:scale-102 transition-all cursor-pointer"
                          title="Clicca per copiare questa parola chiave"
                        >
                          <span>{kw}</span>
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 text-rose-500 transition-opacity" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("missing")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === "missing"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Competenze Mancanti ({comparison.missingSkills.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("matched")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === "matched"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Competenze Presenti ({comparison.matchedSkills.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("requirements")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === "requirements"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Confronto Requisiti ({comparison.requirementsComparison?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("advice")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === "advice"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Consigli Ottimizzazione</span>
                  </button>
                </div>

                {activeTab === "missing" && (
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-stone-500 font-medium">Filtra per:</span>
                    <button
                      type="button"
                      onClick={() => setMissingFilter("all")}
                      className={`px-2 py-0.5 rounded-lg font-semibold ${
                        missingFilter === "all"
                          ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                          : "text-stone-600 dark:text-stone-400"
                      }`}
                    >
                      Tutte
                    </button>
                    <button
                      type="button"
                      onClick={() => setMissingFilter("critical")}
                      className={`px-2 py-0.5 rounded-lg font-semibold ${
                        missingFilter === "critical"
                          ? "bg-rose-600 text-white"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      Solo Cruciali
                    </button>
                    <button
                      type="button"
                      onClick={() => setMissingFilter("high")}
                      className={`px-2 py-0.5 rounded-lg font-semibold ${
                        missingFilter === "high"
                          ? "bg-amber-600 text-white"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      Alta Priorità
                    </button>
                  </div>
                )}
              </div>

              {/* Tab 1: Missing Skills Detail */}
              {activeTab === "missing" && (
                <div className="space-y-3">
                  {filteredMissingSkills.length === 0 ? (
                    <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                        Nessuna competenza mancante per questo filtro!
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        Il tuo CV soddisfa tutti i requisiti con questo livello di priorità.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {filteredMissingSkills.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-rose-400 dark:hover:border-rose-600 transition-all shadow-2xs space-y-2 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                                {item.category}
                              </span>
                              {getImportanceBadge(item.importance)}
                            </div>

                            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                              <span>{item.skill}</span>
                              <button
                                type="button"
                                onClick={() => handleCopySingleKeyword(item.skill)}
                                className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                                title="Copia competenza"
                              >
                                {copiedKey === item.skill ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </h4>

                            <div className="text-xs text-stone-600 dark:text-stone-400">
                              <p className="text-[11px] leading-relaxed">
                                <strong className="text-stone-700 dark:text-stone-300">Perché è richiesta:</strong> {item.reason}
                              </p>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 mt-2">
                            <div className="flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-300 mb-0.5">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>Come valorizzarla nel tuo CV:</span>
                            </div>
                            <p className="leading-snug">{item.suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Matched Skills */}
              {activeTab === "matched" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {comparison.matchedSkills.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-bold text-xs text-emerald-900 dark:text-emerald-100">
                              {item.skill}
                            </span>
                            {item.category && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-medium">
                                {item.category}
                              </span>
                            )}
                          </div>
                          {item.cvEvidenceSnippet && (
                            <p className="text-[11px] text-stone-600 dark:text-stone-400 pl-5.5 italic">
                              "{item.cvEvidenceSnippet}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Requirements Comparison Table */}
              {activeTab === "requirements" && (
                <div className="space-y-3">
                  {comparison.requirementsComparison?.map((reqItem, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-bold text-stone-900 dark:text-stone-100 flex-1">
                          {reqItem.requirement}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold shrink-0 border ${
                            reqItem.status === "matched"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                              : reqItem.status === "partial"
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700"
                              : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700"
                          }`}
                        >
                          {reqItem.status === "matched"
                            ? "✅ Riscontrato nel CV"
                            : reqItem.status === "partial"
                            ? "⚠️ Parzialmente Soddisfatto"
                            : "❌ Assente nel CV"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px]">
                        <div>
                          <span className="font-semibold text-stone-500 block mb-0.5">
                            Evidenza nel tuo CV:
                          </span>
                          <p className="text-stone-700 dark:text-stone-300">
                            {reqItem.candidateEvidence || "Nessuna menzione esplicita trovata nel documento."}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-stone-500 block mb-0.5">
                            Strategia di allineamento:
                          </span>
                          <p className="text-stone-700 dark:text-stone-300">
                            {reqItem.advice || "Formula le tue mansioni descrivendo risultati affini a questo punto."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Tailoring & ATS Advice */}
              {activeTab === "advice" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 space-y-2">
                    <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Consiglio Strategico per il CV su Misura</span>
                    </h4>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      {comparison.tailoringAdvice}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Checklist Operativa per Superare l'ATS di {job.company}:
                    </h4>
                    <ul className="space-y-2">
                      {comparison.atsOptimizationTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 dark:text-stone-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Actions Bar */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-950/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Ask Copilot */}
            <button
              type="button"
              onClick={handleAskCopilot}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-colors"
              title="Apri il Career Copilot per farti guidare su come valorizzare queste competenze"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Chiedi a Copilot come Colmare i Gap</span>
            </button>

            {/* Direct Link to Job */}
            {job.jobUrl && (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center gap-1"
              >
                <span>Vedi Annuncio Ufficiale</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Import to Tracker if not yet imported */}
            {!isJobAlreadyImported && onImportToTracker && (
              <button
                type="button"
                onClick={() => {
                  onImportToTracker(job);
                  showToast(`Posizione aggiunta alla bacheca candidature!`, "success");
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 hover:border-indigo-500 text-stone-800 dark:text-stone-200 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                <span>Salva nel Tracker</span>
              </button>
            )}

            {/* Tailor CV with 1 click */}
            {onOpenTailorCv && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTailorCv(job);
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Genera CV su Misura per Questa Posizione</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

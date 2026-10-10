import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Award,
  Layers,
  RefreshCw,
  ChevronRight,
  BookmarkCheck,
  Calendar,
  Building,
  Target,
  ArrowUpRight,
  Filter,
  Check,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { SkillGapAnalysisResult, SkillGapItem, RecommendedCourse } from "../types";

export const SkillGapWidget: React.FC = () => {
  const { applications, documents, userProfile, t } = useApp();

  // Wishlist jobs
  const wishlistJobs = applications.filter((app) => app.stage === "wishlist");

  // CV selection
  const cvDocs = documents.filter((doc) => doc.type === "cv" && doc.content?.trim());
  const [selectedCvId, setSelectedCvId] = useState<string>(
    cvDocs[0]?.id || "profile_summary"
  );

  // Analysis state
  const [analysis, setAnalysis] = useState<SkillGapAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active view tab inside the widget
  const [activeTab, setActiveTab] = useState<"gaps" | "roadmap" | "acquired">("gaps");
  const [selectedImportance, setSelectedImportance] = useState<string>("all");
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("all");

  // Track user study plan and completed skills
  const [savedPlanSkills, setSavedPlanSkills] = useState<Record<string, "planned" | "done">>({});

  // Load cached analysis & progress from localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem("careerflow_skill_gap_analysis");
      if (cached) {
        setAnalysis(JSON.parse(cached));
      }
      const savedProgress = localStorage.getItem("careerflow_skill_gap_progress");
      if (savedProgress) {
        setSavedPlanSkills(JSON.parse(savedProgress));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const toggleSkillStatus = (skillName: string, status: "planned" | "done") => {
    setSavedPlanSkills((prev) => {
      const next = { ...prev };
      if (next[skillName] === status) {
        delete next[skillName];
      } else {
        next[skillName] = status;
      }
      try {
        localStorage.setItem("careerflow_skill_gap_progress", JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const runAnalysis = async () => {
    if (wishlistJobs.length === 0) {
      setError("Nessuna offerta presente nella Wishlist. Aggiungi almeno una candidatura per analizzare i gap.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Determine CV text
      let cvText = "";
      if (selectedCvId === "profile_summary") {
        cvText = `# ${userProfile.name} - ${userProfile.title}\n${userProfile.experienceSummary}\nCompetenze: ${(userProfile.skills || []).join(", ")}\nObiettivi: ${(userProfile.targetRoles || []).join(", ")}`;
      } else {
        const found = cvDocs.find((d) => d.id === selectedCvId);
        cvText = found?.content || userProfile.experienceSummary;
      }

      const res = await fetch("/api/skill-gap/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText,
          wishlistJobs: wishlistJobs.map((j) => ({
            id: j.id,
            company: j.company,
            title: j.title,
            requiredSkills: j.requiredSkills || [],
            softSkills: j.softSkills || [],
            responsibilities: j.responsibilities || [],
            jobDescription: j.jobDescription || "",
            workplaceType: j.workplaceType,
            salary: j.salary,
          })),
          language: "it",
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Errore durante l'analisi del gap di competenze.");
      }

      const data: SkillGapAnalysisResult = await res.json();
      setAnalysis(data);
      try {
        localStorage.setItem("careerflow_skill_gap_analysis", JSON.stringify(data));
      } catch {
        // Ignore storage error
      }
    } catch (err: any) {
      setError(err?.message || "Impossibile completare l'analisi con Gemini AI.");
    } finally {
      setIsLoading(false);
    }
  };

  // If no analysis yet and we have wishlist jobs, run analysis automatically once if not cached
  useEffect(() => {
    if (!analysis && wishlistJobs.length > 0 && !isLoading && !error) {
      runAnalysis();
    }
  }, [wishlistJobs.length]);

  // Filter gaps
  const filteredGaps = (analysis?.skillGaps || []).filter((gap) => {
    if (selectedImportance !== "all" && gap.importance !== selectedImportance) {
      return false;
    }
    if (selectedJobFilter !== "all") {
      const matchJob = gap.targetJobs?.some((tj) => tj.company.toLowerCase().includes(selectedJobFilter.toLowerCase()));
      if (!matchJob) return false;
    }
    return true;
  });

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Widget Header */}
      <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 bg-gradient-to-r from-stone-50/70 via-indigo-50/30 to-white dark:from-stone-900 dark:via-indigo-950/20 dark:to-stone-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                {t.skillGapTitle || "Skill Gap Analysis (Wishlist vs CV)"}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-3xl">
              {t.skillGapSubtitle ||
                "Incrocia il tuo CV con i ruoli desiderati nella Wishlist, scopri le competenze mancanti e accelera le candidature con corsi e certificazioni ad alto valore."}
            </p>
          </div>

          {/* Action & CV selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {cvDocs.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5">
                <span className="text-[11px] font-medium text-stone-500">CV:</span>
                <select
                  value={selectedCvId}
                  onChange={(e) => setSelectedCvId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer max-w-[150px] truncate"
                >
                  <option value="profile_summary">Profilo & Competenze</option>
                  {cvDocs.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={runAnalysis}
              disabled={isLoading || wishlistJobs.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? (t.skillGapAnalyzing || "Analisi in corso...") : (t.skillGapRunAnalysis || "Analizza Gap con AI")}</span>
            </button>
          </div>
        </div>

        {/* Error notice if any */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {wishlistJobs.length === 0 ? (
        <div className="p-8 sm:p-12 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
            <Layers className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {t.skillGapNoWishlist || "Nessuna offerta attualmente nella colonna Wishlist"}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {t.skillGapNoWishlistDesc ||
                "Aggiungi offerte alla fase 'Da candidarsi' (Wishlist) sulla bacheca Kanban o usa il modulo Job Hunter AI per individuare ruoli target prima di analizzare i gap."}
            </p>
          </div>
        </div>
      ) : !analysis && isLoading ? (
        <div className="p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            {t.skillGapAnalyzing || "Gemini AI sta esaminando i requisiti di tutti i ruoli Wishlist a confronto con il tuo CV..."}
          </p>
          <p className="text-[11px] text-stone-400">
            Estrazione competenze mancanti, verifica priorità e selezione dei migliori corsi online in corso...
          </p>
        </div>
      ) : analysis ? (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Top KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Match / Readiness Score */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="font-medium">{t.skillGapReadinessScore || "Prontezza Wishlist"}</span>
                <Target className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {analysis.overallMatchScore}%
                </span>
                <span className="text-[11px] font-semibold text-stone-500">
                  {analysis.overallMatchScore >= 85
                    ? "Ottimo allineamento"
                    : analysis.overallMatchScore >= 70
                    ? "Buono, colmabile"
                    : "Gap significativi"}
                </span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-700"
                  style={{ width: `${analysis.overallMatchScore}%` }}
                />
              </div>
            </div>

            {/* Target Jobs count */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="font-medium">Posizioni Wishlist</span>
                <Building className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
                {analysis.totalWishlistJobsAnalyzed || wishlistJobs.length}
              </div>
              <div className="text-[11px] text-stone-500 truncate">
                {wishlistJobs.map((j) => j.company).slice(0, 3).join(", ")}
                {wishlistJobs.length > 3 && ` +${wishlistJobs.length - 3}`}
              </div>
            </div>

            {/* Missing Gaps count */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="font-medium">{t.skillGapMissingCount || "Gap Rilevati"}</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {analysis.skillGaps?.length || 0}
                </span>
                <span className="text-[11px] text-stone-500">
                  {analysis.skillGaps?.filter((g) => g.importance === "critical").length || 0} critici
                </span>
              </div>
              <div className="text-[11px] text-stone-500">
                {Object.values(savedPlanSkills).filter((v) => v === "done").length} contrassegnati come acquisiti
              </div>
            </div>

            {/* Recommended Courses count */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="font-medium">{t.skillGapCoursesCount || "Corsi Consigliati"}</span>
                <BookOpen className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {(analysis.skillGaps || []).reduce(
                  (acc, g) => acc + (g.recommendedCourses?.length || 0),
                  0
                )}
              </div>
              <div className="text-[11px] text-stone-500 truncate">
                Coursera, edX, Udemy, LinkedIn Learning
              </div>
            </div>
          </div>

          {/* Strategic Executive Summary Banner */}
          {analysis.readinessSummary && (
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-indigo-50/70 via-stone-50 to-white dark:from-indigo-950/20 dark:via-stone-900/60 dark:to-stone-900 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                    Sintesi Strategica & Diagnosi AI
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                    {analysis.readinessSummary}
                  </p>
                  {analysis.quickWinsSummary && (
                    <div className="pt-2 text-xs font-medium text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                      <span className="font-bold underline">Azione Rapida Consigliata:</span>
                      <span>{analysis.quickWinsSummary}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs Inside Widget */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-b border-stone-200 dark:border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("gaps")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === "gaps"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800/60"
                }`}
              >
                {t.skillGapAllGapsTab || "Competenze Mancanti & Corsi"} ({analysis.skillGaps?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab("roadmap")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === "roadmap"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800/60"
                }`}
              >
                {t.skillGapRoadmapTab || "Roadmap di Upskilling"}
              </button>

              <button
                onClick={() => setActiveTab("acquired")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === "acquired"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800/60"
                }`}
              >
                {t.skillGapAcquiredTab || "Punti di Forza Già Allineati"} ({analysis.acquiredSkills?.length || 0})
              </button>
            </div>

            {/* Filter by priority / job if on gaps tab */}
            {activeTab === "gaps" && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedImportance}
                  onChange={(e) => setSelectedImportance(e.target.value)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 focus:outline-none"
                >
                  <option value="all">Tutte le priorità</option>
                  <option value="critical">Solo Critici</option>
                  <option value="high">Solo Alta Priorità</option>
                  <option value="moderate">Solo Moderati</option>
                </select>

                <select
                  value={selectedJobFilter}
                  onChange={(e) => setSelectedJobFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 focus:outline-none max-w-[150px] truncate"
                >
                  <option value="all">{t.skillGapFilterAllWishlist || "Tutti i ruoli Wishlist"}</option>
                  {wishlistJobs.map((j) => (
                    <option key={j.id} value={j.company}>
                      {j.company}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* TAB 1: GAPS & RECOMMENDED COURSES */}
          {activeTab === "gaps" && (
            <div className="space-y-4">
              {filteredGaps.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500">
                  Nessuna competenza corrispondente ai filtri selezionati.
                </div>
              ) : (
                filteredGaps.map((gap: SkillGapItem, idx: number) => {
                  const status = savedPlanSkills[gap.skill];
                  return (
                    <div
                      key={idx}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        status === "done"
                          ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/40"
                          : status === "planned"
                          ? "bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-800/40"
                          : "bg-stone-50/50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
                      }`}
                    >
                      {/* Skill Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                            {typeof gap.skill === "object" ? String((gap.skill as any)?.name || (gap.skill as any)?.skill || "") : gap.skill}
                          </h3>

                          {/* Importance badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              gap.importance === "critical"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                                : gap.importance === "high"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                            }`}
                          >
                            {gap.importance === "critical"
                              ? "Critico"
                              : gap.importance === "high"
                              ? "Alta Priorità"
                              : "Consigliato"}
                          </span>

                          {/* Category badge */}
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                            {gap.category}
                          </span>

                          {/* Learning Effort */}
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-500 dark:text-stone-400">
                            <Clock className="w-3 h-3" />
                            {gap.learningEffort}
                          </span>
                        </div>

                        {/* Interactive toggle buttons: Plan / Acquired */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button
                            onClick={() => toggleSkillStatus(gap.skill, "planned")}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              status === "planned"
                                ? "bg-indigo-600 text-white"
                                : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700"
                            }`}
                          >
                            <BookmarkCheck className="w-3.5 h-3.5" />
                            <span>
                              {status === "planned"
                                ? "In programma"
                                : t.skillGapMarkPlanned || "Aggiungi al Piano"}
                            </span>
                          </button>

                          <button
                            onClick={() => toggleSkillStatus(gap.skill, "done")}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              status === "done"
                                ? "bg-emerald-600 text-white"
                                : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {status === "done"
                                ? "Acquisita!"
                                : t.skillGapMarkDone || "Segna Acquisita"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Demand in Wishlist: which target jobs require it */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 mb-2">
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          Richiesto in:
                        </span>
                        {gap.targetJobs?.map((tj, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium text-[11px]"
                          >
                            <Building className="w-3 h-3 text-stone-500" />
                            <span>{typeof tj.company === "object" ? String((tj.company as any)?.name || "") : tj.company}</span>
                            <span className="text-stone-400">({typeof tj.title === "object" ? String((tj.title as any)?.name || "") : tj.title})</span>
                          </span>
                        ))}
                        <span className="text-stone-400 text-[11px]">
                          ({gap.frequencyCount} su {analysis.totalWishlistJobsAnalyzed || wishlistJobs.length} ruoli Wishlist)
                        </span>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
                        {gap.gapExplanation}
                      </p>

                      {/* Recommended Courses & Certifications Sub-Section */}
                      <div className="space-y-2 pt-2 border-t border-stone-200/60 dark:border-stone-800">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>Corsi Online & Certificazioni Consigliate:</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {gap.recommendedCourses?.map((course: RecommendedCourse, cIdx: number) => (
                            <div
                              key={cIdx}
                              className="p-3.5 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between space-y-2"
                            >
                              <div className="space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-indigo-600">
                                    {course.title}
                                  </h4>
                                  <span
                                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                      course.type === "certification"
                                        ? "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300"
                                        : "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300"
                                    }`}
                                  >
                                    {course.type === "certification" ? "Certificazione" : "Corso Specializzato"}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                                    {course.provider}
                                  </span>
                                  <span>·</span>
                                  <span>{course.duration}</span>
                                  <span>·</span>
                                  <span>{course.difficulty}</span>
                                  <span>·</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    {course.estimatedCost}
                                  </span>
                                </div>

                                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                                    Competenza verificabile:
                                  </span>{" "}
                                  {course.keyTakeaway}
                                </p>
                              </div>

                              {/* Course external link */}
                              <div className="pt-1.5 flex items-center justify-end">
                                <a
                                  href={course.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
                                >
                                  <span>{t.skillGapTakeCourse || "Accedi al Corso / Esame"}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: STRATEGIC LEARNING ROADMAP */}
          {activeTab === "roadmap" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
                <span className="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">
                  Piano Sequenziale per Massimizzare l'Affinità con la Wishlist
                </span>
                Questo percorso temporale struttura l'acquisizione delle competenze mancanti in 3 fasi ordinate per impatto e tempo di studio.
              </div>

              <div className="space-y-4">
                {analysis.strategicLearningPath?.map((milestone, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          {mIdx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                            {milestone.phase}
                          </h4>
                          <span className="text-[11px] text-stone-500 font-medium">
                            {milestone.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                      🎯 Obiettivo: {milestone.milestone}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-stone-500">Focus Competenze:</span>
                      {milestone.focusSkills?.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ACQUIRED STRENGTHS (MATCH) */}
          {activeTab === "acquired" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-bold block mb-0.5">
                  Competenze Già Rilevate nel Tuo Profilo / CV
                </span>
                Queste competenze presenti nel tuo CV soddisfano già pienamente i requisiti indicati dalle aziende nella tua Wishlist. Continua a valorizzarle nelle tue cover letter e durante i colloqui.
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {analysis.acquiredSkills?.map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer details: timestamp */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
            <span>
              Valutazione calcolata su {analysis.totalWishlistJobsAnalyzed || wishlistJobs.length} posizioni Wishlist
            </span>
            {analysis.evaluatedAt && (
              <span>
                Ultimo aggiornamento: {new Date(analysis.evaluatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

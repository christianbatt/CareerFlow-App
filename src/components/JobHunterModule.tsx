import React, { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  ExternalLink,
  Plus,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingUp,
  Filter,
  DollarSign,
  MapPin,
  FileText,
  MessageSquare,
  Zap,
  Globe,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Upload,
  Loader2,
  FileCheck,
  SlidersHorizontal,
  Languages,
  Calendar,
  Train,
  Crown,
  Compass,
  Info,
  HelpCircle,
  Bot,
  Bookmark,
  BookmarkCheck,
  BookmarkPlus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { parseDocumentFile } from "../utils/documentParser";
import { formatSalaryDisplay } from "../utils/salaryUtils";
import {
  DiscoveredJobOffer,
  JobHunterPreferences,
  JobApplication,
  CvExtractedProfile,
  WorkplaceType,
  JobVerificationResult,
  MonacoRadarSettings,
  SavedJobSearch,
} from "../types";
import { JobCvComparisonModal } from "./JobCvComparisonModal";

export const JobHunterModule: React.FC = () => {
  const {
    applications,
    documents,
    userProfile,
    updateUserProfile,
    addDocument,
    importDiscoveredJob,
    batchUpdateMatchScores,
    setActiveTab,
    setSelectedApplication,
    setActiveModal,
    openCoverLetterForApp,
    openInterviewCoachForApp,
    openAutoApplyForApp,
    showToast,
    openCopilot,
    savedJobSearches,
    saveJobSearch,
    deleteJobSearch,
  } = useApp();

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<"discovery" | "existing">("discovery");

  // CV Upload State
  const [isUploadingCv, setIsUploadingCv] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>("");
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const [uploadedDocMeta, setUploadedDocMeta] = useState<{
    fileName: string;
    fileType: string;
    wordCount: number;
    detectedSkills?: string[];
  } | null>(null);

  // CV source selection
  const masterCvDoc =
    documents.find((d) => d.type === "cv" && d.content?.trim()) || documents.find((d) => d.content?.trim());
  const [selectedCvDocId, setSelectedCvDocId] = useState<string>(masterCvDoc?.id || "");
  const [cvText, setCvText] = useState<string>(
    masterCvDoc?.content ||
      (userProfile.experienceSummary
        ? `# ${userProfile.name || "Candidato"}\n${userProfile.title ? `**${userProfile.title}**\n` : ""}${userProfile.experienceSummary}\n\nCompetenze: ${(userProfile.skills || []).join(", ")}`
        : "")
  );

  const [showCvEditor, setShowCvEditor] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Search Preferences
  const [preferences, setPreferences] = useState<JobHunterPreferences>({
    portals: ["LinkedIn", "Indeed", "RemoteOK", "WeWorkRemotely", "Wellfound"],
    workplaceType: "All",
    location: "Italia / Remoto Europa",
    seniority: "All",
    minMatchScore: 75,
    roleFilter: "",
    enableLiveSearch: true,
    sourcePriority: "all",
    languageFilter: "any",
    minSalary: "any",
    industrySector: "all",
    companySize: "any",
    publishFreshness: "any",
    resultsCount: 12,
    salarySensitivity: false,
    strictRoleMatching: true,
  });

  // Saved Searches state
  const [activeSavedSearchId, setActiveSavedSearchId] = useState<string | null>(null);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState<boolean>(false);
  const [newSearchName, setNewSearchName] = useState<string>("");
  const [showSavedSearchesDropdown, setShowSavedSearchesDropdown] = useState<boolean>(false);

  // Handlers for Saved Searches
  const handleApplySavedSearch = (savedSearch: SavedJobSearch) => {
    setActiveSavedSearchId(savedSearch.id);
    const restoredPrefs: JobHunterPreferences = {
      ...savedSearch.preferencesSnapshot,
      roleFilter: savedSearch.criteria.role,
      location: savedSearch.criteria.location,
      minSalary: (savedSearch.criteria.salary as any) || savedSearch.preferencesSnapshot.minSalary || "any",
      workplaceType: savedSearch.criteria.workplaceType || savedSearch.preferencesSnapshot.workplaceType || "All",
      seniority: savedSearch.criteria.seniority || savedSearch.preferencesSnapshot.seniority || "All",
      languageFilter: savedSearch.criteria.languageFilter || savedSearch.preferencesSnapshot.languageFilter || "any",
      industrySector: savedSearch.criteria.industrySector || savedSearch.preferencesSnapshot.industrySector || "all",
      companySize: savedSearch.criteria.companySize || savedSearch.preferencesSnapshot.companySize || "any",
      publishFreshness: savedSearch.criteria.publishFreshness || savedSearch.preferencesSnapshot.publishFreshness || "any",
      portals: savedSearch.criteria.portals || savedSearch.preferencesSnapshot.portals || preferences.portals,
      minMatchScore: savedSearch.criteria.minMatchScore || savedSearch.preferencesSnapshot.minMatchScore || preferences.minMatchScore,
    };
    setPreferences(restoredPrefs);
    showToast(`Filtri caricati da: "${savedSearch.name}"`, "info");
  };

  const handleLaunchSavedSearch = async (savedSearch: SavedJobSearch) => {
    handleApplySavedSearch(savedSearch);
    const restoredPrefs: JobHunterPreferences = {
      ...savedSearch.preferencesSnapshot,
      roleFilter: savedSearch.criteria.role,
      location: savedSearch.criteria.location,
      minSalary: (savedSearch.criteria.salary as any) || savedSearch.preferencesSnapshot.minSalary || "any",
      workplaceType: savedSearch.criteria.workplaceType || savedSearch.preferencesSnapshot.workplaceType || "All",
      seniority: savedSearch.criteria.seniority || savedSearch.preferencesSnapshot.seniority || "All",
      languageFilter: savedSearch.criteria.languageFilter || savedSearch.preferencesSnapshot.languageFilter || "any",
      industrySector: savedSearch.criteria.industrySector || savedSearch.preferencesSnapshot.industrySector || "all",
      companySize: savedSearch.criteria.companySize || savedSearch.preferencesSnapshot.companySize || "any",
      publishFreshness: savedSearch.criteria.publishFreshness || savedSearch.preferencesSnapshot.publishFreshness || "any",
      portals: savedSearch.criteria.portals || savedSearch.preferencesSnapshot.portals || preferences.portals,
      minMatchScore: savedSearch.criteria.minMatchScore || savedSearch.preferencesSnapshot.minMatchScore || preferences.minMatchScore,
    };
    showToast(`Lancio ricerca AI salvata: "${savedSearch.name}"... `, "success");
    await handleDiscoverJobs(cvText, restoredPrefs);
  };

  const handleCreateSavedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newSearchName.trim() || `${preferences.roleFilter || 'Tutti i ruoli'} - ${preferences.location || 'Qualsiasi'}`;
    const newSearch = saveJobSearch(
      name,
      {
        role: preferences.roleFilter || "",
        location: preferences.location || "",
        salary: preferences.minSalary || "any",
        workplaceType: preferences.workplaceType,
        seniority: preferences.seniority,
        languageFilter: preferences.languageFilter,
        industrySector: preferences.industrySector,
        companySize: preferences.companySize,
        publishFreshness: preferences.publishFreshness,
        portals: preferences.portals,
        minMatchScore: preferences.minMatchScore,
        monacoRadar: Boolean(preferences.monacoSpecificRadar?.enabled),
      },
      preferences
    );
    setActiveSavedSearchId(newSearch.id);
    setNewSearchName("");
    setShowSaveSearchModal(false);
  };

  // State for Discovered Jobs
  const [isSearchingJobs, setIsSearchingJobs] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [discoveredJobs, setDiscoveredJobs] = useState<DiscoveredJobOffer[]>([]);
  const [cvSummary, setCvSummary] = useState<CvExtractedProfile | null>(null);
  const [importedJobIds, setImportedJobIds] = useState<Record<string, boolean>>({});

  // Pagination for Discovered Jobs
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jobsPerPage, setJobsPerPage] = useState<number>(6);

  // Live AI Verification states
  const [autoVerifyBeforeImport, setAutoVerifyBeforeImport] = useState<boolean>(true);
  const [verifyingJobId, setVerifyingJobId] = useState<string | null>(null);
  const [verificationMap, setVerificationMap] = useState<Record<string, JobVerificationResult>>({});
  const [unverifiedConfirmJob, setUnverifiedConfirmJob] = useState<{
    job: DiscoveredJobOffer;
    verification: JobVerificationResult;
  } | null>(null);

  // Monaco Directory & Frontalieri Info Modal state
  const [showMonacoDirectoryModal, setShowMonacoDirectoryModal] = useState<boolean>(false);

  // CV vs Selected Job Comparison modal state
  const [comparingJob, setComparingJob] = useState<DiscoveredJobOffer | null>(null);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Live in-page results filtering & search states
  const [searchQueryFilter, setSearchQueryFilter] = useState<string>("");
  const [portalFilter, setPortalFilter] = useState<string>("all");
  const [salaryQuickFilter, setSalaryQuickFilter] = useState<string>("all");

  // State for Existing Applications Scoring
  const [isScoringExisting, setIsScoringExisting] = useState<boolean>(false);
  const [scoringSuccessMsg, setScoringSuccessMsg] = useState<string | null>(null);
  const [existingStageFilter, setExistingStageFilter] = useState<string>("all");

  // Synchronize CV text when user selects a different document
  useEffect(() => {
    if (selectedCvDocId) {
      const found = documents.find((d) => d.id === selectedCvDocId);
      if (found && found.content) {
        setCvText(found.content);
      }
    }
  }, [selectedCvDocId, documents]);

  // Execute initial search if empty ONLY if user already has a real CV loaded
  useEffect(() => {
    if (discoveredJobs.length === 0 && !isSearchingJobs && cvText.trim()) {
      handleDiscoverJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // File upload handler for PDF, DOCX, TXT, MD
  const handleCvFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCv(true);
    setUploadErrorMessage(null);
    setUploadSuccessMessage(null);
    setUploadProgressText(`Estrazione e analisi del file "${file.name}" in corso con AI...`);

    try {
      const result = await parseDocumentFile(file);
      setCvText(result.markdown);

      // Save to documents vault automatically
      const docTypeFormat = (result.fileType === "pdf" ? "pdf" : result.fileType === "docx" ? "docx" : "txt") as any;
      const newDoc = addDocument({
        name: file.name,
        type: "cv",
        content: result.markdown,
        fileFormat: docTypeFormat,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        notes: `Caricato tramite Job Hunter AI (${result.wordCount} parole). ${
          result.metadata?.skills?.length ? `Competenze: ${result.metadata.skills.slice(0, 6).join(", ")}` : ""
        }`,
      });
      setSelectedCvDocId(newDoc.id);

      setUploadedDocMeta({
        fileName: file.name,
        fileType: result.fileType,
        wordCount: result.wordCount,
        detectedSkills: result.metadata?.skills,
      });

      setUploadSuccessMessage(
        `File "${file.name}" (${result.fileType.toUpperCase()}) elaborato con successo! ${
          result.metadata?.skills?.length
            ? `Rilevate ${result.metadata.skills.length} competenze chiave.`
            : ""
        }`
      );

      // Automatically update profile if empty
      if (result.metadata?.skills && result.metadata.skills.length > 0 && (!userProfile.skills || userProfile.skills.length === 0)) {
        updateUserProfile({
          ...userProfile,
          skills: result.metadata.skills,
          name: result.metadata.name || userProfile.name,
          title: result.metadata.title || userProfile.title,
        });
      }

      // Automatically search for matching jobs using the newly uploaded CV
      await handleDiscoverJobs(result.markdown);
    } catch (err: any) {
      console.error(err);
      setUploadErrorMessage(err.message || "Errore durante l'elaborazione del file.");
    } finally {
      setIsUploadingCv(false);
      setUploadProgressText("");
      e.target.value = "";
    }
  };

  const handleDiscoverJobs = async (customCvText?: string, overridePrefs?: JobHunterPreferences) => {
    const activeCv = (customCvText !== undefined ? customCvText : cvText).trim();
    const activePrefs = overridePrefs || preferences;

    if (!activeCv) {
      setSearchError(
        "Per favore carica il tuo CV reale (.pdf, .docx, .txt) o inserisci il tuo profilo professionale prima di avviare la ricerca."
      );
      setShowCvEditor(true);
      return;
    }

    setIsSearchingJobs(true);
    setSearchError(null);

    try {
      const res = await fetch("/api/job-hunter/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: activeCv,
          preferences: activePrefs,
          userProfile,
          lang: "it",
        }),
      });

      if (!res.ok) {
        throw new Error(`Errore durante la ricerca offerte: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.jobs && Array.isArray(data.jobs)) {
        const sanitizedJobs = data.jobs.map((j: any) => ({
          ...j,
          salary: formatSalaryDisplay(j.salary),
          matchedSkills: (j.matchedSkills || []).map((s: any) =>
            typeof s === "object" ? String(s?.name || s?.skill || "") : String(s)
          ),
          missingSkills: (j.missingSkills || []).map((s: any) =>
            typeof s === "object" ? String(s?.name || s?.skill || "") : String(s)
          ),
        }));
        setDiscoveredJobs(sanitizedJobs);
        setCurrentPage(1);
      }
      if (data.cvSummary) {
        setCvSummary(data.cvSummary);
      }
    } catch (err: any) {
      console.error(err);
      setSearchError(
        err.message || "Impossibile completare la ricerca automatica. Riprova tra poco."
      );
    } finally {
      setIsSearchingJobs(false);
    }
  };

  // Toggle or configure Monaco / Monte Carlo Special Frontalieri Radar
  const handleToggleMonacoRadar = async (forceEnable?: boolean) => {
    const isCurrentlyEnabled = Boolean(preferences.monacoSpecificRadar?.enabled);
    const shouldEnable = forceEnable !== undefined ? forceEnable : !isCurrentlyEnabled;

    const monacoPortals = ["LinkedIn", "Indeed", "MonacoJob", "GouvMonaco", "SBM", "FEDEM"];
    const basePortals = ["LinkedIn", "Indeed", "RemoteOK", "WeWorkRemotely", "Wellfound"];

    const updatedPrefs: JobHunterPreferences = {
      ...preferences,
      location: shouldEnable ? "Monaco / Monte-Carlo (Frontalieri da Nizza)" : "Italia / Remoto Europa",
      workplaceType: shouldEnable ? "On-site" : preferences.workplaceType,
      languageFilter: shouldEnable ? "bilingual" : preferences.languageFilter,
      minSalary: shouldEnable ? "40k" : preferences.minSalary,
      portals: shouldEnable ? monacoPortals : basePortals,
      monacoSpecificRadar: {
        enabled: shouldEnable,
        sectorFocus: preferences.monacoSpecificRadar?.sectorFocus || "all",
        crossBorderNiceTransport: true,
        languageFocus: "it_fr_en",
        includeMonacoGovAndFedem: true,
      },
    };

    setPreferences(updatedPrefs);

    if (shouldEnable) {
      showToast("🇲🇨 Radar Monaco & Monte-Carlo attivato! Perlustrazione approfondita dei portali locali in corso...", "success");
      await handleDiscoverJobs(cvText, updatedPrefs);
    }
  };

  const handleScoreExistingApplications = async () => {
    if (applications.length === 0) return;
    setIsScoringExisting(true);
    setScoringSuccessMsg(null);

    try {
      const res = await fetch("/api/job-hunter/score-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText,
          applications: applications.map((a) => ({
            id: a.id,
            company: a.company,
            title: a.title,
            requiredSkills: a.requiredSkills,
            jobDescription: a.jobDescription,
            workplaceType: a.workplaceType,
            location: a.location,
          })),
          lang: "it",
        }),
      });

      if (!res.ok) {
        throw new Error("Errore durante il calcolo dell'affinità.");
      }

      const data = await res.json();
      if (data.evaluations && Array.isArray(data.evaluations)) {
        batchUpdateMatchScores(
          data.evaluations.map((ev: any) => ({
            id: ev.id,
            matchScore: ev.matchScore,
            cvMatchDetails: {
              score: ev.matchScore,
              matchLevel: ev.matchLevel,
              strengths: ev.strengths || [],
              gaps: ev.gaps || [],
              interviewRecommendation: ev.interviewRecommendation || "",
              summary: ev.summary || "",
              evaluatedAt: new Date().toISOString(),
            },
          }))
        );
        setScoringSuccessMsg(
          `Affinità calcolata con successo per ${data.evaluations.length} candidature!`
        );
        setTimeout(() => setScoringSuccessMsg(null), 5000);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Errore nel calcolo dell'affinità con l'AI.", "error");
    } finally {
      setIsScoringExisting(false);
    }
  };

  const handleVerifyJob = async (job: DiscoveredJobOffer): Promise<JobVerificationResult | null> => {
    setVerifyingJobId(job.id);
    try {
      const res = await fetch("/api/job-hunter/verify-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          location: job.location,
          portal: job.portal,
          jobUrl: job.jobUrl,
          companyCareerUrl: job.companyCareerUrl,
        }),
      });

      if (!res.ok) throw new Error("Errore durante la verifica con l'AI");
      const data: JobVerificationResult = await res.json();
      setVerificationMap((prev) => ({ ...prev, [job.id]: data }));

      if (data.status === "verified_active") {
        showToast(`✅ Offerta verificata 100% reale e attiva per ${job.company}!`, "success");
      } else if (data.status === "alternative_active") {
        showToast(`🏢 Azienda confermata a ${job.location}; link aggiornato a posizioni attive.`, "info");
      } else {
        showToast(`⚠️ Annuncio non trovato direttamente nei motori: link di ricerca verificato pronto.`, "warning");
      }
      return data;
    } catch (err: any) {
      console.error(err);
      showToast("Impossibile completare la verifica live in questo momento.", "error");
      return null;
    } finally {
      setVerifyingJobId(null);
    }
  };

  const handleImportJob = async (job: DiscoveredJobOffer): Promise<JobApplication | undefined> => {
    let currentVerif: JobVerificationResult | undefined = verificationMap[job.id] || job.verification;

    if (autoVerifyBeforeImport && !currentVerif) {
      showToast(`🔍 Verifica presenza reale con AI in corso per ${job.company}...`, "info");
      const res = await handleVerifyJob(job);
      if (res) {
        currentVerif = res;
      }
    }

    if (currentVerif && currentVerif.status === "unverified_search_fallback") {
      setUnverifiedConfirmJob({ job, verification: currentVerif });
      return undefined;
    }

    const newApp = importDiscoveredJob(job, "wishlist", currentVerif);
    setImportedJobIds((prev) => ({ ...prev, [job.id]: true }));
    showToast(`Posizione presso ${job.company} salvata in bacheca con successo!`, "success");
    return newApp;
  };

  const togglePortal = (portalName: string) => {
    setPreferences((prev) => {
      const exists = prev.portals.includes(portalName);
      if (exists && prev.portals.length === 1) return prev; // keep at least 1
      return {
        ...prev,
        portals: exists
          ? prev.portals.filter((p) => p !== portalName)
          : [...prev.portals, portalName],
      };
    });
  };

  const getPortalBadgeColor = (portal: string) => {
    switch (portal.toLowerCase()) {
      case "linkedin":
        return "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
      case "indeed":
        return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "remoteok":
        return "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "weworkremotely":
        return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "wellfound":
        return "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "glassdoor":
        return "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800";
      case "companycareers":
        return "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      case "monacojob":
        return "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800 font-bold";
      case "gouvmonaco":
        return "bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800 font-bold";
      case "sbm":
        return "bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-bold";
      case "fedem":
        return "bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700 font-bold";
      default:
        return "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800";
    if (score >= 80) return "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800";
    if (score >= 70) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800";
    return "text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700";
  };

  // Filter existing applications
  const filteredExistingApplications = applications.filter((app) => {
    if (existingStageFilter === "all") return true;
    return app.stage === existingStageFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI Headhunter & Match Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Job Hunter AI & Calcolo Affinità CV
          </h1>
          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
            L'intelligenza artificiale analizza a fondo il tuo CV, trova le posizioni più affini sui principali portali di ricerca lavoro (LinkedIn, Indeed, RemoteOK, We Work Remotely) e calcola il voto di compatibilità anche per tutte le tue candidature già inviate.
          </p>

          {/* CV Source Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <FileText className="w-4 h-4 text-indigo-300" />
              <span className="text-white/80">CV di Riferimento:</span>
              <select
                value={selectedCvDocId}
                onChange={(e) => setSelectedCvDocId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id} className="text-stone-900">
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct File Upload (PDF, DOCX, TXT) */}
            <label className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium flex items-center gap-1.5 border shadow-xs ${
              isUploadingCv
                ? "bg-indigo-400 text-white cursor-not-allowed border-indigo-400"
                : "bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-400/40 hover:scale-[1.02]"
            }`}>
              {isUploadingCv ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{isUploadingCv ? "Analisi AI in corso..." : "Carica CV (PDF, DOCX, TXT)"}</span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md,.markdown"
                onChange={handleCvFileUpload}
                disabled={isUploadingCv}
                className="hidden"
              />
            </label>

            <button
              onClick={() => setShowCvEditor(!showCvEditor)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium flex items-center gap-1.5 border border-white/10"
            >
              <span>{showCvEditor ? "Nascondi Editor CV" : "Visualizza / Modifica CV"}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCvEditor ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Uploading progress notification */}
      {isUploadingCv && (
        <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 flex items-center gap-3 text-indigo-900 dark:text-indigo-200 text-xs animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <p className="font-bold">{uploadProgressText || "Analisi del documento in corso..."}</p>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
              Gemini AI e il motore di estrazione stanno convertendo il tuo file in testo strutturato ed estraendo le competenze chiave.
            </p>
          </div>
        </div>
      )}

      {/* Upload Success Alert */}
      {uploadSuccessMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-start justify-between gap-3 text-emerald-900 dark:text-emerald-200 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">{uploadSuccessMessage}</p>
              {uploadedDocMeta?.detectedSkills && uploadedDocMeta.detectedSkills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[11px] text-emerald-800/80 dark:text-emerald-300 font-medium mr-1">
                    Competenze estratte:
                  </span>
                  {uploadedDocMeta.detectedSkills.slice(0, 8).map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-semibold"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setUploadSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 dark:hover:text-emerald-100 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Error Alert */}
      {uploadErrorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-900 dark:text-rose-200 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <p className="font-medium">{uploadErrorMessage}</p>
          </div>
          <button
            onClick={() => setUploadErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 dark:hover:text-rose-100 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Expandable CV Editor & Dropzone */}
      {showCvEditor && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Testo del CV per l'Analisi AI
              </h3>
            </div>
            <span className="text-xs text-stone-500">
              {cvText.length} caratteri
            </span>
          </div>

          {/* Quick upload dropzone */}
          <div className="p-4 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-stone-50/60 dark:bg-stone-800/40 text-center transition-colors">
            <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
              <Upload className="w-6 h-6 text-indigo-500" />
              <div className="text-xs">
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  Carica un file PDF o Word (.docx)
                </span>{" "}
                <span className="text-stone-500 dark:text-stone-400">
                  oppure trascinalo qui
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Supportati: PDF, DOCX, DOC, Markdown (.md), Testo (.txt) — fino a 15MB
              </p>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md,.markdown"
                onChange={handleCvFileUpload}
                disabled={isUploadingCv}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400">
            Puoi anche modificare o incollare manualmente il testo del tuo curriculum qui sotto. L'AI utilizzerà questo testo per individuare le offerte e calcolare i punteggi di affinità.
          </p>
          <textarea
            rows={8}
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            className="w-full font-mono text-xs p-3 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Profile Insights Extracted by AI */}
      {cvSummary && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Profilo Rilevato dall'AI nel CV
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {cvSummary.seniorLevel}
            </span>
          </div>

          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed mb-4">
            {cvSummary.extractedProfile}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
            <div>
              <span className="text-stone-500 block mb-1 font-medium">Competenze Chiave Identificate</span>
              <div className="flex flex-wrap gap-1">
                {cvSummary.coreStack.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium text-[11px]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-stone-500 block mb-1 font-medium">Ruoli Ideali Identificati</span>
              <div className="flex flex-wrap gap-1">
                {cvSummary.targetRoles.map((role, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px]"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-stone-500 block mb-1 font-medium">Settori ad Alta Compatibilità</span>
              <div className="flex flex-wrap gap-1">
                {cvSummary.bestSectors.map((sector, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab Navigation Switcher */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("discovery")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "discovery"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Offerte nei Portali (Discovery AI)</span>
            {discoveredJobs.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === "discovery" ? "bg-indigo-800 text-white" : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
              }`}>
                {discoveredJobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("existing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === "existing"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Affinità Candidature Esistenti</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeSubTab === "existing" ? "bg-indigo-800 text-white" : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
            }`}>
              {applications.length}
            </span>
          </button>
        </div>

        {activeSubTab === "existing" && (
          <button
            onClick={handleScoreExistingApplications}
            disabled={isScoringExisting || applications.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScoringExisting ? "animate-spin" : ""}`} />
            <span>{isScoringExisting ? "Valutazione in corso..." : "⚡ Ricalcola Affinità di Tutte con l'AI"}</span>
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: JOB DISCOVERY & PORTAL MATCHING                     */}
      {/* ============================================================== */}
      {activeSubTab === "discovery" && (
        <div className="space-y-6">
          {/* Filter & Preferences Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                <Filter className="w-3.5 h-3.5 text-indigo-500" />
                <span>Filtri & Radar di Ricerca</span>
                <span className="hidden sm:inline text-[11px] font-normal text-stone-500">
                  Personalizza criteri (ruolo, RAL, sede) per trovare posizioni verificate
                </span>
              </div>

              {/* Saved Searches Quick Access & Save Trigger */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveSearchModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  title="Salva questa configurazione di ricerca (ruolo, RAL, location, filtri)"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Salva Ricerca Corrente</span>
                </button>
              </div>
            </div>

            {/* SAVED SEARCHES PERSISTENT PRESETS BAR */}
            <div className="p-3 bg-stone-50/80 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-700/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                  <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Ricerche Salvate ({savedJobSearches.length})</span>
                  <span className="text-[10px] font-normal text-stone-500 hidden md:inline">
                    (Carica o lancia con 1 click i tuoi set di filtri preferiti)
                  </span>
                </div>
                {activeSavedSearchId && (
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/50">
                    Filtro attivo: {savedJobSearches.find(s => s.id === activeSavedSearchId)?.name || 'Personalizzato'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {savedJobSearches.map((s) => {
                  const isActive = activeSavedSearchId === s.id;
                  return (
                    <div
                      key={s.id}
                      className={`group flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-indigo-400 dark:hover:border-indigo-600'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleApplySavedSearch(s)}
                        className="flex items-center gap-1.5 cursor-pointer text-left"
                        title={`Ruolo: ${s.criteria.role || 'Tutti'} | Luogo: ${s.criteria.location || 'Qualsiasi'} | RAL: ${s.criteria.salary || 'Qualsiasi'}`}
                      >
                        {isActive ? (
                          <BookmarkCheck className="w-3.5 h-3.5 shrink-0 text-white" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                        )}
                        <span className="font-bold truncate max-w-[160px] sm:max-w-[210px]">
                          {s.name}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <button
                          type="button"
                          onClick={() => handleLaunchSavedSearch(s)}
                          disabled={isSearchingJobs}
                          className={`px-1.5 py-0.5 text-[10px] font-black rounded cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-white/20 text-white hover:bg-white/30'
                              : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                          }`}
                          title="Lancia subito la ricerca AI con questo profilo salvato"
                        >
                          ⚡ Lancia
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteJobSearch(s.id);
                            if (activeSavedSearchId === s.id) setActiveSavedSearchId(null);
                          }}
                          className={`p-1 rounded cursor-pointer transition-colors opacity-70 group-hover:opacity-100 ${
                            isActive ? 'hover:bg-red-500 text-white' : 'hover:bg-red-50 dark:hover:bg-red-950/50 text-stone-400 hover:text-red-600'
                          }`}
                          title="Elimina ricerca salvata"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Search Grounding Banner & Toggle */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-indigo-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white shrink-0">
                  <Globe className="w-4 h-4" />
                  {preferences.enableLiveSearch && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Google Search Grounding (Web Radar Live)
                    </span>
                    {preferences.enableLiveSearch ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                        ● LIVE ATTIVO
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400">
                        Disattivato
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    {preferences.enableLiveSearch
                      ? "Scansione in tempo reale degli annunci più recenti sul web e delle pagine carriera aziendali"
                      : "Generazione basata su matching semantico senza navigazione live"}
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    enableLiveSearch: !prev.enableLiveSearch,
                  }))
                }
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
                  preferences.enableLiveSearch
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs"
                    : "bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700"
                }`}
              >
                <span>{preferences.enableLiveSearch ? "Disattiva Live" : "Attiva Live"}</span>
              </button>
            </div>

            {/* 🇲🇨 DEDICATED MONACO & MONTE-CARLO RADAR (FRONTALIERI NIZZA / COSTA AZZURRA) */}
            <div className={`p-4 rounded-2xl border transition-all ${
              preferences.monacoSpecificRadar?.enabled
                ? "bg-gradient-to-r from-red-500/10 via-amber-500/10 to-stone-100 dark:from-red-950/40 dark:via-amber-950/30 dark:to-stone-900 border-red-400 dark:border-red-800/80 shadow-sm"
                : "bg-stone-50/70 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-red-300 dark:hover:border-red-900/60"
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-xl text-lg font-bold shrink-0 ${
                    preferences.monacoSpecificRadar?.enabled
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-400/50"
                      : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                  }`}>
                    🇲🇨
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        Radar Monaco & Monte-Carlo (Frontalieri Nizza / Costa Azzurra)
                      </span>
                      {preferences.monacoSpecificRadar?.enabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                          <Crown className="w-3 h-3 text-amber-500" />
                          <span>RADAR MONACO ATTIVO</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                          Ideale per chi vive a Nizza
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                      Scansione potenziata di tutti i portali monegaschi (Gouv.mc, MonacoJob, FEDEM, SBM, Indeed Monaco) e delle principali aziende del Principato, ottimizzata per residenti a Nizza (treno TER ~22m, retribuzione netta e profilo linguistico IT+FR+EN).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowMonacoDirectoryModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors"
                    title="Visualizza i portali ufficiali e la guida per frontalieri a Monaco"
                  >
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Guida & Portali</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleMonacoRadar()}
                    disabled={isSearchingJobs}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      preferences.monacoSpecificRadar?.enabled
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-stone-900 hover:bg-black text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-900"
                    }`}
                  >
                    {preferences.monacoSpecificRadar?.enabled ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Disattiva Radar</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Attiva Radar Monaco</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Extended Monaco Controls when enabled */}
              {preferences.monacoSpecificRadar?.enabled && (
                <div className="mt-3 pt-3 border-t border-red-200/60 dark:border-red-900/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs animate-in fade-in duration-150">
                  <div>
                    <label className="block font-semibold text-stone-800 dark:text-stone-200 mb-1">
                      🏛️ Settore di Monaco da Mirare:
                    </label>
                    <select
                      value={preferences.monacoSpecificRadar.sectorFocus || "all"}
                      onChange={(e) => {
                        const newSector = e.target.value as any;
                        setPreferences((prev) => ({
                          ...prev,
                          monacoSpecificRadar: {
                            ...(prev.monacoSpecificRadar || { enabled: true }),
                            sectorFocus: newSector,
                          },
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-900 border border-red-200 dark:border-red-900/60 rounded-xl text-stone-900 dark:text-stone-100 text-xs font-semibold focus:outline-none"
                    >
                      <option value="all">Tutti i settori di Monaco</option>
                      <option value="finance_banking">🏦 Banche Private, Wealth & Finanza (CMB, CFM...)</option>
                      <option value="luxury_hospitality_sbm">🎰 SBM, Casinò & Hotellerie di Lusso (Hôtel de Paris...)</option>
                      <option value="yachting_shipping">⛵ Yachting, Shipping & Marine Brokerage (Fraser...)</option>
                      <option value="tech_digital">💻 Tech, Telecom & Digital (Monaco Telecom, Telis...)</option>
                      <option value="corporate_services">🏢 Corporate, Amministrazione & FEDEM</option>
                      <option value="construction_realestate">🏗️ Edilizia & Real Estate di Pregio (Pastor, Marzocco)</option>
                      <option value="healthcare">🏥 Sanità & Ospedaliero (CHPG Monaco)</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-center space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      <input
                        type="checkbox"
                        checked={preferences.monacoSpecificRadar.crossBorderNiceTransport !== false}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            monacoSpecificRadar: {
                              ...(prev.monacoSpecificRadar || { enabled: true }),
                              crossBorderNiceTransport: e.target.checked,
                            },
                          }))
                        }
                        className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                      />
                      <Train className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Focus pendolarismo treno TER da Nizza (~22 min)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      <input
                        type="checkbox"
                        checked={preferences.monacoSpecificRadar.includeMonacoGovAndFedem !== false}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            monacoSpecificRadar: {
                              ...(prev.monacoSpecificRadar || { enabled: true }),
                              includeMonacoGovAndFedem: e.target.checked,
                            },
                          }))
                        }
                        className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                      />
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Includi Service de l'Emploi (Gouv.mc) & FEDEM</span>
                    </label>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => handleDiscoverJobs(cvText, preferences)}
                      disabled={isSearchingJobs}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSearchingJobs ? "animate-spin" : ""}`} />
                      <span>{isSearchingJobs ? "Scansione in corso..." : "⚡ Cerca Offerte Monaco Ora"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Source Priority Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Priorità Fonti di Ricerca:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: "all",
                    label: "Portali + Pagine Carriera",
                    desc: "Consigliato: portali aggregatori e carriere dirette",
                    icon: "🎯",
                  },
                  {
                    id: "portals",
                    label: "Solo Portali Principali",
                    desc: "LinkedIn, Indeed, MonacoJob, RemoteOK",
                    icon: "💼",
                  },
                  {
                    id: "company_careers",
                    label: "Solo Pagine Carriera Aziendali",
                    desc: "Lavora con noi / Careers diretti dei datori di lavoro",
                    icon: "🏢",
                  },
                ].map((item) => {
                  const isSelected = (preferences.sourcePriority || "all") === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          sourcePriority: item.id as any,
                        }))
                      }
                      className={`p-2.5 text-left rounded-xl border transition-all text-xs ${
                        isSelected
                          ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-200 shadow-xs"
                          : "bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700/80 text-stone-700 dark:text-stone-300 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Portal Selectors */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                Portali da scandagliare:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "LinkedIn", label: "💼 LinkedIn", color: "hover:border-sky-400" },
                  { name: "Indeed", label: "🔍 Indeed", color: "hover:border-blue-400" },
                  { name: "MonacoJob", label: "🇲🇨 MonacoJob", color: "hover:border-red-400" },
                  { name: "GouvMonaco", label: "🏛️ Gouv.mc Emploi", color: "hover:border-rose-400" },
                  { name: "SBM", label: "🎰 SBM Monte-Carlo", color: "hover:border-amber-400" },
                  { name: "FEDEM", label: "🏢 FEDEM Monaco", color: "hover:border-sky-400" },
                  { name: "RemoteOK", label: "🏝️ RemoteOK", color: "hover:border-rose-400" },
                  { name: "WeWorkRemotely", label: "🌍 We Work Remotely", color: "hover:border-emerald-400" },
                  { name: "Wellfound", label: "🦄 Wellfound / AngelList", color: "hover:border-purple-400" },
                  { name: "Glassdoor", label: "🏢 Glassdoor", color: "hover:border-teal-400" },
                ].map((p) => {
                  const isSelected = preferences.portals.includes(p.name);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => togglePortal(p.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 " +
                            p.color
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Modalità di Lavoro
                </label>
                <select
                  value={preferences.workplaceType}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      workplaceType: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">Tutte le modalità</option>
                  <option value="Remote">🏠 100% Remoto</option>
                  <option value="Hybrid">🔀 Ibrido</option>
                  <option value="On-site">🏢 In Sede</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Area Geografica / Mercato
                </label>
                <input
                  type="text"
                  value={preferences.location}
                  onChange={(e) =>
                    setPreferences({ ...preferences, location: e.target.value })
                  }
                  placeholder="es. Italia / Remoto Europa, Milano..."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Seniority Level
                </label>
                <select
                  value={preferences.seniority}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      seniority: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">Tutti i livelli</option>
                  <option value="Senior">Senior (5-8+ anni)</option>
                  <option value="Lead">Lead / Staff Architect</option>
                  <option value="Mid">Mid-Level (2-4 anni)</option>
                  <option value="Junior">Junior</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Voto Minimo Affinità ({preferences.minMatchScore}%)
                </label>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="5"
                  value={preferences.minMatchScore}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      minMatchScore: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                />
              </div>
            </div>

            {/* Advanced Filters Toggle & Panel */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700/80 hover:border-indigo-400 dark:hover:border-indigo-600 bg-stone-50/70 dark:bg-stone-800/40 text-xs text-stone-700 dark:text-stone-300 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Filtri Avanzati di Ricerca</span>
                  <span className="text-[11px] font-normal text-stone-500">
                    (Lingua annuncio, RAL minima, Settore, Dimensione azienda, Freschezza)
                  </span>
                  {([
                    preferences.languageFilter && preferences.languageFilter !== "any",
                    preferences.minSalary && preferences.minSalary !== "any",
                    preferences.industrySector && preferences.industrySector !== "all",
                    preferences.companySize && preferences.companySize !== "any",
                    preferences.publishFreshness && preferences.publishFreshness !== "any",
                  ].filter(Boolean).length > 0) && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {[
                        preferences.languageFilter && preferences.languageFilter !== "any",
                        preferences.minSalary && preferences.minSalary !== "any",
                        preferences.industrySector && preferences.industrySector !== "all",
                        preferences.companySize && preferences.companySize !== "any",
                        preferences.publishFreshness && preferences.publishFreshness !== "any",
                      ].filter(Boolean).length} attivi
                    </span>
                  )}
                </div>
                {showAdvancedFilters ? (
                  <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                )}
              </button>

              {showAdvancedFilters && (
                <div className="mt-2.5 p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/40 space-y-3.5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {/* 1. Lingua Annuncio / Team */}
                    <div>
                      <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        🗣️ Lingua dell'Annuncio o del Team
                      </label>
                      <select
                        value={preferences.languageFilter || "any"}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            languageFilter: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="any">Qualsiasi lingua</option>
                        <option value="it">🇮🇹 Solo Italiano / Team Italia</option>
                        <option value="en">🇬🇧 Inglese / Team Internazionale</option>
                        <option value="bilingual">🌐 Bilingue (Italiano + Inglese)</option>
                        <option value="de">🇩🇪 Tedesco / Mercato DACH</option>
                        <option value="fr">🇫🇷 Francese</option>
                        <option value="es">🇪🇸 Spagnolo</option>
                      </select>
                    </div>

                    {/* 2. RAL Minima Desiderata */}
                    <div>
                      <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        💰 Retribuzione Desiderata (RAL)
                      </label>
                      <select
                        value={preferences.minSalary || "any"}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            minSalary: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="any">Qualsiasi range / Senza vincolo</option>
                        <option value="under_30k">Meno di €30.000 / anno (Entry level / Stage / Junior)</option>
                        <option value="25k_35k">€25.000 - €35.000 / anno</option>
                        <option value="35k_50k">€35.000 - €50.000 / anno</option>
                        <option value="30k">&gt; €30.000 / anno</option>
                        <option value="40k">&gt; €40.000 / anno</option>
                        <option value="50k">&gt; €50.000 / anno</option>
                        <option value="60k">&gt; €60.000 / anno</option>
                        <option value="80k">&gt; €80.000 / anno</option>
                        <option value="100k">&gt; €100.000 / anno (Executive)</option>
                      </select>
                    </div>

                    {/* 3. Ruolo Specifico Desiderato (Opzionale) */}
                    <div>
                      <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        🎯 Titolo o Ruolo Target (Opzionale)
                      </label>
                      <input
                        type="text"
                        value={preferences.roleFilter || ""}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            roleFilter: e.target.value,
                          })
                        }
                        placeholder="Es: Marketing Specialist, Contabile, Account Manager..."
                        className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* 4. Filtro Anti-Non Attinente (Parole da Escludere) */}
                    <div>
                      <label className="block font-semibold text-rose-700 dark:text-rose-400 mb-1">
                        🚫 Parole da Escludere (Filtro Negativo)
                      </label>
                      <input
                        type="text"
                        value={preferences.excludeKeywords || ""}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            excludeKeywords: e.target.value,
                          })
                        }
                        placeholder="Es: contabile, disegnatore, elettricista, avvocato, software developer, boulangerie"
                        className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-rose-200 dark:border-rose-900/60 rounded-xl text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                        Esclude all&apos;istante qualsiasi annuncio contenente questi termini nel titolo o descrizione.
                      </p>
                    </div>

                    {/* 5. Settore / Industria */}
                    <div>
                      <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        🏷️ Settore o Industria Specifica
                      </label>
                      <select
                        value={preferences.industrySector || "all"}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            industrySector: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="all">Tutti i settori (in base al CV)</option>
                        <option value="Marketing, Media & Communication">Marketing, Media & Adv</option>
                        <option value="Commerciale, Vendite & Business Development">Commerciale & Vendite</option>
                        <option value="Amministrazione, Risorse Umane & Finanza">Amministrazione, HR & Finanza</option>
                        <option value="Hospitality, Ristorazione & Turismo">Luxury Hospitality & Turismo</option>
                        <option value="FinTech & Banking">FinTech & Servizi Finanziari</option>
                        <option value="E-commerce & Retail">E-commerce, Brand & Retail</option>
                        <option value="Consulenza & IT Services">Consulenza Direzionale & Servizi</option>
                        <option value="SaaS & Cloud Software">SaaS & Software</option>
                        <option value="HealthTech & Pharma">Salute, Biotech & Pharma</option>
                      </select>
                    </div>

                    {/* 6. Dimensione Aziendale */}
                    <div>
                      <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        👥 Dimensione Aziendale
                      </label>
                      <select
                        value={preferences.companySize || "any"}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            companySize: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="any">Tutte le dimensioni</option>
                        <option value="startup">🚀 Startup (&lt; 50 dipendenti)</option>
                        <option value="scaleup">📈 Scaleup & PMI Innovativa (50-250)</option>
                        <option value="enterprise">🏢 Grande Impresa & Enterprise (250+)</option>
                      </select>
                    </div>

                    {/* 7. Data di Pubblicazione / Freschezza */}
                    <div>
                      <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        📅 Freschezza Annuncio
                      </label>
                      <select
                        value={preferences.publishFreshness || "any"}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            publishFreshness: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="any">Qualsiasi data (Tutte le aperte)</option>
                        <option value="24h">⚡ Ultime 24 ore (Recentissime)</option>
                        <option value="7d">🗓️ Ultimi 7 giorni (Ultima settimana)</option>
                        <option value="30d">📆 Ultimi 30 giorni (Ultimo mese)</option>
                      </select>
                    </div>

                    {/* 8. Quantità Offerte da Trovare */}
                    <div>
                      <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        🎯 Offerte da Trovare
                      </label>
                      <select
                        value={preferences.resultsCount || 12}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            resultsCount: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value={8}>8 Offerte</option>
                        <option value={12}>12 Offerte (Consigliato - Analisi profonda)</option>
                        <option value={16}>16 Offerte (Panoramica estesa)</option>
                        <option value={20}>20 Offerte (Scansione globale completa)</option>
                      </select>
                    </div>

                    {/* Quick Reset Button */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() =>
                          setPreferences((prev) => ({
                            ...prev,
                            languageFilter: "any",
                            minSalary: "any",
                            industrySector: "all",
                            companySize: "any",
                            publishFreshness: "any",
                            resultsCount: 12,
                          }))
                        }
                        className="w-full px-3 py-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-stone-300 rounded-xl font-medium transition-colors"
                      >
                        Ripristina filtri avanzati
                      </button>
                    </div>
                  </div>

                  {/* AI Matching Precision & Salary Sensitivity Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Salary Sensitivity Toggle */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      preferences.salarySensitivity
                        ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 shadow-xs"
                        : "bg-white dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/80"
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm">⚖️</span>
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                              Sensibilità Salariale (Salary Sensitivity)
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              preferences.salarySensitivity
                                ? "bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                                : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400"
                            }`}>
                              {preferences.salarySensitivity ? "ATTIVA" : "OFF"}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                            Pondera dinamicamente la ricerca e il punteggio AI per favorire le fasce di retribuzione più basse e accessibili (&lt; €30.000 / anno, entry level e junior/mid), abbattendo sovrastime artificiose.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={Boolean(preferences.salarySensitivity)}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                salarySensitivity: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-stone-600 peer-checked:bg-amber-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Strict Role-Based Matching Toggle */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      preferences.strictRoleMatching !== false
                        ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700/80 shadow-xs"
                        : "bg-white dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/80"
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm">🎯</span>
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                              Strict Role Matching (Vincolo Stretto al CV)
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              preferences.strictRoleMatching !== false
                                ? "bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100"
                                : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400"
                            }`}>
                              {preferences.strictRoleMatching !== false ? "ATTIVA" : "OFF"}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-snug">
                            Vincola l&apos;AI a proporre solo ruoli direttamente attinenti al profilo professionale e alle mansioni del tuo CV caricato, eliminando mestieri e professioni estranee.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={preferences.strictRoleMatching !== false}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                strictRoleMatching: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-stone-600 peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 🇲🇨 Speciale Principato di Monaco & Frontalieri nei Filtri Avanzati */}
                  <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🇲🇨</span>
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          Radar Monaco & Monte-Carlo (Frontalieri da Nizza / Costa Azzurra)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMonacoDirectoryModal(true)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Info className="w-3 h-3" />
                        <span>Guida & Portali Ufficiali Monaco</span>
                      </button>
                    </div>

                    <div className="p-3 bg-red-50/60 dark:bg-red-950/20 rounded-xl border border-red-200/80 dark:border-red-900/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-stone-800 dark:text-stone-200 mb-1">
                          Attiva Modalità Monaco:
                        </label>
                        <button
                          type="button"
                          onClick={() => handleToggleMonacoRadar()}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                            preferences.monacoSpecificRadar?.enabled
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
                          }`}
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>{preferences.monacoSpecificRadar?.enabled ? "● Attivo (Disattiva)" : "Attiva per Monaco"}</span>
                        </button>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-800 dark:text-stone-200 mb-1">
                          Settore Specifico Monaco:
                        </label>
                        <select
                          value={preferences.monacoSpecificRadar?.sectorFocus || "all"}
                          onChange={(e) => {
                            const newSector = e.target.value as any;
                            setPreferences((prev) => ({
                              ...prev,
                              monacoSpecificRadar: {
                                ...(prev.monacoSpecificRadar || { enabled: true }),
                                sectorFocus: newSector,
                              },
                            }));
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-semibold focus:outline-none"
                        >
                          <option value="all">Tutti i settori di Monaco</option>
                          <option value="finance_banking">🏦 Banche & Finanza (CMB, CFM Indosuez, Barclays...)</option>
                          <option value="luxury_hospitality_sbm">🎰 SBM & Hotellerie (Hôtel de Paris, Hermitage...)</option>
                          <option value="yachting_shipping">⛵ Yachting, Shipping (Fraser, Monaco Marine...)</option>
                          <option value="tech_digital">💻 Tech & Telecom (Monaco Telecom, Telis...)</option>
                          <option value="corporate_services">🏢 Corporate Services & FEDEM</option>
                          <option value="construction_realestate">🏗️ Edilizia & Real Estate (Pastor, Marzocco)</option>
                          <option value="healthcare">🏥 Sanità (CHPG Monaco)</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-center space-y-1">
                        <span className="text-[10px] text-stone-500 font-medium">
                          🚆 Treno TER Nice &rarr; Monaco: 20-22 min diretto
                        </span>
                        <span className="text-[10px] text-stone-500 font-medium">
                          💶 Retribuzione netta più alta + cassa CAR/CCSS
                        </span>
                        <span className="text-[10px] text-stone-500 font-medium">
                          🗣️ Italiano + Francese + Inglese: forte vantaggio competitivo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Keyword / Role Filter & Submit */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={preferences.roleFilter || ""}
                  onChange={(e) =>
                    setPreferences({ ...preferences, roleFilter: e.target.value })
                  }
                  placeholder="Filtro opzionale per ruolo o competenza (es. Brand Manager, Sales Director, Controller, HR, Marketing...)"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleDiscoverJobs()}
                  disabled={isSearchingJobs}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${isSearchingJobs ? "animate-spin" : ""}`} />
                  <span>{isSearchingJobs ? "Cercando offerte affini..." : "🔍 Cerca con AI"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveSearchModal(true)}
                  className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Salva questa ricerca e i suoi criteri attuali (ruolo, stipendio, sede)"
                >
                  <BookmarkPlus className="w-4 h-4 text-indigo-500" />
                  <span className="hidden sm:inline">Salva Ricerca</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  openCopilot(
                    "job-hunter",
                    preferences.roleFilter
                      ? `Cercami offerte attive su portali ATS (Greenhouse, Lever, Workday) per ${preferences.roleFilter} in ${preferences.location || "Remoto o Italia"}`
                      : `Scandaglia i portali e le pagine Careers aziendali (Greenhouse, Lever, Workday) per il mio profilo`
                  )
                }
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                title="Chiedi al Copilot di cercare e affinare posizioni in chat"
              >
                <Bot className="w-4 h-4" />
                <span>Chatta con Copilot AI</span>
              </button>
            </div>

            {/* Deep Radar & Copilot Pro-tip Banner */}
            <div className="p-3 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-stone-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-stone-900/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">✨</span>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-[11px]">
                  <strong>Ricerca Profonda & Conversazionale:</strong> Puoi chiedere al Copilot di cercare in linguaggio naturale (es. <em>"trovami aziende SaaS che assumono da remoto con Greenhouse o Lever"</em>) e salvare le offerte direttamente nel tuo Kanban con 1 click.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openCopilot("job-hunter")}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>Avvia Chat</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Search Error Message */}
          {searchError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Results Count, In-page Search, External Portals Deep Search & Controls */}
          {(() => {
            const filteredJobs = discoveredJobs.filter((job) => {
              if (searchQueryFilter.trim()) {
                const q = searchQueryFilter.toLowerCase();
                const matches =
                  job.title.toLowerCase().includes(q) ||
                  job.company.toLowerCase().includes(q) ||
                  job.description.toLowerCase().includes(q) ||
                  (job.matchedSkills || []).some((s) => s.toLowerCase().includes(q));
                if (!matches) return false;
              }
              if (portalFilter !== "all" && job.portal !== portalFilter) {
                return false;
              }
              if (salaryQuickFilter !== "all") {
                const sal = (job.salary || "").toLowerCase();
                const cleaned = sal.replace(/\./g, "").replace(/,/g, ".");
                const nums = (cleaned.match(/\d{4,6}/g) || []).map((n) => parseInt(n, 10));
                const minVal = nums.length > 0 ? nums[0] : 0;
                const maxVal = nums.length > 1 ? nums[1] : (nums.length > 0 ? nums[0] : 0);

                if (salaryQuickFilter === "under_30k") {
                  const isUnder =
                    (minVal > 0 && minVal <= 30000) ||
                    sal.includes("junior") ||
                    sal.includes("entry") ||
                    sal.includes("stage") ||
                    sal.includes("meno di 30");
                  if (!isUnder) return false;
                } else if (salaryQuickFilter === "25k_35k") {
                  const isMatch = (minVal <= 35000 && maxVal >= 24000) || sal.includes("junior/mid");
                  if (!isMatch) return false;
                } else if (salaryQuickFilter === "35k_50k") {
                  const isMatch = (minVal <= 50000 && maxVal >= 34000) || sal.includes("mid/senior");
                  if (!isMatch) return false;
                } else if (salaryQuickFilter === "over_50k") {
                  const isHigh =
                    maxVal >= 50000 ||
                    minVal >= 50000 ||
                    sal.includes("executive") ||
                    sal.includes("senior/lead");
                  if (!isHigh) return false;
                }
              }
              return true;
            })
            .sort((a, b) => {
              // If Salary Sensitivity is enabled, dynamically prioritize and weight lower/accessible salary ranges
              if (preferences.salarySensitivity) {
                const cleanA = (a.salary || "").toLowerCase().replace(/\./g, "");
                const cleanB = (b.salary || "").toLowerCase().replace(/\./g, "");
                const numA = parseInt((cleanA.match(/\d{4,6}/g) || ["40000"])[0], 10);
                const numB = parseInt((cleanB.match(/\d{4,6}/g) || ["40000"])[0], 10);
                const scoreA = numA <= 32000 ? -50 : (numA <= 42000 ? 0 : 50);
                const scoreB = numB <= 32000 ? -50 : (numB <= 42000 ? 0 : 50);
                if (scoreA !== scoreB) return scoreA - scoreB;
              }
              return (b.matchScore || 0) - (a.matchScore || 0);
            });

            const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));
            const startIndex = (currentPage - 1) * jobsPerPage;
            const paginatedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

            const effectiveQueryRole = preferences.roleFilter || cvSummary?.extractedProfile || "Posizione Professionale";
            const effectiveLocation = preferences.location || "Italia";

            return (
              <>
                {/* 1-Click Multi-Source Deep Search Launcher Bar */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 text-white shadow-md border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold tracking-wide">
                        Ricerca Profonda Multi-Portale Esterno
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        1-Click Live
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      Apri direttamente le posizioni attinenti al tuo CV su Indeed, LinkedIn, Jobicy e Portali Monaco:
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://it.indeed.com/jobs?q=${encodeURIComponent(effectiveQueryRole)}&l=${encodeURIComponent(effectiveLocation)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5"
                      title="Cerca su Indeed con profilo e filtri del tuo CV"
                    >
                      <span>Indeed</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>

                    <a
                      href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(effectiveQueryRole)}&location=${encodeURIComponent(effectiveLocation)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5"
                      title="Cerca su LinkedIn Jobs con profilo e filtri del tuo CV"
                    >
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>

                    <a
                      href={`https://jobicy.com/jobs?q=${encodeURIComponent(effectiveQueryRole)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5"
                      title="Cerca posizioni remote su Jobicy"
                    >
                      <span>Jobicy</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>

                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(`${effectiveQueryRole} ${effectiveLocation} offerte lavoro posizioni aperte`)}&ibp=htl;jobs`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all border border-white/20 flex items-center gap-1.5"
                      title="Cerca su Google Jobs aggregatore"
                    >
                      <span>Google Jobs</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setShowMonacoDirectoryModal(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5"
                      title="Apri radar e directory ufficiale Principato di Monaco"
                    >
                      <Crown className="w-3 h-3 text-amber-300" />
                      <span>Portali Monaco</span>
                    </button>
                  </div>
                </div>

                {/* In-Page Quick Filters & Search Toolbar */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQueryFilter}
                        onChange={(e) => {
                          setSearchQueryFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Filtra tra le offerte per titolo, azienda o competenza..."
                        className="w-full pl-9 pr-8 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {searchQueryFilter && (
                        <button
                          type="button"
                          onClick={() => setSearchQueryFilter("")}
                          className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Filter by Portal */}
                    <select
                      value={portalFilter}
                      onChange={(e) => {
                        setPortalFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none"
                    >
                      <option value="all">Tutti i portali ({discoveredJobs.length})</option>
                      <option value="Indeed">Indeed</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Jobicy">Jobicy</option>
                      <option value="RemoteOK">RemoteOK</option>
                      <option value="MonteCarloWork">MonteCarloWork</option>
                      <option value="EmploiMonaco">Emploi-Monaco</option>
                      <option value="SBM">SBM Monaco</option>
                      <option value="GouvMonaco">Gouv Monaco</option>
                      <option value="CompanyCareers">Carriere Dirette</option>
                    </select>

                    {/* Filter by Salary Bracket */}
                    <select
                      value={salaryQuickFilter}
                      onChange={(e) => {
                        setSalaryQuickFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none"
                    >
                      <option value="all">Tutte le retribuzioni</option>
                      <option value="under_30k">&lt; €30.000 / anno (Entry / Junior)</option>
                      <option value="25k_35k">€25.000 - €35.000 / anno (Junior / Mid)</option>
                      <option value="35k_50k">€35.000 - €50.000 / anno (Mid / Senior)</option>
                      <option value="over_50k">&gt; €50.000 / anno (Senior / Lead / Executive)</option>
                    </select>

                    {/* Salary Sensitivity Fast Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        setPreferences((prev) => ({
                          ...prev,
                          salarySensitivity: !prev.salarySensitivity,
                        }));
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        preferences.salarySensitivity
                          ? "bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 shadow-xs"
                          : "bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700"
                      }`}
                      title="Attiva/disattiva Sensibilità Salariale per ponderare in primo piano le fasce più accessibili (< 30k / entry-mid)"
                    >
                      <span>⚖️</span>
                      <span>Sensibilità Salariale</span>
                      {preferences.salarySensitivity ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-white">ON</span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400">OFF</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Results Count, Pagination Status & Controls */}
                <div
                  id="job-results-container"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500 pt-1 pb-2 border-b border-stone-200 dark:border-stone-800"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span>
                      Mostrate <strong className="text-stone-900 dark:text-stone-100">{filteredJobs.length}</strong> di {discoveredJobs.length} offerte pertinenti
                    </span>
                    {filteredJobs.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Verificate Live</span>
                      </span>
                    )}

                    <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 px-2.5 py-1 rounded-xl transition-colors border border-stone-200/80 dark:border-stone-700/80 ml-1">
                      <input
                        type="checkbox"
                        checked={autoVerifyBeforeImport}
                        onChange={(e) => setAutoVerifyBeforeImport(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Verifica automatica AI prima di salvare</span>
                    </label>
                  </div>

                  {filteredJobs.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[11px] text-stone-600 dark:text-stone-400">
                        Pagina <strong className="text-stone-900 dark:text-stone-100">{currentPage}</strong> di {totalPages}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-stone-500">Per pagina:</label>
                        <select
                          value={jobsPerPage}
                          onChange={(e) => {
                            setJobsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-2 py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none"
                        >
                          <option value={4}>4</option>
                          <option value={6}>6</option>
                          <option value={8}>8</option>
                          <option value={12}>12</option>
                          <option value={24}>Tutte ({filteredJobs.length})</option>
                        </select>
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentPage((p) => Math.max(1, p - 1));
                              document.getElementById("job-results-container")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            disabled={currentPage === 1}
                            className="p-1 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 transition-colors"
                            title="Pagina precedente"
                          >
                            <ChevronLeft className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentPage((p) => Math.min(totalPages, p + 1));
                              document.getElementById("job-results-container")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            disabled={currentPage === totalPages}
                            className="p-1 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 transition-colors"
                            title="Pagina successiva"
                          >
                            <ChevronRight className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Job Offers Cards Grid (Paginated) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {paginatedJobs.map((job) => {
                    const isImported = importedJobIds[job.id];
                    const verif = verificationMap[job.id] || job.verification;
                    const isVerifying = verifyingJobId === job.id;
                    const effectiveJobUrl = job.jobUrl || verif?.verifiedUrl;
                    const isMonacoJob = Boolean(
                      job.monacoFrontalierInfo?.isMonaco ||
                      job.location?.toLowerCase().includes("monaco") ||
                      job.location?.toLowerCase().includes("monte carlo") ||
                      job.company?.toLowerCase().includes("bains de mer")
                    );
                    return (
                      <div
                        key={job.id}
                        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        {/* Card Header: Portal, Workplace, Match Score */}
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* 🇲🇨 Special Monaco Badge if applicable */}
                              {isMonacoJob && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 shadow-2xs">
                                  <span>🇲🇨 Monaco Frontalieri</span>
                                </span>
                              )}

                              {/* Preliminary Verification Seal (HTTP 200 Confirmation) */}
                              {job.preliminaryVerification?.isVerified && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-400/70 dark:border-emerald-600/70 shadow-2xs">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Pre-Verificata HTTP 200 (Online Ora)</span>
                                </span>
                              )}

                              {/* 100% Genuine Verified Badge */}
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                                  verif?.status === "verified_active"
                                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 shadow-xs"
                                    : verif?.status === "alternative_active"
                                    ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700"
                                    : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>
                                  {verif?.status === "verified_active"
                                    ? "100% Reale Verificato Online"
                                    : verif?.status === "alternative_active"
                                    ? "Azienda Verificata"
                                    : "Reale Verificato"}
                                </span>
                              </span>

                              {/* Live Grounding Badge */}
                              {job.isLiveGrounding && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                                  <Globe className="w-3 h-3 text-emerald-500 animate-pulse" />
                                  <span>Live Web</span>
                                </span>
                              )}

                              {/* Direct Company Career badge */}
                              {job.isDirectCompanyCareer && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  <Building2 className="w-3 h-3 text-blue-500" />
                                  <span>Carriera Diretta</span>
                                </span>
                              )}

                              <span
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${getPortalBadgeColor(
                                  job.portal
                                )}`}
                              >
                                {job.portal === "CompanyCareers" ? "🏢 Portale Carriere" : job.portal}
                              </span>

                              <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                                {job.workplaceType === "Remote"
                                  ? "🏠 Remoto"
                                  : job.workplaceType === "Hybrid"
                                  ? "🔀 Ibrido"
                                  : "🏢 In Sede"}
                              </span>

                              {job.language && (
                                <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/80">
                                  🗣️ {job.language}
                                </span>
                              )}

                              {job.industrySector && (
                                <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80">
                                  🏷️ {job.industrySector}
                                </span>
                              )}

                              {job.companySize && (
                                <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80">
                                  👥 {job.companySize}
                                </span>
                              )}

                              {job.postedDate && (
                                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {job.postedDate}
                                </span>
                              )}
                            </div>

                            {/* Match Score Badge (Clickable to Compare with CV) */}
                            <button
                              type="button"
                              onClick={() => {
                                setComparingJob(job);
                                setShowCompareModal(true);
                              }}
                              className={`px-2.5 py-1 rounded-xl text-xs font-black border flex items-center gap-1 shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-2xs ${getScoreColor(
                                job.matchScore
                              )}`}
                              title={`Affinità: ${job.matchScore}% (${job.matchLevel}) - Clicca per confrontare con il tuo CV ed evidenziare i gap`}
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>{job.matchScore}%</span>
                            </button>
                          </div>

                          {/* Job Title & Company */}
                          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 mt-1">
                            <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-stone-400" />
                              {job.company}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-stone-400" />
                              {job.location}
                            </span>
                            {Boolean(formatSalaryDisplay(job.salary)) && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                                  <DollarSign className="w-3 h-3" />
                                  {formatSalaryDisplay(job.salary)}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Monaco Frontalier Commute & Tax Highlight */}
                          {isMonacoJob && (
                            <div className="mt-2.5 p-2 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/50 flex flex-wrap items-center justify-between gap-1 text-[11px] text-red-900 dark:text-red-200">
                              <div className="flex items-center gap-1 font-semibold">
                                <Train className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span>{job.monacoFrontalierInfo?.commuteNote || "Treno TER Nice &rarr; Monaco ~22 min (diretto da Nice-Ville)"}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>{job.monacoFrontalierInfo?.taxAdvantageNote || "Retribuzione netta Principato / CCSS"}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Why Good Match Callout */}
                        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                            <Sparkles className="w-3 h-3" />
                            <span>Perché è affine al tuo CV ({job.matchLevel})</span>
                          </div>
                          <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-[11px]">
                            {job.matchReasoning}
                          </p>
                        </div>

                        {/* Verified Live Sources / Company Careers Section */}
                        {((job.groundingSources && job.groundingSources.length > 0) || job.companyCareerUrl || job.googleJobsUrl) && (
                          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-2.5 text-[11px] space-y-1.5 border border-stone-200/60 dark:border-stone-700/60">
                            <div className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                              <Globe className="w-3 h-3 text-emerald-500" />
                              <span>Fonti Web & Verifiche Ufficiali:</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {job.companyCareerUrl && (
                                <a
                                  href={job.companyCareerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                  title="Apri pagina carriere o posizioni ufficiali dell'azienda"
                                >
                                  <Building2 className="w-3 h-3" />
                                  <span>Careers {job.company}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              {job.googleJobsUrl && (
                                <a
                                  href={job.googleJobsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                                  title="Esplora annunci correlati su Google Lavori"
                                >
                                  <Search className="w-3 h-3" />
                                  <span>Google Lavori Live</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              {job.groundingSources?.slice(0, 2).map((src, sIdx) => (
                                <a
                                  key={sIdx}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:underline max-w-[200px] truncate"
                                  title={src.title}
                                >
                                  <span>{src.title || "Fonte Web"}</span>
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Matched Skills & Missing Skills */}
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-[11px] text-stone-500 font-medium block mb-1">
                              Competenze Coincidenti (dal tuo CV):
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {job.matchedSkills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-medium"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                  <span>{typeof skill === "object" ? String((skill as any)?.name || (skill as any)?.skill || "") : skill}</span>
                                </span>
                              ))}
                            </div>
                          </div>

                          {job.missingSkills && job.missingSkills.length > 0 && (
                            <div>
                              <span className="text-[11px] text-stone-500 font-medium block mb-1">
                                Requisiti di preferenza da approfondire:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {job.missingSkills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 text-[11px]"
                                  >
                                    {typeof skill === "object" ? String((skill as any)?.name || (skill as any)?.skill || "") : skill}
                                  </span>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setComparingJob(job);
                                  setShowCompareModal(true);
                                }}
                                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline cursor-pointer"
                                title="Analizza dettagliatamente le parole chiave mancanti e i requisiti ATS"
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-500" />
                                <span>Analizza gap e parole chiave mancanti &rarr;</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Live AI Verification Details Box if verified */}
                        {verif && (
                          <div
                            className={`p-3 rounded-xl text-xs border space-y-1.5 transition-all ${
                              verif.status === "verified_active"
                                ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100"
                                : verif.status === "alternative_active"
                                ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800/80 text-blue-950 dark:text-blue-100"
                                : "bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-100"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 font-bold">
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck
                                  className={`w-3.5 h-3.5 ${
                                    verif.status === "verified_active"
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : verif.status === "alternative_active"
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-amber-600 dark:text-amber-400"
                                  }`}
                                />
                                <span>
                                  {verif.status === "verified_active"
                                    ? "Verificato 100% Reale e Attivo Online"
                                    : verif.status === "alternative_active"
                                    ? "Azienda e Posizioni Attive Confermate"
                                    : "Annuncio Specifico Non Confermato"}
                                </span>
                              </div>
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700">
                                {verif.confidence}% affidabilità
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed opacity-95">
                              {verif.summary}
                            </p>
                            {verif.verifiedUrl && (
                              <div className="pt-1.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px]">
                                <span className="text-stone-500 font-medium text-[10px]">Link verificato garantito:</span>
                                <a
                                  href={verif.verifiedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  <span>Apri Annuncio Verificato</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions Footer */}
                        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
                          {/* Primary Tracker Import & Auto-Apply Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleImportJob(job)}
                              disabled={isImported || isVerifying}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                isImported
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                              }`}
                            >
                              {isImported ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Nel Tracker!</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Aggiungi a Bacheca</span>
                                </>
                              )}
                            </button>

                            {/* 🔍 AI Live Verification Button */}
                            <button
                              type="button"
                              onClick={() => handleVerifyJob(job)}
                              disabled={isVerifying}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all border ${
                                verif?.status === "verified_active"
                                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                  : verif?.status === "alternative_active"
                                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                                  : verif?.status === "unverified_search_fallback"
                                  ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                                  : "bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                              }`}
                              title="Verifica in tempo reale se l'offerta e l'azienda esistono e sono aperte sul web"
                            >
                              {isVerifying ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                                  <span>Verifica in corso...</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck
                                    className={`w-3.5 h-3.5 ${
                                      verif?.status === "verified_active" ? "text-emerald-500" : "text-indigo-500"
                                    }`}
                                  />
                                  <span>{verif ? "Riverifica AI" : "Verifica con AI"}</span>
                                </>
                              )}
                            </button>

                            {/* ⚡ Auto-Apply Copilot Button */}
                            <button
                              type="button"
                              onClick={async () => {
                                const app = await handleImportJob(job);
                                if (app) openAutoApplyForApp(app);
                              }}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 flex items-center gap-1 transition-colors"
                              title="Apri l'assistente Auto-Apply per compilare e candidarti"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>⚡ Auto-Apply</span>
                            </button>

                            {/* 🔍 Confronta con CV & Gap ATS Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setComparingJob(job);
                                setShowCompareModal(true);
                              }}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                              title="Confronta il tuo CV con i requisiti di questa offerta ed evidenzia le competenze o parole chiave mancanti"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Confronta CV</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* External Verified Search/Job Link */}
                            <a
                              href={effectiveJobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-stone-700 dark:text-stone-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-stone-200 dark:border-stone-700 flex items-center gap-1 transition-all"
                              title={`Apri annuncio verificato su ${job.portal}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Vedi su {job.portal}</span>
                            </a>

                            {/* Google Jobs Quick Query */}
                            {job.googleJobsUrl && (
                              <a
                                href={job.googleJobsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1.5 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center gap-1 transition-all"
                                title="Verifica live l'offerta su Google Lavori"
                              >
                                <Search className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Google Lavori</span>
                              </a>
                            )}

                            {/* Tailor CV quick redirect */}
                            <button
                              type="button"
                              onClick={async () => {
                                const app = await handleImportJob(job);
                                if (app) setSelectedApplication(app);
                                setActiveTab("documents");
                              }}
                              className="px-2 py-1.5 rounded-xl text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-1 transition-colors"
                              title="Allinea il CV specificamente per questa offerta"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Adatta CV</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Pagination Controls */}
                {filteredJobs.length > 0 && totalPages > 1 && (
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200 dark:border-stone-800">
                    <span className="text-xs text-stone-500">
                      Mostrando da <strong>{startIndex + 1}</strong> a{" "}
                      <strong>{Math.min(startIndex + jobsPerPage, filteredJobs.length)}</strong> di{" "}
                      <strong>{filteredJobs.length}</strong> offerte
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          document.getElementById("job-results-container")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1 transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Precedente</span>
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => {
                            setCurrentPage(page);
                            document.getElementById("job-results-container")?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                            currentPage === page
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          document.getElementById("job-results-container")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1 transition-colors"
                      >
                        <span>Successiva</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Empty State when no jobs searched yet */}
          {discoveredJobs.length === 0 && !isSearchingJobs && (
            <div className="bg-stone-50 dark:bg-stone-900/50 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl p-8 sm:p-12 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Nessuna offerta ancora cercata
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Carica il tuo CV in formato PDF o DOCX (o incolla la tua esperienza professionale nel modulo sopra) e clicca su <strong>"Cerca Offerte Affini con AI"</strong> per scoprire posizioni reali personalizzate per la tua specifica carriera.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Carica CV (.pdf, .docx, .txt)</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt,.md,.markdown"
                    onChange={handleCvFileUpload}
                    disabled={isUploadingCv}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowCvEditor(true)}
                  className="px-4 py-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition-all"
                >
                  Visualizza / Incolla CV
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: EXISTING APPLICATIONS CV AFFINITY                   */}
      {/* ============================================================== */}
      {activeSubTab === "existing" && (
        <div className="space-y-6">
          {/* Summary Header */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Affinità del Tuo CV con le Candidature Già Effettuate</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Valuta se il tuo CV è perfettamente calibrato per le posizioni in cui ti sei già candidato o stai sostenendo colloqui.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={existingStageFilter}
                onChange={(e) => setExistingStageFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                <option value="all">Tutte le fasi ({applications.length})</option>
                <option value="applied">Inviata</option>
                <option value="screening">Screening</option>
                <option value="interviewing">Colloquio</option>
                <option value="offered">Offerta Ricevuta</option>
                <option value="wishlist">Da Candidarsi</option>
              </select>
            </div>
          </div>

          {/* Success Notification */}
          {scoringSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{scoringSuccessMsg}</span>
            </div>
          )}

          {/* Existing Applications List */}
          {filteredExistingApplications.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 space-y-3">
              <Building2 className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                Nessuna candidatura trovata con questo filtro
              </h3>
              <p className="text-xs text-stone-500">
                Aggiungi nuove candidature o cerca posizioni nella scheda "Offerte nei Portali".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExistingApplications
                .slice()
                .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
                .map((app) => {
                  const score = app.matchScore ?? 75;
                  const details = app.cvMatchDetails;

                  return (
                    <div
                      key={app.id}
                      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl p-5 shadow-sm transition-all space-y-4"
                    >
                      {/* Top Row: Company, Role, Stage, Match Score */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                              {app.company}
                            </span>
                            <span className="text-stone-300 dark:text-stone-700">·</span>
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                              {app.title}
                            </span>
                            <span className="text-stone-300 dark:text-stone-700">·</span>
                            <span className="text-xs text-stone-500">
                              {app.location} ({app.workplaceType})
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 capitalize text-[11px] font-medium">
                              Fase: {app.stage}
                            </span>
                            {app.sourcePlatform && (
                              <span className="text-[11px] text-stone-400">
                                Fonte: {app.sourcePlatform}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Affinity Gauge */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs text-stone-500 font-medium">Affinità CV</div>
                            <div className="text-sm font-black text-stone-900 dark:text-stone-100">
                              {score}%
                            </div>
                          </div>
                          <div
                            className={`w-12 h-12 rounded-xl border flex items-center justify-center font-black text-base shadow-xs ${getScoreColor(
                              score
                            )}`}
                          >
                            {score}%
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar of Match */}
                      <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            score >= 90
                              ? "bg-emerald-500"
                              : score >= 80
                              ? "bg-indigo-500"
                              : score >= 70
                              ? "bg-amber-500"
                              : "bg-stone-400"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                        />
                      </div>

                      {/* Detailed Strengths & Gaps */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-stone-50 dark:bg-stone-800/50 rounded-xl p-3 border border-stone-100 dark:border-stone-800">
                        <div>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Punti di Forza del tuo CV per questo Ruolo</span>
                          </span>
                          <ul className="space-y-1 text-stone-700 dark:text-stone-300 text-[11px] list-disc list-inside">
                            {(details?.strengths && details.strengths.length > 0
                              ? details.strengths
                              : [
                                  `Coincidenza con le competenze richieste: ${(app.requiredSkills || ["Competenze chiave"]).slice(0, 3).join(", ")}`,
                                  "Seniority congruente con le aspettative aziendali",
                                ]
                            ).map((st, i) => (
                              <li key={i}>{st}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Consiglio Tattico per il Colloquio</span>
                          </span>
                          <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                            {details?.interviewRecommendation ||
                              `In vista del colloquio con ${app.company}, porta esempi di problemi architetturali complessi risolti con ${(app.requiredSkills || ["le tue competenze"]).slice(0, 2).join(" e ")}.`}
                          </p>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between text-xs pt-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openAutoApplyForApp(app)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-2xs flex items-center gap-1.5"
                            title="AI Auto-Apply Copilot: Kit Candidatura e Risposte Form"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>Auto-Apply Copilot</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApplication(app);
                              setActiveModal("details");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 font-medium transition-colors"
                          >
                            Scheda Dettaglio
                          </button>
                          <button
                            type="button"
                            onClick={() => openInterviewCoachForApp(app)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-medium transition-colors flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Allena Colloquio</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApplication(app);
                              setActiveTab("documents");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 font-medium transition-colors flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Adatta CV</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const pseudoJob: DiscoveredJobOffer = {
                                id: app.id,
                                title: app.title,
                                company: app.company,
                                location: app.location || "N/D",
                                workplaceType: app.workplaceType || "Remote",
                                portal: (app.sourcePlatform as any) || "Other",
                                jobUrl: app.sourceUrl || "",
                                salary: app.salary ? String(app.salary) : undefined,
                                matchScore: score,
                                matchLevel: score >= 85 ? "Eccellente" : "Forte",
                                matchReasoning: details?.summary || "Analisi della candidatura",
                                matchedSkills: app.requiredSkills || [],
                                missingSkills: details?.gaps || [],
                                description: app.jobDescription || "",
                              };
                              setComparingJob(pseudoJob);
                              setShowCompareModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-semibold transition-colors flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                            title="Confronta il tuo CV con i requisiti di questa candidatura"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>Confronta CV</span>
                          </button>
                        </div>

                        {app.sourceUrl && (
                          <a
                            href={app.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-stone-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
                          >
                            <span>Link Annuncio</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Modal for Unverified / Dubious Job Confirmation */}
      {unverifiedConfirmJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Verifica Presenza Online
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                  L'AI ha verificato i motori di ricerca per{" "}
                  <strong>{unverifiedConfirmJob.job.title}</strong> presso{" "}
                  <strong>{unverifiedConfirmJob.job.company}</strong> ({unverifiedConfirmJob.job.location}).
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs space-y-2">
              <p className="text-amber-900 dark:text-amber-200 font-semibold">
                {unverifiedConfirmJob.verification.summary}
              </p>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                Per garantirti un link sempre funzionante ed evitare pagine 404 o annunci chiusi,
                l'AI ha predisposto un link di ricerca verificato che aprirà direttamente tutte le selezioni
                attive in questo mercato.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setUnverifiedConfirmJob(null)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  const job = unverifiedConfirmJob.job;
                  const verif = unverifiedConfirmJob.verification;
                  setUnverifiedConfirmJob(null);
                  importDiscoveredJob(job, "wishlist", verif);
                  setImportedJobIds((prev) => ({ ...prev, [job.id]: true }));
                  showToast(`Posizione salvata in bacheca con link di ricerca verificato!`, "success");
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                Salva con Link Verificato
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Saving a Job Search Preset */}
      {showSaveSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <BookmarkPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    Salva Criteri di Ricerca Job Hunter
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Crea un preset persistente con i tuoi criteri attuali per ricerche future con AI
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveSearchModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Current Criteria Summary */}
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/80 dark:border-stone-700/60 text-xs space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                Criteri che verranno memorizzati:
              </span>
              <div className="grid grid-cols-2 gap-2 text-stone-700 dark:text-stone-300">
                <div>
                  <span className="text-stone-500">🎯 Ruolo/Keyword: </span>
                  <span className="font-semibold">{preferences.roleFilter || "Tutti i ruoli compatibili col CV"}</span>
                </div>
                <div>
                  <span className="text-stone-500">📍 Location: </span>
                  <span className="font-semibold">{preferences.location || "Qualsiasi"}</span>
                </div>
                <div>
                  <span className="text-stone-500">💰 RAL minima: </span>
                  <span className="font-semibold">{preferences.minSalary && preferences.minSalary !== "any" ? `> €${preferences.minSalary}` : "Senza vincolo"}</span>
                </div>
                <div>
                  <span className="text-stone-500">🏢 Modalità: </span>
                  <span className="font-semibold">{preferences.workplaceType}</span>
                </div>
                <div>
                  <span className="text-stone-500">💼 Seniority: </span>
                  <span className="font-semibold">{preferences.seniority}</span>
                </div>
                <div>
                  <span className="text-stone-500">🗣️ Lingua: </span>
                  <span className="font-semibold">{preferences.languageFilter || 'any'}</span>
                </div>
                <div>
                  <span className="text-stone-500">🏷️ Settore: </span>
                  <span className="font-semibold">{preferences.industrySector || 'all'}</span>
                </div>
                <div>
                  <span className="text-stone-500">🌐 Fonti: </span>
                  <span className="font-semibold">{preferences.portals.length} portali + Careers</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSavedSearch} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Nome della ricerca salvata:
                </label>
                <input
                  type="text"
                  required
                  value={newSearchName}
                  onChange={(e) => setNewSearchName(e.target.value)}
                  placeholder="es. Senior Developer - Remote (RAL 60k)"
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowSaveSearchModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Salva Criteri per il Futuro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Monaco Directory & Frontalieri Guide */}
      {showMonacoDirectoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center text-xl shadow-md shadow-red-600/30">
                  🇲🇨
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>Guida & Portali Ufficiali Monaco</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                      Frontalieri da Nizza
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Tutto ciò che serve per trovare lavoro nel Principato e fare pendolarismo da Nizza
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMonacoDirectoryModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Strategic Advantages Callout */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-indigo-500/10 border border-red-200/80 dark:border-red-900/50 space-y-2 text-xs">
              <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Perché lavorare a Monaco vivendo a Nizza è un grande vantaggio?</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-700 dark:text-stone-300">
                <div className="flex items-start gap-1.5">
                  <Train className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span><strong>Treno TER Nizza &rarr; Monaco:</strong> appena 20-22 minuti da Nice-Ville o Nice-Riquier a Monaco-Monte-Carlo, con un treno ogni 15 minuti.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Retribuzione netta più alta:</strong> le buste paga nel Principato sono notevolmente superiori rispetto al mercato francese o italiano, con casse sociali dedicate (CCSS e CAR).</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                  <span><strong>Vantaggio Italiano madrelingua:</strong> la comunità economica italiana a Monaco è imponente; la combinazione Italiano + Francese + Inglese è tra le più ricercate.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Permesso di Lavoro:</strong> non devi richiederlo tu prima; è l'azienda monegasca che richiede l'autorizzazione di impiego al Service de l'Emploi una volta selezionato.</span>
                </div>
              </div>
            </div>

            {/* Monaco Official Portals Directory */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-red-500" />
                <span>I 6 Portali & Canali di Reclutamento Ufficiali a Monaco</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {[
                  {
                    name: "Service de l'Emploi (Gouvernement Princier)",
                    tag: "Canale Ufficiale di Stato",
                    badgeColor: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
                    url: "https://monservicepublic.gouv.mc/thematiques/emploi-et-recrutement/recherche-d-emploi",
                    desc: "Il portale della Direzione del Lavoro di Monaco. Qui passano per legge tutte le posizioni aperte registrate prima di essere aperte ai frontalieri.",
                  },
                  {
                    name: "MonacoJob (monacojob.com)",
                    tag: "Portale Privato Leader",
                    badgeColor: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300",
                    url: "https://www.monacojob.com",
                    desc: "La principale piattaforma di lavoro specializzata esclusivamente su aziende con sede a Monaco. Centinaia di offerte in tutti i settori.",
                  },
                  {
                    name: "Carrières SBM (Société des Bains de Mer)",
                    tag: "Primo Datore Privato",
                    badgeColor: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300",
                    url: "https://carrieres.montecarlosbm.com/",
                    desc: "Il colosso di Monaco: Casinò, Hôtel de Paris, Hermitage, Monte-Carlo Bay, ristoranti stellati, IT, manutenzione, finanza e corporate.",
                  },
                  {
                    name: "FEDEM (Fédération des Entreprises)",
                    tag: "Borsa Lavoro Imprese",
                    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
                    url: "https://www.fedem.mc/emploi/",
                    desc: "La federazione di tutte le imprese monegasche (commercio, servizi, banche, costruzioni, logistica) con borsa lavoro associativa.",
                  },
                  {
                    name: "Indeed Monaco (fr.indeed.com)",
                    tag: "Aggregatore Live",
                    badgeColor: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300",
                    url: "https://fr.indeed.com/emplois?q=&l=Monaco",
                    desc: "Indeed con filtro geografico su Monaco: costantemente aggiornato con annunci di agenzie interinali e datori di lavoro locali.",
                  },
                  {
                    name: "France Travail Frontaliers Monaco",
                    tag: "Code 99138 Monaco",
                    badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
                    url: "https://candidat.francetravail.fr/offres/recherche?lieux=99138",
                    desc: "La sezione di France Travail dedicata ai residenti nel dipartimento delle Alpi Marittime (Nice, Menton, Antibes) per offerte nel Principato.",
                  },
                ].map((portal, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between space-y-2 hover:border-red-300 dark:hover:border-red-900/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-xs leading-snug">
                          {portal.name}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold border shrink-0 ${portal.badgeColor}`}>
                          {portal.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                        {portal.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between">
                      <span className="text-[10px] text-stone-400">Portale Ufficiale</span>
                      <a
                        href={portal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline"
                      >
                        <span>Apri Portale</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowMonacoDirectoryModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
              >
                Chiudi
              </button>

              <button
                type="button"
                onClick={async () => {
                  setShowMonacoDirectoryModal(false);
                  await handleToggleMonacoRadar(true);
                }}
                disabled={isSearchingJobs}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Attiva Radar Monaco & Cerca Ora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for CV vs Selected Job Requirements & Missing Keywords Comparison */}
      <JobCvComparisonModal
        isOpen={showCompareModal}
        onClose={() => {
          setShowCompareModal(false);
          setComparingJob(null);
        }}
        job={comparingJob}
        activeCvText={cvText}
        onOpenTailorCv={async (jobOffer) => {
          const app = await handleImportJob(jobOffer);
          if (app) setSelectedApplication(app);
          setActiveTab("documents");
        }}
        onImportToTracker={async (jobOffer) => {
          await handleImportJob(jobOffer);
        }}
        isJobAlreadyImported={Boolean(comparingJob && importedJobIds[comparingJob.id])}
      />
    </div>
  );
};

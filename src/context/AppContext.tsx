import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  JobApplication,
  UserProfile,
  CoverLetterTemplate,
  SavedDocument,
  ApplicationStage,
  SupportedLanguage,
  DiscoveredJobOffer,
  CvMatchDetail,
  ToastMessage,
  JobVerificationResult,
} from "../types";
import {
  initialApplications,
  initialUserProfile,
  initialTemplates,
  initialDocuments,
} from "../data/initialData";
import { translations } from "../i18n/translations";
import { formatSalaryDisplay } from "../utils/salaryUtils";

interface AppContextType {
  applications: JobApplication[];
  userProfile: UserProfile;
  templates: CoverLetterTemplate[];
  documents: SavedDocument[];
  activeTab: "kanban" | "analytics" | "cover-letter" | "deadlines" | "documents" | "job-hunter";
  setActiveTab: (tab: "kanban" | "analytics" | "cover-letter" | "deadlines" | "documents" | "job-hunter") => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (typeof translations)["it"];
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
  isOnline: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  workplaceFilter: string;
  setWorkplaceFilter: (filter: string) => void;
  priorityFilter: string;
  setPriorityFilter: (filter: string) => void;
  selectedApplication: JobApplication | null;
  setSelectedApplication: (app: JobApplication | null) => void;
  activeModal: "import" | "details" | "interviewCoach" | "voice" | "backup" | "followUp" | "installApp" | "autoApply" | null;
  setActiveModal: (modal: "import" | "details" | "interviewCoach" | "voice" | "backup" | "followUp" | "installApp" | "autoApply" | null) => void;
  addApplication: (app: Omit<JobApplication, "id" | "createdAt" | "updatedAt">) => JobApplication;
  updateApplication: (id: string, updates: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;
  moveStage: (id: string, newStage: ApplicationStage) => void;
  updateUserProfile: (profile: UserProfile) => void;
  addTemplate: (template: Omit<CoverLetterTemplate, "id" | "updatedAt">) => void;
  updateTemplate: (id: string, updates: Partial<CoverLetterTemplate>) => void;
  deleteTemplate: (id: string) => void;
  addDocument: (doc: Omit<SavedDocument, "id" | "uploadedAt">) => SavedDocument;
  deleteDocument: (id: string) => void;
  triggerConfetti: () => void;
  exportDataAsJson: () => string;
  importDataFromJson: (jsonStr: string) => boolean;
  openCoverLetterForApp: (app: JobApplication) => void;
  openInterviewCoachForApp: (app: JobApplication) => void;
  openAutoApplyForApp: (app: JobApplication) => void;
  importDiscoveredJob: (offer: DiscoveredJobOffer, stage?: ApplicationStage, customVerification?: JobVerificationResult) => JobApplication;
  updateApplicationVerification: (id: string, verification: JobVerificationResult) => void;
  batchUpdateMatchScores: (results: { id: string; matchScore: number; cvMatchDetails?: CvMatchDetail }[]) => void;
  resetAllData: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "careerflow_ai_v2_data";
const LEGACY_STORAGE_KEY = "careerflow_ai_v1_data";

// Helper to detect initial dummy developer mock records without deleting real user applications
const isLegacyMockApp = (app: JobApplication): boolean => {
  // Only purge static test mock IDs from the earliest template version if they were never updated
  const staticMockIds = ["app-1", "app-2", "app-3", "app-4", "app-5", "app-6"];
  return staticMockIds.includes(app.id) && (!app.createdAt || app.createdAt.startsWith("2024-") || app.createdAt.startsWith("2025-01-"));
};

// Helper to detect legacy developer mock profile
const isLegacyMockProfile = (profile: UserProfile): boolean => {
  if (!profile) return true;
  return (
    profile.title === "Senior Full-Stack & Agile Software Engineer" ||
    (profile.skills?.includes("TypeScript") && profile.skills?.includes("React") && profile.skills?.length === 13)
  );
};

// Helper to detect legacy developer mock documents
const isLegacyMockDocument = (doc: SavedDocument): boolean => {
  return (
    doc.id === "doc-cv-master" ||
    doc.id === "doc-cv-bending" ||
    (doc.name || "").includes("Master Tech") ||
    (doc.name || "").includes("Bending Spoons")
  );
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load applications cleanly, migrating and purging old hardcoded developer mock records
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_apps`) || localStorage.getItem(`${LEGACY_STORAGE_KEY}_apps`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter((a) => !isLegacyMockApp(a))
            .map((a: any) => ({
              ...a,
              salary: formatSalaryDisplay(a.salary),
              company: typeof a.company === "object" ? String(a.company?.name || "Azienda") : String(a.company || "Azienda"),
              title: typeof a.title === "object" ? String(a.title?.name || "Ruolo") : String(a.title || "Ruolo"),
              location: typeof a.location === "object" ? String(a.location?.name || "Remoto") : String(a.location || "Remoto"),
              requiredSkills: Array.isArray(a.requiredSkills)
                ? a.requiredSkills.map((s: any) => (typeof s === "object" ? String(s?.name || s?.skill || "") : String(s)))
                : [],
              softSkills: Array.isArray(a.softSkills)
                ? a.softSkills.map((s: any) => (typeof s === "object" ? String(s?.name || s?.skill || "") : String(s)))
                : [],
              responsibilities: Array.isArray(a.responsibilities)
                ? a.responsibilities.map((r: any) => (typeof r === "object" ? String(r?.title || r?.name || "") : String(r)))
                : [],
              talkingPoints: Array.isArray(a.talkingPoints)
                ? a.talkingPoints.map((tp: any) => (typeof tp === "object" ? JSON.stringify(tp) : String(tp)))
                : [],
            }));
          return cleaned;
        }
      }
      return initialApplications;
    } catch {
      return initialApplications;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_profile`) || localStorage.getItem(`${LEGACY_STORAGE_KEY}_profile`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && !isLegacyMockProfile(parsed)) {
          return parsed;
        }
      }
      return initialUserProfile;
    } catch {
      return initialUserProfile;
    }
  });

  const [templates, setTemplates] = useState<CoverLetterTemplate[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_templates`) || localStorage.getItem(`${LEGACY_STORAGE_KEY}_templates`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some((t) => t.title?.includes("Full-Stack Senior"))) {
          return parsed;
        }
      }
      return initialTemplates;
    } catch {
      return initialTemplates;
    }
  });

  const [documents, setDocuments] = useState<SavedDocument[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_docs`) || localStorage.getItem(`${LEGACY_STORAGE_KEY}_docs`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((d) => !isLegacyMockDocument(d));
          return cleaned;
        }
      }
      return initialDocuments;
    } catch {
      return initialDocuments;
    }
  });

  const [activeTab, setActiveTab] = useState<
    "kanban" | "analytics" | "cover-letter" | "deadlines" | "documents" | "job-hunter"
  >("kanban");

  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_lang`);
      return (stored as SupportedLanguage) || "it";
    } catch {
      return "it";
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_dark`);
      if (stored !== null) return stored === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [searchQuery, setSearchQuery] = useState("");
  const [workplaceFilter, setWorkplaceFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [activeModal, setActiveModal] = useState<
    "import" | "details" | "interviewCoach" | "voice" | "backup" | "followUp" | "installApp" | "autoApply" | null
  >(null);

  // Global Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  // Online / offline event listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_apps`, JSON.stringify(applications));
    } catch (e) {
      console.warn("Storage full or error", e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(userProfile));
    } catch (e) {
      console.warn("Storage full or error", e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_templates`, JSON.stringify(templates));
    } catch (e) {
      console.warn("Storage full or error", e);
    }
  }, [templates]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_docs`, JSON.stringify(documents));
    } catch (e) {
      console.warn("Storage full or error", e);
    }
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_lang`, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_dark`, String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }
  };

  const addApplication = (appData: Omit<JobApplication, "id" | "createdAt" | "updatedAt">): JobApplication => {
    const newApp: JobApplication = {
      ...appData,
      salary: formatSalaryDisplay(appData.salary),
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setApplications((prev) => [newApp, ...prev]);
    return newApp;
  };

  const updateApplication = (id: string, updates: Partial<JobApplication>) => {
    const sanitizedUpdates = {
      ...updates,
      ...(updates.salary !== undefined ? { salary: formatSalaryDisplay(updates.salary) } : {}),
      updatedAt: new Date().toISOString(),
    };
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...sanitizedUpdates } : app))
    );
    if (selectedApplication && selectedApplication.id === id) {
      setSelectedApplication((prev) => (prev ? { ...prev, ...sanitizedUpdates } : null));
    }
  };

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    if (selectedApplication && selectedApplication.id === id) {
      setSelectedApplication(null);
      setActiveModal(null);
    }
  };

  const moveStage = (id: string, newStage: ApplicationStage) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          if (newStage === "offered" && app.stage !== "offered") {
            triggerConfetti();
          }
          return {
            ...app,
            stage: newStage,
            updatedAt: new Date().toISOString(),
            dateApplied:
              newStage === "applied" && !app.dateApplied
                ? new Date().toISOString().split("T")[0]
                : app.dateApplied,
          };
        }
        return app;
      })
    );
  };

  const updateUserProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
  };

  const addTemplate = (templateData: Omit<CoverLetterTemplate, "id" | "updatedAt">) => {
    const newTmpl: CoverLetterTemplate = {
      ...templateData,
      id: `tmpl-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [newTmpl, ...prev]);
  };

  const updateTemplate = (id: string, updates: Partial<CoverLetterTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const addDocument = (docData: Omit<SavedDocument, "id" | "uploadedAt">): SavedDocument => {
    const newDoc: SavedDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const exportDataAsJson = (): string => {
    const payload = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      userProfile,
      applications,
      templates,
      documents,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataFromJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.applications)) {
        setApplications(data.applications);
      }
      if (data.userProfile && typeof data.userProfile === "object") {
        setUserProfile(data.userProfile);
      }
      if (Array.isArray(data.templates)) {
        setTemplates(data.templates);
      }
      if (Array.isArray(data.documents)) {
        setDocuments(data.documents);
      }
      return true;
    } catch (e) {
      console.error("Failed to parse import data", e);
      return false;
    }
  };

  const openCoverLetterForApp = (app: JobApplication) => {
    setSelectedApplication(app);
    setActiveTab("cover-letter");
  };

  const openInterviewCoachForApp = (app: JobApplication) => {
    setSelectedApplication(app);
    setActiveModal("interviewCoach");
  };

  const openAutoApplyForApp = (app: JobApplication) => {
    setSelectedApplication(app);
    setActiveModal("autoApply");
  };

  const importDiscoveredJob = (
    offer: DiscoveredJobOffer,
    stage: ApplicationStage = "wishlist",
    customVerification?: JobVerificationResult
  ): JobApplication => {
    const finalVerification = customVerification || offer.verification;
    const finalSourceUrl = finalVerification?.verifiedUrl || offer.jobUrl;
    const finalSourcePlatform = finalVerification?.verifiedPlatform || offer.portal;

    const newApp = addApplication({
      company: offer.company,
      title: offer.title,
      stage: stage,
      location: offer.location,
      workplaceType: offer.workplaceType,
      salary: formatSalaryDisplay(offer.salary),
      sourceUrl: finalSourceUrl,
      sourcePlatform: finalSourcePlatform,
      jobDescription: offer.description,
      requiredSkills: offer.matchedSkills || [],
      matchScore: offer.matchScore,
      responsibilities: offer.keyResponsibilities || [],
      cvMatchDetails: {
        score: offer.matchScore,
        matchLevel: offer.matchLevel,
        strengths: [
          offer.matchReasoning,
          ...(offer.matchedSkills || []).map((s) => `Competenza coincidente: ${s}`),
        ],
        gaps: offer.missingSkills || [],
        interviewRecommendation: `Metti in evidenza l'esperienza con ${(offer.matchedSkills || []).slice(0, 3).join(", ")} e orientati ai requisiti di ${offer.company}.`,
        summary: offer.matchReasoning,
        evaluatedAt: new Date().toISOString(),
      },
      interviews: [],
      priority: offer.matchScore >= 90 ? "high" : "medium",
      verification: finalVerification,
    });
    triggerConfetti();
    return newApp;
  };

  const updateApplicationVerification = (
    id: string,
    verification: JobVerificationResult
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        return {
          ...app,
          verification,
          sourceUrl: verification.verifiedUrl || app.sourceUrl,
          sourcePlatform: verification.verifiedPlatform || app.sourcePlatform,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const batchUpdateMatchScores = (
    results: { id: string; matchScore: number; cvMatchDetails?: CvMatchDetail }[]
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        const found = results.find((r) => r.id === app.id);
        if (!found) return app;
        return {
          ...app,
          matchScore: found.matchScore,
          cvMatchDetails: found.cvMatchDetails || {
            score: found.matchScore,
            strengths: ["Allineamento del profilo rilevato dall'AI"],
            gaps: [],
            interviewRecommendation: "Prepara risposte incentrate sui progetti chiave del tuo CV.",
            summary: "Punteggio di affinità aggiornato con successo tramite scansione semantica del CV.",
            evaluatedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const resetAllData = () => {
    try {
      localStorage.removeItem(`${STORAGE_KEY}_apps`);
      localStorage.removeItem(`${STORAGE_KEY}_profile`);
      localStorage.removeItem(`${STORAGE_KEY}_docs`);
      localStorage.removeItem(`${STORAGE_KEY}_templates`);
      localStorage.removeItem(`${LEGACY_STORAGE_KEY}_apps`);
      localStorage.removeItem(`${LEGACY_STORAGE_KEY}_profile`);
      localStorage.removeItem(`${LEGACY_STORAGE_KEY}_docs`);
      localStorage.removeItem(`${LEGACY_STORAGE_KEY}_templates`);
      localStorage.removeItem("careerflow_skill_gap_analysis");
      localStorage.removeItem("careerflow_skill_gap_progress");
    } catch {
      // Ignore storage errors
    }
    setApplications([]);
    setUserProfile(initialUserProfile);
    setDocuments([]);
    setTemplates(initialTemplates);
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        applications,
        userProfile,
        templates,
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        t,
        darkMode,
        setDarkMode,
        toggleDarkMode,
        isOnline,
        searchQuery,
        setSearchQuery,
        workplaceFilter,
        setWorkplaceFilter,
        priorityFilter,
        setPriorityFilter,
        selectedApplication,
        setSelectedApplication,
        activeModal,
        setActiveModal,
        addApplication,
        updateApplication,
        deleteApplication,
        moveStage,
        updateUserProfile,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        documents,
        addDocument,
        deleteDocument,
        triggerConfetti,
        exportDataAsJson,
        importDataFromJson,
        openCoverLetterForApp,
        openInterviewCoachForApp,
        openAutoApplyForApp,
        importDiscoveredJob,
        updateApplicationVerification,
        batchUpdateMatchScores,
        resetAllData,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}

      {/* Global Toast Notifications Stack */}
      {toasts.length > 0 && (
        <div
          role="region"
          aria-label="Notifiche"
          className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 ${
                toast.type === "success"
                  ? "bg-emerald-50/95 dark:bg-emerald-950/95 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100"
                  : toast.type === "error"
                  ? "bg-rose-50/95 dark:bg-rose-950/95 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100"
                  : toast.type === "warning"
                  ? "bg-amber-50/95 dark:bg-amber-950/95 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100"
                  : "bg-stone-900/95 dark:bg-stone-800/95 border-stone-700 text-white"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {toast.type === "success" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                )}
                {toast.type === "error" && (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                {toast.type === "warning" && (
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                {toast.type === "info" && (
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                )}
                <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity shrink-0"
                aria-label="Chiudi notifica"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

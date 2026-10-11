import React, { useState, useRef } from "react";
import {
  UserCheck,
  FileText,
  Plus,
  Trash2,
  Save,
  Check,
  Sparkles,
  Copy,
  Upload,
  Download,
  Printer,
  TrendingUp,
  Target,
  ArrowRight,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Building2,
  RotateCcw,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Lightbulb,
  Loader2,
  FileUp,
  Languages,
  Palette,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { parseDocumentFile, getFileFormatMeta } from "../utils/documentParser";
import { UserProfile, CoverLetterTemplate, JobApplication, CvTailoringResult, SavedDocument } from "../types";
import { ResumePaper } from "./ResumePaper";
import { exportElementToPdf } from "../utils/pdfGenerator";

export const DocumentsVault: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    templates,
    addTemplate,
    deleteTemplate,
    documents,
    addDocument,
    deleteDocument,
    applications,
    selectedApplication,
    setSelectedApplication,
    setActiveTab,
    language,
    triggerConfetti,
    t,
  } = useApp();

  // Sub-tab selection
  const [activeSubTab, setActiveSubTab] = useState<"tailor" | "vault" | "profile">("tailor");

  // --- CV TAILORING STATE ---
  const [selectedAppId, setSelectedAppId] = useState<string>(
    selectedApplication?.id || applications[0]?.id || ""
  );

  const existingCvDoc = documents.find((d) => d.type === "cv" && d.content?.trim()) || documents.find((d) => d.content?.trim());
  const initialMasterCv =
    existingCvDoc?.content ||
    (userProfile.experienceSummary
      ? `# ${userProfile.name || "Candidato"}
${userProfile.title ? `**${userProfile.title}**\n` : ""}${userProfile.email ? `📧 ${userProfile.email} ` : ""}${userProfile.phone ? `| 📱 ${userProfile.phone} ` : ""}${userProfile.location ? `| 📍 ${userProfile.location}` : ""}

---

## 🎯 Profilo Professionale
${userProfile.experienceSummary}

${userProfile.skills && userProfile.skills.length > 0 ? `---

## 🛠️ Competenze Principali
${userProfile.skills.join(", ")}` : ""}

${userProfile.achievements ? `---

## 🏆 Risultati & Traguardi
${userProfile.achievements}` : ""}`
      : "");

  const [cvInputText, setCvInputText] = useState<string>(initialMasterCv);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [optimizationGoal, setOptimizationGoal] = useState<
    "ats_optimization" | "technical_depth" | "leadership_impact"
  >("ats_optimization");

  const [tailoringLoading, setTailoringLoading] = useState<boolean>(false);
  const [tailoringError, setTailoringError] = useState<string | null>(null);
  const [tailoredResult, setTailoredResult] = useState<CvTailoringResult | null>(null);
  const [resultTab, setResultTab] = useState<"markdown" | "preview" | "modifications">("preview");

  const [copiedCvSuccess, setCopiedCvSuccess] = useState<boolean>(false);
  const [copiedPitchSuccess, setCopiedPitchSuccess] = useState<boolean>(false);
  const [savedVaultSuccess, setSavedVaultSuccess] = useState<boolean>(false);
  const [skillsSyncedSuccess, setSkillsSyncedSuccess] = useState<boolean>(false);

  // New multi-language & executive PDF styling states
  const [targetLanguage, setTargetLanguage] = useState<"auto" | "it" | "en" | "fr">("auto");
  const [resumeTheme, setResumeTheme] = useState<"harvard" | "executive" | "modern">("executive");
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const resumePaperRef = useRef<HTMLDivElement>(null);

  // --- PROFILE FORM STATE ---
  const [profileForm, setProfileForm] = useState<UserProfile>(userProfile);
  const [skillsString, setSkillsString] = useState<string>(
    (userProfile.skills || []).join(", ")
  );
  const [savedProfileSuccess, setSavedProfileSuccess] = useState(false);

  // --- TEMPLATE & DOC MODAL STATE ---
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState<Partial<CoverLetterTemplate>>({
    title: "",
    content: "",
    language: "it",
    tags: ["Tech", "Custom"],
  });

  const [viewingDoc, setViewingDoc] = useState<SavedDocument | null>(null);

  const currentJobApp = applications.find((a) => a.id === selectedAppId);

  // File upload state for Tailoring
  const [isParsingCvFile, setIsParsingCvFile] = useState(false);
  const [cvFileError, setCvFileError] = useState<string | null>(null);
  const [cvFileSuccess, setCvFileSuccess] = useState<string | null>(null);
  const [parsedFileFormat, setParsedFileFormat] = useState<string | null>(null);

  // File upload state for Vault
  const [isUploadingToVault, setIsUploadingToVault] = useState(false);
  const [vaultUploadError, setVaultUploadError] = useState<string | null>(null);
  const [vaultUploadSuccess, setVaultUploadSuccess] = useState<string | null>(null);

  // File Upload Handler (reads .pdf, .docx, .txt, .md, and extracts text)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsParsingCvFile(true);
    setCvFileError(null);
    setCvFileSuccess(null);

    try {
      const result = await parseDocumentFile(file);
      setCvInputText(result.markdown);
      setParsedFileFormat(result.fileType.toUpperCase());
      setCvFileSuccess(`File "${file.name}" convertito ed estratto con successo (${result.wordCount} parole).`);
      
      // Auto-save to documents vault
      const docTypeFormat = (result.fileType === "pdf" ? "pdf" : result.fileType === "docx" ? "docx" : "txt") as any;
      addDocument({
        name: file.name,
        type: "cv",
        content: result.markdown,
        fileFormat: docTypeFormat,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        notes: `Caricato tramite Adatta CV (${result.wordCount} parole).`,
      });
    } catch (err: any) {
      console.error(err);
      setCvFileError(err.message || "Impossibile leggere il file.");
    } finally {
      setIsParsingCvFile(false);
      e.target.value = "";
    }
  };

  const handleVaultDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingToVault(true);
    setVaultUploadError(null);
    setVaultUploadSuccess(null);

    try {
      const result = await parseDocumentFile(file);
      const isCv = file.name.toLowerCase().includes("cv") || file.name.toLowerCase().includes("curriculum") || file.name.toLowerCase().includes("resume");
      const docTypeFormat = (result.fileType === "pdf" ? "pdf" : result.fileType === "docx" ? "docx" : "txt") as any;
      
      addDocument({
        name: file.name,
        type: isCv ? "cv" : "other",
        content: result.markdown,
        fileFormat: docTypeFormat,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        notes: `Caricato nel Vault (${result.wordCount} parole). ${
          result.metadata?.skills?.length ? `Skill: ${result.metadata.skills.slice(0, 5).join(", ")}` : ""
        }`,
      });

      setVaultUploadSuccess(`Documento "${file.name}" salvato nel Vault con successo!`);
      setTimeout(() => setVaultUploadSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
      setVaultUploadError(err.message || "Errore durante il caricamento.");
    } finally {
      setIsUploadingToVault(false);
      e.target.value = "";
    }
  };

  // Trigger Gemini AI CV Tailoring
  const handleTailorCv = async () => {
    if (!currentJobApp) {
      setTailoringError("Seleziona una candidatura per cui ottimizzare il CV.");
      return;
    }
    if (!cvInputText.trim()) {
      setTailoringError("Inserisci o carica il testo del tuo CV.");
      return;
    }

    setTailoringLoading(true);
    setTailoringError(null);

    try {
      const response = await fetch("/api/tailor-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: cvInputText,
          application: currentJobApp,
          userProfile,
          optimizationGoal,
          lang: targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }

      const data: CvTailoringResult = await response.json();
      setTailoredResult(data);
      triggerConfetti();
    } catch (err: any) {
      console.error("Errore nell'adattamento del CV:", err);
      setTailoringError(
        "Si è verificato un errore durante la connessione con l'AI. Riprova tra poco."
      );
    } finally {
      setTailoringLoading(false);
    }
  };

  // Download Formatted Executive A4 PDF directly
  const handleExportPdf = async () => {
    if (!resumePaperRef.current || !currentJobApp) {
      return;
    }
    setIsExportingPdf(true);
    try {
      const effectiveLang =
        targetLanguage === "auto"
          ? tailoredResult?.detectedLanguage || "it"
          : targetLanguage;

      const success = await exportElementToPdf(resumePaperRef.current, {
        candidateName: userProfile.name || "Candidato",
        company: currentJobApp.company || "Azienda",
        role: currentJobApp.title || "Ruolo",
        lang: effectiveLang,
      });

      if (success) {
        // PDF downloaded successfully
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Copy Tailored CV
  const handleCopyTailoredCv = () => {
    if (!tailoredResult?.tailoredCvMarkdown) return;
    navigator.clipboard.writeText(tailoredResult.tailoredCvMarkdown);
    setCopiedCvSuccess(true);
    setTimeout(() => setCopiedCvSuccess(false), 2000);
  };

  // Copy Elevator Pitch
  const handleCopyPitch = () => {
    if (!tailoredResult?.executiveSummaryPitch) return;
    navigator.clipboard.writeText(tailoredResult.executiveSummaryPitch);
    setCopiedPitchSuccess(true);
    setTimeout(() => setCopiedPitchSuccess(false), 2000);
  };

  // Download Markdown file
  const handleDownloadMarkdown = () => {
    if (!tailoredResult?.tailoredCvMarkdown) return;
    const blob = new Blob([tailoredResult.tailoredCvMarkdown], {
      type: "text/markdown;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeCompany = (currentJobApp?.company || "Target").replace(/\s+/g, "-");
    const safeName = (userProfile.name || "Candidato").replace(/\s+/g, "-");
    link.href = url;
    link.download = `CV-${safeName}-${safeCompany}-Tailored.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print / PDF export
  const handlePrint = () => {
    window.print();
  };

  // Save Tailored CV to Documents Vault
  const handleSaveToVault = () => {
    if (!tailoredResult?.tailoredCvMarkdown || !currentJobApp) return;

    const docName = `CV Tailored - ${currentJobApp.company} (${currentJobApp.title}).md`;
    addDocument({
      name: docName,
      type: "cv",
      content: tailoredResult.tailoredCvMarkdown,
      matchedApplicationId: currentJobApp.id,
      notes: `Ottimizzato con AI per ${currentJobApp.company} (ATS ${tailoredResult.atsMatchScoreAfter}%)`,
    });

    setSavedVaultSuccess(true);
    setTimeout(() => setSavedVaultSuccess(false), 2500);
  };

  // Sync new matched skills to Candidate Profile
  const handleSyncSkillsToProfile = () => {
    if (!tailoredResult?.matchedKeywords) return;
    const existingSkills = new Set(userProfile.skills || []);
    tailoredResult.matchedKeywords.forEach((kw) => existingSkills.add(kw));
    const updatedSkills = Array.from(existingSkills);

    updateUserProfile({
      ...userProfile,
      skills: updatedSkills,
    });

    setSkillsString(updatedSkills.join(", "));
    setSkillsSyncedSuccess(true);
    setTimeout(() => setSkillsSyncedSuccess(false), 2500);
  };

  // Save Candidate Profile Form
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = skillsString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const updated = {
      ...profileForm,
      skills: skillsArray,
    };

    updateUserProfile(updated);
    setSavedProfileSuccess(true);
    setTimeout(() => setSavedProfileSuccess(false), 2500);
  };

  // Template creation
  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.title || !templateForm.content) return;

    addTemplate({
      title: templateForm.title,
      content: templateForm.content,
      language: (templateForm.language as any) || "it",
      tags: templateForm.tags || ["Custom"],
    });

    setTemplateForm({ title: "", content: "", language: "it", tags: ["Custom"] });
    setShowNewTemplate(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header & Sub-Tab Switcher */}
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.profileTitle}</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {t.profileDesc}
          </p>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80 text-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab("tailor")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeSubTab === "tailor"
                ? "bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Adatta CV con AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("vault")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeSubTab === "vault"
                ? "bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Archivio Vault ({documents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("profile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeSubTab === "profile"
                ? "bg-white dark:bg-stone-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Profilo & Dati Personali</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. CV TAILORING STUDIO (NEW REQUESTED MODULE)                 */}
      {/* ============================================================== */}
      {activeSubTab === "tailor" && (
        <div className="space-y-6">
          {/* Banner Intro */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/70 via-stone-50 to-purple-50/50 dark:from-indigo-950/20 dark:via-stone-900 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {t.cvTailorTitle}
                </h2>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 max-w-3xl leading-relaxed">
                {t.cvTailorSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCvInputText(initialMasterCv)}
                className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/60 rounded-xl text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                <span>{t.loadDefaultCv}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Job Selection & CV Input Form (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Step 1: Target Job Selection */}
              <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-500" />
                    <span>{t.selectJobForCv}</span>
                  </label>
                  <span className="text-[11px] text-stone-400">
                    {applications.length} candidature disponibili
                  </span>
                </div>

                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="">{t.selectJobPlaceholder}</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company} — {app.title} ({app.matchScore || 0}% match)
                    </option>
                  ))}
                </select>

                {/* Selected Job Card Summary Preview */}
                {currentJobApp && (
                  <div className="p-3.5 bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-700/70 rounded-xl text-xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                          {currentJobApp.title}
                        </span>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3 h-3 text-stone-400" />
                          <span>{currentJobApp.company}</span>
                          <span>·</span>
                          <span>{currentJobApp.location}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
                        {currentJobApp.matchScore || 85}% match
                      </span>
                    </div>

                    {/* Required Skills Highlights */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                        Competenze Chiave Richieste (ATS Target):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(currentJobApp.requiredSkills || []).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium rounded-md border border-indigo-200/50 dark:border-indigo-800/40"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Upload or Edit Original CV Text */}
              <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-indigo-500" />
                    <span>Testo o File del tuo CV</span>
                  </label>

                  {/* File Upload Input */}
                  <label className={`cursor-pointer px-2.5 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 font-semibold transition-all ${
                    isParsingCvFile
                      ? "bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed border-stone-300 dark:border-stone-700"
                      : "bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                  }`}>
                    {isParsingCvFile ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    <span>{isParsingCvFile ? "Conversione..." : "Carica File (.pdf, .docx, .md, .txt)"}</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.md,.markdown"
                      onChange={handleFileUpload}
                      disabled={isParsingCvFile}
                      className="hidden"
                    />
                  </label>
                </div>

                {isParsingCvFile && (
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-2 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-indigo-600" />
                    <span>Estrazione ed analisi del testo in corso con AI (PDF/DOCX)...</span>
                  </div>
                )}

                {cvFileSuccess && (
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                    <span>{cvFileSuccess}</span>
                  </div>
                )}

                {cvFileError && (
                  <div className="text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200/60 dark:border-rose-800/60">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>{cvFileError}</span>
                  </div>
                )}

                {uploadedFileName && !cvFileSuccess && (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200/50">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Caricato: {uploadedFileName}</span>
                  </div>
                )}

                <textarea
                  rows={12}
                  value={cvInputText}
                  onChange={(e) => setCvInputText(e.target.value)}
                  placeholder="Incolla qui il tuo CV in formato testo o Markdown..."
                  className="w-full p-3 text-xs font-mono bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y"
                />

                {/* Target Language Selection */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Lingua del CV Adattato</span>
                    </label>
                    <span className="text-[10px] text-stone-400 font-medium">Standard Internazionale ATS</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-xs">
                    {[
                      { id: "auto", label: "⚡ Auto (Rileva)", desc: "Dall'annuncio" },
                      { id: "it", label: "🇮🇹 Italiano", desc: "Formato Italia" },
                      { id: "en", label: "🇬🇧 English", desc: "US/UK Exec" },
                      { id: "fr", label: "🇫🇷 Français", desc: "Cadre Standard" },
                    ].map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setTargetLanguage(l.id as any)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          targetLanguage === l.id
                            ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold shadow-2xs"
                            : "border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300 font-medium"
                        }`}
                      >
                        <div className="text-[11px] font-semibold">{l.label}</div>
                        <div className="text-[9px] text-stone-400">{l.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Strategy Options */}
                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                    {t.optimizationGoalLabel}
                  </label>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <label
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        optimizationGoal === "ats_optimization"
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-100 font-medium"
                          : "border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="goal"
                        checked={optimizationGoal === "ats_optimization"}
                        onChange={() => setOptimizationGoal("ats_optimization")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-semibold">{t.goalAts}</div>
                        <div className="text-[10px] text-stone-500">
                          Densità e ranking semantico massimo per i software ATS dei recruiter
                        </div>
                      </div>
                    </label>

                    <label
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        optimizationGoal === "technical_depth"
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-100 font-medium"
                          : "border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="goal"
                        checked={optimizationGoal === "technical_depth"}
                        onChange={() => setOptimizationGoal("technical_depth")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-semibold">{t.goalTechnical}</div>
                        <div className="text-[10px] text-stone-500">
                          Enfasi su architetture distribuite, performance e stack tecnologico
                        </div>
                      </div>
                    </label>

                    <label
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        optimizationGoal === "leadership_impact"
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-100 font-medium"
                          : "border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50 text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="goal"
                        checked={optimizationGoal === "leadership_impact"}
                        onChange={() => setOptimizationGoal("leadership_impact")}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="font-semibold">{t.goalLeadership}</div>
                        <div className="text-[10px] text-stone-500">
                          Metodologie agili, metriche di impatto % e ownership end-to-end
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {tailoringError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{tailoringError}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={tailoringLoading}
                  onClick={handleTailorCv}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {tailoringLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t.tailoringCvInProgress}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t.tailorCvBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Tailored Output & ATS Analysis (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {!tailoredResult ? (
                /* Empty state prompt */
                <div className="h-full min-h-[480px] p-8 bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                    Nessun CV Ottimizzato Generato
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm">
                    Seleziona una candidatura a sinistra e clicca su{" "}
                    <strong>&quot;{t.tailorCvBtn}&quot;</strong>. Gemini AI
                    analizzerà i requisiti dell&apos;annuncio ed effettuerà la
                    riscrittura ad alto impatto.
                  </p>
                </div>
              ) : (
                /* Active Result View */
                <div className="space-y-5">
                  {/* Score & Keyword Delta Card */}
                  <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span>{t.atsScoreComparison}</span>
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50">
                        +
                        {tailoredResult.atsMatchScoreAfter -
                          tailoredResult.atsMatchScoreBefore}
                        % Compatibilità Guadagnata
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Before */}
                      <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl space-y-1.5 border border-stone-200/60 dark:border-stone-700/60">
                        <div className="text-[11px] text-stone-500">
                          Score ATS Iniziale:
                        </div>
                        <div className="text-lg font-bold text-stone-600 dark:text-stone-400">
                          {tailoredResult.atsMatchScoreBefore}%
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-stone-400 h-full rounded-full"
                            style={{
                              width: `${tailoredResult.atsMatchScoreBefore}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* After */}
                      <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl space-y-1.5 border border-emerald-200/60 dark:border-emerald-800/40">
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                          Score ATS Ottimizzato:
                        </div>
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {tailoredResult.atsMatchScoreAfter}%
                        </div>
                        <div className="w-full bg-emerald-200 dark:bg-emerald-900/60 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${tailoredResult.atsMatchScoreAfter}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Matched Keywords Cloud */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">
                        {t.matchedKeywordsTitle}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tailoredResult.matchedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium rounded-lg border border-emerald-200/50 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{kw}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing / Prep keywords if any */}
                    {tailoredResult.missingKeywordsToAcquire?.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t.missingKeywordsTitle}:</span>
                        </span>
                        <div className="space-y-1">
                          {tailoredResult.missingKeywordsToAcquire.map(
                            (item, idx) => (
                              <div
                                key={idx}
                                className="text-[11px] text-stone-600 dark:text-stone-400 bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/40"
                              >
                                <span className="font-semibold text-amber-800 dark:text-amber-200">
                                  {item.skill}:
                                </span>{" "}
                                <span>{item.advice}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Executive Elevator Pitch Card */}
                  {tailoredResult.executiveSummaryPitch && (
                    <div className="p-4 bg-gradient-to-r from-purple-50/60 to-indigo-50/60 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200/60 dark:border-purple-800/40 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>{t.executivePitchTitle}</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyPitch}
                          className="text-[11px] text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1 font-semibold"
                        >
                          {copiedPitchSuccess ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copiato!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copia Pitch</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-stone-700 dark:text-stone-300 italic leading-relaxed">
                        &quot;{tailoredResult.executiveSummaryPitch}&quot;
                      </p>
                    </div>
                  )}

                  {/* Tailored CV Output Document */}
                  <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
                    {/* View Switcher & Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs">
                        <button
                          type="button"
                          onClick={() => setResultTab("preview")}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                            resultTab === "preview"
                              ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold"
                              : "text-stone-500 hover:text-stone-800"
                          }`}
                        >
                          Anteprima Renderizzata
                        </button>
                        <button
                          type="button"
                          onClick={() => setResultTab("markdown")}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                            resultTab === "markdown"
                              ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold"
                              : "text-stone-500 hover:text-stone-800"
                          }`}
                        >
                          Markdown
                        </button>
                        <button
                          type="button"
                          onClick={() => setResultTab("modifications")}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                            resultTab === "modifications"
                              ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold"
                              : "text-stone-500 hover:text-stone-800"
                          }`}
                        >
                          Riepilogo Modifiche (
                          {tailoredResult.keyModifications?.length || 0})
                        </button>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {resultTab === "preview" && (
                          <div className="flex items-center gap-1 text-[11px] text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg border border-stone-200/80 dark:border-stone-700">
                            <Palette className="w-3.5 h-3.5 text-indigo-500" />
                            <select
                              aria-label="Stile Tipografico CV"
                              value={resumeTheme}
                              onChange={(e) => setResumeTheme(e.target.value as any)}
                              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
                            >
                              <option value="executive">Modern Executive</option>
                              <option value="harvard">Harvard Classic (Serif)</option>
                              <option value="modern">Tech Leadership</option>
                            </select>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleCopyTailoredCv}
                          className="px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                          title="Copia CV"
                        >
                          {copiedCvSuccess ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Copia</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDownloadMarkdown}
                          className="px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                          title="Scarica .md"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>.md</span>
                        </button>

                        {/* Direct High-Resolution Executive PDF Download */}
                        <button
                          type="button"
                          onClick={handleExportPdf}
                          disabled={isExportingPdf}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Scarica PDF Formattato A4"
                        >
                          {isExportingPdf ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>{isExportingPdf ? "Generazione..." : "Scarica PDF"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handlePrint}
                          className="px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                          title="Stampa con browser"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Stampa</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveToVault}
                          className="px-3 py-1.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          {savedVaultSuccess ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                              <span>Salvato!</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Salva Vault</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Tab 1: Rendered Formatted Executive Resume Preview */}
                    {resultTab === "preview" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                          <span>
                            Documento formattato A4 pronto per l'invio · Lingua:{" "}
                            <strong className="text-stone-800 dark:text-stone-200 uppercase">
                              {tailoredResult.detectedLanguage || targetLanguage}
                            </strong>
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Compatibilità ATS: {tailoredResult.atsMatchScoreAfter || 95}%
                          </span>
                        </div>
                        <div className="overflow-x-auto p-4 bg-stone-100/70 dark:bg-stone-950/40 rounded-xl border border-stone-200 dark:border-stone-800 max-h-[750px] overflow-y-auto">
                          <ResumePaper
                            paperRef={resumePaperRef}
                            tailoredResult={tailoredResult}
                            userProfile={userProfile}
                            targetCompany={currentJobApp?.company}
                            targetRole={currentJobApp?.title}
                            lang={
                              targetLanguage === "auto"
                                ? tailoredResult.detectedLanguage || "it"
                                : targetLanguage
                            }
                            theme={resumeTheme}
                          />
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Raw Editable Markdown */}
                    {resultTab === "markdown" && (
                      <textarea
                        rows={18}
                        value={tailoredResult.tailoredCvMarkdown}
                        onChange={(e) =>
                          setTailoredResult({
                            ...tailoredResult,
                            tailoredCvMarkdown: e.target.value,
                          })
                        }
                        className="w-full p-4 text-xs font-mono bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y"
                      />
                    )}

                    {/* Tab 3: AI Modifications Breakdown */}
                    {resultTab === "modifications" && (
                      <div className="space-y-3">
                        {tailoredResult.keyModifications?.map((mod, i) => (
                          <div
                            key={i}
                            className="p-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 rounded-xl text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
                              <span>Sezione: {mod.section}</span>
                              <span className="text-[10px] uppercase text-indigo-600 dark:text-indigo-400">
                                Revisione AI
                              </span>
                            </div>
                            <div className="text-stone-700 dark:text-stone-300">
                              {mod.changeDescription}
                            </div>
                            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-medium pt-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>Perché aiuta: {mod.whyItHelps}</span>
                            </div>
                          </div>
                        ))}

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={handleSyncSkillsToProfile}
                            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/40 flex items-center gap-1.5 transition-all"
                          >
                            {skillsSyncedSuccess ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Competenze Sincronizzate!</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>
                                  Aggiungi Parole Chiave al Profilo Candidato
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. VAULT SAVED DOCUMENTS & TEMPLATES                           */}
      {/* ============================================================== */}
      {activeSubTab === "vault" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Saved Documents in Vault (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 gap-2">
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>{t.savedDocsTitle}</span>
                </h2>

                <div className="flex items-center gap-2">
                  {/* Direct upload to Vault */}
                  <label className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border shadow-xs transition-all ${
                    isUploadingToVault
                      ? "bg-stone-100 dark:bg-stone-800 text-stone-400 border-stone-300 dark:border-stone-700 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
                  }`}>
                    {isUploadingToVault ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingToVault ? "Caricamento..." : "Carica File (.pdf, .docx, .txt)"}</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.md,.markdown"
                      onChange={handleVaultDirectUpload}
                      disabled={isUploadingToVault}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setActiveSubTab("tailor")}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 px-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adatta Nuovo CV</span>
                  </button>
                </div>
              </div>

              {vaultUploadSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{vaultUploadSuccess}</span>
                </div>
              )}

              {vaultUploadError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{vaultUploadError}</span>
                </div>
              )}

              {documents.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-500">
                  Nessun documento salvato nel vault. Carica un CV o adatta una versione per salvarla qui!
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => {
                    const matchedApp = applications.find(
                      (a) => a.id === doc.matchedApplicationId
                    );
                    const meta = getFileFormatMeta(doc.fileFormat || doc.name);

                    return (
                      <div
                        key={doc.id}
                        className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-xs space-y-2 hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-stone-900 dark:text-stone-100 text-xs flex items-center gap-2">
                                <FileCode className="w-4 h-4 text-indigo-500" />
                                <span>{doc.name}</span>
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase ${meta.bg} ${meta.text}`}>
                                {meta.label}
                              </span>
                              {doc.fileSize && (
                                <span className="text-[10px] text-stone-400 font-mono">
                                  {doc.fileSize}
                                </span>
                              )}
                            </div>
                            {doc.notes && (
                              <p className="text-[11px] text-stone-500">
                                {doc.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {doc.content && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCvInputText(doc.content!);
                                  setActiveSubTab("tailor");
                                }}
                                className="p-1.5 text-stone-500 hover:text-indigo-600 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-all"
                                title="Usa per Adattamento CV con AI"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                              </button>
                            )}

                            {doc.content && (
                              <button
                                type="button"
                                onClick={() => setViewingDoc(doc)}
                                className="p-1.5 text-stone-500 hover:text-indigo-600 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-all"
                                title="Visualizza contenuto"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => deleteDocument(doc.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-all"
                              title="Elimina documento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-200/50 dark:border-stone-700/50 text-[11px]">
                          <span className="text-stone-400">
                            Caricato il:{" "}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>

                          {matchedApp && (
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                              Candidatura: {matchedApp.company} (
                              {matchedApp.title})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Saved Templates Column */}
          <div className="space-y-4">
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>{t.savedTemplates}</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowNewTemplate(!showNewTemplate)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.newTemplateBtn}</span>
                </button>
              </div>

              {/* New Template Form */}
              {showNewTemplate && (
                <form
                  onSubmit={handleCreateTemplate}
                  className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2 text-xs"
                >
                  <input
                    type="text"
                    required
                    placeholder="Titolo modello (es. Candidatura Manageriale / Senior)"
                    value={templateForm.title}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                  />
                  <textarea
                    rows={4}
                    required
                    placeholder="Testo della cover letter..."
                    value={templateForm.content}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        content: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg font-mono text-[11px]"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowNewTemplate(false)}
                      className="px-2.5 py-1 text-stone-500 text-xs"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-semibold text-xs"
                    >
                      Salva
                    </button>
                  </div>
                </form>
              )}

              {/* Templates List */}
              <div className="space-y-3">
                {templates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {tmpl.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteTemplate(tmpl.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded"
                        title="Elimina modello"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-stone-500 text-[11px] line-clamp-3 font-mono">
                      {tmpl.content}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-200/50 dark:border-stone-700/50">
                      <span className="text-[10px] uppercase font-semibold text-stone-400">
                        Lingua: {tmpl.language.toUpperCase()}
                      </span>

                      <button
                        type="button"
                        onClick={() => setActiveTab("cover-letter")}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Usa nello Studio</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CANDIDATE PROFILE & MASTER SETTINGS                         */}
      {/* ============================================================== */}
      {activeSubTab === "profile" && (
        <form
          onSubmit={handleSaveProfile}
          className="max-w-4xl p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Dati Personali & Competenze Master</span>
            </h2>
            {savedProfileSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>Profilo aggiornato!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t.fullName}
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t.currentTitle}
              </label>
              <input
                type="text"
                required
                value={profileForm.title}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, title: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t.email}
              </label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                {t.phone}
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Residenza / Città
              </label>
              <input
                type="text"
                value={profileForm.location}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, location: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Profilo LinkedIn o Portfolio
              </label>
              <input
                type="url"
                value={profileForm.linkedIn || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, linkedIn: e.target.value })
                }
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              {t.skillsListLabel}
            </label>
            <input
              type="text"
              value={skillsString}
              onChange={(e) => setSkillsString(e.target.value)}
              placeholder="TypeScript, React, Node.js, Agile, Python, Docker, PostgreSQL..."
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Experience Summary */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              {t.experienceSummaryLabel}
            </label>
            <textarea
              rows={4}
              value={profileForm.experienceSummary}
              onChange={(e) =>
                setProfileForm({
                  ...profileForm,
                  experienceSummary: e.target.value,
                })
              }
              className="w-full p-3 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
            />
          </div>

          {/* Key Achievements */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Traguardi & Risultati Chiave (per valorizzare le cover letter e i CV)
            </label>
            <textarea
              rows={2}
              value={profileForm.achievements || ""}
              onChange={(e) =>
                setProfileForm({ ...profileForm, achievements: e.target.value })
              }
              placeholder="es. Ridotto del 45% il caricamento; gestito team di 5 sviluppatori; ecc."
              className="w-full p-3 text-xs bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveProfile}</span>
            </button>
          </div>
        </form>
      )}

      {/* Document View Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-3xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <span className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-500" />
                <span>{viewingDoc.name}</span>
              </span>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs p-1"
              >
                ✕ Chiudi
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/60 dark:border-stone-700/60 font-mono text-xs whitespace-pre-wrap leading-relaxed text-stone-800 dark:text-stone-200">
              {viewingDoc.content || "Nessun contenuto testuale salvato."}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => {
                  if (viewingDoc.content) {
                    navigator.clipboard.writeText(viewingDoc.content);
                  }
                }}
                className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copia Testo</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

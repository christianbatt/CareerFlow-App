import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Printer,
  Download,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  BookMarked,
  Bold,
  Italic,
  Heading2,
  List,
  Gauge,
  SpellCheck,
  Copy,
  Check,
  Languages,
  Loader2,
  FileText,
  Mail,
  Zap,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { LetterheadPaper } from "./LetterheadPaper";
import { exportCoverLetterPdf } from "../utils/pdfGenerator";

export const CoverLetterStudio: React.FC = () => {
  const {
    applications,
    selectedApplication,
    setSelectedApplication,
    userProfile,
    language: appLanguage,
    templates,
    addTemplate,
    t,
    showToast,
    triggerConfetti,
  } = useApp();

  const [activeAppId, setActiveAppId] = useState<string>(
    selectedApplication?.id || applications[0]?.id || ""
  );

  const currentApp = applications.find((a) => a.id === activeAppId);

  // Editor & Language states
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [tone, setTone] = useState<string>("professional");
  const [letterLanguage, setLetterLanguage] = useState<"auto" | "it" | "en" | "fr">("auto");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingStyle, setIsCheckingStyle] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // AI High-Conversion Outputs
  const [subjectLine, setSubjectLine] = useState<string>("");
  const [openingHook, setOpeningHook] = useState<string>("");
  const [valueProposition, setValueProposition] = useState<string>("");
  const [recruiterTips, setRecruiterTips] = useState<string[]>([]);
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [detectedLangCode, setDetectedLangCode] = useState<string>("it");

  // Copy success states
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);

  // Style check state
  const [styleAnalysis, setStyleAnalysis] = useState<{
    score: number;
    tone: string;
    suggestions: { type: string; message: string; replacement?: string }[];
    powerWordsUsed: string[];
  } | null>(null);

  // View toggle
  const [previewTab, setPreviewTab] = useState<"letterhead" | "markdown">("letterhead");

  const letterRef = useRef<HTMLDivElement>(null);

  // Load template or default text if empty
  useEffect(() => {
    if (!markdownContent) {
      if (templates.length > 0) {
        setMarkdownContent(templates[0].content);
      } else {
        const defaultDate = new Date().toLocaleDateString("it-IT", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        setMarkdownContent(`**${userProfile.name || "Christian Battistoni"}**  
${userProfile.email || "email@esempio.com"} | ${userProfile.phone || "+39 333 0000000"}  

${defaultDate}  

**Alla cortese attenzione del Team di Selezione**  
**${currentApp?.company || "Azienda Leader"}**  

**Oggetto: Candidatura per la posizione di ${currentApp?.title || "Ruolo Desiderato"}**  

Gentile Team di Selezione,

Vi contatto per presentare la mia candidatura per la posizione di **${currentApp?.title || "Ruolo Desiderato"}** presso **${currentApp?.company || "la Vostra Azienda"}**.

Nel corso del mio percorso professionale ho consolidato competenze pratiche e metodologiche orientate al raggiungimento di obiettivi concreti e all'ottimizzazione dei processi operativi. Seguo con vivo interesse i progetti di ${currentApp?.company || "questa realtà"} e sono certo che il mio background possa contribuire positivamente alle vostre priorità attuali.

Resto a vostra disposizione per un colloquio conoscitivo in cui approfondire le sinergie tra le mie competenze e le vostre esigenze.

Cordiali saluti,  
**${userProfile.name || "Christian Battistoni"}**`);
      }
    }
  }, []);

  // Update selected app when dropdown changes
  const handleAppChange = (appId: string) => {
    setActiveAppId(appId);
    const target = applications.find((a) => a.id === appId);
    if (target) {
      setSelectedApplication(target);
    }
  };

  // 1. Generate from scratch or adapt existing
  const handleGenerateAI = async (mode: "create" | "adapt") => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: currentApp?.title || userProfile.title || "Ruolo di Riferimento",
          company: currentApp?.company || "Azienda Leader",
          jobDescription: currentApp?.jobDescription || currentApp?.talkingPoints?.join("\n") || "",
          requiredSkills: currentApp?.requiredSkills || [],
          userProfile,
          currentDraft: markdownContent,
          mode,
          tone,
          lang: letterLanguage === "auto" ? "auto" : letterLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore durante la generazione della lettera");
      }

      const data = await response.json();
      if (data.markdown) {
        setMarkdownContent(data.markdown);
      }
      if (data.subjectLine) setSubjectLine(data.subjectLine);
      if (data.openingHook) setOpeningHook(data.openingHook);
      if (data.valueProposition) setValueProposition(data.valueProposition);
      if (data.tips) setRecruiterTips(data.tips);
      if (data.detectedKeywords) setDetectedKeywords(data.detectedKeywords);
      if (data.detectedLanguage) setDetectedLangCode(data.detectedLanguage);

      triggerConfetti();
      showToast(
        mode === "create"
          ? "Lettera di presentazione generata con successo!"
          : "Lettera adattata ed elevata con successo!",
        "success"
      );
    } catch (err: any) {
      console.error(err);
      showToast(
        err?.message || "Errore nella generazione con l'AI. Verifica la connessione.",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Real-time Style & Grammar Check
  const handleStyleCheck = async () => {
    if (!markdownContent.trim()) return;
    setIsCheckingStyle(true);
    try {
      const res = await fetch("/api/style-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: markdownContent,
          lang: letterLanguage === "auto" ? detectedLangCode : letterLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStyleAnalysis(data);
      }
    } catch (err) {
      console.error(err);
      showToast("Analisi di stile non disponibile al momento.", "warning");
    } finally {
      setIsCheckingStyle(false);
    }
  };

  // 3. Formatting toolbar helpers
  const insertFormatting = (syntax: string) => {
    if (syntax === "bold") {
      setMarkdownContent((prev) => prev + " **testo in grassetto** ");
    } else if (syntax === "italic") {
      setMarkdownContent((prev) => prev + " *testo in corsivo* ");
    } else if (syntax === "heading") {
      setMarkdownContent((prev) => prev + "\n\n## Titolo Sezione\n");
    } else if (syntax === "list") {
      setMarkdownContent((prev) => prev + "\n- Obiettivo / Risultato misurabile\n- Seconda competenza\n");
    }
  };

  // 4. Download Formatted PDF directly
  const handleExportPdf = async () => {
    if (!letterRef.current) {
      showToast("Elemento non pronto per l'esportazione.", "error");
      return;
    }
    setIsExportingPdf(true);
    try {
      const success = await exportCoverLetterPdf(letterRef.current, {
        candidateName: userProfile.name || "Candidato",
        company: currentApp?.company || "Azienda",
        role: currentApp?.title || "Ruolo",
        lang: letterLanguage === "auto" ? detectedLangCode : letterLanguage,
      });

      if (success) {
        showToast("PDF della Lettera scaricato con successo!", "success");
      } else {
        showToast("Impossibile generare il PDF. Prova a usare il tasto Stampa.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Errore durante la generazione del PDF.", "error");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 5. Print
  const handlePrint = () => {
    window.print();
  };

  // 6. Download Markdown
  const handleDownloadMd = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Lettera_${currentApp?.company || "Candidatura"}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Download markdown avviato!", "success");
  };

  // 7. Copy Text
  const handleCopyLetter = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
    showToast("Testo lettera copiato negli appunti!", "success");
  };

  const handleCopySubject = () => {
    if (!subjectLine) return;
    navigator.clipboard.writeText(subjectLine);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
    showToast("Oggetto email copiato!", "success");
  };

  // 8. Save as template
  const handleSaveAsTemplate = () => {
    const defaultTitle = `Lettera ${currentApp?.company || "Personalizzata"} - ${new Date().toLocaleDateString()}`;
    addTemplate({
      title: defaultTitle,
      content: markdownContent,
      language: appLanguage,
      tags: ["Custom", currentApp?.company || "Generale"],
    });
    showToast("Modello salvato nella sezione Documenti!", "success");
  };

  // Word counter
  const wordCount = markdownContent.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner & Job Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Studio Lettera di Presentazione (Cover Letter)</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Generatore ultra-persuasivo in Italiano, Inglese e Francese con modelli letterhead executive per massimizzare le risposte dei recruiter.
          </p>
        </div>

        {/* Target Job Selector, Language, and Tone */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Language Selector */}
          <div className="flex items-center gap-1 text-xs text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 px-2.5 py-1 rounded-xl border border-stone-200/80 dark:border-stone-700">
            <Languages className="w-3.5 h-3.5 text-indigo-500" />
            <select
              aria-label="Lingua Lettera"
              value={letterLanguage}
              onChange={(e) => setLetterLanguage(e.target.value as any)}
              className="bg-transparent text-xs text-stone-800 dark:text-stone-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="auto">⚡ Auto (Lingua Offerta)</option>
              <option value="it">🇮🇹 Italiano</option>
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
          </div>

          {/* Job Target Selector */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
            <select
              aria-label={t.targetJobLabel}
              value={activeAppId}
              onChange={(e) => handleAppChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-800 dark:text-stone-200 font-medium focus:ring-1 focus:ring-indigo-500 max-w-[220px] truncate"
            >
              <option value="">{t.selectJob}</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} - {app.title}
                </option>
              ))}
            </select>
          </div>

          {/* Tone Selector */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
            <select
              aria-label={t.toneLabel}
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-800 dark:text-stone-200 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="professional">Executive Corporate</option>
              <option value="startup">Innovativo & Startup</option>
              <option value="consulting">Consulenza Strategica (ROI)</option>
              <option value="confident">Diretto & Assertivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Action Header Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleGenerateAI("create")}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isGenerating ? "Generazione in corso..." : "Genera Lettera da Zero"}</span>
          </button>

          <button
            onClick={() => handleGenerateAI("adapt")}
            disabled={isGenerating || !markdownContent}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Adatta & Potenzia Bozza</span>
          </button>

          <button
            onClick={handleStyleCheck}
            disabled={isCheckingStyle}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <SpellCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isCheckingStyle ? "Analisi..." : "Verifica Sintassi & Stile"}</span>
          </button>
        </div>

        {/* Export & Save Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLetter}
            className="px-2.5 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 rounded-xl transition-colors text-xs font-medium flex items-center gap-1 border border-stone-200 dark:border-stone-700 shadow-2xs cursor-pointer"
            title="Copia Testo"
          >
            {copiedLetter ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedLetter ? "Copiato!" : "Copia"}</span>
          </button>

          <button
            onClick={handleSaveAsTemplate}
            className="px-2.5 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 rounded-xl transition-colors text-xs font-medium flex items-center gap-1 border border-stone-200 dark:border-stone-700 shadow-2xs cursor-pointer"
            title="Salva nei Modelli"
          >
            <BookMarked className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Salva Modello</span>
          </button>

          <button
            onClick={handleDownloadMd}
            className="px-2.5 py-1.5 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 rounded-xl transition-colors text-xs font-medium flex items-center gap-1 border border-stone-200 dark:border-stone-700 shadow-2xs cursor-pointer"
            title={t.downloadMd}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">.md</span>
          </button>

          {/* Direct Download Formatted PDF */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Scarica PDF Formattato A4"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExportingPdf ? "Generazione PDF..." : "Scarica PDF"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            title="Stampa con browser"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Stampa</span>
          </button>
        </div>
      </div>

      {/* Recruiter Strategy Banner: Subject Line & Elevator Hook */}
      {(subjectLine || openingHook) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-blue-50/60 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl shadow-xs">
          {subjectLine && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>Oggetto Email ad Alto Tasso di Apertura</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopySubject}
                  className="text-[10px] text-indigo-600 dark:text-indigo-300 hover:underline flex items-center gap-0.5"
                >
                  {copiedSubject ? (
                    <Check className="w-2.5 h-2.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-2.5 h-2.5" />
                  )}
                  <span>{copiedSubject ? "Copiato!" : "Copia Oggetto"}</span>
                </button>
              </div>
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 bg-white/80 dark:bg-stone-900/80 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                {subjectLine}
              </p>
            </div>
          )}

          {openingHook && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Elevator Hook di Apertura (Primi 5 Secondi)</span>
              </span>
              <p className="text-xs text-stone-700 dark:text-stone-300 bg-white/80 dark:bg-stone-900/80 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/40 italic">
                "{openingHook}"
              </p>
            </div>
          )}

          {/* Integrated ATS Keywords */}
          {detectedKeywords.length > 0 && (
            <div className="col-span-full pt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[10px] uppercase font-bold text-stone-500">
                Parole chiave ATS integrate:
              </span>
              {detectedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-white dark:bg-stone-800 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60 rounded-md text-[10px] font-semibold"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Style & Grammar Analysis Card (if active) */}
      {styleAnalysis && (
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {t.styleCheckTitle}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {t.readabilityScore}: {styleAnalysis.score}/100
              </span>
              <span className="text-stone-300 dark:text-stone-700">·</span>
              <span className="text-stone-600 dark:text-stone-400">
                {t.styleTone}: <span className="font-medium text-stone-900 dark:text-stone-100">{styleAnalysis.tone}</span>
              </span>
            </div>
          </div>

          {/* Suggestions List */}
          {styleAnalysis.suggestions && styleAnalysis.suggestions.length > 0 ? (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                {t.suggestedImprovements}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {styleAnalysis.suggestions.map((sugg, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/70 dark:border-stone-800 text-xs flex items-start gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-stone-700 dark:text-stone-300">{sugg.message}</p>
                      {sugg.replacement && (
                        <p className="text-indigo-600 dark:text-indigo-400 text-[11px] mt-0.5">
                          Suggerito: "{sugg.replacement}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-emerald-600 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Nessun errore rilevato. Il testo è fluido, convincente e privo di refusi!</span>
            </p>
          )}

          {/* Power words */}
          {styleAnalysis.powerWordsUsed && styleAnalysis.powerWordsUsed.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
              <span className="text-stone-500">Parole chiave ad alto impatto:</span>
              {styleAnalysis.powerWordsUsed.map((w, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded text-[11px] font-medium"
                >
                  {w}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dual Pane: Markdown Editor & Executive Letterhead Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Pane: Markdown Editor */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex flex-col shadow-xs overflow-hidden print:hidden">
          {/* Editor Header & Formatting Toolbar */}
          <div className="p-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertFormatting("bold")}
                className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded"
                title="Grassetto"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("italic")}
                className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded"
                title="Corsivo"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("heading")}
                className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded"
                title="Titolo H2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("list")}
                className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded"
                title="Elenco puntato"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[11px] text-stone-400 flex items-center gap-2">
              <span>{wordCount} parole</span>
              <span>·</span>
              <span>~{readTimeMinutes} min lettura</span>
            </div>
          </div>

          <textarea
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            rows={24}
            className="w-full p-4 text-xs font-mono bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none resize-none leading-relaxed"
            placeholder="Scrivi o incolla la tua cover letter in Markdown..."
          />
        </div>

        {/* Right Pane: Live Formatted Executive Letterhead Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Anteprima Lettera Impaginata (A4)</span>
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded-md border border-emerald-200/60">
                100% Stampabile & PDF
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewTab("letterhead")}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  previewTab === "letterhead"
                    ? "bg-indigo-600 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                Carta Intestata
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("markdown")}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  previewTab === "markdown"
                    ? "bg-indigo-600 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}
              >
                Markdown
              </button>
            </div>
          </div>

          {previewTab === "letterhead" ? (
            <div className="overflow-x-auto p-2 bg-stone-100/70 dark:bg-stone-950/50 rounded-2xl border border-stone-200 dark:border-stone-800">
              <LetterheadPaper
                paperRef={letterRef}
                content={markdownContent}
                userProfile={userProfile}
                company={currentApp?.company || "Azienda Leader"}
                role={currentApp?.title || "Ruolo di Riferimento"}
                subjectLine={subjectLine}
                lang={letterLanguage === "auto" ? detectedLangCode : letterLanguage}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs min-h-[500px]">
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed space-y-3 font-serif">
                {markdownContent.split("\n\n").map((paragraph, index) => {
                  if (paragraph.startsWith("# ")) {
                    return (
                      <h1 key={index} className="text-lg font-bold font-sans text-stone-900 dark:text-white border-b pb-1">
                        {paragraph.replace("# ", "")}
                      </h1>
                    );
                  }
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-sm font-semibold font-sans text-stone-800 dark:text-stone-200 mt-3">
                        {paragraph.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith("- ")) {
                    const items = paragraph.split("\n");
                    return (
                      <ul key={index} className="list-disc list-inside space-y-1 my-2">
                        {items.map((item, i) => (
                          <li key={i}>{item.replace("- ", "")}</li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={index} className="text-stone-700 dark:text-stone-300 leading-normal">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

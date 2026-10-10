import React, { useState, useEffect } from "react";
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
  Type,
  Gauge,
  SpellCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export const CoverLetterStudio: React.FC = () => {
  const {
    applications,
    selectedApplication,
    setSelectedApplication,
    userProfile,
    language,
    templates,
    addTemplate,
    t,
    showToast,
  } = useApp();

  const [activeAppId, setActiveAppId] = useState<string>(
    selectedApplication?.id || applications[0]?.id || ""
  );

  const currentApp = applications.find((a) => a.id === activeAppId);

  // Editor content
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [tone, setTone] = useState<string>("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingStyle, setIsCheckingStyle] = useState(false);

  // Style check state
  const [styleAnalysis, setStyleAnalysis] = useState<{
    score: number;
    tone: string;
    suggestions: { type: string; message: string; replacement?: string }[];
    powerWordsUsed: string[];
  } | null>(null);

  // Load template or default text if empty
  useEffect(() => {
    if (!markdownContent) {
      if (templates.length > 0) {
        setMarkdownContent(templates[0].content);
      } else {
        setMarkdownContent(`# ${userProfile.name}
${userProfile.location} · ${userProfile.email} · ${userProfile.phone}

Spettabile Team di Selezione,

Vi contatto per esprimere il mio forte interesse per la posizione...`);
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

  // 1. Generate from scratch
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
          lang: language,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore durante la generazione");
      }

      const data = await response.json();
      if (data.markdown) {
        setMarkdownContent(data.markdown);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || "Errore nella generazione con l'AI. Verifica la connessione.", "error");
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
          lang: language,
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

  // 4. Print / PDF Export
  const handlePrint = () => {
    window.print();
  };

  // 5. Download Markdown
  const handleDownloadMd = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cover_Letter_${currentApp?.company || "Candidatura"}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Download lettera di presentazione avviato!", "success");
  };

  // 6. Save as template
  const handleSaveAsTemplate = () => {
    const defaultTitle = `Lettera ${currentApp?.company || "Personalizzata"} - ${new Date().toLocaleDateString()}`;
    addTemplate({
      title: defaultTitle,
      content: markdownContent,
      language: language,
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
            <span>{t.coverLetterTitle}</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {t.coverLetterDesc}
          </p>
        </div>

        {/* Target Job Selector & Tone */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
            <span>{t.targetJobLabel}</span>
            <select
              aria-label={t.targetJobLabel}
              value={activeAppId}
              onChange={(e) => handleAppChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-800 dark:text-stone-200 font-medium focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">{t.selectJob}</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.company} - {app.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
            <span>{t.toneLabel}</span>
            <select
              aria-label={t.toneLabel}
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-800 dark:text-stone-200 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="professional">{t.toneProfessional}</option>
              <option value="confident">{t.toneConfident}</option>
              <option value="enthusiastic">{t.toneEnthusiastic}</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Action Header Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleGenerateAI("create")}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? "Generazione in corso..." : t.generateFromScratch}</span>
          </button>

          <button
            onClick={() => handleGenerateAI("adapt")}
            disabled={isGenerating || !markdownContent}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.adaptExisting}</span>
          </button>

          <button
            onClick={handleStyleCheck}
            disabled={isCheckingStyle}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-medium transition-colors"
          >
            <SpellCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isCheckingStyle ? "Analisi..." : t.runStyleCheck}</span>
          </button>
        </div>

        {/* Export & Save Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAsTemplate}
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 rounded-lg transition-colors text-xs flex items-center gap-1"
            title="Salva nei Modelli"
          >
            <BookMarked className="w-4 h-4" />
            <span className="hidden sm:inline">Salva Modello</span>
          </button>

          <button
            onClick={handleDownloadMd}
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 rounded-lg transition-colors text-xs flex items-center gap-1"
            title={t.downloadMd}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">.md</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
            title={t.exportPdf}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.exportPdf}</span>
          </button>
        </div>
      </div>

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

      {/* Dual Pane: Markdown Editor & Letter Preview */}
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
            rows={22}
            className="w-full p-4 text-xs font-mono bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none resize-none leading-relaxed"
            placeholder="Scrivi o incolla la tua cover letter in Markdown..."
          />
        </div>

        {/* Right Pane: Live Formatted Letterhead Preview */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xs min-h-[500px] text-stone-900 dark:text-stone-100 print:border-none print:shadow-none print:p-0 print:m-0">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-4 mb-5 print:border-stone-300">
            <span className="text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block mb-1">
              {t.livePreview}
            </span>
            <div className="text-xs text-stone-500">
              Pronto per la stampa e l'invio in formato PDF professionale.
            </div>
          </div>

          {/* Rendered Letter Content */}
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
      </div>
    </div>
  );
};

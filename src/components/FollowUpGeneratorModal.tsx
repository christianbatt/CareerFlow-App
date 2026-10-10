import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Send,
  Clock,
  Copy,
  Check,
  Mail,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { JobApplication } from "../types";

export const FollowUpGeneratorModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    applications,
    selectedApplication,
    setSelectedApplication,
    userProfile,
    language,
  } = useApp();

  const [triggerDays, setTriggerDays] = useState<number>(7);
  const [activeAppId, setActiveAppId] = useState<string>(
    selectedApplication?.id || applications[0]?.id || ""
  );

  const [followUpType, setFollowUpType] = useState<string>("initial_application");
  const [tone, setTone] = useState<string>("polite_brief");
  const [loading, setLoading] = useState<boolean>(false);

  const [generatedDraft, setGeneratedDraft] = useState<{
    subjectLine: string;
    emailBody: string;
    linkedinDm: string;
    recommendedTiming: string;
    strategyReasoning: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<"subject" | "body" | "linkedin" | null>(null);

  // Sync active application
  useEffect(() => {
    if (selectedApplication?.id) {
      setActiveAppId(selectedApplication.id);
    } else if (applications.length > 0 && !activeAppId) {
      setActiveAppId(applications[0].id);
    }
  }, [selectedApplication, applications]);

  const currentApp = applications.find((a) => a.id === activeAppId);

  // Calculate days elapsed for current application
  const calculateDaysElapsed = (app: JobApplication) => {
    const timestamp = app.dateApplied
      ? new Date(app.dateApplied).getTime()
      : app.createdAt
      ? new Date(app.createdAt).getTime()
      : Date.now();
    return Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)));
  };

  const currentDaysElapsed = currentApp ? calculateDaysElapsed(currentApp) : 0;

  // Applications that match the trigger threshold
  const dueApplications = applications.filter((app) => {
    const days = calculateDaysElapsed(app);
    return days >= triggerDays && app.stage !== "offered" && app.stage !== "rejected";
  });

  // Automatically adjust default followUpType based on application stage
  useEffect(() => {
    if (currentApp) {
      if (currentApp.stage === "screening") {
        setFollowUpType("post_screening");
      } else if (currentApp.stage === "interviewing") {
        setFollowUpType("post_interview");
      } else {
        setFollowUpType("initial_application");
      }
    }
  }, [activeAppId]);

  if (activeModal !== "followUp") return null;

  const handleGenerate = async () => {
    if (!currentApp) return;

    setLoading(true);
    setGeneratedDraft(null);

    try {
      const response = await fetch("/api/generate-follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application: currentApp,
          daysElapsed: currentDaysElapsed,
          triggerDays,
          followUpType,
          tone,
          userProfile,
          lang: language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedDraft(data);
      }
    } catch (e) {
      console.error("Follow-up generation error:", e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: "subject" | "body" | "linkedin") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const openInMailClient = () => {
    if (!generatedDraft || !currentApp) return;
    const recipient = currentApp.contactEmail || "";
    const subject = encodeURIComponent(generatedDraft.subjectLine);
    const body = encodeURIComponent(generatedDraft.emailBody);
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Follow-up Email Generator Automatico
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  AI Context-Aware
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Genera email e messaggi di ricontatto intelligenti calibrati sui giorni trascorsi e sulla cronologia dei colloqui
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Top Trigger Config Bar */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/80 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Soglia Giorni di Attesa per il Trigger:
                </span>
              </div>

              {/* Day threshold buttons */}
              <div className="flex items-center gap-1.5">
                {[5, 7, 10, 14].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setTriggerDays(days)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      triggerDays === days
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-indigo-400"
                    }`}
                  >
                    {days} giorni
                  </button>
                ))}
              </div>
            </div>

            {/* List of Applications Reaching/Exceeding Threshold */}
            <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>
                  Candidature in attesa di follow-up ({dueApplications.length} trovate ≥ {triggerDays} gg):
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {dueApplications.length === 0 ? (
                  <span className="text-xs text-stone-400 italic">
                    Nessuna candidatura ha superato la soglia di {triggerDays} giorni. Puoi comunque selezionare qualsiasi candidatura sotto.
                  </span>
                ) : (
                  dueApplications.map((app) => {
                    const days = calculateDaysElapsed(app);
                    const isSelected = app.id === activeAppId;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          setActiveAppId(app.id);
                          setSelectedApplication(app);
                        }}
                        className={`p-2.5 rounded-xl border text-left shrink-0 transition-all ${
                          isSelected
                            ? "bg-white dark:bg-stone-800 border-indigo-500 ring-2 ring-indigo-400/30 shadow-xs"
                            : "bg-white/80 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:border-stone-400"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate max-w-[140px]">
                            {app.company}
                          </span>
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                            {days} gg
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 truncate block max-w-[180px]">
                          {app.title}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Target Job Selection & Context Setup */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs">
            {/* Select Target Job */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Candidatura Selezionata
              </label>
              <select
                aria-label="Candidatura selezionata"
                value={activeAppId}
                onChange={(e) => {
                  setActiveAppId(e.target.value);
                  const target = applications.find((a) => a.id === e.target.value);
                  if (target) setSelectedApplication(target);
                }}
                className="w-full p-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:ring-1 focus:ring-indigo-500"
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.company} ({calculateDaysElapsed(app)} gg fa) - {app.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Scenario Type */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Scenario di Follow-up
              </label>
              <select
                aria-label="Scenario di follow-up"
                value={followUpType}
                onChange={(e) => setFollowUpType(e.target.value)}
                className="w-full p-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="initial_application">Dopo Invio Iniziale (Silenzio)</option>
                <option value="post_screening">Post Screening HR (Attesa Colloquio)</option>
                <option value="post_interview">Post Colloquio Tecnico (Feedback)</option>
                <option value="post_offer">Sollecito Proposta / Offerta Finale</option>
              </select>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Tono del Messaggio
              </label>
              <select
                aria-label="Tono del messaggio"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="polite_brief">Cortese & Sintetico (Low friction)</option>
                <option value="value_add">Valore Aggiunto (Condivisione novità/portfolio)</option>
                <option value="assertive_enthusiastic">Assertivo & Dinamico</option>
              </select>
            </div>
          </div>

          {/* Context Badge Banner */}
          {currentApp && (
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-stone-700 dark:text-stone-300">
                  Data invio registrata:{" "}
                  <strong>{currentApp.dateApplied || "Data recente"}</strong> (
                  {currentDaysElapsed} giorni fa) · Fase:{" "}
                  <strong className="capitalize">{currentApp.stage}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-all shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? "Generazione in corso..." : "Genera con AI"}</span>
              </button>
            </div>
          )}

          {/* Generated Follow-up Output */}
          {generatedDraft && (
            <div className="space-y-4">
              {/* Timing Advice & Strategy Banner */}
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 rounded-2xl text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Consiglio di Invio & Strategia:</span>
                </div>
                <p className="text-emerald-800 dark:text-emerald-300">
                  {generatedDraft.recommendedTiming}
                </p>
                <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 italic">
                  {generatedDraft.strategyReasoning}
                </p>
              </div>

              {/* Email Subject Line */}
              <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Oggetto Email
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedDraft.subjectLine, "subject")}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                  >
                    {copiedField === "subject" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copiato!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copia Oggetto</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                  {generatedDraft.subjectLine}
                </div>
              </div>

              {/* Full Email Body */}
              <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Corpo Email Completo
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={openInMailClient}
                      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg"
                      title="Apri nel tuo client email predefinito"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Apri nel Client Email</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(generatedDraft.emailBody, "body")}
                      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg"
                    >
                      {copiedField === "body" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copiato!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copia Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700/80 text-xs font-serif leading-relaxed text-stone-800 dark:text-stone-200 whitespace-pre-wrap">
                  {generatedDraft.emailBody}
                </div>
              </div>

              {/* Short LinkedIn DM / InMail */}
              <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Versione Breve per Messaggio Diretto LinkedIn (InMail / Chat)
                  </span>
                  <button
                    onClick={() => copyToClipboard(generatedDraft.linkedinDm, "linkedin")}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                  >
                    {copiedField === "linkedin" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copiato!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copia per LinkedIn</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-xs leading-relaxed text-stone-800 dark:text-stone-200">
                  "{generatedDraft.linkedinDm}"
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

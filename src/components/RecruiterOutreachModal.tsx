import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Send,
  Copy,
  Check,
  Languages,
  ExternalLink,
  Loader2,
  Clock,
  Lightbulb,
  Building2,
  Linkedin,
  MessageSquare,
  Mail,
  Zap,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { JobApplication } from "../types";

export interface RecruiterOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetApplication?: JobApplication | null;
}

export const RecruiterOutreachModal: React.FC<RecruiterOutreachModalProps> = ({
  isOpen,
  onClose,
  targetApplication,
}) => {
  const { userProfile, applications, showToast } = useApp();

  const [selectedAppId, setSelectedAppId] = useState<string>(
    targetApplication?.id || applications[0]?.id || ""
  );

  const activeApp =
    applications.find((a) => a.id === selectedAppId) || targetApplication || applications[0];

  const [outreachType, setOutreachType] = useState<
    "connection_request_note" | "inmail" | "informal_intro"
  >("connection_request_note");

  const [lang, setLang] = useState<"it" | "en" | "fr">("it");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<{
    subject?: string;
    messageText: string;
    characterCount: number;
    rationale: string;
    recommendedTiming: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);

  useEffect(() => {
    if (targetApplication?.id) {
      setSelectedAppId(targetApplication.id);
    }
  }, [targetApplication]);

  const handleGenerate = async () => {
    if (!activeApp) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/outreach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: activeApp.company || "Azienda Target",
          role: activeApp.title || "Ruolo",
          jobDescription: activeApp.jobDescription || "",
          requiredSkills: activeApp.requiredSkills || [],
          userProfile,
          type: outreachType,
          lang,
        }),
      });

      if (!res.ok) {
        throw new Error("Errore durante la generazione del messaggio.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || "Errore con l'AI. Riprova tra poco.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!result?.messageText) return;
    navigator.clipboard.writeText(result.messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("Messaggio copiato negli appunti!", "success");
  };

  const handleCopySubject = () => {
    if (!result?.subject) return;
    navigator.clipboard.writeText(result.subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
    showToast("Oggetto copiato!", "success");
  };

  if (!isOpen) return null;

  const linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
    `${activeApp?.company || ""} recruiter talent acquisition`
  )}`;

  const isOverLimit = outreachType === "connection_request_note" && (result?.characterCount || 0) > 300;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Linkedin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>LinkedIn Recruiter Cold Outreach Generator</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  Alta Risposta
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                Messaggi sintetici ad alto impatto per contattare direttamente Recruiter e Hiring Manager su LinkedIn.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 flex-1">
          {/* Target Job & Language Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Azienda & Posizione Target
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:ring-1 focus:ring-blue-500"
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.company} — {app.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Lingua del Messaggio
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "it", label: "🇮🇹 Italiano" },
                  { id: "en", label: "🇬🇧 English" },
                  { id: "fr", label: "🇫🇷 Français" },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLang(l.id as any)}
                    className={`py-2 px-2 text-xs rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                      lang === l.id
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                        : "border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Type of Outreach Message */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Tipo di Messaggio LinkedIn
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: "connection_request_note",
                  title: "Nota di Collegamento",
                  badge: "< 300 caratteri",
                  desc: "Nota inclusa nella richiesta di connessione. Limite rigido LinkedIn.",
                },
                {
                  id: "inmail",
                  title: "InMail Ufficiale",
                  badge: "120-150 parole",
                  desc: "Messaggio con Oggetto e 3 paragrafi per messaggi diretti a pagamento.",
                },
                {
                  id: "informal_intro",
                  title: "Intro Informale Manager",
                  badge: "Diretto & Veloce",
                  desc: "Messaggio rapido e sicuro post-collegamento per avviare il dialogo.",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setOutreachType(opt.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    outreachType === opt.id
                      ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-950 dark:text-blue-100 ring-1 ring-blue-500"
                      : "border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{opt.title}</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-tight">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-1">
            <a
              href={linkedinSearchUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Cerca Recruiter di {activeApp?.company || "questa azienda"} su LinkedIn</span>
            </a>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{loading ? "Elaborazione con AI..." : "Genera Messaggio Perfetto"}</span>
            </button>
          </div>

          {/* Output Display */}
          {result && (
            <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-2xl space-y-3">
              {/* Character Limit Counter */}
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2 text-xs">
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  Bozza Generata con Formula ad Alta Conversione
                </span>
                <span
                  className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                    isOverLimit
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  }`}
                >
                  {result.characterCount} {outreachType === "connection_request_note" ? "/ 300 caratteri" : "caratteri"}
                </span>
              </div>

              {/* Subject if InMail */}
              {result.subject && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="font-semibold uppercase tracking-wider">Oggetto InMail:</span>
                    <button
                      type="button"
                      onClick={handleCopySubject}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      {copiedSubject ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>{copiedSubject ? "Copiato" : "Copia"}</span>
                    </button>
                  </div>
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-200 dark:border-stone-700">
                    {result.subject}
                  </div>
                </div>
              )}

              {/* Message text */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span className="font-semibold uppercase tracking-wider">Testo del Messaggio:</span>
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copiato negli appunti!" : "Copia Messaggio"}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={outreachType === "connection_request_note" ? 4 : 8}
                  value={result.messageText}
                  className="w-full p-3 text-xs font-sans bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Rationale & Optimal Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-800 dark:text-stone-200 block text-[11px]">
                      Perché converte:
                    </span>
                    <span className="text-[11px] text-stone-500">{result.rationale}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 flex items-start gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-800 dark:text-stone-200 block text-[11px]">
                      Tempistica consigliata:
                    </span>
                    <span className="text-[11px] text-stone-500">{result.recommendedTiming}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

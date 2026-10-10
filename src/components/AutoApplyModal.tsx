import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Send,
  HelpCircle,
  FileText,
  Mail,
  User,
  Phone,
  Linkedin,
  Globe,
  Briefcase,
  Calendar,
  AlertCircle,
  RefreshCw,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface ScreeningItem {
  question: string;
  answer: string;
  category: string;
}

interface AutoApplyResult {
  elevatorPitch: string;
  tailoredCoverLetter: string;
  screeningAnswers: ScreeningItem[];
  customAnswer?: string;
  directEmail: {
    subject: string;
    body: string;
  };
  bestApplicationTips: string[];
}

export const AutoApplyModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedApplication,
    updateApplication,
    userProfile,
    documents,
    triggerConfetti,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"fields" | "screening" | "pitch" | "email">("screening");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<AutoApplyResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Custom question state
  const [customQuestion, setCustomQuestion] = useState("");
  const [customLoading, setCustomLoading] = useState(false);
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);

  // Success message when marked as applied
  const [isAppliedSuccess, setIsAppliedSuccess] = useState(false);

  useEffect(() => {
    if (activeModal === "autoApply" && selectedApplication) {
      setIsAppliedSuccess(false);
      setCustomAnswer(null);
      setCustomQuestion("");
      fetchAutoApplyPackage();
    }
  }, [activeModal, selectedApplication?.id]);

  if (activeModal !== "autoApply" || !selectedApplication) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const fetchAutoApplyPackage = async () => {
    setLoading(true);
    try {
      const cvDoc = documents.find((d) => d.type === "cv" && d.content) || documents[0];
      const cvText = cvDoc?.content || userProfile.experienceSummary || "";

      const res = await fetch("/api/auto-apply-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application: selectedApplication,
          userProfile,
          cvText,
          lang: "it",
        }),
      });

      if (!res.ok) throw new Error("Errore chiamata server");
      const result: AutoApplyResult = await res.json();
      setData(result);
      showToast("Pacchetto candidatura personalizzato generato!", "success");
    } catch (err: any) {
      console.error("Errore fetchAutoApplyPackage:", err);
      showToast("Impossibile generare il kit al momento. Verifica la connessione.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSolveCustomQuestion = async () => {
    if (!customQuestion.trim()) return;
    setCustomLoading(true);
    try {
      const cvDoc = documents.find((d) => d.type === "cv" && d.content) || documents[0];
      const cvText = cvDoc?.content || userProfile.experienceSummary || "";

      const res = await fetch("/api/auto-apply-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application: selectedApplication,
          userProfile,
          cvText,
          customQuestion,
          lang: "it",
        }),
      });

      if (!res.ok) throw new Error("Errore risposta custom");
      const result: AutoApplyResult = await res.json();
      setCustomAnswer(result.customAnswer || result.elevatorPitch);
      showToast("Risposta personalizzata generata!", "success");
    } catch (err) {
      console.error(err);
      showToast("Errore nella risposta alla domanda personalizzata.", "error");
    } finally {
      setCustomLoading(false);
    }
  };

  const handleLaunchAndMarkApplied = () => {
    // Open application URL if available safely
    if (selectedApplication.sourceUrl) {
      try {
        const link = document.createElement("a");
        link.href = selectedApplication.sourceUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        window.open(selectedApplication.sourceUrl, "_blank", "noopener,noreferrer");
      }
    }

    // Move to applied stage and set dateApplied to today
    const today = new Date().toISOString().split("T")[0];
    updateApplication(selectedApplication.id, {
      stage: "applied",
      dateApplied: today,
    });

    triggerConfetti();
    setIsAppliedSuccess(true);
    showToast(`Candidatura per ${selectedApplication.company} avanzata allo stage Inviata!`, "success");
    setTimeout(() => {
      setIsAppliedSuccess(false);
    }, 4000);
  };

  const formFields = [
    { label: "Nome Completo", value: userProfile.name, icon: User, key: "name" },
    { label: "Titolo Professionale", value: userProfile.title, icon: Briefcase, key: "title" },
    { label: "Email", value: userProfile.email, icon: Mail, key: "email" },
    { label: "Numero di Telefono", value: userProfile.phone, icon: Phone, key: "phone" },
    { label: "Città / Domicilio", value: userProfile.location, icon: Globe, key: "loc" },
    { label: "Profilo LinkedIn", value: userProfile.linkedIn || "", icon: Linkedin, key: "linkedin" },
    { label: "Portfolio / Sito Web", value: userProfile.portfolio || "", icon: Globe, key: "portfolio" },
    {
      label: "Competenze Principali",
      value: (userProfile.skills || []).join(", "),
      icon: Sparkles,
      key: "skills",
    },
    {
      label: "Disponibilità / Preavviso",
      value: "Disponibile con preavviso contrattuale standard (o immediato previo accordo)",
      icon: Calendar,
      key: "notice",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md font-bold">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  AI Auto-Apply Copilot
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
                  1-Click Form Kit
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {selectedApplication.company} · {selectedApplication.title} ({selectedApplication.location})
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {isAppliedSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>
                Candidatura segnata come "Inviata" nella Kanban e data di oggi registrata! 🎉
              </span>
            </div>
            <button
              onClick={() => setIsAppliedSuccess(false)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-800/40 px-5 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("screening")}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "screening"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-stone-900/50"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Domande di Selezione IA ({data?.screeningAnswers?.length || 4})</span>
          </button>

          <button
            onClick={() => setActiveTab("fields")}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "fields"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-stone-900/50"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Dati & Campi Form (1-Click)</span>
          </button>

          <button
            onClick={() => setActiveTab("pitch")}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "pitch"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-stone-900/50"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Elevator Pitch & Lettera</span>
          </button>

          <button
            onClick={() => setActiveTab("email")}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "email"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-stone-900/50"
                : "border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Diretta HR</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                L'IA sta preparando il pacchetto di candidatura per {selectedApplication.company}...
              </p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Allineamento del CV con l'offerta, elaborazione risposte di screening e redazione pitch.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: SCREENING QUESTIONS SOLVER */}
              {activeTab === "screening" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                        Risposte Pronte per le Domande Aperte dei Moduli ATS
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Incolla direttamente queste risposte nei campi del form di LinkedIn, Indeed o del portale aziendale.
                      </p>
                    </div>
                    <button
                      onClick={fetchAutoApplyPackage}
                      className="px-2.5 py-1 text-[11px] font-medium text-stone-600 dark:text-stone-300 hover:text-indigo-600 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Rigenera</span>
                    </button>
                  </div>

                  {data?.screeningAnswers.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 space-y-2 relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          {item.question}
                        </span>
                        <button
                          onClick={() => handleCopy(item.answer, `screen-${idx}`)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-stone-900 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-stone-700 dark:text-stone-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-stone-200 dark:border-stone-700 flex items-center gap-1 shadow-2xs transition-all shrink-0"
                        >
                          {copiedKey === `screen-${idx}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 text-[11px] font-bold">Copiata!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[11px]">Copia Risposta</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-white dark:bg-stone-900/60 p-3 rounded-lg border border-stone-100 dark:border-stone-800/80">
                        {item.answer}
                      </p>
                    </div>
                  ))}

                  {/* Interactive Custom Question Solver Box */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        Il form ha una domanda specifica diversa? Risolvila con l'IA:
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSolveCustomQuestion()}
                        placeholder="Incolla qui la domanda del modulo (es. 'Qual è il tuo punto di forza principale?')"
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={handleSolveCustomQuestion}
                        disabled={customLoading || !customQuestion.trim()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
                      >
                        {customLoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5" />
                        )}
                        <span>Risolvi Ora</span>
                      </button>
                    </div>

                    {customAnswer && (
                      <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-indigo-700 dark:text-indigo-400 text-[11px]">
                            Risposta elaborata su misura dal tuo CV:
                          </span>
                          <button
                            onClick={() => handleCopy(customAnswer, "custom-ans")}
                            className="px-2 py-0.5 text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            {copiedKey === "custom-ans" ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Copiata!
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Copy className="w-3 h-3" /> Copia
                              </span>
                            )}
                          </button>
                        </div>
                        <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                          {customAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: 1-CLICK FORM FIELDS */}
              {activeTab === "fields" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                        Campi Anagrafici & Professionali (Copia Istantanea con 1 Click)
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Clicca su qualsiasi campo per copiarlo immediatamente negli appunti e incollarlo nel form di candidatura.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formFields.map((field) => {
                      const Icon = field.icon;
                      const isCopied = copiedKey === field.key;
                      return (
                        <div
                          key={field.key}
                          onClick={() => field.value && handleCopy(field.value, field.key)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isCopied
                              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-2xs"
                              : "bg-stone-50 hover:bg-stone-100/80 dark:bg-stone-800/50 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-800 hover:border-indigo-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-stone-200 dark:bg-stone-700 flex items-center justify-center shrink-0 text-stone-600 dark:text-stone-300">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                                {field.label}
                              </span>
                              <span className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate block">
                                {field.value || "Non impostato"}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isCopied ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <Check className="w-3.5 h-3.5" /> Copiato
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="p-1.5 text-stone-400 hover:text-indigo-600 rounded"
                                title="Copia campo"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: ELEVATOR PITCH & TAILORED COVER LETTER */}
              {activeTab === "pitch" && (
                <div className="space-y-5">
                  {/* Elevator Pitch */}
                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">
                          Elevator Pitch (30 Secondi per Form / Nota di Presentazione)
                        </h4>
                      </div>
                      <button
                        onClick={() => handleCopy(data?.elevatorPitch || "", "pitch")}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:text-indigo-600 flex items-center gap-1 transition-all"
                      >
                        {copiedKey === "pitch" ? (
                          <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                            <Check className="w-3 h-3" /> Copiato!
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px]">
                            <Copy className="w-3 h-3" /> Copia Pitch
                          </span>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-100 dark:border-stone-800">
                      {data?.elevatorPitch}
                    </p>
                  </div>

                  {/* Tailored Cover Letter */}
                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">
                          Lettera di Presentazione Ottimizzata ATS
                        </h4>
                      </div>
                      <button
                        onClick={() => handleCopy(data?.tailoredCoverLetter || "", "letter")}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:text-indigo-600 flex items-center gap-1 transition-all"
                      >
                        {copiedKey === "letter" ? (
                          <span className="text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                            <Check className="w-3 h-3" /> Copiata!
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px]">
                            <Copy className="w-3 h-3" /> Copia Lettera
                          </span>
                        )}
                      </button>
                    </div>
                    <pre className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans whitespace-pre-wrap bg-white dark:bg-stone-900 p-3.5 rounded-lg border border-stone-100 dark:border-stone-800">
                      {data?.tailoredCoverLetter}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 4: DIRECT EMAIL TO HR */}
              {activeTab === "email" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      Email di Candidatura Diretta al Recruiter / Hiring Manager
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Puoi contattare direttamente il contatto aziendale via email se possiedi l'indirizzo.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Oggetto Email
                      </span>
                      <div className="flex items-center justify-between gap-2 p-2.5 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 text-xs font-medium">
                        <span className="truncate">{data?.directEmail.subject}</span>
                        <button
                          onClick={() => handleCopy(data?.directEmail.subject || "", "email-subj")}
                          className="text-stone-500 hover:text-indigo-600 shrink-0"
                          title="Copia oggetto"
                        >
                          {copiedKey === "email-subj" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Corpo Email
                      </span>
                      <div className="relative">
                        <pre className="text-xs text-stone-700 dark:text-stone-300 font-sans whitespace-pre-wrap p-3.5 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 leading-relaxed">
                          {data?.directEmail.body}
                        </pre>
                        <button
                          onClick={() => handleCopy(data?.directEmail.body || "", "email-body")}
                          className="absolute top-2 right-2 px-2 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded text-[11px] font-medium flex items-center gap-1"
                        >
                          {copiedKey === "email-body" ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copia Testo</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <a
                        href={`mailto:${selectedApplication.contactEmail || ""}?subject=${encodeURIComponent(
                          data?.directEmail.subject || ""
                        )}&body=${encodeURIComponent(data?.directEmail.body || "")}`}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Apri nel Client Email</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Best tips footer note */}
              {data?.bestApplicationTips && data.bestApplicationTips.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <span className="font-bold">Strategia Vincente per {selectedApplication.company}:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-stone-600 dark:text-stone-300 text-[11px]">
                      {data.bestApplicationTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
            {selectedApplication.verification && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>100% Reale Verificata</span>
              </span>
            )}
            {selectedApplication.sourceUrl ? (
              <a
                href={selectedApplication.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>{selectedApplication.sourcePlatform || "Vai all'annuncio"}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span>Nessun link URL salvato per l'annuncio</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Chiudi
            </button>

            <button
              onClick={handleLaunchAndMarkApplied}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>
                {selectedApplication.sourceUrl
                  ? "Apri Annuncio & Segna Inviata 🚀"
                  : "Segna come Inviata nella Kanban 🚀"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

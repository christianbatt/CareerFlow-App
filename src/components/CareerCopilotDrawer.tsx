import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Trash2,
  Maximize2,
  Minimize2,
  Compass,
  LayoutGrid,
  FileText,
  Mic,
  Search,
  CheckCircle2,
  Building2,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Bookmark,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CopilotMessage, CopilotMode, CopilotJobOffer } from "../types";
import { InteractiveJobCard } from "./InteractiveJobCard";

export interface CareerCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: CopilotMode;
  initialPrompt?: string;
}

export const CareerCopilotDrawer: React.FC<CareerCopilotDrawerProps> = ({
  isOpen,
  onClose,
  defaultMode = "job-hunter",
  initialPrompt,
}) => {
  const { userProfile, applications, activeTab, setActiveTab, showToast, savedJobSearches } = useApp();

  const [currentMode, setCurrentMode] = useState<CopilotMode>(defaultMode);
  const [messages, setMessages] = useState<CopilotMessage[]>(() => {
    try {
      const saved = localStorage.getItem("careerflow_copilot_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: "msg-welcome",
        role: "assistant",
        content: `Ciao ${userProfile?.name?.split(" ")[0] || "Christian"}! Sono il tuo **Career Copilot** con Gemini 3.8 Flash.\n\nPosso setacciare i portali di annunci e le pagine *Careers aziendali* (inclusi gli ATS ufficiali come **Greenhouse**, **Lever** e **Workday**) per trovare posizioni cucite sul tuo profilo, oppure consigliarti sul CV e prepararti ai colloqui.\n\nCosa vorresti cercare o approfondire oggi?`,
        timestamp: new Date().toISOString(),
        mode: defaultMode,
        suggestedActions: [
          {
            label: "🎯 Trovami ruoli aperti affini al mio CV",
            prompt: "Trovami le migliori posizioni aperte in questo momento che combaciano con il mio profilo e competenze",
          },
          {
            label: "🏢 Cerca su Greenhouse / Lever (Remote)",
            prompt: "Cerca opportunità aperte su portali ATS aziendali (Greenhouse, Lever) in aziende software o tech con modalità remote",
          },
          {
            label: "📊 Fai il check-up del mio Kanban",
            prompt: "Esamina le mie attuali candidature nel Kanban e dimmi quali hanno priorità per i follow-up",
          },
        ],
      },
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync defaultMode or initialPrompt when opened
  useEffect(() => {
    if (defaultMode) {
      setCurrentMode(defaultMode);
    }
    if (initialPrompt && isOpen) {
      setInputValue(initialPrompt);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [defaultMode, initialPrompt, isOpen]);

  // Persist history to localStorage
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(
          "careerflow_copilot_history",
          JSON.stringify(messages.slice(-25))
        );
      }
    } catch {
      // ignore storage overflow
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Auto-focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputValue).trim();
    if (!prompt || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date().toISOString(),
      mode: currentMode,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          history: newMessages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mode: currentMode,
          userProfile,
          applications,
          activeTab,
        }),
      });

      if (!response.ok) {
        throw new Error(`Errore server: ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: CopilotMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: data.content || "Ho completato l'analisi per te.",
        timestamp: new Date().toISOString(),
        mode: currentMode,
        discoveredJobs: data.discoveredJobs || [],
        suggestedActions: data.suggestedActions || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Copilot chat error:", err);
      const errorMsg: CopilotMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "Si è verificato un problema temporaneo di connessione con il motore Gemini. Riprova tra pochi secondi.",
        timestamp: new Date().toISOString(),
        mode: currentMode,
      };
      setMessages((prev) => [...prev, errorMsg]);
      showToast("Errore di risposta del Copilot AI", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const fresh: CopilotMessage[] = [
      {
        id: "msg-welcome-fresh",
        role: "assistant",
        content: `Cronologia azzerata. Come posso aiutarti ora nella tua ricerca di carriera?`,
        timestamp: new Date().toISOString(),
        mode: currentMode,
        suggestedActions: [
          {
            label: "🎯 Trovami ruoli aperti affini al mio CV",
            prompt: "Trovami le migliori posizioni aperte in questo momento che combaciano con il mio profilo e competenze",
          },
          {
            label: "🏢 Scansione pagine Careers (ATS)",
            prompt: "Cerca opportunità aperte su portali ATS aziendali (Greenhouse, Lever) per il mio profilo",
          },
        ],
      },
    ];
    setMessages(fresh);
    localStorage.removeItem("careerflow_copilot_history");
    showToast("Cronologia Copilot azzerata", "info");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex justify-end">
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs transition-opacity pointer-events-auto md:hidden"
        onClick={onClose}
      />

      {/* Drawer Surface */}
      <div
        className={`pointer-events-auto w-full flex flex-col h-full bg-white dark:bg-stone-900 shadow-2xl border-l border-stone-200 dark:border-stone-800 transition-all duration-300 ease-in-out ${
          isExpanded ? "md:w-[720px]" : "md:w-[460px]"
        }`}
      >
        {/* Header Bar */}
        <div className="p-3.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                  CareerFlow Copilot
                </h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                Radar offerte & Consulente strategico di carriera
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClearHistory}
              title="Azzera conversazione"
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Comprimi" : "Espandi"}
              className="hidden md:flex p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Chiudi Copilot"
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-3 py-2 bg-stone-100/60 dark:bg-stone-950/40 border-b border-stone-200/80 dark:border-stone-800 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setCurrentMode("job-hunter")}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "job-hunter"
                ? "bg-white dark:bg-stone-800 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
            }`}
          >
            <Compass className="w-3 h-3 text-indigo-500" />
            <span>Job Hunter</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentMode("applications")}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "applications"
                ? "bg-white dark:bg-stone-800 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
            }`}
          >
            <LayoutGrid className="w-3 h-3 text-emerald-500" />
            <span>Kanban & Status</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentMode("cv-tailor")}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "cv-tailor"
                ? "bg-white dark:bg-stone-800 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
            }`}
          >
            <FileText className="w-3 h-3 text-amber-500" />
            <span>CV & Lettera</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentMode("interview")}
            className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "interview"
                ? "bg-white dark:bg-stone-800 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
            }`}
          >
            <Mic className="w-3 h-3 text-purple-500" />
            <span>Colloqui</span>
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {/* Role Header */}
              <div className="text-[10px] text-stone-400 mb-1 px-1 flex items-center gap-1">
                {msg.role === "user" ? (
                  <span>Tu</span>
                ) : (
                  <>
                    <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                    <span>Copilot</span>
                  </>
                )}
                <span>·</span>
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl text-xs leading-relaxed max-w-[92%] transition-all ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white p-3.5 shadow-2xs rounded-tr-xs"
                    : "bg-stone-50 dark:bg-stone-800/70 border border-stone-200/80 dark:border-stone-800 text-stone-900 dark:text-stone-100 p-4 shadow-2xs rounded-tl-xs space-y-3"
                }`}
              >
                {/* Text Content */}
                <div className="prose prose-stone dark:prose-invert max-w-none text-xs space-y-2">
                  {msg.content.split("\n\n").map((paragraph, pIdx) => (
                    <p key={pIdx} className="whitespace-pre-line leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Discovered Job Offer Cards (Interactive) */}
                {msg.discoveredJobs && msg.discoveredJobs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-200/80 dark:border-stone-700/80 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 dark:text-stone-300">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Posizioni identificate ({msg.discoveredJobs.length})</span>
                      </span>
                      <span className="text-[10px] font-normal text-stone-500">
                        1-click Kanban & CV Tailor
                      </span>
                    </div>

                    <div className="space-y-2">
                      {msg.discoveredJobs.map((job) => (
                        <InteractiveJobCard
                          key={job.id}
                          job={job}
                          compact={true}
                          onAddedToKanban={() => {
                            // feedback
                          }}
                          onOpenCvTailor={() => {
                            onClose();
                          }}
                          onOpenCoverLetter={() => {
                            onClose();
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-up Actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-200/60 dark:border-stone-700/50 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        type="button"
                        onClick={() => handleSendMessage(act.prompt)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-stone-700 dark:text-stone-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors flex items-center gap-1 cursor-pointer border border-stone-200/50 dark:border-stone-700/40"
                      >
                        <ChevronRight className="w-3 h-3 text-indigo-500" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-start space-y-1">
              <div className="text-[10px] text-stone-400 px-1 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500 animate-spin" />
                <span>Copilot sta elaborando...</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 flex items-center gap-2.5 shadow-2xs">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
                <span className="animate-pulse">
                  {currentMode === "job-hunter"
                    ? "Scansione portali di lavoro e pagine Careers aziendali in corso..."
                    : "Analisi contesto e generazione suggerimenti strategici..."}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/90 shrink-0 space-y-2">
          {/* Saved Searches Quick Chips (when available) */}
          {savedJobSearches && savedJobSearches.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[11px] pb-0.5">
              <span className="text-indigo-500 text-[10px] font-bold shrink-0 flex items-center gap-0.5">
                <Bookmark className="w-3 h-3" />
                Ricerche salvate:
              </span>
              {savedJobSearches.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      `Lancia una ricerca AI approfondita basata sui miei filtri salvati "${s.name}": Ruolo: ${s.criteria.role || 'non specificato'}, Location: ${s.criteria.location || 'qualsiasi'}, Retribuzione minima/RAL: ${s.criteria.salary || 'non specificato'}, Modalità: ${s.criteria.workplaceType || 'tutte'}. Scandaglia sia portali che pagine Careers aziendali e ATS diretti.`
                    )
                  }
                  className="shrink-0 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-medium transition-colors"
                  title={`Lancia la ricerca salvata "${s.name}"`}
                >
                  ⚡ {s.name.length > 25 ? s.name.substring(0, 25) + '...' : s.name}
                </button>
              ))}
            </div>
          )}

          {/* Quick Context Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-stone-400 text-[10px] font-semibold shrink-0">
              Suggerimenti:
            </span>
            <button
              type="button"
              onClick={() =>
                handleSendMessage(
                  "Trovami posizioni aperte per Senior o Lead con stipendio trasparente su portali Greenhouse o Lever"
                )
              }
              className="shrink-0 px-2 py-0.5 rounded-md bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
            >
              🏢 ATS Greenhouse/Lever
            </button>
            <button
              type="button"
              onClick={() =>
                handleSendMessage(
                  "Quali aziende stanno assumendo profili con le mie competenze in full remote?"
                )
              }
              className="shrink-0 px-2 py-0.5 rounded-md bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
            >
              🌐 Offerte 100% Remote
            </button>
            <button
              type="button"
              onClick={() =>
                handleSendMessage(
                  "Dammi 3 consigli chiave per far passare il mio CV attraverso i filtri ATS"
                )
              }
              className="shrink-0 px-2 py-0.5 rounded-md bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
            >
              ⚡ Check-up ATS
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-1.5"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  currentMode === "job-hunter"
                    ? "Es. Trovami posizioni remote in aziende SaaS con RAL > 50k..."
                    : "Chiedi qualunque cosa al Copilot (candidature, CV, colloqui)..."
                }
                rows={2}
                disabled={isLoading}
                className="w-full p-2.5 text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
              title="Invia messaggio"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Global Launcher Button (Dock)
export const CareerCopilotDockButton: React.FC<{
  onClick: () => void;
  isOpen: boolean;
}> = ({ onClick, isOpen }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl shadow-lg transition-all duration-200 cursor-pointer font-bold text-xs ${
        isOpen
          ? "bg-stone-800 text-stone-200 hover:bg-stone-700 scale-95"
          : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:shadow-indigo-500/25 hover:scale-105"
      }`}
      title="Apri CareerFlow AI Copilot"
    >
      <div className="relative">
        <Sparkles className="w-4 h-4" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
      </div>
      <span className="hidden sm:inline">Copilot AI</span>
      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/20 text-white/90 hidden md:inline">
        Ctrl+K
      </span>
    </button>
  );
};

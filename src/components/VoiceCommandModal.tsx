import React, { useState, useEffect } from "react";
import { X, Mic, MicOff, Check, Command, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

export const VoiceCommandModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    setActiveTab,
    setWorkplaceFilter,
    setSearchQuery,
    language,
    t,
    showToast,
  } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastAction, setLastAction] = useState<string | null>(null);

  if (activeModal !== "voice") return null;

  const processVoiceCommand = (text: string) => {
    const lower = text.toLowerCase();

    if (
      lower.includes("nuova candidatura") ||
      lower.includes("crea candidatura") ||
      lower.includes("new application")
    ) {
      setLastAction("Apertura modulo nuova candidatura...");
      setTimeout(() => {
        setActiveModal("details");
      }, 700);
    } else if (
      lower.includes("estrai") ||
      lower.includes("link") ||
      lower.includes("analizza offerta") ||
      lower.includes("import")
    ) {
      setLastAction("Apertura estrazione AI da link...");
      setTimeout(() => {
        setActiveModal("import");
      }, 700);
    } else if (
      lower.includes("statistiche") ||
      lower.includes("kpi") ||
      lower.includes("analytics")
    ) {
      setLastAction("Passaggio alla dashboard Statistiche...");
      setActiveTab("analytics");
      setTimeout(() => setActiveModal(null), 800);
    } else if (
      lower.includes("cover letter") ||
      lower.includes("lettera") ||
      lower.includes("letter")
    ) {
      setLastAction("Passaggio allo Studio Cover Letter...");
      setActiveTab("cover-letter");
      setTimeout(() => setActiveModal(null), 800);
    } else if (
      lower.includes("colloqui") ||
      lower.includes("scadenze") ||
      lower.includes("calendario") ||
      lower.includes("deadlines")
    ) {
      setLastAction("Apertura calendario colloqui...");
      setActiveTab("deadlines");
      setTimeout(() => setActiveModal(null), 800);
    } else if (
      lower.includes("bacheca") ||
      lower.includes("kanban") ||
      lower.includes("board")
    ) {
      setLastAction("Ritorno alla Bacheca Kanban...");
      setActiveTab("kanban");
      setTimeout(() => setActiveModal(null), 800);
    } else if (lower.includes("remoto") || lower.includes("remote")) {
      setLastAction("Filtro impostato su 'Da remoto'...");
      setWorkplaceFilter("Remote");
      setActiveTab("kanban");
      setTimeout(() => setActiveModal(null), 800);
    } else if (lower.includes("cerca ")) {
      const query = lower.replace("cerca ", "").trim();
      setLastAction(`Ricerca per "${query}"...`);
      setSearchQuery(query);
      setActiveTab("kanban");
      setTimeout(() => setActiveModal(null), 800);
    } else {
      setLastAction("Comando non riconosciuto. Prova uno di quelli suggeriti in basso.");
    }
  };

  const startListening = () => {
    if (
      typeof window === "undefined" ||
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      showToast("Il riconoscimento vocale non è supportato da questo browser.", "warning");
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === "en" ? "en-US" : language === "fr" ? "fr-FR" : "it-IT";
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
        setLastAction(null);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processVoiceCommand(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {t.voiceCommands}
            </h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Microphone circle */}
        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          <button
            onClick={startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isListening
                ? "bg-rose-500 text-white animate-pulse ring-8 ring-rose-200 dark:ring-rose-900/50"
                : "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105"
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
            {isListening ? "Parla adesso..." : "Clicca sul microfono per dare un comando vocale"}
          </span>
        </div>

        {/* Live Transcript / Result */}
        {transcript && (
          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
            <span className="text-stone-400 block text-[11px] mb-0.5">Hai detto:</span>
            <p className="font-semibold text-stone-900 dark:text-stone-100">"{transcript}"</p>
          </div>
        )}

        {lastAction && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{lastAction}</span>
          </div>
        )}

        {/* Suggested Voice Commands */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Comandi di esempio supportati:
          </span>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <button
              onClick={() => processVoiceCommand("nuova candidatura")}
              className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg text-stone-700 dark:text-stone-300 font-medium"
            >
              "Nuova candidatura"
            </button>
            <button
              onClick={() => processVoiceCommand("estrai link")}
              className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg text-stone-700 dark:text-stone-300 font-medium"
            >
              "Estrai da link"
            </button>
            <button
              onClick={() => processVoiceCommand("statistiche")}
              className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg text-stone-700 dark:text-stone-300 font-medium"
            >
              "Statistiche"
            </button>
            <button
              onClick={() => processVoiceCommand("cover letter")}
              className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg text-stone-700 dark:text-stone-300 font-medium"
            >
              "Cover letter"
            </button>
            <button
              onClick={() => processVoiceCommand("colloqui")}
              className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg text-stone-700 dark:text-stone-300 font-medium"
            >
              "Mostra colloqui"
            </button>
            <button
              onClick={() => processVoiceCommand("remoto")}
              className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg text-stone-700 dark:text-stone-300 font-medium"
            >
              "Filtra da remoto"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

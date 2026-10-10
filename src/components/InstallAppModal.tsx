import React, { useState, useEffect } from "react";
import {
  X,
  Monitor,
  Download,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export const InstallAppModal: React.FC = () => {
  const { activeModal, setActiveModal } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [selectedBrowser, setSelectedBrowser] = useState<"chrome" | "edge" | "safari">("chrome");

  useEffect(() => {
    // Detect if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Listen to native beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Auto-detect browser
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("edg/")) {
      setSelectedBrowser("edge");
    } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
      setSelectedBrowser("safari");
    } else {
      setSelectedBrowser("chrome");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (activeModal !== "installApp") return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm font-bold">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Installa CareerFlow AI su Desktop
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Usa l'app come programma autonomo sul tuo PC o Mac (senza barra del browser)
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status banner */}
          {isInstalled ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  L'app è già installata sul tuo computer!
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Puoi avviarla direttamente dal Desktop, dal menu Start di Windows o dal Dock di macOS.
                </p>
              </div>
            </div>
          ) : deferredPrompt ? (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                    Installazione Rapida con 1 Click
                  </p>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">
                    Il tuo browser è pronto per creare l'icona sul tuo computer adesso.
                  </p>
                </div>
              </div>
              <button
                onClick={handleNativeInstall}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Installa Adesso</span>
              </button>
            </div>
          ) : null}

          {/* Browser Selection Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              Seleziona il tuo browser per vedere dove si trova il pulsante esatto:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedBrowser("chrome")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedBrowser === "chrome"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Google Chrome / Brave</span>
              </button>

              <button
                onClick={() => setSelectedBrowser("edge")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedBrowser === "edge"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Microsoft Edge</span>
              </button>

              <button
                onClick={() => setSelectedBrowser("safari")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedBrowser === "safari"
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Apple Mac (Safari)</span>
              </button>
            </div>
          </div>

          {/* Browser Specific Visual Instructions */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-4">
            {selectedBrowser === "chrome" && (
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                    1
                  </span>
                  <span>Opzione A: Direttamente dalla barra degli indirizzi (in alto a destra)</span>
                </div>
                <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 space-y-2">
                  <p>
                    Guarda in alto a destra nella barra dove digiti il sito: a destra dell'indirizzo trovi l'icona con un{" "}
                    <strong>computerino e una freccia verso il basso</strong> (o un pulsante con scritto <strong>"Installa"</strong>).
                  </p>
                  <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded border border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-between text-stone-500 font-mono text-[11px]">
                    <span>https://ais-pre-...run.app</span>
                    <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-sans font-bold flex items-center gap-1 shadow-xs">
                      <Download className="w-3 h-3" /> Installa app
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Cliccaci sopra e conferma premendo <strong>"Installa"</strong> nel popup che compare.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-700">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <span>Opzione B: Dal menu di Chrome (i 3 puntini ⋮ in alto a destra)</span>
                </div>
                <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                  <p>1. Clicca sui <strong>tre puntini verticali (⋮)</strong> in alto a destra del browser.</p>
                  <p>
                    2. Clicca sulla voce <strong>"Salva e condividi"</strong> (oppure direttamente <strong>"Installa CareerFlow AI..."</strong>).
                  </p>
                  <p>3. Seleziona <strong>"Installa la pagina come app"</strong> e conferma.</p>
                </div>
              </>
            )}

            {selectedBrowser === "edge" && (
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                    1
                  </span>
                  <span>Opzione A: Icona nella barra degli indirizzi di Edge</span>
                </div>
                <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 space-y-2">
                  <p>
                    A destra nella barra degli indirizzi compare l'icona con <strong>tre quadratini e un segno "+"</strong> (App disponibile).
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Cliccala e premi <strong>"Installa"</strong>: si aprirà la finestra per aggiungere l'icona alla barra delle applicazioni o sul desktop.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-700">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <span>Opzione B: Dal menu di Edge (3 puntini ⋯)</span>
                </div>
                <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                  <p>1. Clicca sui <strong>tre puntini orizzontali (⋯)</strong> in alto a destra.</p>
                  <p>2. Passa con il mouse su <strong>"App"</strong>.</p>
                  <p>3. Clicca su <strong>"Installa questo sito come app"</strong>.</p>
                </div>
              </>
            )}

            {selectedBrowser === "safari" && (
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                    1
                  </span>
                  <span>Su macOS (Sonoma, Sequoia o versioni recenti)</span>
                </div>
                <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 space-y-2">
                  <p>
                    1. Nella barra dei menu in alto del tuo Mac, clicca su <strong>File</strong> ➔ <strong>"Aggiungi al Dock..."</strong>.
                  </p>
                  <p>
                    2. Oppure clicca sul pulsante <strong>Condividi</strong> (icona del quadrato con la freccia in alto) e scegli <strong>"Aggiungi al Dock"</strong>.
                  </p>
                  <p className="text-[11px] text-stone-500">
                    L'icona di CareerFlow apparirà nel Dock del tuo Mac e si aprirà come vera e propria app desktop dedicata!
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Data safety guarantee */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Tutti i tuoi dati e candidature rimangono intatti
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Installare l'app su desktop non cancella assolutamente nulla. L'app continuerà a condividere lo stesso database e salvataggio locale, mantenendo tutte le offerte, CV, note e statistiche aggiunte finora.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl text-xs font-medium transition-colors"
          >
            Ho capito, chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

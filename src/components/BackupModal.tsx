import React, { useState } from "react";
import {
  X,
  Cloud,
  Download,
  Upload,
  ShieldCheck,
  Check,
  FileCode,
  HardDrive,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export const BackupModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    exportDataAsJson,
    importDataFromJson,
    resetAllData,
    isOnline,
    t,
  } = useApp();

  const [importJsonText, setImportJsonText] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (activeModal !== "backup") return null;

  const handleResetData = () => {
    resetAllData();
    setShowConfirmReset(false);
    setSuccessMsg("Tutti i dati e i mock sono stati azzerati con successo. Workspace pulito!");
    setTimeout(() => {
      setActiveModal(null);
    }, 1500);
  };

  const handleDownloadBackup = () => {
    const dataStr = exportDataAsJson();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CareerFlow_Backup_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMsg("File di backup scaricato con successo!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    if (!importJsonText.trim()) return;
    const ok = importDataFromJson(importJsonText);
    if (ok) {
      setSuccessMsg("Dati ripristinati e sincronizzati con successo!");
      setErrorMsg(null);
      setTimeout(() => {
        setActiveModal(null);
      }, 1500);
    } else {
      setErrorMsg("Formato file non valido. Verifica il file JSON.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {t.backupTitle}
            </h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Offline Banner */}
        <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Architettura Local-First & Privacy Assoluta</span>
          </div>
          <p className="text-stone-500 leading-relaxed">
            I tuoi dati sono conservati sul tuo dispositivo in memoria locale e sono sempre accessibili anche senza internet.
            Stato attuale:{" "}
            <span className={isOnline ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
              {isOnline ? "Connesso online" : "Modalità offline attiva"}
            </span>.
          </p>
        </div>

        {/* Export Action */}
        <div className="p-4 bg-white dark:bg-stone-800/20 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                Esporta Backup Completo
              </span>
              <span className="text-[11px] text-stone-500">
                Salva tutte le candidature, colloqui, cover letter e profilo in un file JSON
              </span>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Scarica JSON</span>
            </button>
          </div>
        </div>

        {/* Import Action */}
        <div className="p-4 bg-white dark:bg-stone-800/20 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
          <div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
              Ripristina o Sincronizza da un Altro Dispositivo
            </span>
            <span className="text-[11px] text-stone-500">
              Carica un file JSON esportato in precedenza
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Seleziona file .json</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            {importJsonText && (
              <button
                onClick={handleApplyImport}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Applica Ripristino</span>
              </button>
            )}
          </div>
        </div>

        {/* Reset / Purge Mock Data Section */}
        <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-900 dark:text-rose-300 block">
                Azzera e Pulisci Workspace
              </span>
              <span className="text-[11px] text-rose-700/80 dark:text-rose-400">
                Elimina tutti i dati mock o vecchie candidature per ripartire da zero col tuo reale CV
              </span>
            </div>
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/70 text-rose-800 dark:text-rose-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Svuota Tutto
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetData}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Conferma Reset
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2 py-1.5 text-stone-500 hover:text-stone-700 text-xs font-medium"
                >
                  Annulla
                </button>
              </div>
            )}
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 rounded-xl">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
};
